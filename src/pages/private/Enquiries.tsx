import { useEffect, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useEnquiriesApi } from '../../hooks'
import type { Enquiry } from '../../types/entities'
import { useToast } from '../../components/CustomToast/ToastContext'
import DateRangePicker from '../../components/DateRangePicker'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import { Pagination } from '../../components'
import { API_CONFIG, ENQUIRY_ENDPOINTS, getAuthHeaders } from '../../config/api'

type EnquiryTabType = 'pending' | 'accepted' | 'rejected'

const Enquiries = () => {
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()

  const hasReadPermission = hasPermission('Enquiry', 'read')

  const [activeTab, setActiveTab] = useState<EnquiryTabType>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    state: '',
    startDate: '',
    endDate: '',
    email: '',
    firstName: '',
    lastName: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)

  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    state: activeTab,
    ...(searchTerm && { search: searchTerm }),
    ...(filters.email && { email: filters.email }),
    ...(filters.firstName && { firstName: filters.firstName }),
    ...(filters.lastName && { lastName: filters.lastName }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  })

  const { data, isLoading, refetch } = useEnquiriesApi(queryParams.toString(), {
    requireAuth: true,
    staleTime: 0,
  })

  const enquiries: Enquiry[] = data?.data?.data || []

  useEffect(() => {
    if (data?.data?.pagination) {
      setPagination(prev => ({
        ...prev,
        totalPages: Number(data.data.pagination.totalPages) || 1,
        totalItems: Number(data.data.pagination.total) || 0,
      }))
    }
  }, [data])

  // Refetch data when active tab changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page
    setSelectedEnquiry(null) // Clear selected enquiry when switching tabs
    refetch()
  }, [activeTab, refetch])

  // Select first enquiry when data loads or tab changes
  useEffect(() => {
    if (enquiries.length > 0 && !selectedEnquiry) {
      setSelectedEnquiry(enquiries[0])
    } else if (enquiries.length > 0 && selectedEnquiry && !enquiries.find(e => e.id === selectedEnquiry.id)) {
      setSelectedEnquiry(enquiries[0])
    }
  }, [enquiries, selectedEnquiry])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }


  const handleDateFilterApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }



  const handleConfirmDelete = async () => {
    if (!enquiryToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${ENQUIRY_ENDPOINTS.delete}/${enquiryToDelete.id}?hardDelete=true`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete enquiry')
      }
      showToast('success', 'Enquiry deleted successfully!')
      setIsDeleteModalOpen(false)
      setEnquiryToDelete(null)
      refetch()
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to delete enquiry')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAccept = async (enquiry: Enquiry) => {
    setUpdatingId(enquiry.id)
    setActionType('accept')
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${ENQUIRY_ENDPOINTS.update}/${enquiry.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ state: 'Accepted' }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to accept enquiry')
      }

      showToast('success', 'Enquiry accepted successfully')
      refetch()
    } catch (error) {
      console.error('Error accepting enquiry:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to accept enquiry')
    } finally {
      setUpdatingId(null)
      setActionType(null)
    }
  }

  const handleReject = async (enquiry: Enquiry) => {
    setUpdatingId(enquiry.id)
    setActionType('reject')
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${ENQUIRY_ENDPOINTS.update}/${enquiry.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ state: 'Rejected' }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to reject enquiry')
      }

      showToast('success', 'Enquiry rejected successfully')
      refetch()
    } catch (error) {
      console.error('Error rejecting enquiry:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to reject enquiry')
    } finally {
      setUpdatingId(null)
      setActionType(null)
    }
  }

  if (!hasReadPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 text-lg">You don't have permission to view enquiries</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] max-h-[calc(100vh-35px)] overflow-y-auto px-6 py-10'> 
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Enquiries</h1>
          <p className="text-gray-600">View and manage customer enquiries.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'accepted'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'rejected'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rejected
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
                placeholder="Search in name, email, or message"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-[10px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-xs"
              />
            </div>


            {/* Date Range Picker */}
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onDateRangeChange={handleDateFilterApply}
              placeholder="Select date range"
              includeTime={true}
              className="w-[250px] text-xs"
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

        {/* Two Panel Layout */}
        <div className="flex gap-6 h-[calc(100vh-350px)]">
          {/* Left Panel - User List */}
          <div className="w-1/5 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-xs text-gray-500">Total Enquiries: {enquiries.length}</h3>
            </div>
            <div className="overflow-y-auto h-full">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))
              ) : enquiries.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">No enquiries found</p>
                </div>
              ) : (
                enquiries.map((enquiry: Enquiry) => (
                  <div
                    key={enquiry.id}
                    onClick={() => setSelectedEnquiry(enquiry)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedEnquiry?.id === enquiry.id ? 'bg-[#0c684b]/5 border-l-4 border-l-[#0c684b]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {enquiry.firstName} {enquiry.lastName}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{enquiry.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{enquiry.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] ${
                          enquiry.state === 'Pending' ? 'bg-[#0c684b] text-white' :
                          enquiry.state === 'Accepted' ? 'bg-[#0c684b] text-white' :
                          'bg-[#0c684b] text-white'
                        }`}>
                          {enquiry.state}
                        </span>
                        <p className="text-xs text-gray-400 mt-5">
                          {new Date(enquiry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Details */}
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            {selectedEnquiry ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedEnquiry.firstName} {selectedEnquiry.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">Enquiry Details</p>
                    </div>
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs bg-[#0c684b] text-white`}>
                      {selectedEnquiry.state}
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
                          <label className="text-xs text-gray-500">First Name</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedEnquiry.firstName}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Last Name</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedEnquiry.lastName}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Email</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedEnquiry.email}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Phone</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedEnquiry.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Message</h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[168px] overflow-y-auto">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEnquiry.message}</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Action Buttons */}
                {activeTab === 'pending' && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleReject(selectedEnquiry)}
                        disabled={updatingId === selectedEnquiry.id}
                        className="px-12 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingId === selectedEnquiry.id && actionType === 'reject' ? 'Rejecting...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleAccept(selectedEnquiry)}
                        disabled={updatingId === selectedEnquiry.id}
                        className="px-12 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingId === selectedEnquiry.id && actionType === 'accept' ? 'Accepting...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'rejected' && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleAccept(selectedEnquiry)}
                        disabled={updatingId === selectedEnquiry.id}
                        className="px-12 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingId === selectedEnquiry.id && actionType === 'accept' ? 'Accepting...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg font-medium">Select an enquiry</p>
                  <p className="text-sm">Choose an enquiry from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Enquiry"
          message={`Are you sure you want to delete the enquiry from "${enquiryToDelete?.firstName} ${enquiryToDelete?.lastName}"? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      </div>
    </div>
  )
}

export default Enquiries


