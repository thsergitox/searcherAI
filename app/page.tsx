import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-bold">Welcome to SearcherAI</h1>
      <p className="text-xl text-muted-foreground">
        Collaborative document editing with AI assistance
      </p>
      <div className="space-x-4">
        <Link href="/project">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </div>
  )
}

