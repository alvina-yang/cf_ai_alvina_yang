export const config = {
  workerUrl: process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787',
  defaultModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
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
  ui: {
    maxChatMessages: 100,
    maxWorkflowHistoryItems: 50,
    autoSaveInterval: 30000,
  },
  execution: {
    maxRetries: 3,
    timeout: 300000,
  },
} as const;

export type Config = typeof config;

