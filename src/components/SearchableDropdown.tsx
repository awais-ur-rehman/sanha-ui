import { useState, useRef, useEffect, forwardRef } from 'react'
import { FiChevronDown, FiPlus, FiX } from 'react-icons/fi'

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
  onAddCustom?: (value: string) => Promise<void> | void
  isAddingCustom?: boolean
  /**
   * When true, filtering is delegated to the parent (server-side search):
   * the component renders `options` as-is and reports the typed term via
   * `onSearchChange` instead of filtering locally.
   */
  serverSide?: boolean
  onSearchChange?: (term: string) => void
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
    maxDisplayed,
    onAddCustom,
    isAddingCustom = false,
    serverSide = false,
    onSearchChange
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [inputValue, setInputValue] = useState(value || '')
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)



    // Filter options based on search term.
    // In server-side mode the parent already returns matches for the current
    // term, so we render options as-is (optionally capped by maxDisplayed).
    const filteredOptions = serverSide
      ? (maxDisplayed && maxDisplayed > 0 ? options.slice(0, maxDisplayed) : options)
      : maxDisplayed && maxDisplayed > 0
        ? options.filter(option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, maxDisplayed)
        : options.filter(option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )

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
      // In server-side mode `options` changes on every fetch; re-deriving the
      // input from it would wipe what the user is typing. The label is managed
      // by handleSelect / the clear button instead.
      if (serverSide) return
      if (value) {
        const selectedOption = options.find(option => option.value.toString() === value.toString())
        setInputValue(selectedOption ? selectedOption.label : value.toString())
      } else {
        setInputValue('')
      }
    }, [value, options, serverSide])

    // Report the typed term to the parent so it can drive a server-side search.
    useEffect(() => {
      if (serverSide && onSearchChange) {
        onSearchChange(searchTerm)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, serverSide])

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
        onChange?.(option.value.toString())
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    const handleCustomValue = async () => {
      if (inputValue.trim()) {
        // If onAddCustom is provided, call it first (for API calls)
        if (onAddCustom) {
          try {
            await onAddCustom(inputValue.trim())
            // After successful creation, set the value
            onChange?.(inputValue.trim())
            setIsOpen(false)
            setSearchTerm('')
          } catch {
            // Error handling is done in the parent component
            // Don't close dropdown or set value on error
          }
        } else {
          // Fallback to original behavior if no onAddCustom provided
          onChange?.(inputValue.trim())
          setIsOpen(false)
          setSearchTerm('')
        }
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (allowCustomValue && inputValue.trim()) {
          // Check if it's a new value (not in existing options)
          const isNewValue = !options.find(opt => opt.label.toLowerCase() === inputValue.trim().toLowerCase())
          if (isNewValue && onAddCustom) {
            handleCustomValue()
          } else if (isNewValue) {
            handleCustomValue()
          } else if (filteredOptions.length > 0) {
            handleSelect(filteredOptions[0].value)
          }
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
              transition-colors duration-200 bg-[#F9F8F6]
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
              ${className}
            `}
          />

          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('')
                  setSearchTerm('')
                  onChange?.('')
                  setIsOpen(false)
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <FiX className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} pointer-events-none`} />
          </div>

          {isOpen && (
            <div className="absolute z-[9999] w-full mt-1 bg-[#F9F8F6] border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
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
                  disabled={isAddingCustom}
                  className="w-full px-4 py-3 text-left border-t border-black/10 bg-green-50 hover:bg-green-100 focus:bg-green-100 focus:outline-none text-green-700 transition-colors duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPlus size={14} />
                  {isAddingCustom ? 'Adding...' : `Add "${inputValue.trim()}"`}
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
