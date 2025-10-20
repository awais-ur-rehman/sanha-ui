import React from 'react'
import { type ButtonProps as ButtonPropsType } from '../types'

interface ButtonProps extends Omit<ButtonPropsType, 'onClick'> {
  onClick?: () => void
  className?: string
  [key: string]: any // For additional props
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-[#0c684b] text-white hover:bg-green-900 focus:ring-green-500 cursor-pointer',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 cursor-pointer',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 cursor-pointer bg-white',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 cursor-pointer',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 cursor-pointer',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 cursor-pointer',
  }
  
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-4 text-lg',
  }

  const handleClick = () => {
    if (onClick && !loading && !disabled) {
      onClick()
    }
  }

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant as keyof typeof variantClasses]}
        ${sizeClasses[size as keyof typeof sizeClasses]}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button 