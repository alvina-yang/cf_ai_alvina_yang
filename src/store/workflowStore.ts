import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow';
import { nanoid } from 'nanoid';
import { WorkflowNode, WorkflowEdge, NodeType } from '@/types/workflow';
import { config } from '@/lib/config';

interface WorkflowStore {
  nodes: Node[];
  edges: Edge[];
  workflowId: string | null;
  workflowName: string;
  isExecuting: boolean;
  executionResults: Record<string, any>;
  executionErrors: Record<string, string>;
  currentExecutingNode: string | null;

  setWorkflowId: (id: string) => void;
  setWorkflowName: (name: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position?: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, data: any) => void;
  clearWorkflow: () => void;
  loadWorkflow: (nodes: Node[], edges: Edge[], id: string, name: string) => void;
  setExecuting: (executing: boolean) => void;
  setExecutionResults: (results: Record<string, any>) => void;
  setExecutionErrors: (errors: Record<string, string>) => void;
  setCurrentExecutingNode: (nodeId: string | null) => void;
}

const getNodeLabel = (type: NodeType): string => {
  const labels: Record<NodeType, string> = {
    start: 'Start',
    llm: 'LLM',
    http: 'HTTP Request',
    transform: 'Transform',
    condition: 'Condition',
    end: 'End',
  };
  return labels[type];
};

const getNodeDefaultData = (type: NodeType): any => {
  switch (type) {
    case 'llm':
      return {
        label: 'LLM',
        prompt: 'Your prompt here',
        model: config.defaultModel,
        temperature: 0.7,
      };
    case 'http':
      return {
        label: 'HTTP Request',
        url: 'https://api.example.com/endpoint',
        method: 'GET',
        headers: {},
      };
    case 'transform':
      return {
        label: 'Transform',
        transformType: 'json',
        config: {},
      };
    case 'condition':
      return {
        label: 'Condition',
        condition: 'data.value > 0',
        trueValue: 'true',
        falseValue: 'false',
      };
    default:
      return { label: getNodeLabel(type) };
  }
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  workflowId: null,
  workflowName: 'Untitled Workflow',
  isExecuting: false,
  executionResults: {},
  executionErrors: {},
  currentExecutingNode: null,

  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },

  addNode: (type, position = { x: 250, y: 250 }) => {
    const newNode: Node = {
      id: nanoid(),
      type: type === 'start' || type === 'end' ? 'default' : 'custom',
      position,
      data: {
        ...getNodeDefaultData(type),
        nodeType: type, // Store the actual node type for reference
      },
    };

    set({ nodes: [...get().nodes, newNode] });
  },

  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
    });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      workflowId: null,
      workflowName: 'Untitled Workflow',
      executionResults: {},
      executionErrors: {},
      currentExecutingNode: null,
    });
  },

  loadWorkflow: (nodes, edges, id, name) => {
    set({
      nodes,
      edges,
      workflowId: id,
      workflowName: name,
      executionResults: {},
      executionErrors: {},
      currentExecutingNode: null,
    });
  },

  setExecuting: (executing) => set({ isExecuting: executing }),
  setExecutionResults: (results) => set({ executionResults: results }),
  setExecutionErrors: (errors) => set({ executionErrors: errors }),
  setCurrentExecutingNode: (nodeId) => set({ currentExecutingNode: nodeId }),
}));
