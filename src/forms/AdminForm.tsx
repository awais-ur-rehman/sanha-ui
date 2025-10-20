import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState, useEffect } from 'react'
import { type Admin, type AdminCreateRequest, type AdminUpdateRequest, type Role } from '../types/rbac'
import { API_CONFIG, getAuthHeaders } from '../config/api'
import CustomInput from '../components/CustomInput'
import CustomDropdown from '../components/CustomDropdown'
import Button from '../components/Button'

const createSchema = yup.object({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: yup.string().required('Role is required'),
})

const updateSchema = yup.object({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').optional(),
  role: yup.string().required('Role is required'),
})

interface AdminFormProps {
  admin?: Admin | null
  onSubmit: (data: AdminCreateRequest | AdminUpdateRequest) => void
  onCancel: () => void
  loading?: boolean
}

const AdminForm = ({ admin, onSubmit, onCancel, loading = false }: AdminFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(admin ? updateSchema : createSchema),
    defaultValues: {
      username: admin?.username || '',
      email: admin?.email || '',
      password: '',
      role: admin?.role || '',
    },
  })

  const selectedRole = watch('role')

  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [fetchingRoles, setFetchingRoles] = useState(false)

  // Fetch roles when component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      setFetchingRoles(true)
      try {
        const response = await fetch(`${API_CONFIG.baseURL}/roles`, {
          headers: getAuthHeaders(),
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Handle paginated response
            const data = result.data
            if (data && data.data && Array.isArray(data.data)) {
              setAvailableRoles(data.data)
            } else if (Array.isArray(data)) {
              setAvailableRoles(data)
            } else {
              setAvailableRoles([])
            }
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error)
      } finally {
        setFetchingRoles(false)
      }
    }

    fetchRoles()
  }, [])

  const roleOptions = (availableRoles || []).map(role => ({ 
    value: role.name, 
    label: role.name 
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label="Username *"
          {...register('username')}
          error={errors.username?.message}
          placeholder="e.g. johndoe"
        />

        <CustomInput
          label="Email *"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="e.g. johndoe@gmail.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label={admin ? "Password (Optional)" : "Password *"}
          type="password"
          {...register('password')}
          error={(errors as any).password?.message}
          placeholder={admin ? "Leave blank to keep current password" : "Enter password"}
        />

        <CustomDropdown
          label="Role *"
          value={selectedRole}
          onChange={(value) => setValue('role', value as string)}
          error={errors.role?.message}
          placeholder="Select a role"
          options={roleOptions}
          disabled={fetchingRoles}
        />
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
          {admin ? 'Update Admin' : 'Create Admin'}
        </Button>
      </div>
    </form>
  )
}

export default AdminForm 