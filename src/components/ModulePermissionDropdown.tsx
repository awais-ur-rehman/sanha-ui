import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronDown, FiX } from 'react-icons/fi'
import { type Module, type ModulePermission } from '../types/rbac'
import { Switch } from './ui/switch'

interface ModulePermissionDropdownProps {
  label?: string
  modules: Module[]
  selectedModules: ModulePermission[]
  onModulesChange: (modules: ModulePermission[]) => void
  disabled?: boolean
  className?: string
}

const ALL_PERMISSIONS = ['read', 'create', 'update', 'delete', 'export'] as const

const ModulePermissionDropdown = ({
  label,
  modules,
  selectedModules,
  onModulesChange,
  disabled = false,
  className = ''
}: ModulePermissionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number; width: number } | null>(null)

  const selectedModuleIds = useMemo(() => new Set(selectedModules.map(m => m.moduleId)), [selectedModules])

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      // If click is on the floating panel, do not close
      const panel = document.getElementById('mpd-floating-panel')
      if (panel && panel.contains(e.target as Node)) {
        return
      }
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const updatePanelPosition = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPanelStyle({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(prev => {
      const next = !prev
      if (next) {
        updatePanelPosition()
      }
      return next
    })
  }

  useEffect(() => {
    if (!isOpen) return
    const onResize = () => updatePanelPosition()
    const onScroll = () => updatePanelPosition()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
    updatePanelPosition()
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [isOpen])

  const handleSelectModule = (module: Module) => {
    if (selectedModuleIds.has(module.id!)) return
    const newEntry: ModulePermission = {
      moduleId: module.id!,
      moduleName: module.name,
      permissions: ['read'] // read is always present
    }
    onModulesChange([...selectedModules, newEntry])
  }

  const handleRemoveModule = (moduleId: number) => {
    onModulesChange(selectedModules.filter(m => m.moduleId !== moduleId))
  }

  const togglePermission = (moduleId: number, permission: string) => {
    if (permission === 'read') return // read cannot be removed
    const updated = selectedModules.map(entry => {
      if (entry.moduleId !== moduleId) return entry
      const has = entry.permissions.includes(permission)
      return {
        ...entry,
        permissions: has
          ? entry.permissions.filter(p => p !== permission)
          : [...entry.permissions, permission]
      }
    })
    onModulesChange(updated)
  }

  return (
    <div className={`space-y-1 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-normal text-gray-700">
          {label}
        </label>
      )}

      {/* Control with chips */}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 border border-gray-300 rounded-md bg-white text-left
            focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-[#0c684b]
            transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          `}
          ref={triggerRef}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1 pr-4">
              {selectedModules.length === 0 ? (
                <span className="text-gray-500 text-sm">Select Modules</span>
              ) : (
                selectedModules.map(sm => (
                  <span key={sm.moduleId} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                    {sm.moduleName}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveModule(sm.moduleId) }}
                      className="ml-1 text-gray-600 hover:text-gray-800"
                      aria-label="Remove"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Fixed portal options panel so it doesn't affect layout height */}
        {isOpen && panelStyle && createPortal(
          <div
            id="mpd-floating-panel"
            className="z-[100000] border border-gray-200 rounded-md bg-white shadow-lg p-2 max-h-60 overflow-auto"
            style={{ position: 'fixed', top: panelStyle.top, left: panelStyle.left, width: panelStyle.width }}
          >
            {modules.map(module => (
              <button
                key={module.id}
                type="button"
                disabled={disabled || selectedModuleIds.has(module.id!)}
                onClick={() => handleSelectModule(module)}
                className={`w-full text-left px-3 py-2 rounded border border-transparent text-sm transition-colors
                  ${selectedModuleIds.has(module.id!)
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-50 hover:border-gray-200 cursor-pointer'}
                `}
              >
                {module.name}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>

      {/* Selected with permissions BELOW the dropdown field */}
      {selectedModules.length > 0 && (
        <div className="space-y-2 mt-2">
          {selectedModules.map(entry => (
            <div key={entry.moduleId} className="space-y-2">
              <div className="text-xs font-medium text-gray-700">{entry.moduleName}</div>
              <div className="flex gap-4 flex-wrap">
                {ALL_PERMISSIONS.map(permission => {
                  const checked = entry.permissions.includes(permission)
                  const readOnly = permission === 'read'
                  return (
                    <div key={permission} className="flex items-center gap-2">
                      <Switch
                        size="sm"
                        checked={checked}
                        onCheckedChange={() => togglePermission(entry.moduleId, permission)}
                        disabled={disabled || readOnly}
                      />
                      <span className={`text-xs capitalize ${readOnly ? 'text-gray-500' : 'text-gray-700'}`}>{permission}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ModulePermissionDropdown


