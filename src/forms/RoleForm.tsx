import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState, useEffect } from 'react'
import { type Role, type RoleCreateRequest, type Module } from '../types/rbac'
import { AVAILABLE_PERMISSIONS } from '../config/api/rbac'
import { API_CONFIG, getAuthHeaders } from '../config/api'
import CustomInput from '../components/CustomInput'
import CustomTextarea from '../components/CustomTextarea'

import CustomDropdown from '../components/CustomDropdown'
import CustomCheckbox from '../components/CustomCheckbox'
import Button from '../components/Button'

interface RoleFormProps {
  role?: Role
  modules: Module[]
  onSubmit: (data: RoleCreateRequest) => void
  onCancel: () => void
  loading?: boolean
}

const schema = yup.object({
  name: yup.string().required('Role name is required'),
  description: yup.string().required('Description is required'),
  modulePermissions: yup.array().of(
    yup.object({
      moduleId: yup.number().required(),
      moduleName: yup.string().required(),
      permissions: yup.array().of(yup.string()),
    })
  ),
})

const RoleForm = ({ role, onSubmit, onCancel, loading = false }: RoleFormProps) => {
  const [availableModules, setAvailableModules] = useState<Module[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [fetchingModules, setFetchingModules] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      modulePermissions: role?.modulePermissions || [],
    },
  })

  const modulePermissions = watch('modulePermissions') || []

  // Set initial selected module when editing (if role has modulePermissions)
  useEffect(() => {
    if (role && role.modulePermissions && role.modulePermissions.length > 0) {
      // Set the first module as selected for editing
      const firstModule = role.modulePermissions[0]
      setSelectedModuleId(firstModule.moduleId)
      const module = availableModules.find(m => m.id === firstModule.moduleId)
      setSelectedModule(module || null)
    }
  }, [role, availableModules])

  // Fetch modules when component mounts
  useEffect(() => {
    const fetchModules = async () => {
      setFetchingModules(true)
      try {
        const response = await fetch(`${API_CONFIG.baseURL}/modules`, {
          headers: getAuthHeaders(),
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Handle paginated response
            const data = result.data
            if (data && data.data && Array.isArray(data.data)) {
              setAvailableModules(data.data)
            } else if (Array.isArray(data)) {
              setAvailableModules(data)
            } else {
              setAvailableModules([])
            }
          }
        }
      } catch (error) {
        console.error('Error fetching modules:', error)
      } finally {
        setFetchingModules(false)
      }
    }

    fetchModules()
  }, [])

    const handleModuleSelect = (moduleId: number) => {
    setSelectedModuleId(moduleId)
    const module = (availableModules || []).find(m => m.id === moduleId)
    setSelectedModule(module || null)

    if (module && !modulePermissions.find(mp => mp.moduleId === moduleId)) {
      // Add new module permissions with read permission selected by default
      const newModulePermission = {
        moduleId,
        moduleName: module.name,
        permissions: ['read'], // Default read permission
      }
      setValue('modulePermissions', [...modulePermissions, newModulePermission])
      
      // Reset selected module after adding
      setSelectedModuleId(null)
      setSelectedModule(null)
    }
  }

  const removeModule = (moduleId: number) => {
    const updatedPermissions = modulePermissions.filter(mp => mp.moduleId !== moduleId)
    setValue('modulePermissions', updatedPermissions)
    
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null)
      setSelectedModule(null)
    }
  }

  const handleModulePermissionToggle = (permission: string) => {
    if (!selectedModule) return

    const currentPermissions = modulePermissions.find(mp => mp.moduleId === selectedModule.id)
    
    if (currentPermissions && currentPermissions.permissions) {
      // Don't allow removing read permission
      if (permission === 'read') return
      
      // Update existing module permissions
      const newPermissions = currentPermissions.permissions.includes(permission)
        ? currentPermissions.permissions.filter(p => p !== permission)
        : [...currentPermissions.permissions, permission]
      
      const updatedModulePermissions = modulePermissions.map(mp =>
        mp.moduleId === selectedModule.id
          ? { ...mp, permissions: newPermissions }
          : mp
      )
      setValue('modulePermissions', updatedModulePermissions)
    }
  }

  const isPermissionSelected = (permission: string) => {
    if (!selectedModule) return false
    const modulePermission = modulePermissions.find(mp => mp.moduleId === selectedModule.id)
    return modulePermission?.permissions?.includes(permission) || false
  }



  return (
    <form onSubmit={handleSubmit((data: any) => onSubmit(data))} className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label="Role Name *"
          {...register('name')}
          error={errors.name?.message}
          placeholder="e.g. Admin permissions"
        />

        <CustomTextarea
          label="Description *"
          {...register('description')}
          error={errors.description?.message}
          placeholder="e.g. These permissions are for sales member"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Modules *
        </label>
        
        <CustomDropdown
          label=""
          placeholder="Select modules"
          options={(availableModules || []).filter(module => 
            !modulePermissions.find(mp => mp.moduleId === module.id)
          ).map(module => ({ 
            value: module.id || 0, 
            label: module.name 
          }))}
          value={selectedModuleId || ''}
          onChange={(value) => handleModuleSelect(Number(value))}
          disabled={fetchingModules}
        />
        
        <p className="text-xs text-gray-500 mt-1">
          Select modules to assign permissions. Click "Edit Permissions" on any selected module to modify its permissions.
        </p>

        {/* Selected Modules */}
        {modulePermissions.length > 0 && (
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Selected Modules:</label>
            {modulePermissions.map((mp) => {
              const module = (availableModules || []).find(m => m.id === mp.moduleId)
              return (
                <div key={mp.moduleId} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">{module?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModuleId(mp.moduleId)
                        setSelectedModule(module || null)
                      }}
                      className="text-green-600 hover:text-green-700 text-sm"
                    >
                      Edit Permissions
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeModule(mp.moduleId)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {selectedModule && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{selectedModule.name} Permissions</h4>
              <button
                type="button"
                onClick={() => {
                  setSelectedModuleId(null)
                  setSelectedModule(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <CustomCheckbox
                  key={permission}
                  checked={isPermissionSelected(permission)}
                  onChange={() => handleModulePermissionToggle(permission)}
                  label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                  disabled={permission === 'read'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {role ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  )
}

export default RoleForm 