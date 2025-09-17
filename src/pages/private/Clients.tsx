import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, usePostApi, usePutApi, useDeleteApi } from '../../hooks'
import { useToast } from '../../components/CustomToast/ToastContext'
import { CLIENT_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../../config/api'
import type { Client, ClientCreateRequest, ClientUpdateRequest } from '../../types/entities'
import Modal from '../../components/Modal'
import ClientForm from '../../forms/ClientForm'
import ClientDetailSheet from '../../components/ClientDetailSheet'
import DateRangePicker from '../../components/DateRangePicker'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import CustomDropdown from '../../components/CustomDropdown'
import { Pagination } from '../../components'
import StyledTable from '../../components/StyledTable'

const Clients = () => {
  // Hooks
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  
  // Check if user has read permission for Clients
  const hasReadPermission = hasPermission('Clients', 'read')
  const hasCreatePermission = hasPermission('Clients', 'create')
  const hasUpdatePermission = hasPermission('Clients', 'update')
  const hasDeletePermission = hasPermission('Clients', 'delete')
  
  // State management
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    isActive: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.isActive && { isActive: filters.isActive }),
  })

  // API hooks
  const { data: clientsResponse, isLoading: loading, refetch } = useGetApi<any>(
    `${CLIENT_ENDPOINTS.getAll}?${queryParams}`,
    {
      requireAuth: true,
      staleTime: 0, // Always fetch fresh data
    }
  )

  const createClientMutation = usePostApi<ClientCreateRequest, any>(
    CLIENT_ENDPOINTS.create,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Client created successfully!')
        setIsAddModalOpen(false)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to create client')
      },
    }
  )

  const updateClientMutation = usePutApi<ClientUpdateRequest, any>(
    `${CLIENT_ENDPOINTS.update}/${selectedClient?.id}`,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Client updated successfully!')
        setIsEditModalOpen(false)
        setIsOverlayOpen(false)
        setSelectedClient(null)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to update client')
      },
    }
  )



  const deleteClientMutation = useDeleteApi(
    `${CLIENT_ENDPOINTS.delete}/${selectedClient?.id}?hardDelete=true`,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Client deleted successfully!')
        setIsDeleteModalOpen(false)
        setIsOverlayOpen(false)
        setSelectedClient(null)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to delete client')
      },
    }
  )

  // Process clients data
  const clients = clientsResponse?.data?.data?.map((client: Client) => ({
    ...client,
    isActive: Boolean(client.isActive), // Convert 0/1 to boolean
    logoUrl: client.logoUrl || '',
    name: client.name || '',
    email: client.email || '',
    clientCode: Array.isArray(client.clientCode) ? client.clientCode : (client.clientCode ? [client.clientCode as unknown as string] : []),
    standard: client.standard || '',
    address: client.address || [],
    phone: client.phone || [],
    products: client.products || [],
    category: client.category || [],
    scope: client.scope || [],
  })) || []

  // Update pagination when data changes
  useEffect(() => {
    if (clientsResponse?.data?.pagination) {
      setPagination(prev => ({
        ...prev,
        totalPages: Number(clientsResponse.data.pagination.totalPages) || 1,
        totalItems: Number(clientsResponse.data.pagination.total) || 0,
      }))
    }
  }, [clientsResponse])

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

  const handleRowClick = (client: Client) => {
    setSelectedClient(client)
    setIsOverlayOpen(true)
  }

  const handleAddClient = () => {
    setIsAddModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditModalOpen(true)
  }

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client)
    setIsDeleteModalOpen(true)
  }

  const handleToggleStatus = async (client: Client) => {
    try {
      console.log('Current client.isActive:', client.isActive, 'Type:', typeof client.isActive)
      
      // Use the isActive value that was passed from the detail sheet
      // The detail sheet already toggled the value, so we use it directly
      const payload = {
        isActive: client.isActive, // Use the passed value directly
      }
      
      console.log('Sending payload:', payload)

      // Use direct fetch to ensure we send to the correct endpoint with client ID
      const response = await fetch(`${API_CONFIG.baseURL}${CLIENT_ENDPOINTS.update}/${client.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update client status')
      }

      showToast('success', `Client ${!client.isActive ? 'activated' : 'deactivated'} successfully!`)
      refetch() // Refresh the client list
    } catch (error) {
      console.error('Error updating client status:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to update client status')
    }
  }

  const handleSubmitCreate = async (data: ClientCreateRequest) => {
    setIsSubmitting(true)
    try {
      await createClientMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitUpdate = async (data: ClientUpdateRequest) => {
    setIsSubmitting(true)
    try {
      await updateClientMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteClientMutation.mutateAsync()
    } finally {
      setIsDeleting(false)
    }
  }

  const closeOverlay = () => {
    // Delay the state change to allow the exit animation to complete
    setTimeout(() => {
      setIsOverlayOpen(false)
      setSelectedClient(null)
    }, 300) // Match the animation duration
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (!hasReadPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 text-lg">You don't have permission to view clients</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-35px)] p-6'>

        {/* Header */}
      <div className="flex items-center justify-between my-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage client information and certifications</p>
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
              placeholder="Search clients by name, standard, client code, email, fax, or website..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <CustomDropdown
            options={[
              { value: '', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            value={filters.isActive}
            onChange={handleIsActiveFilterChange}
            placeholder="Filter by status"
            className="w-44 text-sm"
          />

          {/* Date Range Picker */}
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onDateRangeChange={handleDateFilterApply}
            placeholder="Filter by date range"
            className="w-72 text-sm"
            includeTime={true}
          />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => { /* TODO: implement export */ }}
            className="px-6 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Export
          </button>
          {hasCreatePermission && (
            <button
              onClick={handleAddClient}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiPlus size={16} />
              <span>Add Client</span>
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Content */}
      {loading || clients.length === 0 ? (
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
            <div className="p-12 text-center">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No clients found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <StyledTable<Client>
            data={clients}
            columns={[
              {
                key: 'client',
                header: 'Client',
                render: (client: Client) => (
                  <div className="flex items-center">
                    {client.logoUrl && (
                      <img
                        src={client.logoUrl}
                        alt={`${client.name} logo`}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                        onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none' }}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.clientCode && client.clientCode.length > 0 ? client.clientCode.join(', ') : ''}</div>
                    </div>
                  </div>
                )
              },
              {
                key: 'contact',
                header: 'Contact',
                render: (client: Client) => (
                  <div>
                    <div className="text-sm text-gray-900">{client.email}</div>
                    {client.phone.length > 0 && (
                      <div className="text-sm text-gray-500">{client.phone[0]}</div>
                    )}
                  </div>
                )
              },
              {
                key: 'certification',
                header: 'Certification',
                render: (client: Client) => (
                  <div>
                    <div className="text-sm text-gray-900">{client.standard}</div>
                    {client.category.length > 0 && (
                      <div className="text-sm text-gray-500">{client.category[0]}</div>
                    )}
                  </div>
                )
              },
              {
                key: 'status',
                header: 'Status',
                render: (client: Client) => (
                  <div className={`flex items-center space-x-1 px-2 max-w-20 py-1 rounded-full text-xs font-medium ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {client.isActive ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                    <span>{client.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                )
              },
              {
                key: 'expiry',
                header: 'Expiry',
                render: (client: Client) => (
                  <div>
                    <div className="text-sm text-gray-900">{formatDate(client.expiryDate)}</div>
                    {isExpired(client.expiryDate) && (
                      <div className="text-xs text-red-600">Expired</div>
                    )}
                  </div>
                )
              }
            ]}
            onRowClick={handleRowClick}
          />

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Modals */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Client"
        size="xl"
      >
        <div className="h-[70vh] overflow-hidden">
          <ClientForm
            onSubmit={(data: ClientCreateRequest | ClientUpdateRequest) => handleSubmitCreate(data as ClientCreateRequest)}
            onCancel={() => setIsAddModalOpen(false)}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client"
        size="xl"
      >
        <div className="h-[70vh] overflow-hidden">
          <ClientForm
            client={selectedClient || undefined}
            onSubmit={handleSubmitUpdate}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>

      {hasDeletePermission && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Client"
          message={`Are you sure you want to delete "${selectedClient?.name}"? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      )}

      {/* Client Detail Sheet */}
      <ClientDetailSheet
        client={selectedClient}
        open={isOverlayOpen}
        onClose={closeOverlay}
        onEdit={(client) => {
          setIsOverlayOpen(false)
          handleEditClient(client)
        }}
        onDelete={(client) => {
          setIsOverlayOpen(false)
          handleDeleteClient(client)
        }}
        onToggleStatus={handleToggleStatus}
        hasUpdatePermission={hasUpdatePermission}
        hasDeletePermission={hasDeletePermission}
      />
      </div>
      
    </div>
  )
}

export default Clients
