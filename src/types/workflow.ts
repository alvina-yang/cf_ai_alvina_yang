export type NodeType = 'start' | 'llm' | 'http' | 'transform' | 'condition' | 'end';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  data: {
    label: string;
    [key: string]: any;
  };
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: number;
  updatedAt?: number;
}

export interface ExecutionStatus {
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentNodeId: string | null;
  results: Record<string, any>;
  errors: Record<string, string>;
  startedAt: number;
  completedAt?: number;
}

export interface ExecutionEvent {
  type: 'execution_started' | 'node_started' | 'node_completed' | 'node_failed' | 'execution_completed' | 'execution_failed' | 'state';
  data: any;
}
