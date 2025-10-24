import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiPlus, FiUpload, FiX } from 'react-icons/fi'
import { useToast } from '../components/CustomToast/ToastContext'
import { API_CONFIG, FILE_ENDPOINTS } from '../config/api'
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '../types/entities'

interface NonHalalProductFormProps {
  product?: Product
  onSubmit: (data: ProductCreateRequest | ProductUpdateRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

const NonHalalProductForm: React.FC<NonHalalProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [contains, setContains] = useState<string[]>([])
  const [evidences, setEvidences] = useState<Array<{ url: string; type: string }>>([
    { url: '', type: 'link' }
  ])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingDocuments, setUploadingDocuments] = useState(false)
  const { showToast } = useToast()

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
      setValue('image', product.image)
      setValue('madeIn', product.madeIn)
      setContains(product.contains.length > 0 ? product.contains : [])
      
      // Initialize evidences with existing URLs
      if (product.evidences && product.evidences.length > 0) {
        setEvidences(product.evidences.map(url => ({
          url: url,
          type: 'link'
        })))
      } else {
        setEvidences([{ url: '', type: 'link' }])
      }
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

  const handleFileUpload = async (file: File, evidenceIndex: number) => {
    const formData = new FormData()
    formData.append('files', file)

    try {
      setUploadingDocuments(true)
      
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Determine upload endpoint based on file type
      const isImage = file.type.startsWith('image/')
      const uploadEndpoint = isImage ? 'images' : 'documents'
      
      const response = await fetch(`${API_CONFIG.baseURL}${FILE_ENDPOINTS.upload}/${uploadEndpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      if (result.success) {
        const fileUrl = result.data.files[0].url
        const newEvidences = [...evidences]
        newEvidences[evidenceIndex] = { url: fileUrl, type: isImage ? 'image' : 'file' }
        setEvidences(newEvidences)
        showToast('success', 'File uploaded successfully')
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showToast('error', 'Failed to upload file')
    } finally {
      setUploadingDocuments(false)
    }
  }

  const handleFileChangeForEvidence = (event: React.ChangeEvent<HTMLInputElement>, evidenceIndex: number) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file, evidenceIndex)
    }
  }

  const handleUrlChange = (index: number, value: string) => {
    const newEvidences = [...evidences]
    newEvidences[index] = { ...newEvidences[index], url: value }
    setEvidences(newEvidences)
  }

  const handleAddEvidence = () => {
    if (evidences.length < 5) {
      setEvidences([...evidences, { url: '', type: 'link' }])
    }
  }

  const handleRemoveEvidence = (index: number) => {
    if (evidences.length > 1) {
      const newEvidences = evidences.filter((_, i) => i !== index)
      setEvidences(newEvidences)
    }
  }

  // Pills input (chip adder) for ingredients
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

  const onSubmitForm = (data: ProductCreateRequest | ProductUpdateRequest) => {
    const formData = {
      ...data,
      contains: contains.filter(item => item.trim() !== ''),
      evidences: evidences
        .filter(evidence => evidence.url.trim() !== '')
        .map(evidence => evidence.url),
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full px-3 py-2">
      <div className="flex-1 overflow-y-auto space-y-4 p-2">
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
            <input
              type="text"
              {...register('manufacturer', { required: 'Manufacturer is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
              placeholder="Enter manufacturer name"
            />
            {errors.manufacturer && (
              <p className="text-red-500 text-xs mt-1">{errors.manufacturer.message}</p>
            )}
          </div>
        </div>

        {/* Made In - Full Width */}
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
              <div className="relative w-20 h-20">
                <img
                  src={watchedImageUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover rounded-lg border"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    // Show fallback placeholder
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) {
                      fallback.style.display = 'flex'
                    }
                  }}
                />
                <div 
                  className="w-full h-full bg-gray-200 flex items-center justify-center absolute inset-0 rounded-lg border"
                  style={{ display: 'none' }}
                >
                  <span className="text-gray-400 text-xs">Image Error</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contains/Ingredients as chips */}
        <PillsInput
          label="Ingredients"
          items={contains}
          setItems={setContains}
          placeholder="Enter ingredient and press Enter"
        />

        {/* Evidence Field - Similar to Resource Links & Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evidence *
          </label>
          <div className="space-y-3">
            {evidences.map((evidence, index) => (
              <div key={index} className="flex items-center gap-2">
                {/* URL Input */}
                <div className="flex-1">
                  <input
                    type="url"
                    value={evidence.url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="Enter URL or upload a file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                  />
                </div>

                {/* Upload Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={(e) => handleFileChangeForEvidence(e, index)}
                    className="hidden"
                    id={`evidence-file-upload-${index}`}
                    disabled={uploadingDocuments}
                  />
                  <label
                    htmlFor={`evidence-file-upload-${index}`}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] cursor-pointer transition-colors ${
                      uploadingDocuments ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FiUpload size={16} />
                  </label>

                  {/* Remove Button */}
                  {evidences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(index)}
                      className="inline-flex items-center justify-center w-8 h-8 border border-red-300 rounded-full text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Evidence Button */}
            {evidences.length < 5 && (
              <div className="flex justify-end pe-1">
                <button
                  type="button"
                  onClick={handleAddEvidence}
                  className="inline-flex items-center justify-center w-8 h-8 border border-[#0c684b] rounded-full text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] transition-colors"
                >
                  <FiPlus size={16} color='#0c684b' />
                </button>
              </div>
            )}

            {uploadingDocuments && (
              <p className="text-sm text-blue-600 text-center">Uploading...</p>
            )}
          </div>
        </div>

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
          disabled={isLoading}
          className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}</span>
        </button>
      </div>
    </form>
  )
}

export default NonHalalProductForm
