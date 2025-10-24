import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiPlus, FiX } from 'react-icons/fi'
import { useGetApi } from '../hooks'
import { HALAL_PRODUCT_ENDPOINTS } from '../config/api'
import type { HalalProduct, HalalProductCreateRequest, HalalProductUpdateRequest } from '../types/entities'
import SearchableDropdown from '../components/SearchableDropdown'

// Pills input (chip adder) for types - like Phone Numbers in ClientForm
const PillsInput = ({
  label,
  items,
  setItems,
  placeholder,
}: {
  label: string
  items: string[]
  setItems: React.Dispatch<React.SetStateAction<string[]>>
  placeholder: string
}) => {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    const value = inputValue.trim()
    if (!value) return
    if (!items.includes(value)) setItems(prev => [...prev, value])
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRemove = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center w-8 h-8 border border-[#0c684b] rounded-full text-[#0c684b] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] transition-colors"
        >
          <FiPlus size={16} />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {items.map((val, idx) => (
            <span key={`${val}-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
              {val}
              <button type="button" onClick={() => handleRemove(idx)} className="text-gray-500 hover:text-red-600">
                <FiX size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface HalalProductFormProps {
  product?: HalalProduct
  onSubmit: (data: HalalProductCreateRequest | HalalProductUpdateRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

const HalalProductForm: React.FC<HalalProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [types, setTypes] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<HalalProductCreateRequest>()

  // Fetch clients for dropdown
  const { data: clientsResponse } = useGetApi<any>(
    HALAL_PRODUCT_ENDPOINTS.getClients,
    { requireAuth: true }
  )

  const clients = clientsResponse?.data?.data || []
  const clientOptions = clients.map((client: any) => ({
    value: client.id,
    label: client.name
  }))

  useEffect(() => {
    if (product) {
      setTypes(product.types || [])
    }
  }, [product])



  const onSubmitForm = (data: HalalProductCreateRequest | HalalProductUpdateRequest) => {
    if (product) {
      // EDIT MODE: Only send types (isActive is handled by toggle in detail sheet)
      const formData: HalalProductUpdateRequest = {
        types: types.filter(item => item.trim() !== '')
      }
      onSubmit(formData)
    } else {
      // CREATE MODE: Send name, clientId, and types
      const formData: HalalProductCreateRequest = {
        name: (data as HalalProductCreateRequest).name,
        clientId: (data as HalalProductCreateRequest).clientId,
        types: types.filter(item => item.trim() !== '')
      }
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full px-3 py-2">
      <div className="flex-1 overflow-y-auto space-y-4 p-2">
        {/* Show different fields for create vs edit */}
        {!product && (
          // CREATE MODE: Show name, client, and types
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Product name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <SearchableDropdown
                label="Client *"
                options={clientOptions}
                value={watch('clientId')?.toString() || ''}
                onChange={(value) => setValue('clientId', parseInt(value))}
                placeholder="Search or select a client"
                allowCustomValue={false}
                maxDisplayed={10}
              />
              {errors.clientId && (
                <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Product Information - only for edit mode, show non-editable fields */}
        {product && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={product.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={product.clientName || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Product Types - for both create and edit */}
        <PillsInput
          label="Product Types *"
          items={types}
          setItems={setTypes}
          placeholder="Enter product type and press Enter"
        />

        {/* Spacer end scrollable */}
      </div>
      {/* Form Actions - fixed bottom within modal content */}
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
          disabled={isLoading || types.length === 0}
          className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}</span>
        </button>
      </div>
    </form>
  )
}

export default HalalProductForm
