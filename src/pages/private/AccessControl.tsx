import { useState, useEffect } from 'react'
import { FiPlus, FiUsers, FiShield, FiPackage, FiEdit, FiTrash2 } from 'react-icons/fi'
import TabNavigation from '../../components/TabNavigation'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import ModuleForm from '../../forms/ModuleForm'
import RoleForm from '../../forms/RoleForm'
import AdminForm from '../../forms/AdminForm'
import { type TabType, type Module, type Role, type Admin, type ModuleCreateRequest, type RoleCreateRequest, type AdminCreateRequest, type AdminUpdateRequest, type PaginatedResponse } from '../../types/rbac'
import { RBAC_ENDPOINTS } from '../../config/api/rbac'
import { API_CONFIG, getAuthHeaders } from '../../config/api'
import { useToast } from '../../components'
import { usePermissions } from '../../hooks/usePermissions'
import { useDeleteApi } from '../../hooks'


const AccessControl = () => {
  const [activeTab, setActiveTab] = useState<TabType>('admins')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Module | Role | Admin | null>(null)
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Module | Role | Admin | null>(null)

  // Data states
  const [admins, setAdmins] = useState<Admin[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { showToast } = useToast()
  const { hasPermission } = usePermissions()

  // Fetch data based on active tab
  const fetchData = async (page: number = 1) => {
    setLoading(true)
    try {
      const endpoint = getEndpointForTab(activeTab)
      const headers = getAuthHeaders()
      const url = new URL(`${API_CONFIG.baseURL}${endpoint}`)
      
      // Add pagination parameters
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', itemsPerPage.toString())
      
      console.log('Fetching data from:', url.toString())
      console.log('Headers:', headers)
      
      const response = await fetch(url.toString(), {
        headers,
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Response data:', result)
      
      if (result.success) {
        const paginatedData = result.data as PaginatedResponse<any>
        setDataForTab(activeTab, paginatedData.data)
        setCurrentPage(paginatedData.meta.page)
        setTotalPages(paginatedData.meta.totalPages)
        setTotalItems(paginatedData.meta.total)
        setItemsPerPage(paginatedData.meta.limit)
      } else {
        throw new Error(result.message || 'Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showToast('error', 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  const getEndpointForTab = (tab: TabType) => {
    switch (tab) {
      case 'admins': return RBAC_ENDPOINTS.admins.getAll
      case 'modules': return RBAC_ENDPOINTS.modules.getAll
      case 'roles': return RBAC_ENDPOINTS.roles.getAll
      default: return RBAC_ENDPOINTS.admins.getAll
    }
  }

  // Delete mutation
  const deleteMutation = useDeleteApi(
    itemToDelete ? `${getEndpointForTab(activeTab)}/${itemToDelete.id}?hardDelete=true` : '',
    {
      requireAuth: true,
      invalidateQueries: [activeTab],
      onSuccess: () => {
        showToast('success', `${activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)} deleted successfully`)
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
        fetchData(currentPage) // Refresh current page
      },
      onError: (error) => {
        console.error('Error deleting item:', error)
        showToast('error', error instanceof Error ? error.message : 'Error deleting item')
      },
    }
  )

  const setDataForTab = (tab: TabType, data: any[]) => {
    switch (tab) {
      case 'admins': 
        setAdmins(data)
        break
      case 'modules': 
        setModules(data)
        break
      case 'roles': 
        setRoles(data)
        break
    }
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'admins': return admins
      case 'modules': return modules
      case 'roles': return roles
      default: return []
    }
  }

  const getColumns = () => {
    switch (activeTab) {
      case 'admins':
        return [
          { 
            key: 'srNo', 
            header: 'Sr.no', 
            width: 'w-16',
            render: (admin: Admin, index?: number) => {
              const baseNumber = ((currentPage - 1) * itemsPerPage) + 1
              return (index ?? 0) + baseNumber
            }
          },
          { key: 'username', header: 'Username' },
          { key: 'email', header: 'Email' },
          { 
            key: 'role', 
            header: 'Role',
            render: (admin: Admin) => admin.role || 'No Role'
          },
          {
            key: 'isActive',
            header: 'Status',
            render: (admin: Admin) => (
              <span className={`px-2 py-1 text-xs rounded-full ${
                admin.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {admin.isActive ? 'Active' : 'Inactive'}
              </span>
            )
          }
        ]
      case 'modules':
        return [
          { 
            key: 'srNo', 
            header: 'Sr.no', 
            width: 'w-16',
            render: (module: Module, index?: number) => {
              const baseNumber = ((currentPage - 1) * itemsPerPage) + 1
              return (index ?? 0) + baseNumber
            }
          },
          { key: 'name', header: 'Name' },
          { key: 'description', header: 'Description' },
          {
            key: 'permissions',
            header: 'Permissions',
            render: (module: Module) => (
              <div className="flex flex-wrap gap-1">
                {module.permissions?.slice(0, 3).map(permission => (
                  <span key={permission} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {permission}
                  </span>
                ))}
                {module.permissions && module.permissions.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{module.permissions.length - 3}
                  </span>
                )}
              </div>
            )
          },
          {
            key: 'isActive',
            header: 'Status',
            render: (module: Module) => (
              <span className={`px-2 py-1 text-xs rounded-full ${
                module.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {module.isActive ? 'Active' : 'Inactive'}
              </span>
            )
          }
        ]
      case 'roles':
        return [
          { 
            key: 'srNo', 
            header: 'Sr.no', 
            width: 'w-16',
            render: (role: Role, index?: number) => {
              const baseNumber = ((currentPage - 1) * itemsPerPage) + 1
              return (index ?? 0) + baseNumber
            }
          },
          { key: 'name', header: 'Name' },
          { key: 'description', header: 'Description' },
          {
            key: 'modulePermissions',
            header: 'Level',
            render: (role: Role) => (
              <div className="flex flex-wrap gap-1">
                {role.modulePermissions?.slice(0, 2).map(mp => (
                  <span key={mp.moduleId} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    {mp.moduleName}
                  </span>
                ))}
                {role.modulePermissions && role.modulePermissions.length > 2 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{role.modulePermissions.length - 2}
                  </span>
                )}
              </div>
            )
          }
        ]
      default:
        return []
    }
  }

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'admins': return 'Add Admin'
      case 'modules': return 'Add Module'
      case 'roles': return 'Add Role'
      default: return 'Add'
    }
  }

  const getAddButtonIcon = () => {
    switch (activeTab) {
      case 'admins': return <FiUsers className="w-4 h-4" />
      case 'modules': return <FiPackage className="w-4 h-4" />
      case 'roles': return <FiShield className="w-4 h-4" />
      default: return <FiPlus className="w-4 h-4" />
    }
  }

  const handleAddClick = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleRowSelect = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const currentData = getCurrentData()
    if (selectedRows.length === currentData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(currentData.map(item => item.id || 0))
    }
  }

  const handleFormSubmit = async (data: ModuleCreateRequest | RoleCreateRequest | AdminCreateRequest | AdminUpdateRequest) => {
    setFormLoading(true)
    try {
      const method = editingItem ? 'PUT' : 'POST'
      let url: string

      if (editingItem) {
        // Update operation
        const endpoint = getEndpointForTab(activeTab)
        url = `${API_CONFIG.baseURL}${endpoint}/${editingItem.id}`
      } else {
        // Create operation - use the correct create endpoint
        switch (activeTab) {
          case 'admins':
            url = `${API_CONFIG.baseURL}${RBAC_ENDPOINTS.admins.create}`
            break
          case 'modules':
            url = `${API_CONFIG.baseURL}${RBAC_ENDPOINTS.modules.create}`
            break
          case 'roles':
            url = `${API_CONFIG.baseURL}${RBAC_ENDPOINTS.roles.create}`
            break
          default:
            url = `${API_CONFIG.baseURL}${getEndpointForTab(activeTab)}`
        }
      }

      // For admin updates, only include password if it's provided
      let requestData = data
      if (activeTab === 'admins' && editingItem) {
        if ((data as any).password === '') {
          const { password, ...dataWithoutPassword } = data as any
          requestData = dataWithoutPassword
        }
        // If password is provided, keep it in the request
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        showToast(
          'success',
          `${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'created'} successfully`
        )
        setIsModalOpen(false)
        setEditingItem(null)
        fetchData(currentPage) // Refresh current page
      }
    } catch (error) {
      console.error('Error saving data:', error)
      showToast('error', 'Error saving data')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormCancel = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  // Action handlers
  const handleEdit = (item: Module | Role | Admin) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = (item: Module | Role | Admin) => {
    setItemToDelete(item)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteMutation.mutate()
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setItemToDelete(null)
  }

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchData(page)
  }

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when tab changes
    fetchData(1)
  }, [activeTab])

  const filteredData = getCurrentData().filter(item => {
    const searchLower = searchTerm.toLowerCase()
    if ('name' in item) return (item as any).name.toLowerCase().includes(searchLower)
    if ('username' in item) return (item as any).username.toLowerCase().includes(searchLower)
    if ('email' in item) return (item as any).email.toLowerCase().includes(searchLower)
    return false
  })

  return (
    <div className="py-3 lg:py-4">
      <div className='bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-35px)] p-4 lg:p-6 space-y-4 lg:space-y-6'>
       {/* Page Header */}
 <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Roles and Permissions</h1>
        <p className="text-sm lg:text-base text-gray-600">View & manage permissions and roles.</p>
      </div>

      {/* Tab Navigation */}
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        showAdmins={hasPermission('Access Control', 'read')}
        showModules={hasPermission('Access Control', 'read')}
        showRoles={hasPermission('Access Control', 'read')}
      />

      {/* Data Table */}
      <DataTable<any>
        data={filteredData}
        columns={getColumns()}
        loading={loading}
        selectedRows={selectedRows}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={handleAddClick}
        addButtonText={getAddButtonText()}
        addButtonIcon={getAddButtonIcon()}
        actions={[
          {
            label: 'Edit',
            icon: <FiEdit className="w-4 h-4" />,
            onClick: handleEdit,
            variant: 'primary'
          },
          {
            label: 'Delete',
            icon: <FiTrash2 className="w-4 h-4" />,
            onClick: handleDelete,
            variant: 'danger'
          }
        ]}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: handlePageChange
        }}
      />

      {/* Modal for Forms */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={`${editingItem ? 'Edit' : 'Add'} ${activeTab.slice(0, -1)}`}
        size="lg"
      >
        {activeTab === 'modules' && (
          <ModuleForm
            module={editingItem as Module}
            onSubmit={handleFormSubmit as (data: ModuleCreateRequest) => void}
            onCancel={handleFormCancel}
            loading={formLoading}
          />
        )}
        
        {activeTab === 'roles' && (
          <RoleForm
            role={editingItem as Role}
            modules={modules}
            onSubmit={handleFormSubmit as (data: RoleCreateRequest) => void}
            onCancel={handleFormCancel}
            loading={formLoading}
          />
        )}
        
        {activeTab === 'admins' && (
          <AdminForm
            admin={editingItem as Admin}
            onSubmit={handleFormSubmit as (data: AdminCreateRequest | AdminUpdateRequest) => void}
            onCancel={handleFormCancel}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Delete ${activeTab.slice(0, -1)}`}
        message={`Are you sure you want to delete this ${activeTab.slice(0, -1)}? This action cannot be undone.`}

        isLoading={deleteMutation.isPending}
      />
      </div>
     
    </div>
  )
}

export default AccessControl 