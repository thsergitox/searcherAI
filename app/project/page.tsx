'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewDocument() {
  const router = useRouter()
  const [title, setTitle] = useState('')

  const handleCreate = () => {
    const id = crypto.randomUUID()
    // Here you would typically save the document to your backend
    router.push(`/project/${id}`)
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate}>Create Document</Button>
          </div>
        </CardContent>
      </Card>
    </div>)
}

