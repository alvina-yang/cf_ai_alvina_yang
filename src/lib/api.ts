import { Workflow } from '@/types/workflow';
import { config } from './config';

const WORKER_URL = config.workerUrl;

export async function createWorkflow(workflow: Workflow): Promise<{ success: boolean; workflowId: string }> {
  const response = await fetch(`${WORKER_URL}/api/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });

  if (!response.ok) {
    throw new Error('Failed to create workflow');
  }

  return response.json();
}

export async function getWorkflow(id: string): Promise<Workflow> {
  const response = await fetch(`${WORKER_URL}/api/workflows/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch workflow');
  }

  return response.json();
}

export async function listWorkflows(): Promise<{ workflows: Workflow[] }> {
  const response = await fetch(`${WORKER_URL}/api/workflows`);

  if (!response.ok) {
    throw new Error('Failed to list workflows');
  }

  return response.json();
}

export async function executeWorkflow(id: string, input: any): Promise<{ success: boolean; result: any; executionId: string }> {
  const response = await fetch(`${WORKER_URL}/api/workflows/${id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute workflow');
  }

  return response.json();
}

export async function getWorkflowStatus(id: string): Promise<any> {
  const response = await fetch(`${WORKER_URL}/api/workflows/${id}/status`);

  if (!response.ok) {
    throw new Error('Failed to fetch status');
  }

  return response.json();
}

export function createWebSocket(workflowId: string): WebSocket {
  const wsUrl = WORKER_URL.replace('http', 'ws');
  return new WebSocket(`${wsUrl}/api/workflows/${workflowId}/ws`);
}
