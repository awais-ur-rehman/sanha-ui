import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiMail, FiGlobe, FiMessageCircle, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useFaqsApi, useUserFaqsApi } from '../../hooks'
import CustomDropdown from '../../components/CustomDropdown'
import SearchableDropdown from '../../components/SearchableDropdown'
import CustomCheckbox from '../../components/CustomCheckbox'
import { useToast } from '../../components/CustomToast/ToastContext'
import type { FAQ, UserFAQ } from '../../types/entities'
import DateRangePicker from '../../components/DateRangePicker'
import Modal from '../../components/Modal'
import FAQForm from '../../forms/FAQForm'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import ConfirmationModal from '../../components/ConfirmationModal'
import { USER_FAQ_ENDPOINTS, FAQ_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../../config/api'
import { Pagination } from '../../components'

// Common countries list
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
  'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece',
  'Portugal', 'Ireland', 'Iceland', 'Luxembourg', 'Malta', 'Cyprus', 'Estonia',
  'Latvia', 'Lithuania', 'Slovenia', 'Slovakia', 'Croatia', 'Serbia', 'Montenegro',
  'Bosnia and Herzegovina', 'Albania', 'North Macedonia', 'Kosovo', 'Moldova',
  'Ukraine', 'Belarus', 'Russia', 'Georgia', 'Armenia', 'Azerbaijan', 'Turkey',
  'Israel', 'Lebanon', 'Jordan', 'Syria', 'Iraq', 'Iran', 'Saudi Arabia', 'Kuwait',
  'Qatar', 'Bahrain', 'Oman', 'United Arab Emirates', 'Yemen', 'Egypt', 'Libya',
  'Tunisia', 'Algeria', 'Morocco', 'Sudan', 'South Sudan', 'Ethiopia', 'Eritrea',
  'Djibouti', 'Somalia', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi',
  'Democratic Republic of the Congo', 'Republic of the Congo', 'Gabon', 'Cameroon',
  'Central African Republic', 'Chad', 'Niger', 'Mali', 'Burkina Faso', 'Senegal',
  'Gambia', 'Guinea-Bissau', 'Guinea', 'Sierra Leone', 'Liberia', 'Ivory Coast',
  'Ghana', 'Togo', 'Benin', 'Nigeria', 'Equatorial Guinea', 'São Tomé and Príncipe',
  'Angola', 'Zambia', 'Malawi', 'Mozambique', 'Zimbabwe', 'Botswana', 'Namibia',
  'South Africa', 'Lesotho', 'Eswatini', 'Madagascar', 'Mauritius', 'Seychelles',
  'Comoros', 'Mayotte', 'Réunion', 'China', 'Japan', 'South Korea', 'North Korea',
  'Mongolia', 'Taiwan', 'Hong Kong', 'Macau', 'Vietnam', 'Laos', 'Cambodia',
  'Thailand', 'Myanmar', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines',
  'Brunei', 'East Timor', 'India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal',
  'Bhutan', 'Maldives', 'Afghanistan', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan',
  'Tajikistan', 'Kyrgyzstan', 'Australia', 'New Zealand', 'Papua New Guinea',
  'Fiji', 'Solomon Islands', 'Vanuatu', 'New Caledonia', 'Samoa', 'Tonga',
  'Tuvalu', 'Kiribati', 'Nauru', 'Palau', 'Micronesia', 'Marshall Islands',
  'Brazil', 'Argentina', 'Chile', 'Peru', 'Bolivia', 'Paraguay', 'Uruguay',
  'Ecuador', 'Colombia', 'Venezuela', 'Guyana', 'Suriname', 'French Guiana',
  'Mexico', 'Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua',
  'Costa Rica', 'Panama', 'Cuba', 'Jamaica', 'Haiti', 'Dominican Republic',
  'Puerto Rico', 'Trinidad and Tobago', 'Barbados', 'Grenada', 'Saint Vincent and the Grenadines',
  'Saint Lucia', 'Dominica', 'Antigua and Barbuda', 'Saint Kitts and Nevis',
  'Bahamas', 'Cayman Islands', 'Turks and Caicos Islands', 'British Virgin Islands',
  'US Virgin Islands', 'Anguilla', 'Montserrat', 'Guadeloupe', 'Martinique',
  'Aruba', 'Curaçao', 'Bonaire', 'Sint Eustatius', 'Saba', 'Sint Maarten'
].sort()

