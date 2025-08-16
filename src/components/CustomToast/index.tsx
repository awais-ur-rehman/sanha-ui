import React, { useEffect, useState } from 'react'
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa'
import { type ToastType } from '../../types'

interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose: () => void
  className?: string
}

const Toast: React.FC<ToastProps> = ({ type, message, duration = 5000, onClose, className = '' }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    const baseStyles = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4 p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out'
    
    const typeStyles: Record<ToastType, string> = {
      success: 'bg-green-50 border border-green-200 text-black/60',
      error: 'bg-red-50 border border-red-200 text-black/60',
      warning: 'bg-yellow-50 border border-yellow-200 text-black/60',
      info: 'bg-blue-50 border border-blue-200 text-black/60',
    }

    const visibilityStyles = isVisible 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 -translate-y-2'

    return `${baseStyles} ${typeStyles[type]} ${visibilityStyles} ${className}`
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <FaTimesCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <FaTimesCircle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <FaCheckCircle className="w-5 h-5 text-blue-600" />
      default:
        return null
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast 