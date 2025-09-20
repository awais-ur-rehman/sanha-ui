import React from 'react'
import CustomDropdown from './CustomDropdown'

interface StatusSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  caseType?: 'uppercase' | 'lowercase' | 'proper'
}

const StatusSelect = ({ 
  value, 
  onChange, 
  placeholder = "Select Status", 
  className = "",
  disabled = false,
  caseType = 'proper'
}: StatusSelectProps) => {
  const getStatusOptions = () => {
    switch (caseType) {
      case 'lowercase':
        return [
          { value: 'halaal', label: 'Halaal' },
          { value: 'haraam', label: 'Haraam' },
          { value: 'doubtful', label: 'Doubtful' },
        ]
      case 'uppercase':
        return [
          { value: 'HALAAL', label: 'Halaal' },
          { value: 'HARAAM', label: 'Haraam' },
          { value: 'DOUBTFUL', label: 'Doubtful' },
        ]
      default: // proper case
        return [
          { value: 'Halaal', label: 'Halaal' },
          { value: 'Haraam', label: 'Haraam' },
          { value: 'Doubtful', label: 'Doubtful' },
        ]
    }
  }

  const statusOptions = getStatusOptions()

  return (
    <div className={`w-full ${className}`}>
      <CustomDropdown
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        options={statusOptions}
        disabled={disabled}
        className="w-full"
      />
    </div>
  )
}

export default StatusSelect
