'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from 'ai/react'

export function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'user' ? 'text-blue-600' : 'text-green-600'
            }`}
          >
            <p className="font-semibold">{message.role === 'user' ? 'You' : 'AI'}:</p>
            <p>{message.content}</p>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  )
}

