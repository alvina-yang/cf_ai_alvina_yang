'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';

export function ExecutionPanel() {
  const {
    executionResults,
    executionErrors,
    currentExecutingNode,
    isExecuting,
    nodes,
  } = useWorkflowStore();

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  const toggleNodeExpanded = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Track execution history
  useEffect(() => {
    if (isExecuting && currentExecutingNode) {
      setExecutionHistory((prev) => [
        ...prev,
        {
          nodeId: currentExecutingNode,
          status: 'running',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [currentExecutingNode, isExecuting]);

  useEffect(() => {
    Object.keys(executionResults).forEach((nodeId) => {
      setExecutionHistory((prev) => {
        const existing = prev.find((h) => h.nodeId === nodeId && h.status === 'running');
        if (existing) {
          return prev.map((h) =>
            h === existing
              ? { ...h, status: 'completed', completedAt: Date.now() }
              : h
          );
        }
        return prev;
      });
    });
  }, [executionResults]);

  useEffect(() => {
    Object.keys(executionErrors).forEach((nodeId) => {
      setExecutionHistory((prev) => {
        const existing = prev.find((h) => h.nodeId === nodeId && h.status === 'running');
        if (existing) {
          return prev.map((h) =>
            h === existing
              ? { ...h, status: 'failed', completedAt: Date.now(), error: executionErrors[nodeId] }
              : h
          );
        }
        return prev;
      });
    });
  }, [executionErrors]);

  const getNodeStatus = (nodeId: string) => {
    if (currentExecutingNode === nodeId) return 'running';
    if (executionErrors[nodeId]) return 'error';
    if (executionResults[nodeId]) return 'completed';
    return 'pending';
  };

  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node?.data.label || nodeId;
  };

  const hasAnyExecution = Object.keys(executionResults).length > 0 || 
                         Object.keys(executionErrors).length > 0 || 
                         currentExecutingNode !== null;

  if (!hasAnyExecution) {
    return (
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 w-80">
        <h3 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Execution Status
        </h3>
        <div className="text-center py-6 text-gray-500 text-sm">
          <p>No executions yet</p>
          <p className="text-xs mt-2">Run a workflow to see execution details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg w-80 max-h-96 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Execution Status
          {isExecuting && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500 ml-auto" />
          )}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {nodes.map((node) => {
          const status = getNodeStatus(node.id);
          const isExpanded = expandedNodes.has(node.id);
          const result = executionResults[node.id];
          const error = executionErrors[node.id];

          if (status === 'pending') return null;

          return (
            <div key={node.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleNodeExpanded(node.id)}
                className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}

                {status === 'running' && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
                {status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {status === 'error' && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}

                <span className="flex-1 text-left text-sm font-medium text-gray-800">
                  {getNodeLabel(node.id)}
                </span>

                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    status === 'running' && 'bg-blue-100 text-blue-700',
                    status === 'completed' && 'bg-green-100 text-green-700',
                    status === 'error' && 'bg-red-100 text-red-700'
                  )}
                >
                  {status}
                </span>
              </button>

              {isExpanded && (
                <div className="p-3 bg-gray-50 border-t text-xs space-y-2">
                  {result && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Result:</p>
                      <pre className="bg-white p-2 rounded border overflow-x-auto max-h-32 text-xs">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {error && (
                    <div>
                      <p className="font-semibold text-red-700 mb-1">Error:</p>
                      <div className="bg-red-50 p-2 rounded border border-red-200 text-red-800">
                        {error}
                      </div>
                    </div>
                  )}

                  {!result && !error && status === 'running' && (
                    <div className="text-gray-500 italic">Processing...</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {executionHistory.length > 0 && (
        <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
          <p className="font-semibold mb-1">Execution Timeline:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {executionHistory.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span>{getNodeLabel(entry.nodeId)}</span>
                <span className="text-gray-500">
                  {entry.completedAt
                    ? formatDuration(entry.timestamp, entry.completedAt)
                    : 'Running...'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

