import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiMail, FiHome, FiMessageCircle, FiEdit2 } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, usePutApi } from '../../hooks'
import { useToast } from '../../components/CustomToast/ToastContext'
import { CONTACT_US_ENDPOINTS } from '../../config/api'
import type { ContactUs as ContactUsType, ContactUsReplyRequest } from '../../types/entities'
import DateRangePicker from '../../components/DateRangePicker'
import CustomDropdown from '../../components/CustomDropdown'
import { Pagination } from '../../components'

const ContactUs = () => {
  // Hooks
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  
  // Check permissions
  const hasReadPermission = hasPermission('Contact Us', 'read')
  const hasUpdatePermission = hasPermission('Contact Us', 'update')
  
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.type && { type: filters.type }),
  })

  // API hooks
  const { data: contactUsResponse, isLoading: loading, refetch } = useGetApi<any>(
    `${CONTACT_US_ENDPOINTS.getAll}?${queryParams}`,
    {
      requireAuth: true,
      staleTime: 0, // Always fetch fresh data
    }
  )

  const replyMutation = usePutApi<ContactUsReplyRequest, any>(
    CONTACT_US_ENDPOINTS.reply,
    {
      requireAuth: true,
      onSuccess: () => {
        // Success handling is done in handleSubmitReply
      },
      onError: (error: any) => {
        // Extract actual error message from API response
        let errorMessage = 'Failed to send reply'
        
        if (error?.response?.data?.data?.errors && Array.isArray(error.response.data.data.errors)) {
          // Show the first validation error and remove field prefix
          const rawError = error.response.data.data.errors[0]
          errorMessage = rawError.replace(/^[^:]+:\s*/, '') // Remove "replyMessage: " prefix
        } else if (error?.response?.data?.message) {
          // Fallback to general message
          errorMessage = error.response.data.message
        } else if (error?.message) {
          // Fallback to error message
          errorMessage = error.message
        }
        
        showToast('error', errorMessage)
      },
    }
  )

  // Process contact us data
  const contactUsEntries = contactUsResponse?.data?.data || []

  // Update pagination when data changes
  useEffect(() => {
    if (contactUsResponse?.data?.pagination) {
      setPagination(prev => ({
        ...prev,
        totalPages: Number(contactUsResponse.data.pagination.totalPages) || 1,
        totalItems: Number(contactUsResponse.data.pagination.total) || 0,
      }))
    }
  }, [contactUsResponse])

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term)
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

  const handleTypeFilterChange = (value: string | number) => {
    setFilters(prev => ({ 
      ...prev, 
      type: value.toString() 
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'General Inquiry': 'bg-blue-100 text-blue-800',
      'Certification Inquiry (Businesses)': 'bg-green-100 text-green-800',
      'Verification and Consumer Complaints': 'bg-red-100 text-red-800',
      'Media and Press Inquiries': 'bg-purple-100 text-purple-800',
      'Partnerships and Collaborations': 'bg-yellow-100 text-yellow-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  // Contact Us Card Component
  const ContactUsCard = ({ contact }: { contact: ContactUsType }) => {
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [replyText, setReplyText] = useState('')
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null)

    const handleReplyClick = () => {
      setIsReplying(true)
      setIsEditing(false)
      setReplyText('')
    }

    const handleEditClick = () => {
      setIsEditing(true)
      setIsReplying(false)
      setReplyText(contact.replyMessage || '')
    }

    const handleCancelReply = () => {
      setIsReplying(false)
      setIsEditing(false)
      setReplyText('')
    }

    const handleSubmitReply = async () => {
      if (!replyText.trim()) {
        showToast('error', 'Please enter a reply')
        return
      }

      // Check if editing and no changes were made
      if (isEditing && replyText.trim() === contact.replyMessage) {
        showToast('error', 'No changes detected. Please modify the reply before updating.')
        return
      }

      const payload = {
        id: contact.id,
        replyMessage: replyText.trim(),
        isUpdatedResponse: isEditing
      }

      try {
        await replyMutation.mutateAsync(payload)
        setIsReplying(false)
        setIsEditing(false)
        setReplyText('')
        // Show appropriate success message
        showToast('success', isEditing ? 'Reply updated successfully!' : 'Reply sent successfully!')
        refetch()
      } catch (error) {
        // Error handling is done in the mutation's onError callback
        console.error('Error sending reply:', error)
      }
    }

    // Focus textarea when reply section opens
    useEffect(() => {
      if ((isReplying || isEditing) && replyTextareaRef.current) {
        replyTextareaRef.current.focus()
      }
    }, [isReplying, isEditing])

    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 mb-6 border border-[#0c684b]/20">
        {/* Top: Contact Information */}
        <div className="flex items-center space-x-3 mb-4">
          {/* User Avatar */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
            </span>
          </div>
          
          {/* Contact Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900">
                {contact.firstName} {contact.lastName}
              </h4>
              <span className="text-xs text-gray-500">
                {formatDate(contact.createdAt)}
              </span>
            </div>
            
            {/* Contact Details */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FiMail className="w-3 h-3" />
                <span>{contact.email}</span>
              </div>
              {contact.orgName && (
                <div className="flex items-center space-x-1">
                  <FiHome className="w-3 h-3" />
                  <span>{contact.orgName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Type Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
            {contact.type}
          </span>
        </div>

        {/* Message */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 leading-relaxed mb-2">
            Message
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            {contact.message}
          </p>
        </div>
        
        {/* Reply Section */}
        {contact.replyMessage ? (
          <div className="border border-[#0c684b]/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FiMessageCircle className="w-4 h-4 text-[#0c684b]" />
                <span className="text-sm font-medium text-[#0c684b]">Admin Response</span>
              </div>
              {hasUpdatePermission && (
                <button
                  onClick={handleEditClick}
                  className="flex items-center space-x-1 px-2 py-1 text-[#0c684b] hover:bg-[#0c684b]/10 rounded transition-colors text-xs"
                  title="Edit reply"
                >
                  <FiEdit2 className="w-4 h-4" />
                 
                </button>
              )}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {contact.replyMessage}
            </p>
          </div>
        ) : (
          <div className="flex justify-start">
            <button
              onClick={handleReplyClick}
              disabled={!hasUpdatePermission}
              className="flex items-center space-x-2 px-6 py-3 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiMessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>
        )}
        
        {/* Reply Input Section */}
        {(isReplying || isEditing) && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">
                {isEditing ? 'Edit Reply' : 'Write Reply'}
              </span>
            </div>
            <textarea
              ref={replyTextareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={isEditing ? "Edit your reply..." : "Write your reply..."}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent resize-none"
              rows={3}
              maxLength={4000}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {4000 - replyText.length} characters remaining
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
                  disabled={
                    !replyText.trim() || 
                    replyMutation.isPending || 
                    (isEditing && replyText.trim() === contact.replyMessage)
                  }
                  className="px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replyMutation.isPending 
                    ? (isEditing ? 'Updating...' : 'Sending...') 
                    : (isEditing ? 'Update Reply' : 'Submit Reply')
                  }
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
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  )

  if (!hasReadPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 text-lg">You don't have permission to view contact us entries</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] max-h-[calc(100vh-35px)] overflow-y-auto px-6 py-10'>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Contact Us</h1>
          <p className="text-gray-600">View & manage contact us inquiries and replies.</p>
        </div>

        {/* Filters */}
        <div className='py-6'>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-72">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, organization, or message..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-[10px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-xs"
              />
            </div>

            {/* Type Filter */}
            <CustomDropdown
              options={[
                { value: '', label: 'All Types' },
                { value: 'General Inquiry', label: 'General Inquiry' },
                { value: 'Certification Inquiry (Businesses)', label: 'Certification Inquiry (Businesses)' },
                { value: 'Verification and Consumer Complaints', label: 'Verification and Consumer Complaints' },
                { value: 'Media and Press Inquiries', label: 'Media and Press Inquiries' },
                { value: 'Partnerships and Collaborations', label: 'Partnerships and Collaborations' },
              ]}
              value={filters.type}
              onChange={handleTypeFilterChange}
              placeholder="Filter by type"
              className="w-[200px] text-xs"
            />

            {/* Date Range Picker */}
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onDateRangeChange={handleDateFilterApply}
              placeholder="Filter by date range"
              className="w-[250px] text-xs"
              includeTime={true}
            />

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => { /* TODO: implement export */ }}
                className="px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Content - Single Column Layout */}
        <div className="w-full">
          {loading ? (
            // Loading shimmer
            Array.from({ length: 3 }).map((_, index) => (
              <CardShimmer key={index} />
            ))
          ) : contactUsEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No contact us entries found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            contactUsEntries.map((contact: ContactUsType) => (
              <div key={contact.id} className="mb-6">
                <ContactUsCard contact={contact} />
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
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
      </div>
    </div>
  )
}

export default ContactUs
