import { useEffect, useState, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { FiSearch, FiMapPin, FiCheckCircle, FiXCircle, FiUpload } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, usePostApi, usePutApi, useDeleteApi, useBulkImport } from '../../hooks'
import { useToast } from '../../components/CustomToast/ToastContext'
import { HALAL_PRODUCT_ENDPOINTS, API_CONFIG } from '../../config/api'
import type { HalalProduct, HalalProductCreateRequest, HalalProductUpdateRequest } from '../../types/entities'
import Modal from '../../components/Modal'
import HalalProductForm from '../../forms/HalalProductForm'
import EntityDetailSheet from '../../components/EntityDetailSheet'
import CustomDropdown from '../../components/CustomDropdown'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import BulkImportModal from '../../components/BulkImportModal'
import { Pagination } from '../../components'
import StyledTable from '../../components/StyledTable'

const HalalProducts = () => {
  // Hooks
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  const location = useLocation()

  // State
  const [selectedProduct, setSelectedProduct] = useState<HalalProduct | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    isActive: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  // Bulk import
  const { importState, startImport, reset: resetImport } = useBulkImport({
    endpoint: HALAL_PRODUCT_ENDPOINTS.bulkImport,
    onSuccess: () => {
      showToast('success', 'Products imported successfully!')
    },
    onError: (error) => {
      showToast('error', error)
    }
  })

  // Permissions
  const hasCreatePermission = hasPermission('Products', 'create')
  const hasUpdatePermission = hasPermission('Products', 'update')
  const hasDeletePermission = hasPermission('Products', 'delete')

  // API calls
  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.isActive && { isActive: filters.isActive }),
  })

  const { data: productsResponse, isLoading: loading, refetch } = useGetApi<any>(
    `${HALAL_PRODUCT_ENDPOINTS.getAll}?${queryParams}`,
    { requireAuth: true, staleTime: 0 }
  )

  const createProductMutation = usePostApi<HalalProductCreateRequest, any>(
    HALAL_PRODUCT_ENDPOINTS.create,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Halal product created successfully!')
        setIsAddModalOpen(false)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to create halal product')
      }
    }
  )

  const updateProductMutation = usePutApi<HalalProductUpdateRequest, any>(
    `${HALAL_PRODUCT_ENDPOINTS.update}/${selectedProduct?.id}`,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Halal product updated successfully!')
        setIsEditModalOpen(false)
        setIsDetailSheetOpen(false)
        setSelectedProduct(null)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to update halal product')
      }
    }
  )

  const deleteProductMutation = useDeleteApi<any>(
    `${HALAL_PRODUCT_ENDPOINTS.delete}/${selectedProduct?.id}`,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Halal product deleted successfully!')
        setIsDeleteModalOpen(false)
        setIsDetailSheetOpen(false)
        setSelectedProduct(null)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to delete halal product')
      }
    }
  )

  // Process products data with useMemo to prevent infinite re-renders
  const processedProducts = useMemo(() => {
    return productsResponse?.data?.data?.map((product: HalalProduct) => ({
      ...product,
      isActive: Boolean(product.isActive),
      imageUrl: product.imageUrl || '',
      name: product.name || '',
      clientName: product.clientName || '',
      status: product.status || 'Active',
      types: product.types || [],
    })) || []
  }, [productsResponse?.data?.data])


  // Update pagination when data changes
  useEffect(() => {
    if (productsResponse?.data?.pagination) {
      const nextTotalPages = Number(productsResponse.data.pagination.totalPages) || 1
      const nextTotalItems = Number(productsResponse.data.pagination.total) || 0
      setPagination(prev => ({ ...prev, totalPages: nextTotalPages, totalItems: nextTotalItems }))
    }
  }, [productsResponse?.data?.pagination])

  // Handle page navigation - reset data when returning to page
  useEffect(() => {
    setSelectedProduct(null)
    refetch()
  }, [location.pathname, refetch])

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    refetch()
  }

  const handleIsActiveFilterChange = (value: string | number) => {
    setFilters(prev => ({ ...prev, isActive: value as string }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    refetch()
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
    refetch()
  }

  const handleAddProduct = () => {
    setIsAddModalOpen(true)
  }

  const handleEditProduct = (product: HalalProduct) => {
    setSelectedProduct(product)
    setIsDetailSheetOpen(false) // Close detail sheet
    setIsEditModalOpen(true)
  }

  const handleDeleteProduct = (product: HalalProduct) => {
    setSelectedProduct(product)
    setIsDetailSheetOpen(false) // Close detail sheet
    setIsDeleteModalOpen(true)
  }

  const handleRowClick = (product: HalalProduct) => {
    setSelectedProduct(product)
    setIsDetailSheetOpen(true)
  }

  const handleSubmitCreate = async (data: HalalProductCreateRequest) => {
    setIsSubmitting(true)
    try {
      await createProductMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitUpdate = async (data: HalalProductUpdateRequest) => {
    setIsSubmitting(true)
    try {
      await updateProductMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProductMutation.mutateAsync()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async (product: HalalProduct, newStatus?: boolean) => {
    try {
      const updateData = {
        isActive: newStatus !== undefined ? newStatus : !product.isActive
      }

      await updateProductMutation.mutateAsync(updateData)

      // Refetch data to update the UI
      refetch()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_CONFIG.baseURL}${HALAL_PRODUCT_ENDPOINTS.exportCsv}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'halal-products.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showToast('success', 'CSV exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      showToast('error', 'Failed to export CSV')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      showToast('error', 'Please select a CSV file')
      return
    }

    setIsImportModalOpen(true)
    await startImport(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCloseImportModal = () => {
    if (importState.status === 'completed' || importState.status === 'failed') {
      refetch()
    }
    setIsImportModalOpen(false)
    resetImport()
  }

  useEffect(() => {
    if (importState.isImporting) {
      setIsImportModalOpen(true)
    }
  }, [importState.isImporting])

  // Check permissions
  const hasReadPermission = hasPermission('Products', 'read')

  if (!hasReadPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 text-lg">You don't have permission to view products</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] p-6'>
        {/* Header */}
        <div className="flex items-center justify-between my-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Halal Products</h1>
            <p className="text-gray-600">Manage halal product information and certifications</p>
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
                placeholder="Search products by name, client, or types..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-[10px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-xs"
              />
            </div>

            {/* Active Status Filter */}
            <CustomDropdown
              options={[
                { value: '', label: 'All Records' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              value={filters.isActive}
              onChange={handleIsActiveFilterChange}
              placeholder="Filter by active status"
              className="w-[150px] text-xs"
            />

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleExport}
                className="px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors"
              >
                Export
              </button>
              {hasCreatePermission && (
                <>
                  <button
                    onClick={handleImportClick}
                    disabled={importState.isImporting}
                    className="flex items-center space-x-2 px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiUpload size={14} />
                    <span>Import CSV</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors"
                  >
                    <span>Add Product</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading || processedProducts.length === 0 ? (
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
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <StyledTable<HalalProduct>
              data={processedProducts}
              columns={[
                {
                  key: 'product',
                  header: 'Product',
                  render: (product: HalalProduct) => (
                    <div className="flex items-center">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={`${product.name} image`}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                          onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none' }}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.clientName}</div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'types',
                  header: 'Types',
                  render: (product: HalalProduct) => (
                    <div className="flex flex-wrap gap-1">
                      {product.types.slice(0, 2).map((type, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {type}
                        </span>
                      ))}
                      {product.types.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{product.types.length - 2} more
                        </span>
                      )}
                    </div>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (product: HalalProduct) => {
                    const getStatusColor = (status: string) => {
                      switch (status?.toLowerCase()) {
                        case 'approved':
                        case 'active':
                          return 'bg-green-100 text-green-800'
                        case 'on hold':
                        case 'pending':
                          return 'bg-yellow-100 text-yellow-800'
                        case 'rejected':
                        case 'inactive':
                          return 'bg-red-100 text-red-800'
                        default:
                          return 'bg-gray-100 text-gray-800'
                      }
                    }

                    return (
                      <div className={`flex items-center justify-center px-2 max-w-32 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        <span>{product.status || 'Unknown'}</span>
                      </div>
                    )
                  }
                },
                {
                  key: 'active',
                  header: 'Active Status',
                  render: (product: HalalProduct) => (
                    <div className={`flex items-center space-x-1 px-2 max-w-20 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isActive ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                      <span>{product.isActive ? 'Active' : 'Inactive'}</span>
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
          title="Add New Halal Product"
          size="xl"
        >
          <div className="h-[70vh] overflow-hidden">
            <HalalProductForm
              onSubmit={(data: HalalProductCreateRequest | HalalProductUpdateRequest) => handleSubmitCreate(data as HalalProductCreateRequest)}
              onCancel={() => setIsAddModalOpen(false)}
              isLoading={isSubmitting}
            />
          </div>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Halal Product"
          size="xl"
        >
          <div className="h-[70vh] overflow-hidden">
            <HalalProductForm
              product={selectedProduct || undefined}
              onSubmit={handleSubmitUpdate}
              onCancel={() => setIsEditModalOpen(false)}
              isLoading={isSubmitting}
            />
          </div>
        </Modal>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
          isLoading={isDeleting}
        />

        {/* Entity Detail Sheet */}
        <EntityDetailSheet
          open={isDetailSheetOpen}
          onClose={() => setIsDetailSheetOpen(false)}
          entity={selectedProduct}
          headerTitle={selectedProduct?.name || 'Product Details'}
          image={selectedProduct?.imageUrl ? { src: selectedProduct.imageUrl, alt: selectedProduct.name } : undefined}
          statusToggle={{
            checked: Boolean(selectedProduct?.isActive),
            onChange: async (checked: boolean) => {
              if (!selectedProduct) return
              await handleToggleStatus(selectedProduct, checked)
            },
            enabled: hasUpdatePermission,
            labelActive: 'Active',
            labelInactive: 'Inactive',
          }}
          statusBadge={selectedProduct ? {
            text: selectedProduct.status || 'Unknown',
            color: (() => {
              const status = selectedProduct.status?.toLowerCase()
              if (status === 'approved' || status === 'active') return 'green'
              if (status === 'on hold' || status === 'pending') return 'yellow'
              if (status === 'rejected' || status === 'inactive') return 'red'
              return 'gray'
            })()
          } : undefined}
          chipSections={selectedProduct ? [
            { title: 'Product Types', items: selectedProduct.types || [], limit: 99 },
          ] : []}
          infoGridTitle="Product Information"
          infoGrid={selectedProduct ? [
            { label: 'Client', value: selectedProduct.clientName || '—', icon: (<FiMapPin className="text-gray-400 mt-1" size={16} />) },
          ] : []}
          footerActions={{
            onEdit: hasUpdatePermission ? (entity: unknown) => handleEditProduct(entity as HalalProduct) : undefined,
            onDelete: hasDeletePermission ? (entity: unknown) => handleDeleteProduct(entity as HalalProduct) : undefined,
            hasUpdatePermission,
            hasDeletePermission,
          }}
        />

        {/* Bulk Import Modal */}
        <BulkImportModal
          isOpen={isImportModalOpen}
          onClose={handleCloseImportModal}
          importState={importState}
          entityType="Products"
        />
      </div>
    </div>
  )
}

export default HalalProducts