'use client';

import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { MessageSquare } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { WorkflowBuilder } from '@/components/workflow/WorkflowBuilder';
import { WorkflowList } from '@/components/layout/WorkflowList';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [isWorkflowListOpen, setIsWorkflowListOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="flex flex-col h-screen">
      <Header onOpenWorkflows={() => setIsWorkflowListOpen(true)} />
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <WorkflowBuilder />
        </ReactFlowProvider>
        
        {/* Floating Chat Button */}
        {!isChatOpen && (
          <Button
            onClick={() => setIsChatOpen(true)}
            className="fixed right-4 bottom-4 z-40 rounded-full w-14 h-14 shadow-2xl"
            variant="gradient"
            size="icon"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        )}
      </div>
      
      <WorkflowList
        isOpen={isWorkflowListOpen}
        onClose={() => setIsWorkflowListOpen(false)}
      />
      
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        workflowContext="I'm working on an AI workflow automation platform."
      />
    </main>
  );
}
