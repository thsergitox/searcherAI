'use client'

import { ChatPanel } from '@/components/chat-panel'
import { DraggablePanel } from '@/components/draggable-panel'
import MonacoWithWebsocket from '@/components/monaco-editor'

interface DocumentPageProps {
  params: {
    id: string
  }
}

export default function DocumentPage({ params }: DocumentPageProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1 overflow-hidden">
        <DraggablePanel>
          <ChatPanel />
        </DraggablePanel>
        
        <div className="flex-1">
          <MonacoWithWebsocket documentId={params.id} />
        </div>
        <DraggablePanel>
        <div className="w-80 border-l p-4">
          {/* PDF Preview will go here */}
        </div>
        </DraggablePanel>
      </div>
    </div>
  )
}

