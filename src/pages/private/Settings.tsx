import { useState } from 'react'
import { FiSearch, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, useDeleteApi } from '../../hooks'
import { useToast } from '../../components/CustomToast/ToastContext'
import { CERTIFICATION_STANDARD_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../../config/api'
import type { CertificationStandard } from '../../types/entities'
import Modal from '../../components/Modal'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import CertificationStandardForm from '../../forms/CertificationStandardForm'
import StyledTable from '../../components/StyledTable'

const Settings = () => {
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  
  const [selectedStandard, setSelectedStandard] = useState<CertificationStandard | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const { data: standardsResponse, isLoading: loading, refetch } = useGetApi<any>(
    CERTIFICATION_STANDARD_ENDPOINTS.getAll,
    {
      requireAuth: true,
      staleTime: 0,
    }
  )

  const deleteStandardMutation = useDeleteApi(
    `${CERTIFICATION_STANDARD_ENDPOINTS.delete}/${selectedStandard?.id}`,
    {
      requireAuth: true,
      onSuccess: () => {
        showToast('success', 'Certification standard deleted successfully!')
        setIsDeleteModalOpen(false)
        setSelectedStandard(null)
        refetch()
      },
      onError: (error) => {
        showToast('error', error.message || 'Failed to delete certification standard')
      },
    }
  )

  const standards = standardsResponse?.data || []

  const filteredStandards = standards.filter((standard: CertificationStandard) =>
    standard.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteStandard = (standard: CertificationStandard) => {
    setSelectedStandard(standard)
    setIsDeleteModalOpen(true)
  }

  const handleAddStandard = () => {
    setSelectedStandard(null)
    setIsAddModalOpen(true)
  }

  const handleEditStandard = (standard: CertificationStandard) => {
    setSelectedStandard(standard)
    setIsEditModalOpen(true)
  }

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const isEditing = !!selectedStandard
      const url = isEditing 
        ? `${API_CONFIG.baseURL}${CERTIFICATION_STANDARD_ENDPOINTS.update}/${selectedStandard.id}`
        : `${API_CONFIG.baseURL}${CERTIFICATION_STANDARD_ENDPOINTS.create}`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} certification standard`)
      }

      showToast('success', `Certification standard ${isEditing ? 'updated' : 'created'} successfully!`)
      
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedStandard(null)
      refetch()
    } catch (error) {
      console.error('Error saving certification standard:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to save certification standard')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormCancel = () => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedStandard(null)
  }

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage certification standards and portal configuration</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Certification Standards</h2>
          
          <div className='py-6'>
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search certification standards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-[10px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-xs"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                {hasPermission('Settings', 'create') && (
                  <button
                    onClick={handleAddStandard}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlus size={16} />
                    <span>Add Standard</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-3xl">
            {loading || filteredStandards.length === 0 ? (
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
                  <div className="p-12 text-center text-gray-500">
                    {searchTerm ? 'No certification standards found matching your search' : 'No certification standards yet. Add your first one!'}
                  </div>
                )}
              </div>
            ) : (
              <StyledTable<CertificationStandard>
                data={filteredStandards}
                columns={[
                  { 
                    key: 'name', 
                    header: 'Certification Standard Name', 
                    render: (s: CertificationStandard) => (
                      <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    ) 
                  },
                  { 
                    key: 'createdAt', 
                    header: 'Created At', 
                    render: (s: CertificationStandard) => (
                      <span className="text-sm text-gray-600">
                        {new Date(s.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    ) 
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (s: CertificationStandard) => (
                      <div className="flex items-center gap-2">
                        {hasPermission('Settings', 'update') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditStandard(s)
                            }}
                            className="p-2 text-[#0c684b] hover:bg-green-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        )}
                        {hasPermission('Settings', 'delete') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteStandard(s)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    )
                  }
                ]}
              />
            )}
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => deleteStandardMutation.mutate()}
          title="Delete Certification Standard"
          message={`Are you sure you want to permanently delete the certification standard "${selectedStandard?.name}"?`}
          isLoading={deleteStandardMutation.isPending}
        />

        {isAddModalOpen && (
          <Modal
            isOpen={isAddModalOpen}
            onClose={handleFormCancel}
            title="Add New Certification Standard"
            size="md"
          >
            <div className="h-[40vh] overflow-hidden">
              <CertificationStandardForm
                standard={null}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isSubmitting}
              />
            </div>
          </Modal>
        )}

        {isEditModalOpen && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={handleFormCancel}
            title="Edit Certification Standard"
            size="md"
          >
            <div className="h-[40vh] overflow-hidden">
              <CertificationStandardForm
                standard={selectedStandard}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isSubmitting}
              />
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

export default Settings
