import { useCallback, useRef } from 'react'

interface ResizeHandleProps {
  side: 'left' | 'right'
  onResize: (deltaX: number) => void
  onResizeEnd?: () => void
}

export default function ResizeHandle({ side, onResize, onResizeEnd }: ResizeHandleProps) {
  const startXRef = useRef(0)
  const draggingRef = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    startXRef.current = e.clientX
    draggingRef.current = true

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingRef.current) return
      const deltaX = moveEvent.clientX - startXRef.current
      startXRef.current = moveEvent.clientX
      onResize(deltaX)
    }

    const handleMouseUp = () => {
      draggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('is-resizing')
      onResizeEnd?.()
    }

    document.body.classList.add('is-resizing')
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [onResize, onResizeEnd])

  return (
    <div
      className={`resize-handle resize-handle-${side}`}
      onMouseDown={handleMouseDown}
    />
  )
}
