"use client"

import * as React from "react"
import { cn } from "../../utils/cn"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleClick = () => {
      onCheckedChange?.(!checked);
    };

    return (
      <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
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
            "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
            checked 
              ? "bg-[#0c684b]" 
              : "bg-gray-200",
            className
          )}
        >
          <div
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </div>
      </div>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
