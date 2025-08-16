import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi'
import { useToast } from '../components/CustomToast/ToastContext'
import { API_CONFIG, FILE_ENDPOINTS } from '../config/api'
import { useClientNamesApi } from '../hooks/useClientNamesApi'
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '../types/entities'
import SearchableDropdown from '../components/SearchableDropdown'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: ProductCreateRequest | ProductUpdateRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [contains, setContains] = useState<string[]>([''])

  const [uploadingImage, setUploadingImage] = useState(false)
  const { showToast } = useToast()

  // Fetch client names for manufacturer dropdown
  const { data: clientNamesResponse } = useClientNamesApi()

  const {
    register,
    handleSubmit,

    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductCreateRequest | ProductUpdateRequest>()

  const watchedImageUrl = watch('image')

  useEffect(() => {
    if (product) {
      setValue('name', product.name)
      setValue('manufacturer', product.manufacturer)
      setValue('status', product.status)
      setValue('image', product.image)
      setValue('madeIn', product.madeIn)
      setContains(product.contains.length > 0 ? product.contains : [''])
    }
  }, [product, setValue])

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('files', file)

    try {
      setUploadingImage(true)
      
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_CONFIG.baseURL}${FILE_ENDPOINTS.upload}/images`, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      if (result.success) {
        const imageUrl = result.data.files[0].url
        setValue('image', imageUrl)
        showToast('success', 'Image uploaded successfully')
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showToast('error', 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {

        handleImageUpload(file)
      } else {
        showToast('error', 'Please select a valid image file')
      }
    }
  }

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ''])
  }

  const removeField = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index))
  }

  const updateField = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item))
  }

  const onSubmitForm = (data: ProductCreateRequest | ProductUpdateRequest) => {
    const formData = {
      ...data,
      contains: contains.filter(item => item.trim() !== ''),
    }
    onSubmit(formData)
  }

  // Convert client names to dropdown options
  const clientOptions = clientNamesResponse?.data?.map(client => ({
    value: client.id,
    label: client.name
  })) || []

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      {/* Basic Information */}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manufacturer/Client *
          </label>
          <SearchableDropdown
            options={clientOptions}
            value={watch('manufacturer')}
            onChange={(value) => setValue('manufacturer', value)}
            placeholder="Search or type manufacturer name"
            allowCustomValue={true}
            maxDisplayed={5}
          />
          {errors.manufacturer && (
            <p className="text-red-500 text-xs mt-1">{errors.manufacturer.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            {...register('status', { required: 'Status is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
          >
            <option value="">Select status</option>
            <option value="Halaal">Halaal</option>
            <option value="Haraam">Haraam</option>
            <option value="Doubtful">Doubtful</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Made In *
          </label>
          <input
            type="text"
            {...register('madeIn', { required: 'Country of manufacture is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            placeholder="Enter country of manufacture"
          />
          {errors.madeIn && (
            <p className="text-red-500 text-xs mt-1">{errors.madeIn.message}</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Image
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              {...register('image')}
              placeholder="Image URL or upload file"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiUpload size={16} />
              <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
            </label>
          </div>
        </div>
        {watchedImageUrl && (
          <div className="mt-2">
            <img
              src={watchedImageUrl}
              alt="Product preview"
              className="w-20 h-20 object-cover rounded-lg border"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Contains/Ingredients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contains/Ingredients
        </label>
        {contains.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateField(setContains, index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
              placeholder="Enter ingredient or content"
            />
            {contains.length > 1 && (
              <button
                type="button"
                onClick={() => removeField(setContains, index)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField(setContains)}
          className="flex items-center gap-2 text-[#0c684b] hover:text-green-700 transition-colors text-sm"
        >
          <FiPlus size={14} />
          Add Ingredient
        </button>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