const FAQs = () => {
  // Hooks
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  
  // Check if user has read permission for FAQs

  
  // State management
  const [activeTab, setActiveTab] = useState<'FAQs' | 'User FAQs'>('FAQs')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    isActive: '',
    email: '',
    country: '',
    firstName: '',
    lastName: '',
    startDate: '',
    endDate: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  
  // Simple reply state
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  // FAQ modal state
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [isSubmittingFAQ, setIsSubmittingFAQ] = useState(false)

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null)
  const [isDeletingFAQ, setIsDeletingFAQ] = useState(false)

  // Add to FAQ confirmation modal state
  const [isAddToFAQModalOpen, setIsAddToFAQModalOpen] = useState(false)
  const [userFaqToAdd, setUserFaqToAdd] = useState<UserFAQ | null>(null)
  const [isAddingToFAQ, setIsAddingToFAQ] = useState(false)

  // FAQ status toggle state
  const [togglingFAQId, setTogglingFAQId] = useState<number | null>(null)

  // FAQ status management
  const MAX_ACTIVE_FAQS = 7
  const MIN_ACTIVE_FAQS = 6

  // Build query parameters for FAQs
  const faqQueryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.isActive && { isActive: filters.isActive }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  })

  // Build query parameters for User FAQs
  const userFaqQueryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.country && filters.country.trim() && { country: filters.country }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  })

  // API hooks
  const { data: faqsResponse, isLoading: faqsLoading, refetch: refetchFaqs } = useFaqsApi(
    faqQueryParams.toString(),
    {
      enabled: activeTab === 'FAQs',
      staleTime: 0,
    }
  )

  const { data: userFaqsResponse, isLoading: userFaqsLoading, refetch: refetchUserFaqs } = useUserFaqsApi(
    userFaqQueryParams.toString(),
    {
      enabled: activeTab === 'User FAQs',
      staleTime: 0,
    }
  )





  // Process data
  const faqs = faqsResponse?.data?.data?.map((faq: FAQ) => ({
    ...faq,
    isActive: faq.isActive ?? true,
    question: faq.question || '',
    answer: faq.answer || '',
  })) || []

  const userFaqs = userFaqsResponse?.data?.data?.map((userFaq: UserFAQ) => ({
    ...userFaq,
    firstName: userFaq.firstName || '',
    lastName: userFaq.lastName || '',
    email: userFaq.email || '',
    phoneNumber: userFaq.phoneNumber || '',
    country: userFaq.country || '',
    question: userFaq.question || '',
    answer: userFaq.answer || '',
  })) || []

  // Update pagination when data changes
  useEffect(() => {
    if (activeTab === 'FAQs' && faqsResponse?.data?.pagination) {
      setPagination(prev => ({
        ...prev,
        totalPages: faqsResponse.data.pagination.totalPages,
        totalItems: faqsResponse.data.pagination.total,
      }))
    } else if (activeTab === 'User FAQs' && userFaqsResponse?.data?.pagination) {
      setPagination(prev => ({
        ...prev,
        totalPages: userFaqsResponse.data.pagination.totalPages,
        totalItems: userFaqsResponse.data.pagination.total,
      }))
    }
  }, [faqsResponse, userFaqsResponse, activeTab])

  // Reset pagination when tab changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [activeTab])



  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleDateFilterApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ 
      ...prev, 
      startDate, 
      endDate 
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  // const handleSubmitReply = async (userFaq: UserFAQ, replyText: string) => {
  //   if (!replyText.trim()) {
  //     showToast('error', 'Please enter a reply')
  //     return
  //   }

  //   setIsSubmittingReply(true)
  //   try {
  //     const payload = {
  //       userName: `${userFaq.firstName} ${userFaq.lastName}`,
  //       email: userFaq.email,
  //       question: userFaq.question,
  //       answer: replyText.trim(),
  //     }

  //     const response = await fetch(`${API_CONFIG.baseURL}${USER_FAQ_ENDPOINTS.respond}`, {
  //       method: 'POST',
  //       headers: getAuthHeaders(),
  //       body: JSON.stringify(payload),
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.message || 'Failed to send reply')
  //     }

  //     showToast('success', 'Reply sent successfully!')
  //     refetchUserFaqs()
  //   } catch (error) {
  //     console.error('Error sending reply:', error)
  //     showToast('error', error instanceof Error ? error.message : 'Failed to send reply')
  //   } finally {
  //     setIsSubmittingReply(false)
  //   }
  // }

  const handleAddToFaqs = (userFaq: UserFAQ) => {
    if (!userFaq.answer) {
      showToast('error', 'Cannot add FAQ without an answer')
      return
    }
    
    setUserFaqToAdd(userFaq)
    setIsAddToFAQModalOpen(true)
  }

  const handleConfirmAddToFAQ = async () => {
    if (!userFaqToAdd) return

    setIsAddingToFAQ(true)
    try {
      const payload = {
        question: userFaqToAdd.question,
        answer: userFaqToAdd.answer,
        isActive: false, // Set to inactive as requested
      }

      const response = await fetch(`${API_CONFIG.baseURL}${FAQ_ENDPOINTS.create}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add FAQ')
      }

      showToast('success', 'FAQ added successfully!')
      setIsAddToFAQModalOpen(false)
      setUserFaqToAdd(null)
      refetchFaqs() // Refresh the FAQ list to show the new FAQ
    } catch (error) {
      console.error('Error adding FAQ:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to add FAQ')
    } finally {
      setIsAddingToFAQ(false)
    }
  }

  const handleCancelAddToFAQ = () => {
    setIsAddToFAQModalOpen(false)
    setUserFaqToAdd(null)
  }

  // Helper functions for FAQ status management
  const getActiveFAQsCount = () => {
    return faqsResponse?.data?.data?.filter((faq: FAQ) => Boolean(faq.isActive)).length || 0
  }

  const shouldNewFAQBeActive = () => {
    const activeCount = getActiveFAQsCount()
    return activeCount < MAX_ACTIVE_FAQS
  }

  const canDeactivateFAQ = () => {
    const activeCount = getActiveFAQsCount()
    return activeCount > MIN_ACTIVE_FAQS
  }

  // FAQ status toggle handler
  const handleFAQStatusToggle = async (faq: FAQ) => {
    // Prevent deactivation if we're at minimum active FAQs
    if (Boolean(faq.isActive) && !canDeactivateFAQ()) {
      showToast('error', `Cannot deactivate FAQ. At least ${MIN_ACTIVE_FAQS} FAQs must remain active.`)
      return
    }

    setTogglingFAQId(faq.id)
    try {
      const payload = {
        question: faq.question,
        answer: faq.answer,
        isActive: !Boolean(faq.isActive), // Toggle the status
      }

      const response = await fetch(`${API_CONFIG.baseURL}${FAQ_ENDPOINTS.update}/${faq.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update FAQ status')
      }

      showToast('success', `FAQ ${Boolean(faq.isActive) ? 'deactivated' : 'activated'} successfully!`)
      refetchFaqs() // Refresh the FAQ list
    } catch (error) {
      console.error('Error updating FAQ status:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to update FAQ status')
    } finally {
      setTogglingFAQId(null)
    }
  }

  // FAQ handlers
  const handleAddFAQ = () => {
    setSelectedFAQ(null)
    setIsFAQModalOpen(true)
  }

  const handleEditFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setIsFAQModalOpen(true)
  }

  const handleDeleteFAQ = (faq: FAQ) => {
    setFaqToDelete(faq)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDeleteFAQ = async () => {
    if (!faqToDelete) return

    setIsDeletingFAQ(true)
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${FAQ_ENDPOINTS.delete}/${faqToDelete.id}?hardDelete=true`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete FAQ')
      }

      showToast('success', 'FAQ deleted successfully!')
      setIsDeleteModalOpen(false)
      setFaqToDelete(null)
      refetchFaqs()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to delete FAQ')
    } finally {
      setIsDeletingFAQ(false)
    }
  }

  const handleCancelDeleteFAQ = () => {
    setIsDeleteModalOpen(false)
    setFaqToDelete(null)
  }

  const handleFAQFormSubmit = async (formData: { question: string; answer: string; isActive?: boolean }) => {
    setIsSubmittingFAQ(true)
    try {
      const isEditing = !!selectedFAQ
      const url = isEditing 
        ? `${API_CONFIG.baseURL}${FAQ_ENDPOINTS.update}/${selectedFAQ.id}`
        : `${API_CONFIG.baseURL}${FAQ_ENDPOINTS.create}`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} FAQ`)
      }

      showToast('success', `FAQ ${isEditing ? 'updated' : 'created'} successfully!`)
      setIsFAQModalOpen(false)
      setSelectedFAQ(null)
      refetchFaqs()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to save FAQ')
    } finally {
      setIsSubmittingFAQ(false)
    }
  }

  const handleFAQFormCancel = () => {
    setIsFAQModalOpen(false)
    setSelectedFAQ(null)
  }

  const getCurrentData = () => {
    return activeTab === 'FAQs' ? faqs : userFaqs
  }

  const getCurrentLoading = () => {
    return activeTab === 'FAQs' ? faqsLoading : userFaqsLoading
  }



  // FAQ Card Component (Column Layout)
  const FAQCard = ({ faq }: { faq: FAQ }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 mb-6 border border-[#0c684b]/20">
      {/* Top Right: Status Toggle & Edit/Delete Actions */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CustomCheckbox
            checked={Boolean(faq.isActive)}
            onChange={() => handleFAQStatusToggle(faq)}
            disabled={togglingFAQId === faq.id || (Boolean(faq.isActive) && !canDeactivateFAQ())}
            className="w-5 h-5"
          />
          <span className="text-sm text-gray-600 font-medium">
            {togglingFAQId === faq.id ? 'Updating...' : (Boolean(faq.isActive) ? 'Active' : 'Inactive')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditFAQ(faq)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit FAQ"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => handleDeleteFAQ(faq)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete FAQ"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* Top: Question */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
          {faq.question}
        </h3>
      </div>

     

      {/* Bottom: Answer */}
      <div className="border border-[#0c684b]/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <FiMessageCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Answer</span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  )

  // User FAQ Card Component (Column Layout)
  const UserFAQCard = ({ userFaq }: { userFaq: UserFAQ }) => {
    const [isReplying, setIsReplying] = useState(false)
    const [replyText, setReplyText] = useState('')
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null)

    const handleReplyClick = () => {
      setIsReplying(true)
      setReplyText('')
    }

    const handleCancelReply = () => {
      setIsReplying(false)
      setReplyText('')
    }

    const handleSubmitReply = async () => {
      if (!replyText.trim()) {
        showToast('error', 'Please enter a reply')
        return
      }

      setIsSubmittingReply(true)
      try {
        const payload = {
          userName: `${userFaq.firstName} ${userFaq.lastName}`,
          email: userFaq.email,
          question: userFaq.question,
          answer: replyText.trim(),
        }

        const response = await fetch(`${API_CONFIG.baseURL}${USER_FAQ_ENDPOINTS.respond}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to send reply')
        }

        showToast('success', 'Reply sent successfully!')
        setIsReplying(false)
        setReplyText('')
        refetchUserFaqs()
      } catch (error) {
        console.error('Error sending reply:', error)
        showToast('error', error instanceof Error ? error.message : 'Failed to send reply')
      } finally {
        setIsSubmittingReply(false)
      }
    }

    // Focus textarea when reply section opens
    useEffect(() => {
      if (isReplying && replyTextareaRef.current) {
        replyTextareaRef.current.focus()
      }
    }, [isReplying])

    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 mb-6 border border-[#0c684b]/20">
        {/* Top Right: Add To FAQs Button (only if answer exists) */}
        <div className='flex justify-between'>      
        {/* Middle: User details */}
        <div className=" p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {userFaq.firstName.charAt(0)}{userFaq.lastName.charAt(0)}
              </span>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-900">
                  {userFaq.firstName} {userFaq.lastName}
                </h4>
                <span className="text-xs text-gray-500">
                  {new Date(userFaq.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {/* Contact Details */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <FiMail className="w-3 h-3" />
                  <span>{userFaq.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiGlobe className="w-3 h-3" />
                  <span>{userFaq.country}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {userFaq.answer && (
          <div className="flex justify-end ">
            <button
              onClick={() => handleAddToFaqs(userFaq)}
              className="flex items-center space-x-1 h-8 px-2  bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
            >
              <FiPlus className="w-3 h-3" />
              <span>Add To FAQs</span>
            </button>
          </div>
        )}
        
        </div>

        {/* Top: Question asked by user */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
            {userFaq.question}
          </h3>
        </div>
        
        {/* Bottom: Admin answer or reply button */}
        {userFaq.answer ? (
          <div className=" border border-[#0c684b]/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiMessageCircle className="w-4 h-4 text-[#0c684b]" />
              <span className="text-sm font-medium text-[#0c684b]">Admin Response</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {userFaq.answer}
            </p>
          </div>
        ) : (
          <div className="flex justify-start">
            <button
              onClick={handleReplyClick}
              className="flex items-center space-x-2 px-6 py-3 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <FiMessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>
        )}
        
        {/* Reply Input Section */}
        {isReplying && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <textarea
              ref={replyTextareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {500 - replyText.length} characters remaining
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancelReply}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isSubmittingReply}
                  className="px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReply ? 'Sending...' : 'Submit Reply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Loading shimmer for cards
  const CardShimmer = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse p-6 mb-6">
      <div className="h-6 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded mb-4"></div>
      <div className="p-4 bg-gray-100 rounded-lg mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  )

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-35px)] max-h-[calc(100vh-35px)] overflow-y-auto px-6 py-10'> 
         {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">FAQs</h1>
        <p className="text-gray-600">View & manage FAQs.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('FAQs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'FAQs'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => setActiveTab('User FAQs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'User FAQs'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            User FAQs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={activeTab === 'FAQs' ? 'Search FAQs...' : 'Search in name, email, or question'}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            />
          </div>

          {/* Date Range Picker */}
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onDateRangeChange={handleDateFilterApply}
            placeholder="Select date range"
            includeTime={true}
            className="w-64"
          />

          {/* Status Filter (only for FAQs) */}
          {activeTab === 'FAQs' && (
            <div className="w-48">
              <CustomDropdown
                placeholder="All Status"
                value={filters.isActive}
                onChange={(value) => handleFilterChange('isActive', value as string)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ]}
              />
            </div>
          )}

          {/* User FAQ specific filters */}
          {activeTab === 'User FAQs' && (
            <div className="w-48">
              <SearchableDropdown
                placeholder="Filter by country"
                value={filters.country}
                onChange={(value) => handleFilterChange('country', value)}
                options={[
                  { value: '', label: 'All Countries' },
                  ...COUNTRIES.map(country => ({ value: country, label: country }))
                ]}
              />
            </div>
          )}

          {/* Add FAQ Button (only for FAQs tab) */}
          {activeTab === 'FAQs' && hasPermission('FAQs', 'create') && (
            <button
              onClick={handleAddFAQ}
              className="flex items-center space-x-2 px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiPlus size={16} />
              <span>Add FAQ</span>
            </button>
          )}
        </div>
      </div>

      {/* Content - Single Column Layout */}
      <div className="w-full">
        {getCurrentLoading() ? (
          // Loading shimmer
          Array.from({ length: 3 }).map((_, index) => (
            <CardShimmer key={index} />
          ))
        ) : getCurrentData().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium">No {activeTab.toLowerCase()} found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          getCurrentData().map((item: FAQ | UserFAQ) => (
            activeTab === 'FAQs' ? (
              <div key={item.id} className="mb-6">
                <FAQCard faq={item as FAQ} />
              </div>
            ) : (
              <UserFAQCard key={item.id} userFaq={item as UserFAQ} />
            )
          ))
        )}
      </div>

      {/* Pagination */}
      {!getCurrentLoading() && pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            className="justify-center"
          />
        </div>
      )}

      {/* FAQ Modal */}
      {isFAQModalOpen && (
        <Modal
          isOpen={isFAQModalOpen}
          onClose={handleFAQFormCancel}
          title={selectedFAQ ? 'Edit FAQ' : 'Add New FAQ'}
        >
                  <FAQForm
          faq={selectedFAQ}
          onSubmit={handleFAQFormSubmit}
          onCancel={handleFAQFormCancel}
          isLoading={isSubmittingFAQ}
          showActiveCheckbox={false} // Never show checkbox when editing
          willBeInactive={!selectedFAQ && !shouldNewFAQBeActive()} // Show inactive message when creating and max active reached
        />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDeleteFAQ}
        onConfirm={handleConfirmDeleteFAQ}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        
        isLoading={isDeletingFAQ}
      />

      {/* Add to FAQ Confirmation Modal */}
      <ConfirmationModal
        isOpen={isAddToFAQModalOpen}
        onClose={handleCancelAddToFAQ}
        onConfirm={handleConfirmAddToFAQ}
        title="Add to FAQs"
        message={`Are you sure you want to add this user question to the FAQ list? The FAQ will be created as inactive and you can activate it later.`}
        confirmText="Add to FAQs"
        cancelText="Cancel"
        isLoading={isAddingToFAQ}
        type="info"
      />
      </div>
     
    </div>
  )
}

export default FAQs
