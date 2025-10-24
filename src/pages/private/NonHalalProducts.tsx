import { useState, useEffect } from 'react'
import { FiSearch, FiCheckCircle, FiXCircle, FiMapPin } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, usePostApi, usePutApi, useDeleteApi } from '../../hooks'
import { useToast } from '../../components/CustomToast/ToastContext'
import { NON_HALAL_PRODUCT_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../../config/api'
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '../../types/entities'
import Modal from '../../components/Modal'
import NonHalalProductForm from '../../forms/NonHalalProductForm'
import EntityDetailSheet from '../../components/EntityDetailSheet'
import CustomDropdown from '../../components/CustomDropdown'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import { Pagination } from '../../components'
import StyledTable from '../../components/StyledTable'

const NonHalalProducts = () => {
  // Hooks
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  
  // Check if user has read permission for Products
  const hasReadPermission = hasPermission('Products', 'read')
  const hasCreatePermission = hasPermission('Products', 'create')
  const hasUpdatePermission = hasPermission('Products', 'update')
  const hasDeletePermission = hasPermission('Products', 'delete')
  
  // State management
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
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
  const [isDeleting, setIsDeleting] = useState(false)

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.status && { status: filters.status }),
    ...(filters.isActive && { isActive: filters.isActive }),
  })

  // API hooks
  const { data: productsResponse, isLoading: loading, refetch } = useGetApi<any>(
    `${NON_HALAL_PRODUCT_ENDPOINTS.getAll}?${queryParams}`,
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
    `${NON_HALAL_PRODUCT_ENDPOINTS.exportCsv}?${exportQueryParams.toString()}`,
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
      a.download = `non-halal-products-${new Date().toISOString().slice(0,10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {}
  }

  const createProductMutation = usePostApi<ProductCreateRequest, any>(
    NON_HALAL_PRODUCT_ENDPOINTS.create,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Non-Halal product created successfully!')
        setIsAddModalOpen(false)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to create product')
      },
    }
  )

  const updateProductMutation = usePutApi<ProductUpdateRequest, any>(
    `${NON_HALAL_PRODUCT_ENDPOINTS.update}/${selectedProduct?.id}`,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Non-Halal product updated successfully!')
        setIsEditModalOpen(false)
        setIsOverlayOpen(false)
        setSelectedProduct(null)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to update product')
      },
    }
  )

  const deleteProductMutation = useDeleteApi(
    `${NON_HALAL_PRODUCT_ENDPOINTS.delete}/${selectedProduct?.id}?hardDelete=true`,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Non-Halal product deleted successfully!')
        setIsDeleteModalOpen(false)
        setIsOverlayOpen(false)
        setSelectedProduct(null)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to delete product')
      },
    }
  )

  // Process products data
  const products = productsResponse?.data?.data?.map((product: Product) => ({
    ...product,
    isActive: Boolean(product.isActive), // Convert 0/1 to boolean
    image: product.image || '',
    name: product.name || '',
    manufacturer: product.manufacturer || '',
    status: product.status || 'Non-Halal', // Non-Halal products always have this status
    madeIn: product.madeIn || '',
    contains: product.contains || [],
    evidences: product.evidences || [],
  })) || []

  // Update pagination when data changes
  useEffect(() => {
    if (productsResponse?.data?.pagination) {
      setPagination(prev => ({
        ...prev,
        totalPages: Number(productsResponse.data.pagination.totalPages) || 1,
        totalItems: Number(productsResponse.data.pagination.total) || 0,
      }))
    }
  }, [productsResponse])

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term)
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

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product)
    setIsOverlayOpen(true)
  }

  const handleAddProduct = () => {
    setIsAddModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const handleToggleStatus = async (product: Product, newStatus?: boolean) => {
    try {
      // Use provided newStatus or current product status
      const statusToSet = newStatus !== undefined ? newStatus : product.isActive
      
      const payload = {
        isActive: statusToSet,
      }
      
      console.log('Sending payload:', payload)

      // Use direct fetch to ensure we send to the correct endpoint with product ID
      const response = await fetch(`${API_CONFIG.baseURL}${NON_HALAL_PRODUCT_ENDPOINTS.update}/${product.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update product status')
      }

      showToast('success', `Non-Halal product ${!product.isActive ? 'activated' : 'deactivated'} successfully!`)
      refetch() // Refresh the product list
    } catch (error) {
      console.error('Error updating product status:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to update product status')
    }
  }

  const handleSubmitCreate = async (data: ProductCreateRequest) => {
    setIsSubmitting(true)
    try {
      await createProductMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitUpdate = async (data: ProductUpdateRequest) => {
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

  const closeOverlay = () => {
    // Delay the state change to allow the exit animation to complete
    setTimeout(() => {
      setIsOverlayOpen(false)
      setSelectedProduct(null)
    }, 300) // Match the animation duration
  }

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
            <h1 className="text-2xl font-semibold text-gray-900">Non-Halal Products</h1>
            <p className="text-gray-600">Manage non-halal product information and certifications</p>
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
                placeholder="Search products by name, manufacturer, or madeIn..."
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
                <button
                  onClick={handleAddProduct}
                  className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors"
                >
                  <span>Add Product</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading || products.length === 0 ? (
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
            <StyledTable<Product>
              data={products}
              columns={[
                {
                  key: 'product',
                  header: 'Product',
                  render: (product: Product) => (
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={`${product.name} image`}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                          onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none' }}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.contains.length > 0 && (
                          <div className="text-sm text-gray-500">{product.contains[0]}</div>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'manufacturer',
                  header: 'Manufacturer',
                  render: (product: Product) => (
                    <div className="text-sm text-gray-900">{product.manufacturer}</div>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: () => (
                    <div className="flex items-center justify-center px-2 max-w-20 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <span>Non-Halal</span>
                    </div>
                  )
                },
                {
                  key: 'active',
                  header: 'Active Status',
                  render: (product: Product) => (
                    <div className={`flex items-center space-x-1 px-2 max-w-20 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isActive ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                      <span>{product.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  )
                },
                {
                  key: 'madeIn',
                  header: 'Made In',
                  render: (product: Product) => (
                    <div className="text-sm text-gray-900">{product.madeIn}</div>
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
          title="Add New Non-Halal Product"
          size="xl"
        >
          <div className="h-[70vh] overflow-hidden">
            <NonHalalProductForm
              onSubmit={(data: ProductCreateRequest | ProductUpdateRequest) => handleSubmitCreate(data as ProductCreateRequest)}
              onCancel={() => setIsAddModalOpen(false)}
              isLoading={isSubmitting}
            />
          </div>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Non-Halal Product"
          size="xl"
        >
          <div className="h-[70vh] overflow-hidden">
            <NonHalalProductForm
              product={selectedProduct || undefined}
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
            title="Delete Non-Halal Product"
            message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
            isLoading={isDeleting}
          />
        )}

        {/* Product Detail Sheet (Unified) */}
        <EntityDetailSheet<Product>
          entity={selectedProduct}
          open={isOverlayOpen}
          onClose={closeOverlay}
          title={`Non-Halal Product Details - ${selectedProduct?.name || ''}`}
          headerTitle={selectedProduct?.name || ''}
          image={{ src: selectedProduct?.image, alt: `${selectedProduct?.name || ''} image` }}
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
            text: 'Non-Halal',
            color: 'red'
          } : undefined}
          chipSections={selectedProduct ? [
            { title: 'Contains/Ingredients', items: selectedProduct.contains || [], limit: 99 },
          ] : []}
          evidenceSection={selectedProduct?.evidences && selectedProduct.evidences.length > 0 ? {
            title: 'Evidence',
            evidences: selectedProduct.evidences
          } : undefined}
          infoGridTitle="Product Information"
          infoGrid={selectedProduct ? [
            { label: 'Manufacturer', value: selectedProduct.manufacturer || '—', icon: (<FiMapPin className="text-gray-400 mt-1" size={16} />) },
            { label: 'Country of Origin', value: selectedProduct.madeIn || '—', icon: (<FiMapPin className="text-gray-400 mt-1" size={16} />) },
          ] : []}
          footerActions={{
            onEdit: (product) => {
              setIsOverlayOpen(false)
              handleEditProduct(product)
            },
            onDelete: (product) => {
              setIsOverlayOpen(false)
              handleDeleteProduct(product)
            },
            hasUpdatePermission,
            hasDeletePermission,
          }}
        />
      </div>
    </div>
  )
}

export default NonHalalProducts
