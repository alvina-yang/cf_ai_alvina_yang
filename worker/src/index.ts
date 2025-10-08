import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Durable Objects will be exported at the end
export { WorkflowAgent } from './agents/WorkflowAgent';
export { LLMAgent } from './agents/LLMAgent';

type Bindings = {
  WORKFLOW_AGENT: DurableObjectNamespace;
  LLM_AGENT: DurableObjectNamespace;
  AI: Ai;
  WORKFLOWS_KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://agentflow.pages.dev'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Chat endpoint (using LLMAgent)
app.post('/api/chat', async (c) => {
  try {
    const { message, sessionId, context } = await c.req.json();
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Create or get LLM Agent instance
    const id = c.env.LLM_AGENT.idFromName(sessionId || crypto.randomUUID());
    const agent = c.env.LLM_AGENT.get(id);

    // Call the chat endpoint
    const response = await agent.fetch(
      new Request('https://dummy/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: context ? `${context}\n\nUser: ${message}` : message,
          sessionId,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await response.json();
    return c.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ error: 'Failed to process chat message' }, 500);
  }
});

// Transcribe audio (for voice input)
app.post('/api/transcribe', async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return c.json({ error: 'Audio file is required' }, 400);
    }

    // Use Cloudflare Workers AI for speech-to-text
    const arrayBuffer = await audioFile.arrayBuffer();
    const response = await c.env.AI.run('@cf/openai/whisper', {
      audio: Array.from(new Uint8Array(arrayBuffer)),
    }) as any;

    return c.json({ text: response.text || response.vtt || '' });
  } catch (error) {
    console.error('Transcription error:', error);
    return c.json({ error: 'Failed to transcribe audio' }, 500);
  }
});

// Create a new workflow
app.post('/api/workflows', async (c) => {
  try {
    const body = await c.req.json();
    const { id, name, nodes, edges } = body;

    if (!id || !name || !nodes || !edges) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Store workflow definition in KV
    await c.env.WORKFLOWS_KV.put(
      `workflow:${id}`,
      JSON.stringify({ id, name, nodes, edges, createdAt: Date.now() })
    );

    return c.json({ success: true, workflowId: id });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return c.json({ error: 'Failed to create workflow' }, 500);
  }
});

// Get workflow by ID
app.get('/api/workflows/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const workflow = await c.env.WORKFLOWS_KV.get(`workflow:${id}`, 'json');

    if (!workflow) {
      return c.json({ error: 'Workflow not found' }, 404);
    }

    return c.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return c.json({ error: 'Failed to fetch workflow' }, 500);
  }
});

// List all workflows
app.get('/api/workflows', async (c) => {
  try {
    const list = await c.env.WORKFLOWS_KV.list({ prefix: 'workflow:' });
    const workflows = await Promise.all(
      list.keys.map(async (key) => {
        const workflow = await c.env.WORKFLOWS_KV.get(key.name, 'json');
        return workflow;
      })
    );

    return c.json({ workflows: workflows.filter(Boolean) });
  } catch (error) {
    console.error('Error listing workflows:', error);
    return c.json({ error: 'Failed to list workflows' }, 500);
  }
});

// Execute a workflow
app.post('/api/workflows/:id/execute', async (c) => {
  try {
    const workflowId = c.req.param('id');
    const { input } = await c.req.json();

    // Get the workflow definition
    const workflow = await c.env.WORKFLOWS_KV.get(`workflow:${workflowId}`, 'json') as any;

    if (!workflow) {
      return c.json({ error: 'Workflow not found' }, 404);
    }

    // Create a Durable Object instance for this execution
    const id = c.env.WORKFLOW_AGENT.idFromName(workflowId);
    const agent = c.env.WORKFLOW_AGENT.get(id);

    // Execute the workflow
    const response = await agent.fetch(
      new Request('https://dummy/execute', {
        method: 'POST',
        body: JSON.stringify({ workflow, input }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await response.json();
    return c.json(result);
  } catch (error) {
    console.error('Error executing workflow:', error);
    return c.json({ error: 'Failed to execute workflow' }, 500);
  }
});

// Get workflow execution status
app.get('/api/workflows/:id/status', async (c) => {
  try {
    const workflowId = c.req.param('id');
    const id = c.env.WORKFLOW_AGENT.idFromName(workflowId);
    const agent = c.env.WORKFLOW_AGENT.get(id);

    const response = await agent.fetch(
      new Request('https://dummy/status', { method: 'GET' })
    );

    const status = await response.json();
    return c.json(status);
  } catch (error) {
    console.error('Error fetching status:', error);
    return c.json({ error: 'Failed to fetch status' }, 500);
  }
});

// WebSocket endpoint for real-time updates
app.get('/api/workflows/:id/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected websocket', 426);
  }

  const workflowId = c.req.param('id');
  const id = c.env.WORKFLOW_AGENT.idFromName(workflowId);
  const agent = c.env.WORKFLOW_AGENT.get(id);

  return agent.fetch(c.req.raw);
});

export default app;
