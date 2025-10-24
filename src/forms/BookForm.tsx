import { useState } from 'react'
import { FiUpload, FiX, FiFile, FiImage } from 'react-icons/fi'
import CustomInput from '../components/CustomInput'
import CustomTextarea from '../components/CustomTextarea'
import SearchableDropdown from '../components/SearchableDropdown'
// import CustomCheckbox from '../components/CustomCheckbox'
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
    amazonUrl: book?.amazonUrl || '',
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
      formData.url &&
      formData.amazonUrl &&
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
    
    if (!formData.title || !formData.author || !formData.description || !formData.publishedBy || !formData.contentLanguage || !formData.url || !formData.amazonUrl) {
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
    <div className="flex flex-col h-full max-h-[80vh]">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Form content - scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2">
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
        rows={6}
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
        <SearchableDropdown
          label="Content Language *"
          value={formData.contentLanguage}
          onChange={(value) => handleInputChange('contentLanguage', value)}
          options={languageOptions}
          placeholder="Search or select language"
          allowCustomValue={true}
        />
      </div>



      {/* Book Cover Image and PDF File - Parallel with square styling */}
      <div className="grid grid-cols-2 gap-4">
        {/* Book Cover Image */}
        <div>
          <label className="block text-[12px] md:text-[13px] lg:text-[13px] xl:text-[14px] font-medium text-gray-700 mb-2">
            Book Cover Image *
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              disabled={uploadingImage}
            />
            
            {formData.imageUrl ? (
              <div className="relative w-full border-2 border-dashed p-4 border-gray-300 rounded-lg h-[220px] flex items-center justify-center">
                <img 
                  src={formData.imageUrl} 
                  alt="Book cover" 
                  className="h-full w-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FiX size={12} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className={`block w-full border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#0c684b] hover:bg-gray-50 transition-colors h-[220px] flex flex-col items-center justify-center ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiImage className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-sm text-gray-600">
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </p>
              </label>
            )}
          </div>
        </div>

        {/* PDF File */}
        <div>
          <label className="block text-[12px] md:text-[13px] lg:text-[13px] xl:text-[14px] font-medium text-gray-700 mb-2">
            PDF File *
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfChange}
              className="hidden"
              id="pdf-upload"
              disabled={uploadingPdf}
            />
            
            {formData.url ? (
              <div className="relative w-full border-2 border-dashed p-4 border-gray-300 rounded-lg h-[220px] flex items-center justify-center">
                <div className="text-center">
                  <FiFile className="mx-auto mb-3 text-green-600" size={32} />
                  <p className="text-sm text-green-700">PDF uploaded</p>
                </div>
                <button
                  type="button"
                  onClick={removePdf}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FiX size={12} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="pdf-upload"
                className={`block w-full border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#0c684b] hover:bg-gray-50 transition-colors h-[220px] flex flex-col items-center justify-center ${
                  uploadingPdf ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiFile className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-sm text-gray-600">
                  {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
                </p>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Amazon URL */}
      <CustomInput
        label="Amazon URL *"
        value={formData.amazonUrl}
        onChange={(value) => handleInputChange('amazonUrl', value)}
        placeholder="Enter Amazon URL for the book"
        required
      />
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
            disabled={loading || uploadingImage || uploadingPdf || !isFormValid()}
            className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Saving...' : book ? 'Update Book' : 'Add Book'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookForm 