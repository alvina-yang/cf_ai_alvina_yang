interface WorkflowNode {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface ExecutionState {
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentNodeId: string | null;
  results: Record<string, any>;
  errors: Record<string, string>;
  startedAt: number;
  completedAt?: number;
}

interface Env {
  AI: Ai;
  WORKFLOWS_KV: KVNamespace;
}

export class WorkflowAgent implements DurableObject {
  private state: DurableObjectState;
  private env: Env;
  private websockets: Set<WebSocket> = new Set();
  private execution: ExecutionState | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    if (url.pathname === '/execute' && request.method === 'POST') {
      return this.handleExecute(request);
    }

    if (url.pathname === '/status' && request.method === 'GET') {
      return this.handleStatus();
    }

    return new Response('Not found', { status: 404 });
  }

  private handleWebSocket(request: Request): Response {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.websockets.add(server as any);

    server.accept();
    server.addEventListener('close', () => {
      this.websockets.delete(server as any);
    });

    if (this.execution) {
      server.send(JSON.stringify({ type: 'state', data: this.execution }));
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async handleExecute(request: Request): Promise<Response> {
    try {
      const { workflow, input } = await request.json() as any;

      this.execution = {
        status: 'running',
        currentNodeId: null,
        results: {},
        errors: {},
        startedAt: Date.now(),
      };

      this.broadcast({ type: 'execution_started', data: this.execution });

      await this.state.storage.sql.exec(
        'CREATE TABLE IF NOT EXISTS executions (id TEXT PRIMARY KEY, workflow_id TEXT, status TEXT, results TEXT, created_at INTEGER)'
      );

      const executionId = crypto.randomUUID();
      await this.state.storage.sql.exec(
        'INSERT INTO executions (id, workflow_id, status, results, created_at) VALUES (?, ?, ?, ?, ?)',
        executionId,
        workflow.id,
        'running',
        '{}',
        Date.now()
      );

      const result = await this.executeWorkflow(workflow, input);

      this.execution.status = 'completed';
      this.execution.completedAt = Date.now();

      await this.state.storage.sql.exec(
        'UPDATE executions SET status = ?, results = ? WHERE id = ?',
        'completed',
        JSON.stringify(result),
        executionId
      );

      this.broadcast({ type: 'execution_completed', data: this.execution });

      return Response.json({ success: true, result, executionId });
    } catch (error) {
      this.execution = this.execution || {
        status: 'failed',
        currentNodeId: null,
        results: {},
        errors: {},
        startedAt: Date.now(),
      };
      this.execution.status = 'failed';
      this.execution.errors['execution'] = error instanceof Error ? error.message : String(error);
      this.execution.completedAt = Date.now();

      this.broadcast({ type: 'execution_failed', data: this.execution });

      return Response.json({ success: false, error: String(error) }, { status: 500 });
    }
  }

  private handleStatus(): Response {
    return Response.json({
      execution: this.execution,
      websocketCount: this.websockets.size,
    });
  }

  private async executeWorkflow(workflow: any, input: any): Promise<any> {
    const { nodes, edges } = workflow;
    const results: Record<string, any> = { input };

    const adjacency = new Map<string, string[]>();
    edges.forEach((edge: WorkflowEdge) => {
      if (!adjacency.has(edge.source)) {
        adjacency.set(edge.source, []);
      }
      adjacency.get(edge.source)!.push(edge.target);
    });

    const startNode = nodes.find((n: WorkflowNode) => n.type === 'start');
    if (!startNode) {
      throw new Error('No start node found in workflow');
    }

    await this.executeNode(startNode, nodes, adjacency, results, input);

    return results;
  }

  private async executeNode(
    node: WorkflowNode,
    allNodes: WorkflowNode[],
    adjacency: Map<string, string[]>,
    results: Record<string, any>,
    currentInput: any
  ): Promise<any> {
    this.execution!.currentNodeId = node.id;
    this.broadcast({ type: 'node_started', data: { nodeId: node.id } });

    let nodeResult: any;

    try {
      switch (node.type) {
        case 'start':
          nodeResult = currentInput;
          break;

        case 'llm':
          nodeResult = await this.executeLLMNode(node, currentInput);
          break;

        case 'http':
          nodeResult = await this.executeHttpNode(node, currentInput);
          break;

        case 'transform':
          nodeResult = await this.executeTransformNode(node, currentInput);
          break;

        case 'condition':
          nodeResult = await this.executeConditionNode(node, currentInput);
          break;

        case 'end':
          nodeResult = currentInput;
          break;

        default:
          nodeResult = currentInput;
      }

      results[node.id] = nodeResult;
      this.broadcast({ 
        type: 'node_completed', 
        data: { nodeId: node.id, result: nodeResult } 
      });

      const children = adjacency.get(node.id) || [];
      for (const childId of children) {
        const childNode = allNodes.find((n) => n.id === childId);
        if (childNode) {
          await this.executeNode(childNode, allNodes, adjacency, results, nodeResult);
        }
      }

      return nodeResult;
    } catch (error) {
      this.execution!.errors[node.id] = error instanceof Error ? error.message : String(error);
      this.broadcast({ 
        type: 'node_failed', 
        data: { nodeId: node.id, error: String(error) } 
      });
      throw error;
    }
  }

  private async executeLLMNode(node: WorkflowNode, input: any): Promise<any> {
    const { prompt, model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast', temperature = 0.7 } = node.data;

    const processedPrompt = this.replacePlaceholders(prompt, input);

    const response = await this.env.AI.run(model, {
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant in a workflow automation system.' },
        { role: 'user', content: processedPrompt }
      ],
      temperature,
    }) as any;

    return {
      text: response.response || response.text,
      model,
      input: processedPrompt,
    };
  }

  private async executeHttpNode(node: WorkflowNode, input: any): Promise<any> {
    const { url, method = 'GET', headers = {}, body } = node.data;

    const processedUrl = this.replacePlaceholders(url, input);
    const processedBody = body ? this.replacePlaceholders(JSON.stringify(body), input) : undefined;

    const response = await fetch(processedUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: processedBody,
    });

    const data = await response.json();
    return { status: response.status, data };
  }

  private async executeTransformNode(node: WorkflowNode, input: any): Promise<any> {
    const { transformType, config } = node.data;

    switch (transformType) {
      case 'json':
        return JSON.parse(input);
      case 'extract':
        return this.extractFields(input, config.fields);
      case 'merge':
        return { ...input, ...config.data };
      default:
        return input;
    }
  }

  private async executeConditionNode(node: WorkflowNode, input: any): Promise<any> {
    const { condition, trueValue, falseValue } = node.data;

    // Simple condition evaluation
    const result = this.evaluateCondition(condition, input);

    return result ? trueValue : falseValue;
  }

  private replacePlaceholders(template: string, data: any): string {
    if (typeof template !== 'string') return template;
    
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private extractFields(data: any, fields: string[]): any {
    const result: any = {};
    fields.forEach((field) => {
      result[field] = this.getNestedValue(data, field);
    });
    return result;
  }

  private evaluateCondition(condition: string, data: any): boolean {
    try {
      const func = new Function('data', `return ${condition}`);
      return func(data);
    } catch {
      return false;
    }
  }

  private broadcast(message: any): void {
    const payload = JSON.stringify(message);
    this.websockets.forEach((ws) => {
      try {
        ws.send(payload);
      } catch (error) {
        console.error('Error broadcasting:', error);
      }
    });
  }
}
