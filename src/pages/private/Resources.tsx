import { useState, useEffect } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, useDeleteApi } from '../../hooks'
import CustomDropdown from '../../components/CustomDropdown'
import { useToast } from '../../components/CustomToast/ToastContext'
import { RESOURCE_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../../config/api'
import type { Resource } from '../../types/entities'
import ResourceDetailSheet from '../../components/ResourceDetailSheet'
import Modal from '../../components/Modal'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import ResourceForm from '../../forms/ResourceForm'
import DateRangePicker from '../../components/DateRangePicker'
import { Pagination } from '../../components'

const Resources = () => {
  // Hooks
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  
  // Check if user has read permission for Resources

  
  // State management
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'Articles' | 'News'>('Articles')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    isActive: '',
    startDate: '',
    endDate: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    category: activeTab,
    ...(searchTerm && { search: searchTerm }),
    ...(filters.isActive && { isActive: filters.isActive }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  })

  // API hooks
  const { data: resourcesResponse, isLoading: loading, refetch } = useGetApi<any>(
    `${RESOURCE_ENDPOINTS.getAll}?${queryParams}`,
    {
      requireAuth: true,
      staleTime: 0, // Always fetch fresh data
    }
  )

  // Delete resource mutation
  const deleteResourceMutation = useDeleteApi(
    resourceToDelete ? `${RESOURCE_ENDPOINTS.delete}/${resourceToDelete.id}?hardDelete=true` : '',
    {
      requireAuth: true,
      invalidateQueries: ['resources'],
      onSuccess: () => {
        showToast('success', 'Resource deleted successfully!')
        setIsDeleteModalOpen(false)
        setResourceToDelete(null)
        
        if (selectedResource?.id === resourceToDelete?.id) {
          setIsOverlayOpen(false)
          setSelectedResource(null)
        }
        
        refetch()
      },
      onError: (error) => {
        console.error('Error deleting resource:', error)
        showToast('error', error instanceof Error ? error.message : 'Failed to delete resource')
      },
    }
  )

  // Process resources data
  const resources = resourcesResponse?.data?.data?.map((resource: Resource) => ({
    ...resource,
    isActive: resource.isActive ?? true,
    imageUrl: resource.imageUrl || '',
    title: resource.title || '',
    authorName: resource.authorName || '',
    description: resource.description || '',
    category: resource.category || '',
    listUrl: resource.listUrl || [],
  })) || []

  // Update pagination when data changes
  useEffect(() => {
    if (resourcesResponse?.data?.pagination) {
      setPagination(prev => ({
        ...prev,
        totalPages: resourcesResponse.data.pagination.totalPages,
        totalItems: resourcesResponse.data.pagination.totalItems,
      }))
    }
  }, [resourcesResponse])

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



  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource)
    setIsOverlayOpen(true)
  }

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource)
    setIsAddModalOpen(true)
  }

  const handleToggleStatus = async (resource: Resource) => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${RESOURCE_ENDPOINTS.update}/${resource.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          authorName: resource.authorName,
          title: resource.title,
          description: resource.description,
          category: resource.category,
          imageUrl: resource.imageUrl,
          listUrl: resource.listUrl,
          publishedDate: resource.publishedDate,
          isActive: resource.isActive,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update resource status')
      }

      // Update selected resource if it's the same
      if (selectedResource?.id === resource.id) {
        setSelectedResource(prev => prev ? { ...prev, isActive: resource.isActive } : null)
      }
      
      showToast('success', `Resource ${resource.isActive ? 'activated' : 'deactivated'} successfully!`)
      
      // Refetch resources to update the list
      refetch()
    } catch (error) {
      console.error('Error updating resource status:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to update resource status')
      throw error // Re-throw to allow the component to revert the local state
    }
  }



  const handleAddResource = () => {
    setSelectedResource(null)
    setIsAddModalOpen(true)
  }

  const handleResourceFormSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const isEditing = !!selectedResource
      const url = isEditing 
        ? `${API_CONFIG.baseURL}${RESOURCE_ENDPOINTS.update}/${selectedResource.id}`
        : `${API_CONFIG.baseURL}${RESOURCE_ENDPOINTS.create}`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} resource`)
      }

      const result = await response.json()
      console.log(`Resource ${isEditing ? 'updated' : 'created'} successfully:`, result)
      
      // Show success toast
      showToast('success', `Resource ${isEditing ? 'updated' : 'created'} successfully!`)
      
      // Close modal and refetch resources
      setIsAddModalOpen(false)
      setSelectedResource(null)
      refetch()
    } catch (error) {
      console.error('Error saving resource:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to save resource')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResourceFormCancel = () => {
    setIsAddModalOpen(false)
  }

  const closeOverlay = () => {
    setIsOverlayOpen(false)
    setSelectedResource(null)
  }

  // Resource Card Component
  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={() => handleViewResource(resource)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={resource.imageUrl || '/placeholder-resource.jpg'}
          alt={resource.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-resource.jpg'
          }}
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
            {resource.title}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            resource.isActive 
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {resource.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          By {resource.authorName}
        </p>
        <p className="text-sm text-gray-500 line-clamp-2">
          {resource.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(resource.publishedDate).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-400">
            {resource.listUrl.length} link{resource.listUrl.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )

  // Loading shimmer for resource cards
  const ResourceCardShimmer = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded mb-3"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
         {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
        <p className="text-gray-600">View & manage resources.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('Articles')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'Articles'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setActiveTab('News')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'News'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            News
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
              placeholder={`Search ${activeTab.toLowerCase()} by title, author, or description...`}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            />
          </div>

          {/* Date Range Picker */}
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onDateRangeChange={(startDate, endDate) => {
              setFilters(prev => ({ 
                ...prev, 
                startDate, 
                endDate 
              }));
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            placeholder="Select date range"
            className="w-64 text-sm"
          />

          {/* Status Filter */}
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

          {/* Add Resource Button */}
          {hasPermission('Resources', 'create') && (
            <button
              onClick={handleAddResource}
                              disabled={isSubmitting}
              className="flex items-center space-x-2 cursor-pointer px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus size={16} />
              <span>Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Loading shimmer
          Array.from({ length: 8 }).map((_, index) => (
            <ResourceCardShimmer key={index} />
          ))
        ) : resources.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium">No {activeTab.toLowerCase()} found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          resources.map((resource: Resource) => (
            <ResourceCard key={resource.id} resource={resource} />
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

      {/* Resource Detail Sheet */}
      <ResourceDetailSheet
        resource={selectedResource}
        open={isOverlayOpen}
        onClose={closeOverlay}
        onEdit={(resource) => {
          setIsOverlayOpen(false)
          handleEditResource(resource)
        }}
        onDelete={(resource) => {
          setResourceToDelete(resource)
          setIsOverlayOpen(false)
          setIsDeleteModalOpen(true)
        }}
        onToggleStatus={handleToggleStatus}
        hasUpdatePermission={hasPermission('Resources', 'update')}
        hasDeletePermission={hasPermission('Resources', 'delete')}
        onRefetch={refetch}
      />

      {/* Add/Edit Resource Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleResourceFormCancel}
          title={selectedResource ? 'Edit Resource' : 'Add New Resource'}
        >
          <ResourceForm
            resource={selectedResource}
            category={activeTab}
            onSubmit={handleResourceFormSubmit}
            onCancel={handleResourceFormCancel}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteResourceMutation.mutate()}
        title="Delete Resource"
        message={`Are you sure you want to permanently delete the resource "${resourceToDelete?.title}"? This action cannot be undone and the resource will be permanently removed from the database.`}
        isLoading={deleteResourceMutation.isPending}
      />
      </div>
     
    </div>
  )
}

export default Resources
