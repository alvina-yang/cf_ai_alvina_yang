import { useEffect, useRef, useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { createWebSocket } from '@/lib/api';
import { ExecutionEvent } from '@/types/workflow';

export function useWorkflowExecution(workflowId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const {
    setCurrentExecutingNode,
    setExecutionResults,
    setExecutionErrors,
    executionResults,
  } = useWorkflowStore();

  useEffect(() => {
    if (!workflowId) return;

    // Create WebSocket connection
    const ws = createWebSocket(workflowId);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: ExecutionEvent = JSON.parse(event.data);
        console.log('WebSocket message:', message);

        switch (message.type) {
          case 'execution_started':
            console.log('Execution started:', message.data);
            break;

          case 'node_started':
            setCurrentExecutingNode(message.data.nodeId);
            break;

          case 'node_completed':
            setExecutionResults({
              ...executionResults,
              [message.data.nodeId]: message.data.result,
            });
            break;

          case 'node_failed':
            setExecutionErrors({
              [message.data.nodeId]: message.data.error,
            });
            break;

          case 'execution_completed':
            setCurrentExecutingNode(null);
            console.log('Execution completed:', message.data);
            break;

          case 'execution_failed':
            setCurrentExecutingNode(null);
            console.error('Execution failed:', message.data);
            break;

          case 'state':
            // Handle full state update
            if (message.data.currentNodeId) {
              setCurrentExecutingNode(message.data.currentNodeId);
            }
            if (message.data.results) {
              setExecutionResults(message.data.results);
            }
            if (message.data.errors) {
              setExecutionErrors(message.data.errors);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [workflowId]);

  return { isConnected };
}
