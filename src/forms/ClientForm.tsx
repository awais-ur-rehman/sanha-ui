import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiPlus, FiUpload, FiX } from 'react-icons/fi'
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
  const [addresses, setAddresses] = useState<string[]>([])
  const [phones, setPhones] = useState<string[]>([])
  const [products, setProducts] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [scopes, setScopes] = useState<string[]>([])
  const [clientCodes, setClientCodes] = useState<string[]>([])
  const [addressInput, setAddressInput] = useState('')
  const [scopeInput, setScopeInput] = useState('')

  const [uploadingLogo, setUploadingLogo] = useState(false)
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<ClientCreateRequest | ClientUpdateRequest>({ mode: 'onChange' })

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
      setClientCodes(client.clientCode.length > 0 ? client.clientCode : [''])
    } else {
      // Set default values for new client
      setValue('isActive', true)
      setClientCodes([])
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

  // helper retained for future symmetry; currently unused

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
      clientCode: clientCodes.filter(code => code.trim() !== ''),
      // Only include isActive for edit mode (when client prop is provided)
      ...(client && { isActive: data.isActive })
    }
    onSubmit(formData)
  }

  const requiredReady = (
    (watch('name') ?? '').toString().trim() !== '' &&
    (watch('email') ?? '').toString().trim() !== '' &&
    (watch('standard') ?? '').toString().trim() !== '' &&
    (watch('certifiedSince') ?? '').toString().trim() !== '' &&
    (watch('expiryDate') ?? '').toString().trim() !== '' &&
    clientCodes.some(c => c.trim() !== '')
  )

  // Pills input (chip adder) with circular plus button
  const PillsInput = ({
    label,
    items,
    setItems,
    placeholder
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

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full px-3 py-2">
      <div className="flex-1 overflow-y-auto space-y-4 p-2">
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

        <PillsInput
          label="Client Codes *"
          items={clientCodes}
          setItems={setClientCodes}
          placeholder="Enter client code (e.g., K-0026) and press Enter"
        />
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
      <PillsInput
        label="Phone Numbers"
        items={phones}
        setItems={setPhones}
        placeholder="Enter phone and press Enter"
      />

      {/* Addresses - initial input editable; plus adds more rows */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Addresses</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = addressInput.trim();
                if (val) {
                  setAddresses(prev => [...prev, val]);
                  setAddressInput('');
                }
              }
            }}
            placeholder="Enter address and press Enter or + to add"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => { const val = addressInput.trim(); if (val) { setAddresses(prev => [...prev, val]); setAddressInput(''); } }}
            className="inline-flex items-center justify-center w-8 h-8 border border-[#0c684b] rounded-full text-[#0c684b] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] transition-colors"
          >
            <FiPlus size={16} />
          </button>
        </div>
        {addresses.length > 0 && (
          <div className="space-y-2 p-1">
            {addresses.map((address, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => updateField('addresses', setAddresses, index, e.target.value)}
                  placeholder="Enter address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                />
                <button type="button" onClick={() => removeField('addresses', setAddresses, index)} className="p-2 text-gray-500 hover:text-red-600 rounded-md transition-colors">
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certification Information */}
      <div className="space-y-4">
        {/* Certification Standard single line */}
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

        {/* Certified Since and Expiry in same line */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certified Since *
            </label>
            <DatePicker
              value={watch('certifiedSince') || ''}
              onChange={(date) => setValue('certifiedSince', date)}
              placeholder="Select certification date"
              maxDate={undefined}
            />
            {errors.certifiedSince && (
              <p className="text-red-500 text-xs mt-1">{errors.certifiedSince.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date *
            </label>
            <DatePicker
              value={watch('expiryDate') || ''}
              onChange={(date) => setValue('expiryDate', date)}
              placeholder="Select expiry date"
              minDate={new Date()}
              maxDate={undefined}
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Categories as pills */}
      <PillsInput
        label="Categories"
        items={categories}
        setItems={setCategories}
        placeholder="Enter category and press Enter"
      />

      {/* Products as pills */}
      <PillsInput
        label="Products"
        items={products}
        setItems={setProducts}
        placeholder="Enter product and press Enter"
      />

      {/* Scopes - initial input editable; plus adds more rows */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Certification Scopes</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={scopeInput}
            onChange={(e) => setScopeInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = scopeInput.trim(); if (v) { setScopes(prev => [...prev, v]); setScopeInput('') } } }}
            placeholder="Enter scope and press Enter or + to add"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
          />
          <button type="button" onClick={() => { const v = scopeInput.trim(); if (v) { setScopes(prev => [...prev, v]); setScopeInput('') } }} className="inline-flex items-center justify-center w-8 h-8 border border-[#0c684b] rounded-full text-[#0c684b] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] transition-colors">
            <FiPlus size={16} />
          </button>
        </div>
        {scopes.length > 0 && (
          <div className="space-y-2 p-1">
            {scopes.map((scope, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={scope}
                  onChange={(e) => updateField('scopes', setScopes, index, e.target.value)}
                  placeholder="Enter scope"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                />
                <button type="button" onClick={() => removeField('scopes', setScopes, index)} className="p-2 text-gray-500 hover:text-red-600 rounded-md transition-colors">
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Form Actions - fixed bottom within modal content */}
      </div>
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 flex-shrink-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !requiredReady || !isValid}
          className="px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
        </button>
      </div>
    </form>
  )
}

export default ClientForm
