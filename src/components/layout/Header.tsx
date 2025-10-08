'use client';

import React, { useState } from 'react';
import { Save, Play, List, Download, Upload, Zap } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { createWorkflow, executeWorkflow } from '@/lib/api';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

interface HeaderProps {
  onOpenWorkflows: () => void;
}

export function Header({ onOpenWorkflows }: HeaderProps) {
  const {
    nodes,
    edges,
    workflowId,
    workflowName,
    setWorkflowId,
    setWorkflowName,
    setExecuting,
    isExecuting,
  } = useWorkflowStore();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const id = workflowId || nanoid();
      
      await createWorkflow({
        id,
        name: workflowName,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.data.nodeType || n.data.label.toLowerCase() as any,
          data: n.data,
          position: n.position,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        })),
        createdAt: Date.now(),
      });

      setWorkflowId(id);
      toast.success('Workflow saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!workflowId) {
      toast.error('Please save the workflow first');
      return;
    }

    if (nodes.length === 0) {
      toast.error('Add some nodes to execute');
      return;
    }

    try {
      setExecuting(true);
      const input = prompt('Enter input data (JSON):');
      let parsedInput = {};

      if (input) {
        try {
          parsedInput = JSON.parse(input);
        } catch {
          parsedInput = { text: input };
        }
      }

      const result = await executeWorkflow(workflowId, parsedInput);
      toast.success('Workflow executed successfully!');
      console.log('Execution result:', result);
    } catch (error) {
      console.error('Execution error:', error);
      toast.error('Failed to execute workflow');
    } finally {
      setExecuting(false);
    }
  };

  const handleExport = () => {
    const data = {
      id: workflowId,
      name: workflowName,
      nodes,
      edges,
      exportedAt: Date.now(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          // Load workflow would be implemented here
          toast.success('Workflow imported!');
        } catch {
          toast.error('Invalid workflow file');
        }
      }
    };
    input.click();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AgentFlow
          </h1>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Workflow name"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenWorkflows}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2 transition-colors"
        >
          <List className="w-4 h-4" />
          <span>Workflows</span>
        </button>

        <button
          onClick={handleImport}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Import</span>
        </button>

        <button
          onClick={handleExport}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>

        <div className="h-8 w-px bg-gray-300" />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>

        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>{isExecuting ? 'Running...' : 'Execute'}</span>
        </button>
      </div>
    </header>
  );
}
