import { useState, useRef, useEffect, forwardRef } from 'react'
import { FiChevronDown, FiPlus } from 'react-icons/fi'

interface SearchableDropdownProps {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  allowCustomValue?: boolean
  maxDisplayed?: number
}

const SearchableDropdown = forwardRef<HTMLDivElement, SearchableDropdownProps>(
  ({ 
    label, 
    error, 
    options, 
    placeholder, 
    value, 
    onChange, 
    disabled, 
    className = '',
    allowCustomValue = true,
    maxDisplayed = 5
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [inputValue, setInputValue] = useState(value || '')
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)



    // Filter options based on search term
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, maxDisplayed)

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

    useEffect(() => {
      setInputValue(value || '')
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setSearchTerm(newValue)
      
      if (!isOpen) {
        setIsOpen(true)
      }
    }

    const handleInputFocus = () => {
      if (!disabled) {
        setIsOpen(true)
        setSearchTerm('')
      }
    }

    const handleSelect = (optionValue: string | number) => {
      const option = options.find(opt => opt.value === optionValue)
      if (option) {
        setInputValue(option.label)
        onChange?.(option.label)
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    const handleCustomValue = () => {
      if (inputValue.trim()) {
        onChange?.(inputValue.trim())
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (allowCustomValue && inputValue.trim()) {
          handleCustomValue()
        } else if (filteredOptions.length > 0) {
          handleSelect(filteredOptions[0].value)
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    return (
      <div className="space-y-2" ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative" ref={dropdownRef}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder || 'Search or type...'}
            className={`
              w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-[#0c684b]
              transition-colors duration-200 bg-white
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
              ${className}
            `}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {isOpen && (
            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-3 text-left border-b border-black/10 last:border-b-0
                      hover:bg-gray-100 hover:text-black focus:bg-gray-50 focus:outline-none
                      ${option.label === inputValue ? 'bg-[#0c684b] text-white hover:bg-[#0c684b]' : 'text-black'}
                      transition-colors duration-150
                    `}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No options found
                </div>
              )}
              
              {allowCustomValue && inputValue.trim() && !options.find(opt => opt.label.toLowerCase() === inputValue.toLowerCase()) && (
                <button
                  type="button"
                  onClick={handleCustomValue}
                  className="w-full px-4 py-3 text-left border-t border-black/10 bg-green-50 hover:bg-green-100 focus:bg-green-100 focus:outline-none text-green-700 transition-colors duration-150 flex items-center gap-2"
                >
                  <FiPlus size={14} />
                  Add "{inputValue.trim()}"
                </button>
              )}
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

SearchableDropdown.displayName = 'SearchableDropdown'

export default SearchableDropdown
