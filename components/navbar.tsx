'use client'

import { Button } from '@/components/ui/button'
import { useToast } from "@/hooks/use-toast"
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// import { useCallback } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  
  const handleShare =  () => {
    
    try {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Éxitosamente",
        description: "El enlace ha sido copiado al portapapeles",
      })
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: "Hubo un error",
      })
      throw e
    }
  }

  // Don't show navbar on landing page
  if (pathname === '/') return null

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/project" className="font-bold">
          SearcherAI
        </Link>
        
        <div className="ml-auto flex items-center space-x-4">

          <Button variant="outline" onClick={handleShare}>Compartir</Button>
          
          <Button variant="ghost">Account</Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </nav>
  )
}

