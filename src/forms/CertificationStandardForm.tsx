import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { CertificationStandard } from '../types/entities'

interface CertificationStandardFormProps {
  standard?: CertificationStandard | null
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

const schema = yup.object({
  name: yup.string().required('Certification standard name is required').min(2, 'Name must be at least 2 characters'),
}).required()

const CertificationStandardForm: React.FC<CertificationStandardFormProps> = ({ 
  standard, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: standard?.name || '',
    },
  })

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-4 p-2">
          <div>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Certification Standard Name *
                  </label>
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., ISO 22000, HALAL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onCancel}
            className="px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Saving...' : standard ? 'Update Standard' : 'Add Standard'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default CertificationStandardForm

