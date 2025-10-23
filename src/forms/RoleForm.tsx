import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState, useEffect } from 'react'
import { type Role, type RoleCreateRequest, type Module } from '../types/rbac'
import { API_CONFIG, getAuthHeaders } from '../config/api'
import CustomInput from '../components/CustomInput'
import CustomTextarea from '../components/CustomTextarea'
import ModulePermissionDropdown from '../components/ModulePermissionDropdown'
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

  const handleModulePermissionsChange = (updatedModulePermissions: any[]) => {
    setValue('modulePermissions', updatedModulePermissions)
  }



  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <form onSubmit={handleSubmit((data: any) => onSubmit(data))} className="flex flex-col h-full">
        {/* Form content - scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-[12px] md:text-[13px] lg:text-[13px] xl:text-[14px]">
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
              placeholder="e.g. These are Test Permissions"
              rows={1}
            />
          </div>

          <ModulePermissionDropdown
            label="Select Modules *"
            modules={availableModules}
            selectedModules={modulePermissions.filter(mp => mp.permissions && mp.permissions.length > 0) as any}
            onModulesChange={handleModulePermissionsChange}
            disabled={fetchingModules}
          />
        </div>

        {/* Fixed footer with buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 flex-shrink-0">
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
    </div>
  )
}

export default RoleForm 