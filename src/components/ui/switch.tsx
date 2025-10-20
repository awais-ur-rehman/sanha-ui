"use client"

import * as React from "react"
import { cn } from "../../utils/cn"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: 'sm' | 'md'
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, size = 'md', ...props }, ref) => {
    const handleClick = () => {
      onCheckedChange?.(!checked);
    };

    const wrapperSize = size === 'sm' ? 'h-5 w-10' : 'h-6 w-11'
    const trackSize = size === 'sm' ? 'h-5 w-10' : 'h-6 w-11'
    const knobSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    const knobTranslate = checked ? (size === 'sm' ? 'translate-x-5' : 'translate-x-5') : (size === 'sm' ? 'translate-x-0' : 'translate-x-0')

    return (
      <div className={`relative inline-flex ${wrapperSize} items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => {
            onCheckedChange?.(e.target.checked);
          }}
          className="sr-only"
          {...props}
        />
        <div
          onClick={handleClick}
          className={cn(
            `relative inline-flex ${trackSize} cursor-pointer items-center rounded-full border-2 border-transparent transition-colors`,
            checked 
              ? "bg-[#0c684b]" 
              : "bg-gray-200",
            className
          )}
        >
          <div
            className={cn(
              `pointer-events-none block ${knobSize} rounded-full bg-white shadow-lg ring-0 transition-transform`,
              knobTranslate
            )}
          />
        </div>
      </div>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
