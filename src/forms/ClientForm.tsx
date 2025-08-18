import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi'
import { useToast } from '../components/CustomToast/ToastContext'
import { API_CONFIG, FILE_ENDPOINTS } from '../config/api'
import type { Client, ClientCreateRequest, ClientUpdateRequest } from '../types/entities'
import DatePicker from '../components/DatePicker'

interface ClientFormProps {
  client?: Client
  onSubmit: (data: ClientCreateRequest | ClientUpdateRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [addresses, setAddresses] = useState<string[]>([''])
  const [phones, setPhones] = useState<string[]>([''])
  const [products, setProducts] = useState<string[]>([''])
  const [categories, setCategories] = useState<string[]>([''])
  const [scopes, setScopes] = useState<string[]>([''])

  const [uploadingLogo, setUploadingLogo] = useState(false)
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ClientCreateRequest | ClientUpdateRequest>()

  const watchedLogoUrl = watch('logoUrl')

  useEffect(() => {
    if (client) {
      setValue('name', client.name)
      setValue('logoUrl', client.logoUrl)
      setValue('email', client.email)
      setValue('fax', client.fax)
      setValue('website', client.website)
      setValue('standard', client.standard)
      setValue('clientCode', client.clientCode)
      setValue('certifiedSince', client.certifiedSince)
      setValue('expiryDate', client.expiryDate)
      setValue('isActive', client.isActive)

      setAddresses(client.address.length > 0 ? client.address : [''])
      setPhones(client.phone.length > 0 ? client.phone : [''])
      setProducts(client.products.length > 0 ? client.products : [''])
      setCategories(client.category.length > 0 ? client.category : [''])
      setScopes(client.scope.length > 0 ? client.scope : [''])
    } else {
      // Set default values for new client
      setValue('isActive', true)
    }
  }, [client, setValue])

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('files', file)

    try {
      setUploadingLogo(true)
      
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
        const logoUrl = result.data.files[0].url
        setValue('logoUrl', logoUrl)
        showToast('success', 'Logo uploaded successfully')
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showToast('error', 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        handleLogoUpload(file)
      } else {
        showToast('error', 'Please select a valid image file')
      }
    }
  }

  const addField = (_field: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ''])
  }

  const removeField = (_field: string, setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index))
  }

  const updateField = (_field: string, setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item))
  }

  const onSubmitForm = (data: ClientCreateRequest | ClientUpdateRequest) => {
    const formData = {
      ...data,
      address: addresses.filter(addr => addr.trim() !== ''),
      phone: phones.filter(phone => phone.trim() !== ''),
      products: products.filter(product => product.trim() !== ''),
      category: categories.filter(cat => cat.trim() !== ''),
      scope: scopes.filter(scope => scope.trim() !== ''),
      // Only include isActive for edit mode (when client prop is provided)
      ...(client && { isActive: data.isActive })
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Name *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Client name is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            placeholder="Enter client name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Code *
          </label>
          <input
            type="text"
            {...register('clientCode', { required: 'Client code is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            placeholder="Enter client code"
          />
          {errors.clientCode && (
            <p className="text-red-500 text-xs mt-1">{errors.clientCode.message}</p>
          )}
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              {...register('logoUrl')}
              placeholder="Logo URL or upload file"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiUpload size={16} />
              <span className="text-sm">{uploadingLogo ? 'Uploading...' : 'Upload'}</span>
            </label>
          </div>
        </div>
        {watchedLogoUrl && (
          <div className="mt-2">
            <img
              src={watchedLogoUrl}
              alt="Client logo"
              className="w-16 h-16 object-cover rounded-lg border"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            placeholder="client@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fax
          </label>
          <input
            type="text"
            {...register('fax')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            placeholder="+1-234-567-8900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          {...register('website')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
          placeholder="https://www.example.com"
        />
      </div>

      {/* Phone Numbers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Numbers
        </label>
        {phones.map((phone, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={phone}
              onChange={(e) => updateField('phones', setPhones, index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
              placeholder="+1-234-567-8900"
            />
            {phones.length > 1 && (
              <button
                type="button"
                onClick={() => removeField('phones', setPhones, index)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField('phones', setPhones)}
          className="flex items-center gap-2 text-[#0c684b] hover:text-green-700 transition-colors text-sm"
        >
          <FiPlus size={14} />
          Add Phone Number
        </button>
      </div>

      {/* Addresses */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Addresses
        </label>
        {addresses.map((address, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={address}
              onChange={(e) => updateField('addresses', setAddresses, index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
              placeholder="Enter address"
            />
            {addresses.length > 1 && (
              <button
                type="button"
                onClick={() => removeField('addresses', setAddresses, index)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField('addresses', setAddresses)}
          className="flex items-center gap-2 text-[#0c684b] hover:text-green-700 transition-colors text-sm"
        >
          <FiPlus size={14} />
          Add Address
        </button>
      </div>

      {/* Certification Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certification Standard *
          </label>
          <input
            type="text"
            {...register('standard', { required: 'Certification standard is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            placeholder="ISO 9001, ISO 14001, etc."
          />
          {errors.standard && (
            <p className="text-red-500 text-xs mt-1">{errors.standard.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certified Since *
          </label>
          <DatePicker
            value={watch('certifiedSince') || ''}
            onChange={(date) => setValue('certifiedSince', date)}
            placeholder="Select certification date"
            maxDate={new Date()}
          />
          {errors.certifiedSince && (
            <p className="text-red-500 text-xs mt-1">{errors.certifiedSince.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expiry Date *
        </label>
        <DatePicker
          value={watch('expiryDate') || ''}
          onChange={(date) => setValue('expiryDate', date)}
          placeholder="Select expiry date"
          maxDate={new Date()}
        />
        {errors.expiryDate && (
          <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>
        )}
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categories
        </label>
        {categories.map((category, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={category}
              onChange={(e) => updateField('categories', setCategories, index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
              placeholder="Enter category"
            />
            {categories.length > 1 && (
              <button
                type="button"
                onClick={() => removeField('categories', setCategories, index)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField('categories', setCategories)}
          className="flex items-center gap-2 text-[#0c684b] hover:text-green-700 transition-colors text-sm"
        >
          <FiPlus size={14} />
          Add Category
        </button>
      </div>

      {/* Scopes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certification Scopes
        </label>
        {scopes.map((scope, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={scope}
              onChange={(e) => updateField('scopes', setScopes, index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
              placeholder="Enter scope"
            />
            {scopes.length > 1 && (
              <button
                type="button"
                onClick={() => removeField('scopes', setScopes, index)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField('scopes', setScopes)}
          className="flex items-center gap-2 text-[#0c684b] hover:text-green-700 transition-colors text-sm"
        >
          <FiPlus size={14} />
          Add Scope
        </button>
      </div>

      {/* Products */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Products
        </label>
        {products.map((product, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={product}
              onChange={(e) => updateField('products', setProducts, index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
              placeholder="Enter product"
            />
            {products.length > 1 && (
              <button
                type="button"
                onClick={() => removeField('products', setProducts, index)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField('products', setProducts)}
          className="flex items-center gap-2 text-[#0c684b] hover:text-green-700 transition-colors text-sm"
        >
          <FiPlus size={14} />
          Add Product
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
          {isLoading ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
        </button>
      </div>
    </form>
  )
}

export default ClientForm
