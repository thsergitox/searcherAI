'use client'

import { ChatPanel } from '@/components/chat-panel';
import { DraggablePanel } from '@/components/draggable-panel';
import MonacoWithWebsocket from '@/components/monaco-editor';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


interface DocumentPageProps {
  params: {
    id: string
  }
}

const queryClient = new QueryClient({});

export default function DocumentPage({ params }: DocumentPageProps) {
  return (
    
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1 overflow-hidden">
        <DraggablePanel>
          <ChatPanel />
        </DraggablePanel>
        
        <div className="flex-1">
        <QueryClientProvider client={queryClient}>

          <MonacoWithWebsocket documentId={params.id} />
        </QueryClientProvider>
        </div>
      </div>
    </div>
  )
}

