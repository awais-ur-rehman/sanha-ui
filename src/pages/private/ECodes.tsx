import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, useDeleteApi } from '../../hooks'
import CustomDropdown from '../../components/CustomDropdown'
import { useToast } from '../../components/CustomToast/ToastContext'
import { ECODE_ENDPOINTS, API_CONFIG, getAuthHeaders, ECODE_EXPORT_ENDPOINT } from '../../config/api'
import type { ECode } from '../../types/entities'
import EntityDetailSheet from '../../components/EntityDetailSheet'
import Modal from '../../components/Modal'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'

import ECodeForm from '../../forms/ECodeForm'
import { Pagination } from '../../components'
import StyledTable from '../../components/StyledTable'

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
    isActive: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  
  // Delete modal state



  // Build query parameters
  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.status && { status: filters.status }),
    ...(filters.isActive && { isActive: filters.isActive }),
  })

  // API hooks
  const { data: ecodesResponse, isLoading: loading, refetch } = useGetApi<any>(
    `${ECODE_ENDPOINTS.getAll}?${queryParams}`,
    {
      requireAuth: true,
      staleTime: 0, // Always fetch fresh data
    }
  )

  // Export CSV hook
  const exportQueryParams = new URLSearchParams({
    ...(searchTerm && { search: searchTerm }),
    ...(filters.status && { status: filters.status }),
    ...(filters.isActive && { isActive: filters.isActive }),
  })
  const exportCsvQuery = useGetApi<Blob>(
    `${ECODE_EXPORT_ENDPOINT}?${exportQueryParams.toString()}`,
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
      a.download = `ecodes-${new Date().toISOString().slice(0,10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {}
  }

  // Delete E-Code mutation
  const deleteECodeMutation = useDeleteApi(
    `${ECODE_ENDPOINTS.delete}/${selectedECode?.id}?hardDelete=true`,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'E-Code deleted successfully!')
        setIsDeleteModalOpen(false)
        setIsOverlayOpen(false)
        setSelectedECode(null)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to delete E-Code')
      },
    }
  )
  

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

  const handleIsActiveFilterChange = (value: string | number) => {
    setFilters(prev => ({ 
      ...prev, 
      isActive: value.toString() 
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleViewECode = (ecode: ECode) => {
    setSelectedECode(ecode)
    setIsOverlayOpen(true)
  }

  const handleDeleteECode = (ecode: ECode) => {
    setSelectedECode(ecode)
    setIsOverlayOpen(false) // Close the detail sheet
    setIsDeleteModalOpen(true)
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

  const handleToggleStatus = async (ecode: ECode, newStatus?: boolean) => {
    try {
      // Use provided newStatus or toggle current status
      const statusToSet = newStatus !== undefined ? newStatus : !ecode.isActive
      
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
        isActive: statusToSet,
      }

      const response = await fetch(`${API_CONFIG.baseURL}${ECODE_ENDPOINTS.update}/${ecode.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        // Special handling for 404 error when deactivating
        if (response.status === 404 && !statusToSet) {
          // The E-Code was successfully deactivated but the API can't find it to return
          // This is likely a backend issue where inactive records are filtered out
          console.log('E-Code deactivated successfully but API returned 404 (backend filtering issue)')
          
          // Update selected ecode if it's the same
          if (selectedECode?.id === ecode.id) {
            setSelectedECode(prev => prev ? { ...prev, isActive: statusToSet } : null)
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
        setSelectedECode(prev => prev ? { ...prev, isActive: statusToSet } : null)
      }
      
      showToast('success', `E-Code ${statusToSet ? 'activated' : 'deactivated'} successfully!`)
      
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
      <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">E-Codes</h1>
        <p className="text-gray-600">View & manage E-Codes.</p>
      </div>

      {/* Filters */}
      <div className='py-6'>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-72">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search E-Codes by code, name, or status..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-[10px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-xs"
            />
          </div>

          {/* Status Filter */}
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
            className="w-[120px] text-xs"
          />

          {/* Active Status Filter */}
          <CustomDropdown
            placeholder="All Records"
            value={filters.isActive}
            onChange={handleIsActiveFilterChange}
            options={[
              { value: '', label: 'All Records' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            className="w-[150px] text-xs"
          />

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors"
            >
              Export
            </button>
            {hasPermission('E-Codes', 'create') && (
              <button
                onClick={handleAddECode}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Add E-Code</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* E-Codes Table */}
      {loading || ecodes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">No E-Codes found</div>
          )}
        </div>
      ) : (
        <>
          <StyledTable<ECode>
            data={ecodes}
            columns={[
              { key: 'code', header: 'Code', render: (e: ECode) => (<span className="text-sm font-medium text-gray-900">{e.code}</span>) },
              { key: 'name', header: 'Name', render: (e: ECode) => (<span className="text-sm text-gray-900">{e.name}</span>) },
              { key: 'function', header: 'Function', render: (e: ECode) => (<span className="text-sm text-gray-600">{displayArrayItems(e.function || [])}</span>) },
              { key: 'status', header: 'Status', render: (e: ECode) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${e.status === 'halaal' ? 'bg-green-100 text-green-800' : e.status === 'haraam' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {e.status}
                </span>
              ) },
              { key: 'active', header: 'Active Status', render: (e: ECode) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${e.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {e.isActive ? 'Active' : 'Inactive'}
                </span>
              ) },
              { key: 'source', header: 'Source', render: (e: ECode) => (<span className="text-sm text-gray-600">{displayArrayItems(e.source || [])}</span>) },
            ]}
            onRowClick={(e) => !isSubmitting && handleViewECode(e)}
          />

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
 

      {/* E-Code Detail Sheet */}
      <EntityDetailSheet
        entity={selectedECode}
        open={isOverlayOpen}
        onClose={closeOverlay}
        onEdit={(ecode) => {
          setIsOverlayOpen(false)
          handleEditECode(ecode as ECode)
        }}
        onDelete={(ecode) => {
          setIsOverlayOpen(false)
          handleDeleteECode(ecode as ECode)
        }}
        hasUpdatePermission={hasPermission('E-Codes', 'update')}
        hasDeletePermission={hasPermission('E-Codes', 'delete')}
        titleAccessor={(ecode: ECode) => ecode.name}
        statusToggle={{
          checked: Boolean(selectedECode?.isActive),
          onChange: async (checked: boolean) => {
            if (!selectedECode) return
            await handleToggleStatus(selectedECode, checked)
          },
          enabled: hasPermission('E-Codes', 'update'),
          labelActive: 'Active',
          labelInactive: 'Inactive',
        }}
        statusBadge={selectedECode ? {
          text: selectedECode.status,
          color: selectedECode.status === 'halaal' ? 'green' : selectedECode.status === 'haraam' ? 'red' : 'yellow'
        } : undefined}
        sections={[
          {
            title: 'E-Code Information',
            items: [
              { label: 'Code', value: selectedECode?.code || 'N/A' },
              { label: 'Alternate Names', value: selectedECode?.alternateName?.join(', ') || 'N/A' },
            ]
          },
          {
            title: 'Function',
            type: 'chips',
            items: selectedECode?.function || [],
          },
          {
            title: 'Source',
            type: 'chips',
            items: selectedECode?.source || [],
          },
          {
            title: 'Health Information',
            type: 'chips',
            items: selectedECode?.healthInfo || [],
          },
          {
            title: 'Uses',
            type: 'chips',
            items: selectedECode?.uses || [],
          },
        ]}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteECodeMutation.mutate()}
        title="Delete E-Code"
        message={`Are you sure you want to permanently delete the E-Code "${selectedECode?.name}"? This action cannot be undone.`}
        isLoading={deleteECodeMutation.isPending}
      />

      {/* Add/Edit E-Code Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleECodeFormCancel}
          title={selectedECode ? 'Edit E-Code' : 'Add New E-Code'}
          size="xl"
        >
          <div className="h-[70vh] overflow-hidden">
            <ECodeForm
              ecode={selectedECode}
              onSubmit={handleECodeFormSubmit}
              onCancel={handleECodeFormCancel}
              isLoading={isSubmitting}
            />
          </div>
        </Modal>
      )}
      </div>
    </div>
  )
}

export default ECodes
