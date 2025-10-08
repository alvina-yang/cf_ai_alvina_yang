'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Globe, Code, GitBranch, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeIcons = {
  llm: Zap,
  http: Globe,
  transform: Code,
  condition: GitBranch,
  start: Play,
  end: Square,
};

const nodeColors = {
  llm: 'bg-purple-500',
  http: 'bg-blue-500',
  transform: 'bg-green-500',
  condition: 'bg-yellow-500',
  start: 'bg-gray-500',
  end: 'bg-gray-700',
};

export const CustomNode = memo(({ data, selected, id }: NodeProps) => {
  const nodeType = data.nodeType || data.label.toLowerCase();
  const Icon = nodeIcons[nodeType as keyof typeof nodeIcons] || Zap;
  const colorClass = nodeColors[nodeType as keyof typeof nodeColors] || 'bg-gray-500';

  const isExecuting = data.isExecuting;
  const hasError = data.hasError;
  const isCompleted = data.isCompleted;

  return (
    <div
      className={cn(
        'px-4 py-2 shadow-lg rounded-lg border-2 bg-white min-w-[180px] transition-all',
        selected ? 'border-blue-500 shadow-xl' : 'border-gray-300',
        isExecuting && 'border-yellow-400 animate-pulse',
        hasError && 'border-red-500',
        isCompleted && 'border-green-500'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" />

      <div className="flex items-center gap-2">
        <div className={cn('p-2 rounded-md text-white', colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-800">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-500 mt-1">{data.description}</div>
          )}
        </div>
      </div>

      {isExecuting && (
        <div className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
          Executing...
        </div>
      )}

      {hasError && (
        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          Failed
        </div>
      )}

      {isCompleted && !isExecuting && !hasError && (
        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Completed
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
