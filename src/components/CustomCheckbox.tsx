import { forwardRef, type InputHTMLAttributes } from 'react'
import { FiCheck } from 'react-icons/fi'

interface CustomCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const CustomCheckbox = forwardRef<HTMLInputElement, CustomCheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className={`flex items-center space-x-3 ${props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              className="sr-only"
              {...props}
            />
            <div className={`
              w-5 h-5 border-2 rounded-md flex items-center justify-center
              transition-colors duration-200
              ${props.checked 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-300 hover:border-green-400'
              }
              ${error ? 'border-red-500' : ''}
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}>
              {props.checked && (
                <FiCheck className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          {label && (
            <span className={`text-sm ${props.disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
          )}
        </label>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

CustomCheckbox.displayName = 'CustomCheckbox'

export default CustomCheckbox 