import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { type Module, type ModuleCreateRequest } from '../types/rbac'
import CustomInput from '../components/CustomInput'
import CustomTextarea from '../components/CustomTextarea'
import { Switch } from '../components/ui/switch'
import Button from '../components/Button'

interface ModuleFormProps {
  module?: Module
  onSubmit: (data: ModuleCreateRequest) => void
  onCancel: () => void
  loading?: boolean
}

const schema = yup.object({
  name: yup.string().required('Module name is required'),
  description: yup.string().required('Description is required'),
  permissions: yup.array().of(yup.string()).optional(),
  isActive: yup.boolean().optional().default(true),
})

const ModuleForm = ({ module, onSubmit, onCancel, loading = false }: ModuleFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: module?.name || '',
      description: module?.description || '',
      permissions: module?.permissions || [],
      isActive: module?.isActive ?? true,
    },
  })

  const selectedPermissions = watch('permissions') || []

  const handlePermissionToggle = (permission: string) => {
    const currentPermissions = selectedPermissions
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission]
    
    // Update the form value
    const event = {
      target: {
        name: 'permissions',
        value: newPermissions,
      },
    } as any
    register('permissions').onChange(event)
  }

  return (
    <form onSubmit={handleSubmit((data: any) => onSubmit(data))} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label="Module Name *"
          {...register('name')}
          error={errors.name?.message}
          placeholder="e.g. unique_value"
        />

        <CustomTextarea
          label="Description (Optional)"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Enter module description"
          rows={1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Permissions
        </label>
        <div className="grid grid-cols-5 gap-4">
          {['create','read','update','delete','export'].map((permission) => {
            const checked = selectedPermissions.includes(permission)
            return (
              <div key={permission} className="flex items-center gap-2">
                <Switch
                  size="sm"
                  checked={checked}
                  onCheckedChange={() => handlePermissionToggle(permission)}
                />
                <span className="text-xs capitalize text-gray-700">{permission}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Removed Active option as requested */}

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
          {module ? 'Update Module' : 'Create Module'}
        </Button>
      </div>
    </form>
  )
}

export default ModuleForm 