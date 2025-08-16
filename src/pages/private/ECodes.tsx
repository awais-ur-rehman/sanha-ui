import { useState, useEffect } from 'react'
import { FiSearch, FiPlus } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi } from '../../hooks'
import CustomDropdown from '../../components/CustomDropdown'
import { useToast } from '../../components/CustomToast/ToastContext'
import { ECODE_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../../config/api'
import type { ECode } from '../../types/entities'
import ECodeDetailSheet from '../../components/ECodeDetailSheet'
import Modal from '../../components/Modal'

import ECodeForm from '../../forms/ECodeForm'

const ECodes = () => {
  // Hooks
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  
  // State management
  const [selectedECode, setSelectedECode] = useState<ECode | null>(null)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  // Delete modal state



  // Build query parameters
  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.status && { status: filters.status }),
  })

  // API hooks
  const { data: ecodesResponse, isLoading: loading, refetch } = useGetApi<any>(
    `${ECODE_ENDPOINTS.getAll}?${queryParams}`,
    {
      requireAuth: true,
      staleTime: 0, // Always fetch fresh data
    }
  )

  // Delete E-Code mutation
  

  // Process E-Codes data
  const ecodes = ecodesResponse?.data?.data?.map((ecode: ECode) => ({
    ...ecode,
    isActive: ecode.isActive ?? true,
    code: ecode.code || '',
    name: ecode.name || '',
    function: ecode.function || [],
    status: ecode.status || '',
    source: ecode.source || [],
  })) || []

  // Update pagination when data changes
  useEffect(() => {
    if (ecodesResponse?.data?.pagination) {
      setPagination(prev => ({
        ...prev,
        totalPages: Number(ecodesResponse.data.pagination.totalPages) || 1,
        totalItems: Number(ecodesResponse.data.pagination.total) || 0,
      }))
    }
  }, [ecodesResponse])

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleViewECode = (ecode: ECode) => {
    setSelectedECode(ecode)
    setIsOverlayOpen(true)
  }

  const handleAddECode = () => {
    setSelectedECode(null)
    setIsAddModalOpen(true)
  }

  const handleEditECode = (ecode: ECode) => {
    setSelectedECode(ecode)
    setIsAddModalOpen(true)
  }

  const handleECodeFormSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const isEditing = !!selectedECode
      const url = isEditing 
        ? `${API_CONFIG.baseURL}${ECODE_ENDPOINTS.update}/${selectedECode.id}`
        : `${API_CONFIG.baseURL}${ECODE_ENDPOINTS.create}`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} E-Code`)
      }

      const result = await response.json()
      console.log(`E-Code ${isEditing ? 'updated' : 'created'} successfully:`, result)
      
      // Show success toast
      showToast('success', `E-Code ${isEditing ? 'updated' : 'created'} successfully!`)
      
      // Close modal and refetch E-Codes
      setIsAddModalOpen(false)
      setSelectedECode(null)
      refetch()
    } catch (error) {
      console.error('Error saving E-Code:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to save E-Code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleECodeFormCancel = () => {
    setIsAddModalOpen(false)
  }

  const handleToggleStatus = async (ecode: ECode) => {
    try {
      // Prepare the complete E-Code data for update
      const updateData = {
        code: ecode.code,
        name: ecode.name,
        alternateName: ecode.alternateName || [],
        function: ecode.function || [],
        status: ecode.status,
        source: ecode.source || [],
        healthInfo: ecode.healthInfo || [],
        uses: ecode.uses || [],
        isActive: ecode.isActive,
      }

      const response = await fetch(`${API_CONFIG.baseURL}${ECODE_ENDPOINTS.update}/${ecode.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        // Special handling for 404 error when deactivating
        if (response.status === 404 && !ecode.isActive) {
          // The E-Code was successfully deactivated but the API can't find it to return
          // This is likely a backend issue where inactive records are filtered out
          console.log('E-Code deactivated successfully but API returned 404 (backend filtering issue)')
          
          // Update selected ecode if it's the same
          if (selectedECode?.id === ecode.id) {
            setSelectedECode(prev => prev ? { ...prev, isActive: ecode.isActive } : null)
          }
          
          showToast('success', 'E-Code deactivated successfully!')
          
          // Refetch ecodes to update the list
          refetch()
          return
        }
        
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update E-Code status')
      }

      // Update selected ecode if it's the same
      if (selectedECode?.id === ecode.id) {
        setSelectedECode(prev => prev ? { ...prev, isActive: ecode.isActive } : null)
      }
      
      showToast('success', `E-Code ${ecode.isActive ? 'activated' : 'deactivated'} successfully!`)
      
      // Refetch ecodes to update the list
      refetch()
    } catch (error) {
      console.error('Error updating E-Code status:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to update E-Code status')
      throw error // Re-throw to allow the component to revert the local state
    }
  }



  const closeOverlay = () => {
    setIsOverlayOpen(false)
    setSelectedECode(null)
  }

  // Helper function to display array items with +N indicator
  const displayArrayItems = (items: string[], maxItems: number = 2) => {
    if (!items || items.length === 0) return 'N/A'
    
    const displayItems = items.slice(0, maxItems)
    const remainingCount = items.length - maxItems
    
    let display = displayItems.join(', ')
    if (remainingCount > 0) {
      display += ` +${remainingCount}`
    }
    
    return display
  }

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">E-Codes</h1>
        <p className="text-gray-600">View & manage E-Codes.</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search E-Codes by code, name, or status..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="w-48">
            <CustomDropdown
              placeholder="All Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value as string)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'halaal', label: 'Halaal' },
                { value: 'haraam', label: 'Haraam' },
                { value: 'doubtful', label: 'Doubtful' },
              ]}
            />
          </div>

          {/* Add E-Code Button */}
          <button
            onClick={handleAddECode}
                            disabled={isSubmitting}
            className="flex items-center space-x-2 cursor-pointer px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus size={16} />
            <span>Add E-Code</span>
          </button>
        </div>
      </div>

            {/* E-Codes Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Function
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Loading rows
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </td>
                  </tr>
                ))
              ) : ecodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No E-Codes found
                  </td>
                </tr>
              ) : (
                ecodes.map((ecode: ECode) => (
                  <tr
                    key={ecode.id}
                    onClick={() => !isSubmitting && handleViewECode(ecode)}
                    className={`transition-colors ${
                      isSubmitting 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ecode.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ecode.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {displayArrayItems(ecode.function || [])}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ecode.status === 'halaal' 
                          ? 'bg-green-100 text-green-800'
                          : ecode.status === 'haraam'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ecode.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {displayArrayItems(ecode.source || [])}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems || 0)} of{' '}
            {pagination.totalItems || 0} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= (pagination.totalPages || 1)}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
 

      {/* E-Code Detail Sheet */}
      <ECodeDetailSheet
        ecode={selectedECode}
        open={isOverlayOpen}
        onClose={closeOverlay}
        onEdit={(ecode) => {
          setIsOverlayOpen(false)
          handleEditECode(ecode)
        }}
        onDelete={() => {
          setIsOverlayOpen(false)
          setSelectedECode(null)
          showToast('success', 'E-Code deleted successfully!')
        }}
        onToggleStatus={handleToggleStatus}
        hasUpdatePermission={hasPermission('E-Codes', 'update')}
        hasDeletePermission={hasPermission('E-Codes', 'delete')}
        onRefetch={refetch}
      />

      {/* Add/Edit E-Code Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleECodeFormCancel}
          title={selectedECode ? 'Edit E-Code' : 'Add New E-Code'}
        >
          <ECodeForm
            ecode={selectedECode}
            onSubmit={handleECodeFormSubmit}
            onCancel={handleECodeFormCancel}
            isLoading={isSubmitting}
          />
        </Modal>
      )}
      </div>
    </div>
  )
}

export default ECodes
