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
      <div className="space-y-2" ref={ref}>
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
               px-3 py-[10px] border border-gray-300 rounded-md 
              focus:outline-none focus:ring-1 focus:ring-[#0c684b] focus:border-[#0c684b]
              transition-colors duration-200 bg-white text-left 
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
              ${className}
            `}
          >
            <span className={`${selectedOption ? 'text-gray-500' : 'text-gray-900'} pr-8`}>
              {selectedOption ? selectedOption.label : placeholder || 'Select an option'}
            </span>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

            {isOpen && (
              <div className="absolute z-[9999] mt-1 bg-white -right-[10px] border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto w-32 p-2">
                {options.map((option) => {
                  const isActive = option.value === value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full px-3 py-2.5 text-left text-xs rounded-md
                        hover:bg-gray-100 hover:text-black focus:bg-gray-50 focus:outline-none
                        transition-colors duration-150
                      `}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${isActive ? 'bg-[#0c684b]' : 'bg-gray-300'}`}></span>
                        <span>{option.label}</span>
                      </span>
                    </button>
                  )
                })}
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