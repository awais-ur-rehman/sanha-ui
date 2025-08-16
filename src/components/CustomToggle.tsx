import React from 'react'

interface CustomToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const CustomToggle: React.FC<CustomToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-14 h-8',
  }

  const knobSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  }

  const knobTranslateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-6' : 'translate-x-0.5',
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${sizeClasses[size]}
        ${checked 
          ? 'bg-green-500 shadow-inner' 
          : 'bg-gray-200 shadow-inner'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:shadow-md'
        }
        ${className}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          ${knobSizeClasses[size]}
          ${knobTranslateClasses[size]}
        `}
      />
    </button>
  )
}

export default CustomToggle 