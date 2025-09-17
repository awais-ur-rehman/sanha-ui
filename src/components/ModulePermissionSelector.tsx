import { useState, useEffect } from 'react'
import { FiX, FiChevronDown } from 'react-icons/fi'
import { type Module } from '../types/rbac'

interface ModulePermissionSelectorProps {
  modules: Module[]
  selectedModules: ModulePermission[]
  onModulesChange: (modules: ModulePermission[]) => void
  disabled?: boolean
  className?: string
}

interface ModulePermission {
  moduleId: number
  moduleName: string
  permissions: string[]
}

const AVAILABLE_PERMISSIONS = ['read', 'create', 'update', 'delete', 'export']

const ModulePermissionSelector = ({ 
  modules, 
  selectedModules, 
  onModulesChange, 
  disabled = false,
  className = '' 
}: ModulePermissionSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [availableModules, setAvailableModules] = useState<Module[]>([])

  useEffect(() => {
    // Filter out already selected modules
    const selectedModuleIds = selectedModules.map(sm => sm.moduleId)
    setAvailableModules(modules.filter(module => !selectedModuleIds.includes(module.id)))
  }, [modules, selectedModules])

  const handleModuleSelect = (module: Module) => {
    const newModulePermission: ModulePermission = {
      moduleId: module.id,
      moduleName: module.name,
      permissions: ['read'] // Default to read permission
    }
    onModulesChange([...selectedModules, newModulePermission])
    setIsOpen(false)
  }

  const handleModuleRemove = (moduleId: number) => {
    onModulesChange(selectedModules.filter(sm => sm.moduleId !== moduleId))
  }

  const handlePermissionToggle = (moduleId: number, permission: string) => {
    const updatedModules = selectedModules.map(sm => {
      if (sm.moduleId === moduleId) {
        if (permission === 'read') {
          // Don't allow removing read permission
          return sm
        }
        
        const hasPermission = sm.permissions.includes(permission)
        if (hasPermission) {
          return {
            ...sm,
            permissions: sm.permissions.filter(p => p !== permission)
          }
        } else {
          return {
            ...sm,
            permissions: [...sm.permissions, permission]
          }
        }
      }
      return sm
    })
    onModulesChange(updatedModules)
  }

  const CustomSwitch = ({ 
    checked, 
    onChange, 
    disabled: switchDisabled = false 
  }: { 
    checked: boolean
    onChange: () => void
    disabled?: boolean 
  }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={switchDisabled}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full transition-colors
        ${checked ? 'bg-[#0c684b]' : 'bg-gray-300'}
        ${switchDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-4' : 'translate-x-0.5'}
        `}
      />
    </button>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Module Selector */}
      <div className="relative">
          <label className="block text-sm font-normal text-gray-700 mb-2">
          Select Modules *
        </label>
        
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || availableModules.length === 0}
          className="w-full px-4 py-3 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-[#0c684b] bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors duration-200"
        >
          <span className="text-gray-500 pr-8">
            {availableModules.length === 0 ? 'No more modules available' : 'Select Modules'}
          </span>
          <FiChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && availableModules.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-48 overflow-y-auto">
            {availableModules.map((module) => (
              <button
                key={module.id}
                type="button"
                onClick={() => handleModuleSelect(module)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors duration-150"
              >
                <span className="text-sm text-gray-900">{module.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Modules with Permissions */}
      {selectedModules.length > 0 && (
        <div className="space-y-3">
            <label className="block text-sm font-normal text-gray-700">
            Selected Modules & Permissions
          </label>
          
          {/* Scrollable container for selected modules */}
          <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
            {selectedModules.map((selectedModule) => (
              <div key={selectedModule.moduleId} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                {/* Module Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedModule.moduleName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleModuleRemove(selectedModule.moduleId)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>

                {/* Permission Switches */}
                <div className="grid grid-cols-5 gap-3">
                  {AVAILABLE_PERMISSIONS.map((permission) => {
                    const isChecked = selectedModule.permissions.includes(permission)
                    const isReadOnly = permission === 'read'
                    
                    return (
                      <div key={permission} className="flex items-center space-x-2">
                        <CustomSwitch
                          checked={isChecked}
                          onChange={() => handlePermissionToggle(selectedModule.moduleId, permission)}
                          disabled={disabled || isReadOnly}
                        />
                        <span className={`text-xs capitalize ${
                          isReadOnly ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {permission}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModulePermissionSelector
