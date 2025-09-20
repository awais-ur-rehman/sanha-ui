import { useEffect, useState } from 'react'
import { FiSearch, FiMail, FiPhone, FiUser, FiTrash2 } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useEnquiriesApi } from '../../hooks'
import type { Enquiry } from '../../types/entities'
import { useToast } from '../../components/CustomToast/ToastContext'
import CustomDropdown from '../../components/CustomDropdown'
import DateRangePicker from '../../components/DateRangePicker'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import { Pagination } from '../../components'
import { API_CONFIG, ENQUIRY_ENDPOINTS, getAuthHeaders } from '../../config/api'

const Enquiries = () => {
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()

  const hasReadPermission = hasPermission('Enquiry', 'read')
  const hasUpdatePermission = hasPermission('Enquiry', 'update')
  const hasDeletePermission = hasPermission('Enquiry', 'delete')

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

  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.state && { state: filters.state }),
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

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleDateFilterApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleStateChange = async (enquiry: Enquiry, newState: 'Pending' | 'Accepted' | 'Rejected') => {
    if (!hasUpdatePermission) return
    try {
      setUpdatingId(enquiry.id)
      const response = await fetch(`${API_CONFIG.baseURL}${ENQUIRY_ENDPOINTS.update}/${enquiry.id}` , {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ state: newState }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update enquiry state')
      }
      showToast('success', 'Enquiry state updated successfully!')
      refetch()
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to update enquiry state')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteEnquiry = (enquiry: Enquiry) => {
    if (!hasDeletePermission) return
    setEnquiryToDelete(enquiry)
    setIsDeleteModalOpen(true)
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
      <div className='bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-35px)] max-h-[calc(100vh-35px)] overflow-y-auto px-6 py-10'> 
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Enquiries</h1>
          <p className="text-gray-600">View and manage customer enquiries.</p>
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

            {/* State Filter */}
            <CustomDropdown
              placeholder="All States"
              value={filters.state}
              onChange={(value) => handleFilterChange('state', value as string)}
              options={[
                { value: '', label: 'All States' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Accepted', label: 'Accepted' },
                { value: 'Rejected', label: 'Rejected' },
              ]}
              className="w-[120px] text-xs"
            />

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

        {/* Content - Cards */}
        <div className="w-full">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse p-6 mb-6 border border-[#0c684b]/20">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
              </div>
            ))
          ) : enquiries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No enquiries found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            enquiries.map((enquiry: Enquiry) => (
              <div key={enquiry.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 mb-6 border border-[#0c684b]/20">
                {/* Header: User info and actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <FiUser className="w-4 h-4 text-[#0c684b]" />
                      <span>{enquiry.firstName} {enquiry.lastName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><FiMail className="w-3 h-3 text-[#0c684b]" /><span>{enquiry.email}</span></div>
                      <div className="flex items-center gap-1"><FiPhone className="w-3 h-3 text-[#0c684b]" /><span>{enquiry.phone}</span></div>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(enquiry.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CustomDropdown
                      disabled={!hasUpdatePermission || updatingId === enquiry.id}
                      value={enquiry.state}
                      onChange={(value) => handleStateChange(enquiry, value as 'Pending' | 'Accepted' | 'Rejected')}
                      options={[
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Accepted', label: 'Accepted' },
                        { value: 'Rejected', label: 'Rejected' },
                      ]}
                      placeholder="Select state"
                      className="w-[120px] text-sm"
                    />

                    {hasDeletePermission && (
                      <button
                        onClick={() => handleDeleteEnquiry(enquiry)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete enquiry"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="border border-[#0c684b]/20 rounded-lg p-4">
                  <p className="text-gray-700 text-sm leading-relaxed">{enquiry.message}</p>
                </div>
              </div>
            ))
          )}
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


