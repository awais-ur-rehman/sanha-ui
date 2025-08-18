import { useState } from 'react'
import { FiUpload, FiX, FiFile, FiImage } from 'react-icons/fi'
import CustomInput from '../components/CustomInput'
import CustomTextarea from '../components/CustomTextarea'
import CustomDropdown from '../components/CustomDropdown'
import CustomCheckbox from '../components/CustomCheckbox'
import { type Book, type BookCreateRequest, type BookUpdateRequest } from '../types/entities'
import { API_CONFIG, FILE_ENDPOINTS } from '../config/api'
import { useToast } from '../components'

interface BookFormProps {
  book?: Book | null
  onSubmit: (data: BookCreateRequest | BookUpdateRequest) => void
  onCancel: () => void
  loading?: boolean
}

const BookForm = ({ book, onSubmit, onCancel, loading = false }: BookFormProps) => {
  const [formData, setFormData] = useState({
    imageUrl: book?.imageUrl || '',
    title: book?.title || '',
    author: book?.author || '',
    description: book?.description || '',
    url: book?.url || '',
    publishedBy: book?.publishedBy || '',
    contentLanguage: book?.contentLanguage || 'English',
    isActive: book?.isActive ?? true,
  })


  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  const { showToast } = useToast()

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Urdu', label: 'Urdu' },
    { value: 'Arabic', label: 'Arabic' },
  ]

  // Check if form is valid
  const isFormValid = () => {
    return !!(
      formData.imageUrl &&
      formData.title &&
      formData.author &&
      formData.description &&
      formData.publishedBy &&
      formData.contentLanguage
    )
  }

  const handleInputChange = (field: string, value: string | boolean | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (typeof value === 'object' && 'target' in value) {
      // Handle event objects
      const target = value.target as HTMLInputElement | HTMLTextAreaElement
      const newValue = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
      setFormData(prev => ({ ...prev, [field]: newValue }))
    } else {
      // Handle direct values
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleFileUpload = async (file: File, type: 'image' | 'pdf') => {
    const formData = new FormData()
    formData.append('files', file)

    try {
      if (type === 'image') {
        setUploadingImage(true)
      } else {
        setUploadingPdf(true)
      }

      const fileType = type === 'image' ? 'images' : 'documents'
      
      // For file uploads, only include Authorization header, let browser set Content-Type
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_CONFIG.baseURL}${FILE_ENDPOINTS.upload}/${fileType}`, {
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
        if (type === 'image') {
          setFormData(prev => ({ ...prev, imageUrl: fileUrl }))
          showToast('success', 'Image uploaded successfully')
        } else {
          setFormData(prev => ({ ...prev, url: fileUrl }))
          showToast('success', 'PDF uploaded successfully')
        }
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showToast('error', `Failed to upload ${type === 'image' ? 'image' : 'PDF'}`)
    } finally {
      if (type === 'image') {
        setUploadingImage(false)
      } else {
        setUploadingPdf(false)
      }
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {

        handleFileUpload(file, 'image')
      } else {
        showToast('error', 'Please select a valid image file')
      }
    }
  }

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf') {

        handleFileUpload(file, 'pdf')
      } else {
        showToast('error', 'Please select a valid PDF file')
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.author || !formData.description || !formData.publishedBy || !formData.contentLanguage) {
      showToast('error', 'Please fill in all required fields')
      return
    }

    if (!formData.imageUrl) {
      showToast('error', 'Please upload a book cover image')
      return
    }

    onSubmit(formData)
  }

  const removeImage = () => {

    setFormData(prev => ({ ...prev, imageUrl: '' }))
  }

  const removePdf = () => {

    setFormData(prev => ({ ...prev, url: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title and Author - Parallel */}
      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label="Title *"
          value={formData.title}
          onChange={(value) => handleInputChange('title', value)}
          placeholder="Enter book title"
          required
        />
        <CustomInput
          label="Author *"
          value={formData.author}
          onChange={(value) => handleInputChange('author', value)}
          placeholder="Enter author name"
          required
        />
      </div>

      {/* Description */}
      <CustomTextarea
        label="Description *"
        value={formData.description}
        onChange={(value) => handleInputChange('description', value)}
        placeholder="Enter book description"
        rows={3}
        required
      />

      {/* Publisher and Language - Parallel */}
      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label="Publisher *"
          value={formData.publishedBy}
          onChange={(value) => handleInputChange('publishedBy', value)}
          placeholder="Enter publisher name"
          required
        />
        <CustomDropdown
          label="Content Language *"
          value={formData.contentLanguage}
          onChange={(value) => handleInputChange('contentLanguage', value as string)}
          options={languageOptions}
          placeholder="Select language"
        />
      </div>



      {/* Image URL and PDF URL - Parallel */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Book Cover Image *
          </label>
          <div className="space-y-2">
            {formData.imageUrl ? (
              <div className="relative inline-block">
                <img 
                  src={formData.imageUrl} 
                  alt="Book cover" 
                  className="w-16 h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <FiX size={10} />
                </button>
              </div>
            ) : (
              <div className="w-16 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <FiImage className="text-gray-400" size={16} />
              </div>
            )}
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiUpload className="mr-1" size={12} />
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF File
          </label>
          <div className="space-y-2">
            {formData.url ? (
              <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded text-xs">
                <FiFile className="text-green-600" size={12} />
                <span className="text-green-700">PDF uploaded</span>
                <button
                  type="button"
                  onClick={removePdf}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded text-xs">
                <FiFile className="text-gray-400" size={12} />
                <span className="text-gray-500">No PDF</span>
              </div>
            )}
            
            <div>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                className="hidden"
                id="pdf-upload"
                disabled={uploadingPdf}
              />
              <label
                htmlFor="pdf-upload"
                className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                  uploadingPdf ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiUpload className="mr-1" size={12} />
                {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploadingImage || uploadingPdf || !isFormValid()}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : book ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  )
}

export default BookForm 