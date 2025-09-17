import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: 'top' | 'bottom'
}

const Tooltip = ({ content, children, placement = 'top' }: TooltipProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [style, setStyle] = useState<{ top: number; left: number } | null>(null)

  const updatePosition = () => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const top = placement === 'top' ? rect.top - 8 : rect.bottom + 8
    const left = rect.left + rect.width / 2
    setStyle({ top, left })
  }

  useEffect(() => {
    if (!visible) return
    updatePosition()
    const onResize = () => updatePosition()
    const onScroll = () => updatePosition()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [visible, placement])

  return (
    <div
      ref={ref}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="inline-flex align-baseline"
    >
      {children}
      {visible && style && createPortal(
        <div
          className="z-[100001] pointer-events-none fixed"
          style={{ top: style.top, left: style.left, transform: 'translateX(-50%)' }}
        >
          <div className="max-w-xs px-2 py-1 rounded bg-[#128763] text-white text-xs shadow-lg">
            {content}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Tooltip


