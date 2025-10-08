'use client';

import React from 'react';
import { Zap, Globe, Code, GitBranch, Play, Square } from 'lucide-react';
import { NodeType } from '@/types/workflow';

interface NodePanelProps {
  onAddNode: (type: NodeType) => void;
}

const nodeTypes: { type: NodeType; label: string; icon: any; description: string }[] = [
  { type: 'start', label: 'Start', icon: Play, description: 'Start of workflow' },
  { type: 'llm', label: 'LLM', icon: Zap, description: 'AI language model' },
  { type: 'http', label: 'HTTP', icon: Globe, description: 'API request' },
  { type: 'transform', label: 'Transform', icon: Code, description: 'Data transformation' },
  { type: 'condition', label: 'Condition', icon: GitBranch, description: 'Conditional logic' },
  { type: 'end', label: 'End', icon: Square, description: 'End of workflow' },
];

export function NodePanel({ onAddNode }: NodePanelProps) {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 w-64">
      <h3 className="font-semibold text-sm mb-3 text-gray-700">Add Nodes</h3>
      <div className="space-y-2">
        {nodeTypes.map(({ type, label, icon: Icon, description }) => (
          <button
            key={type}
            onClick={() => onAddNode(type)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="p-2 rounded-md bg-gray-100 group-hover:bg-blue-100">
              <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-gray-800">{label}</div>
              <div className="text-xs text-gray-500">{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
