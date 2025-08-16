import { forwardRef, type InputHTMLAttributes } from 'react'

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
            transition-colors duration-200
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

CustomInput.displayName = 'CustomInput'

export default CustomInput 