'use client'

import { motion } from 'framer-motion'
import { useCallback, useRef, useState } from 'react'

interface DraggablePanelProps {
  children: React.ReactNode
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function DraggablePanel({
  children,
  initialWidth = 300,
  minWidth = 200,
  maxWidth = 600
}: DraggablePanelProps) {
  const [width, setWidth] = useState(initialWidth)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (panelRef.current) {
        const newWidth = e.clientX - panelRef.current.getBoundingClientRect().left
        setWidth(Math.min(Math.max(newWidth, minWidth), maxWidth))
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [minWidth, maxWidth])

  return (
    <motion.div
      ref={panelRef}
      style={{ width }}
      className="relative h-full"
    >
      {children}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-gray-400"
        onMouseDown={handleMouseDown}
      />
    </motion.div>
  )
}

