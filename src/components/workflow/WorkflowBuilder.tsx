'use client';

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { NodePanel } from './NodePanel';
import { NodeEditor } from './NodeEditor';
import { ExecutionPanel } from './ExecutionPanel';
import { CustomNode } from './CustomNode';
import { NodeType } from '@/types/workflow';

const nodeTypes = {
  custom: CustomNode,
};

export function WorkflowBuilder() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    currentExecutingNode,
    executionErrors,
    executionResults,
  } = useWorkflowStore();

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { project } = useReactFlow();

  // Update node states based on execution
  const enhancedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isExecuting: currentExecutingNode === node.id,
      hasError: !!executionErrors[node.id],
      isCompleted: !!executionResults[node.id] && currentExecutingNode !== node.id,
    },
  }));

  const handleAddNode = useCallback(
    (type: NodeType) => {
      const position = project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      addNode(type, position);
    },
    [addNode, project]
  );

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={enhancedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      <NodePanel onAddNode={handleAddNode} />
      <ExecutionPanel />
      <NodeEditor
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onUpdate={updateNodeData}
      />
    </div>
  );
}
