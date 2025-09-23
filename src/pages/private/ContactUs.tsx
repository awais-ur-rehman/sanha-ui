import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { FiSearch, FiMessageCircle, FiEdit2 } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, usePutApi, useRealTimeUpdates } from '../../hooks'
import { useToast } from '../../components/CustomToast/ToastContext'
import { CONTACT_US_ENDPOINTS } from '../../config/api'
import type { ContactUs as ContactUsType, ContactUsReplyRequest } from '../../types/entities'
import DateRangePicker from '../../components/DateRangePicker'
import CustomDropdown from '../../components/CustomDropdown'
// import { Pagination } from '../../components'

const ContactUs = () => {
  // Hooks
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  const location = useLocation()
  
  // Check permissions
  const hasReadPermission = hasPermission('Contact Us', 'read')
  const hasUpdatePermission = hasPermission('Contact Us', 'update')
  
  // State management
  const [activeTab, setActiveTab] = useState<'pending' | 'answered'>('pending')
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
    status: activeTab === 'pending' ? 'Pending' : 'Answered',
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

  // Export CSV hook
  const exportQueryParams = new URLSearchParams({
    status: activeTab === 'pending' ? 'Pending' : 'Answered',
    ...(searchTerm && { search: searchTerm }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.type && { type: filters.type }),
  })
  const exportCsvQuery = useGetApi<Blob>(
    `${CONTACT_US_ENDPOINTS.exportCsv}?${exportQueryParams.toString()}`,
    { requireAuth: true, enabled: false, staleTime: 0, responseType: 'blob' }
  )

  const handleExport = async () => {
    try {
      const result = await exportCsvQuery.refetch()
      const blob = result.data as Blob
      if (!blob) return
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contact-us-${new Date().toISOString().slice(0,10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      // no-op; hook throws in query when not ok
    }
  }

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
  const pageEntries: ContactUsType[] = contactUsResponse?.data?.data || []
  const [entriesList, setEntriesList] = useState<ContactUsType[]>([])
  const [selectedEntry, setSelectedEntry] = useState<ContactUsType | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Handle page navigation - reset real-time list when returning to page
  useEffect(() => {
    // When component mounts or location changes, reset the real-time list to allow API data to load
    setEntriesList([])
  }, [location.pathname])

  // Real-time updates hook
  useRealTimeUpdates({
    itemType: 'contact-us',
    onNewItem: (newContactUs: ContactUsType) => {
      setEntriesList(prev => {
        // Check if contact us entry already exists to avoid duplicates
        const exists = prev.some(entry => entry.id === newContactUs.id)
        
        if (exists) {
          return prev
        }
        
        // Only add to list if we're on the pending tab (where new contact us entries should appear)
        if (activeTab !== 'pending') {
          return prev
        }
        
        // Add new contact us entry to the beginning of the list
        return [newContactUs, ...prev]
      })
    },
    currentPath: location.pathname
  })

  // Right-panel reply/edit state
  const [isReplyingPanel, setIsReplyingPanel] = useState(false)
  const [isEditingPanel, setIsEditingPanel] = useState(false)
  const [panelReplyText, setPanelReplyText] = useState('')
  const panelReplyTextareaRef = useRef<HTMLTextAreaElement>(null)

  const handleReplyClickPanel = () => {
    setIsReplyingPanel(true)
    setIsEditingPanel(false)
    setPanelReplyText('')
  }

  const handleEditClickPanel = () => {
    if (!selectedEntry) return
    setIsEditingPanel(true)
    setIsReplyingPanel(false)
    setPanelReplyText(selectedEntry.replyMessage || '')
  }

  const handleCancelReplyPanel = () => {
    setIsReplyingPanel(false)
    setIsEditingPanel(false)
    setPanelReplyText('')
  }

  const handleSubmitReplyPanel = async () => {
    if (!selectedEntry) return
    if (!panelReplyText.trim()) {
      showToast('error', 'Please enter a reply')
      return
    }
    if (isEditingPanel && panelReplyText.trim() === selectedEntry.replyMessage) {
      showToast('error', 'No changes detected. Please modify the reply before updating.')
      return
    }
    const payload = {
      id: selectedEntry.id,
      replyMessage: panelReplyText.trim(),
      isUpdatedResponse: isEditingPanel,
    }
    try {
      await replyMutation.mutateAsync(payload)
      setIsReplyingPanel(false)
      setIsEditingPanel(false)
      setPanelReplyText('')
      showToast('success', isEditingPanel ? 'Reply updated successfully!' : 'Reply sent successfully!')
      refetch()
    } catch (error) {
      // handled in onError
      console.error('Error sending reply:', error)
    }
  }

  // Focus textarea when reply/edit opens
  useEffect(() => {
    if ((isReplyingPanel || isEditingPanel) && panelReplyTextareaRef.current) {
      panelReplyTextareaRef.current.focus()
    }
  }, [isReplyingPanel, isEditingPanel])

  // Reset reply/edit state when selection changes
  useEffect(() => {
    setIsReplyingPanel(false)
    setIsEditingPanel(false)
    setPanelReplyText('')
  }, [selectedEntry])

  // Update pagination when data changes
  useEffect(() => {
    if (contactUsResponse?.data?.pagination) {
      const nextTotalPages = Number(contactUsResponse.data.pagination.totalPages) || 1
      const nextTotalItems = Number(contactUsResponse.data.pagination.total) || 0
      setPagination(prev => ({ ...prev, totalPages: nextTotalPages, totalItems: nextTotalItems }))
      setEntriesList(prev => (pagination.currentPage === 1 ? pageEntries : [...prev, ...pageEntries]))
    }
  }, [contactUsResponse, pageEntries, pagination.currentPage])

  // Adjust selected entry when tab changes to ensure a visible selection
  useEffect(() => {
    if (entriesList.length === 0) {
      setSelectedEntry(null)
    } else if (!selectedEntry || !entriesList.find(e => e.id === selectedEntry.id)) {
      setSelectedEntry(entriesList[0])
    }
  }, [activeTab, entriesList])

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    setEntriesList([])
    setSelectedEntry(null)
  }

  const handleDateFilterApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ 
      ...prev, 
      startDate, 
      endDate 
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    setEntriesList([])
    setSelectedEntry(null)
  }

  const handleTypeFilterChange = (value: string | number) => {
    setFilters(prev => ({ 
      ...prev, 
      type: value.toString() 
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    setEntriesList([])
    setSelectedEntry(null)
  }

  // const handlePageChange = (page: number) => {
  //   setPagination(prev => ({ ...prev, currentPage: page }))
  // }

  // Infinite scroll for left pane
  const handleLeftScroll = () => {
    const el = listRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    const hasMore = pagination.currentPage < pagination.totalPages
    if (nearBottom && hasMore && !loading) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // getTypeColor no longer used in inline panel

  // ContactUsCard removed; using inline panel UI instead

  // Loading shimmer for cards
  // const CardShimmer = () => (
  //   <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse p-6 mb-6">
  //     <div className="flex items-center space-x-3 mb-4">
  //       <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
  //       <div className="flex-1">
  //         <div className="h-4 bg-gray-200 rounded mb-2"></div>
  //         <div className="h-3 bg-gray-200 rounded w-3/4"></div>
  //       </div>
  //       <div className="h-6 bg-gray-200 rounded w-20"></div>
  //     </div>
  //     <div className="h-6 bg-gray-200 rounded mb-2"></div>
  //     <div className="h-4 bg-gray-200 rounded mb-4"></div>
  //     <div className="h-8 bg-gray-200 rounded w-24"></div>
  //   </div>
  // )

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
      <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Contact Us</h1>
          <p className="text-gray-600">View & manage contact us inquiries and replies.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setActiveTab('pending'); setSelectedEntry(null); setEntriesList([]); setPagination(prev => ({ ...prev, currentPage: 1 })) }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => { setActiveTab('answered'); setSelectedEntry(null); setEntriesList([]); setPagination(prev => ({ ...prev, currentPage: 1 })) }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'answered'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Answered
            </button>
          </div>
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
                onClick={handleExport}
                className="px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Two Panel Layout */}
        <div className="flex gap-6 h-[calc(100vh-350px)]">
          {/* Left Panel - List */}
          <div className="w-1/5 h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-xs text-gray-500">Total Entries: {entriesList.length}</h3>
            </div>
            <div ref={listRef} onScroll={handleLeftScroll} className="overflow-y-auto flex-1">
              {loading && entriesList.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))
              ) : entriesList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">No entries found</p>
                </div>
              ) : (
                entriesList.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedEntry?.id === entry.id ? 'bg-[#0c684b]/5 border-l-4 border-l-[#0c684b]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{entry.firstName} {entry.lastName}</h4>
                        <p className="text-xs text-gray-600 mt-1">{entry.email}</p>
                        {entry.orgName && <p className="text-xs text-gray-500 mt-1">{entry.orgName}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(entry.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Details */}
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            {selectedEntry ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedEntry.firstName} {selectedEntry.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">Contact Us Details</p>
                    </div>
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs ${selectedEntry.replyMessage ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {selectedEntry.replyMessage ? 'Answered' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Email</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedEntry.email}</p>
                        </div>
                        {selectedEntry.orgName && (
                          <div>
                            <label className="text-xs text-gray-500">Organization</label>
                            <p className="text-sm text-gray-900 mt-1">{selectedEntry.orgName}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Message</h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[168px] overflow-y-auto">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEntry.message}</p>
                      </div>
                    </div>

                    {/* Reply Section */}
                    <div>
                      {selectedEntry.replyMessage ? (
                        <div className="border border-[#0c684b]/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <FiMessageCircle className="w-4 h-4 text-[#0c684b]" />
                              <span className="text-sm font-medium text-[#0c684b]">Admin Response</span>
                            </div>
                            {hasUpdatePermission && (
                              <button
                                onClick={handleEditClickPanel}
                                className="flex items-center space-x-1 px-2 py-1 text-[#0c684b] hover:bg-[#0c684b]/10 rounded transition-colors text-xs"
                                title="Edit reply"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {selectedEntry.replyMessage}
                          </p>
                        </div>
                      ) : (
                        <div className="flex justify-start">
                          <button
                            onClick={handleReplyClickPanel}
                            disabled={!hasUpdatePermission}
                            className="flex items-center space-x-2 px-6 py-3 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiMessageCircle className="w-4 h-4" />
                            <span>Reply</span>
                          </button>
                        </div>
                      )}

                      {(isReplyingPanel || isEditingPanel) && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {isEditingPanel ? 'Edit Reply' : 'Write Reply'}
                            </span>
                          </div>
                          <textarea
                            ref={panelReplyTextareaRef}
                            value={panelReplyText}
                            onChange={(e) => setPanelReplyText(e.target.value)}
                            placeholder={isEditingPanel ? 'Edit your reply...' : 'Write your reply...'}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent resize-none"
                            rows={3}
                            maxLength={4000}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {4000 - panelReplyText.length} characters remaining
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={handleCancelReplyPanel}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSubmitReplyPanel}
                                disabled={!panelReplyText.trim() || replyMutation.isPending || (isEditingPanel && panelReplyText.trim() === (selectedEntry.replyMessage || ''))}
                                className="px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {replyMutation.isPending ? (isEditingPanel ? 'Updating...' : 'Sending...') : (isEditingPanel ? 'Update Reply' : 'Submit Reply')}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg font-medium">Select an entry</p>
                  <p className="text-sm">Choose an entry from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUs
