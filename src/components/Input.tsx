import React, { useState } from 'react'
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa'
import { type InputType, type InputIcon } from '../types'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: InputIcon
  type?: InputType
  className?: string
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon = 'none',
  type = 'text',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  const getIconComponent = () => {
    switch (icon) {
      case 'email':
        return <FaEnvelope className="w-4 h-4 text-gray-400" />
      case 'password':
        return <FaLock className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon !== 'none' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {getIconComponent()}
          </div>
        )}
        <input
          type={inputType}
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent transition-colors
            ${error 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 bg-white hover:border-gray-400'
            }
            ${icon !== 'none' ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FaEyeSlash className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <FaEye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

export default Input 