'use client';

import React, { useEffect, useState } from 'react';
import { X, Clock, Trash2 } from 'lucide-react';
import { listWorkflows, getWorkflow } from '@/lib/api';
import { Workflow } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { formatTimestamp } from '@/lib/utils';
import { toast } from 'sonner';

interface WorkflowListProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowList({ isOpen, onClose }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { loadWorkflow } = useWorkflowStore();

  useEffect(() => {
    if (isOpen) {
      loadWorkflows();
    }
  }, [isOpen]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await listWorkflows();
      setWorkflows(data.workflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadWorkflow = async (id: string) => {
    try {
      const workflow = await getWorkflow(id);
      loadWorkflow(
        workflow.nodes.map((n) => ({
          id: n.id,
          type: n.type === 'start' || n.type === 'end' ? 'default' : 'custom',
          position: n.position,
          data: {
            ...n.data,
            nodeType: n.type,
          },
        })),
        workflow.edges,
        workflow.id,
        workflow.name
      );
      toast.success('Workflow loaded!');
      onClose();
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast.error('Failed to load workflow');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">My Workflows</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading workflows...</div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No workflows yet. Create your first workflow!
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleLoadWorkflow(workflow.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{workflow.name}</h3>
                      {workflow.description && (
                        <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(workflow.createdAt)}
                        </div>
                        <div>{workflow.nodes.length} nodes</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Delete functionality would go here
                        toast.info('Delete functionality coming soon');
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
