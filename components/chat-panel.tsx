'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  response: string
  sessionId: string
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/ai/chatbot`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId || "string"
        })
      })

      if (!response.ok) {
        if (response.status === 422) {
          throw new Error('Invalid request format')
        }
        throw new Error(`Server error: ${response.status}`)
      }

      const data: ChatResponse = await response.json()
      
      // Store the sessionId for future requests
      setSessionId(data.sessionId)
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: error instanceof Error 
          ? `Error: ${error.message}`
          : 'Sorry, there was an error processing your message.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

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
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  )
}

