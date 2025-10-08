/**
 * Application Configuration
 * Centralized configuration for the AgentFlow platform
 */

export const config = {
  // Worker URL - can be overridden by environment variable
  workerUrl: process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787',
  
  // Default LLM models
  defaultModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  
  // Available models
  availableModels: [
    {
      id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      name: 'Llama 3.3 70B (Fast)',
      provider: 'Meta',
    },
    {
      id: '@cf/meta/llama-3.1-8b-instruct',
      name: 'Llama 3.1 8B',
      provider: 'Meta',
    },
    {
      id: '@cf/mistral/mistral-7b-instruct-v0.1',
      name: 'Mistral 7B',
      provider: 'Mistral AI',
    },
  ],
  
  // UI Configuration
  ui: {
    maxChatMessages: 100,
    maxWorkflowHistoryItems: 50,
    autoSaveInterval: 30000, // 30 seconds
  },
  
  // Execution Configuration
  execution: {
    maxRetries: 3,
    timeout: 300000, // 5 minutes
  },
} as const;

export type Config = typeof config;

