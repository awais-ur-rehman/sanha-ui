import { useState, useRef, useEffect, forwardRef } from 'react'
import { FiChevronDown } from 'react-icons/fi'

interface CustomDropdownProps {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
  value?: string | number
  onChange?: (value: string | number) => void
  disabled?: boolean
  className?: string
}

const CustomDropdown = forwardRef<HTMLDivElement, CustomDropdownProps>(
  ({ label, error, options, placeholder, value, onChange, disabled, className = '' }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(option => option.value === value)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    const handleSelect = (optionValue: string | number) => {
      onChange?.(optionValue)
      setIsOpen(false)
    }

    return (
      <div className="space-y-2 min-w-32 max-w-40" ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-[#0c684b]
              transition-colors duration-200 bg-white text-left
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
              ${className}
            `}
          >
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption ? selectedOption.label : placeholder || 'Select an option'}
            </span>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isOpen && (
            <div className="absolute z-[9999] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto min-w-32">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-4 py-3 text-left border-b border-black/10 last:border-b-0
                    hover:bg-gray-100 hover:text-black focus:bg-gray-50 focus:outline-none
                    ${option.value === value ? 'bg-[#0c684b] text-white hover:bg-[#0c684b]' : 'text-black'}
                    transition-colors duration-150
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

CustomDropdown.displayName = 'CustomDropdown'

export default CustomDropdown 