'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Node } from 'reactflow';
import { config } from '@/lib/config';

interface NodeEditorProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}

export function NodeEditor({ node, onClose, onUpdate }: NodeEditorProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (node) {
      setFormData(node.data);
    }
  }, [node]);

  if (!node) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate(node.id, formData);
    onClose();
  };

  const renderFields = () => {
    const nodeType = node.data.nodeType || node.data.label.toLowerCase();

    switch (nodeType) {
      case 'llm':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Prompt</label>
              <textarea
                value={formData.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder="Enter your prompt here. Use {{variable}} for dynamic values."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={formData.model || config.defaultModel}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {config.availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Temperature</label>
              <input
                type="number"
                value={formData.temperature || 0.7}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
          </>
        );

      case 'http':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="text"
                value={formData.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                value={formData.method || 'GET'}
                onChange={(e) => handleChange('method', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Headers (JSON)</label>
              <textarea
                value={JSON.stringify(formData.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    handleChange('headers', JSON.parse(e.target.value));
                  } catch {}
                }}
                className="w-full p-2 border rounded-md font-mono text-sm"
                rows={4}
              />
            </div>
          </>
        );

      case 'transform':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Transform Type</label>
              <select
                value={formData.transformType || 'json'}
                onChange={(e) => handleChange('transformType', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="json">Parse JSON</option>
                <option value="extract">Extract Fields</option>
                <option value="merge">Merge Data</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Configuration (JSON)</label>
              <textarea
                value={JSON.stringify(formData.config || {}, null, 2)}
                onChange={(e) => {
                  try {
                    handleChange('config', JSON.parse(e.target.value));
                  } catch {}
                }}
                className="w-full p-2 border rounded-md font-mono text-sm"
                rows={4}
              />
            </div>
          </>
        );

      case 'condition':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <input
                type="text"
                value={formData.condition || ''}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="data.value > 0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">True Value</label>
              <input
                type="text"
                value={formData.trueValue || ''}
                onChange={(e) => handleChange('trueValue', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">False Value</label>
              <input
                type="text"
                value={formData.falseValue || ''}
                onChange={(e) => handleChange('falseValue', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Edit {node.data.label}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            type="text"
            value={formData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {renderFields()}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
