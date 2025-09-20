import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import Modal from '../../components/Modal'
import BookForm from '../../forms/BookForm'
import EntityDetailSheet from '../../components/EntityDetailSheet'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import type { Book } from '../../types/entities'
import { BOOK_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../../config/api'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, useDeleteApi } from '../../hooks'
import CustomDropdown from '../../components/CustomDropdown'
import { useToast } from '../../components/CustomToast/ToastContext'
import { Pagination } from '../../components'

const Books = () => {
  // Hooks
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  
  // State management
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    contentLanguage: '',
    isActive: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  })
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(filters.contentLanguage && { contentLanguage: filters.contentLanguage }),
    ...(filters.isActive && { isActive: filters.isActive }),
  })

  // API hooks
  const { data: booksResponse, isLoading: loading, refetch } = useGetApi<any>(
    `${BOOK_ENDPOINTS.getAll}?${queryParams}`,
    {
      requireAuth: true,
      staleTime: 0, // Always fetch fresh data
    }
  )

  // Delete book mutation
  const deleteBookMutation = useDeleteApi(
    bookToDelete ? `${BOOK_ENDPOINTS.delete}/${bookToDelete.id}?hardDelete=true` : '',
    {
      requireAuth: true,
      invalidateQueries: ['books'],
      onSuccess: () => {
        showToast('success', 'Book deleted successfully!')
        setIsDeleteModalOpen(false)
        setBookToDelete(null)
        
        if (selectedBook?.id === bookToDelete?.id) {
          setIsOverlayOpen(false)
          setSelectedBook(null)
        }
        
        refetch()
      },
      onError: (error) => {
        console.error('Error deleting book:', error)
        showToast('error', error instanceof Error ? error.message : 'Failed to delete book')
      },
    }
  )



  // Process books data
  const books = booksResponse?.data?.data?.map((book: Book) => ({
    ...book,
    isActive: book.isActive ?? true,
    imageUrl: book.imageUrl || '',
    title: book.title || '',
    author: book.author || '',
    description: book.description || '',
    publishedBy: book.publishedBy || '',
    contentLanguage: book.contentLanguage || '',
    url: book.url || '',
  })) || []

  // Update pagination when data changes
  useEffect(() => {
    if (booksResponse?.data?.pagination) {
      setPagination(prev => ({
        ...prev,
        totalPages: booksResponse.data.pagination.totalPages,
        totalItems: booksResponse.data.pagination.totalItems,
      }))
    }
  }, [booksResponse])

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

  const handleViewBook = (book: Book) => {
    setSelectedBook(book)
    setIsOverlayOpen(true)
  }

  const handleEditBook = (book: Book) => {
    setSelectedBook(book)
    setIsAddModalOpen(true)
  }

  const handleToggleStatus = async (book: Book) => {
    // Toggle the isActive status
    const newStatus = !book.isActive
    
    const response = await fetch(`${API_CONFIG.baseURL}${BOOK_ENDPOINTS.update}/${book.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        isActive: newStatus,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update book status')
    }

    // Update selected book if it's the same
    if (selectedBook?.id === book.id) {
      setSelectedBook(prev => prev ? { ...prev, isActive: newStatus } : null)
    }
    
    showToast('success', `Book ${newStatus ? 'activated' : 'deactivated'} successfully!`)
    
    // Refetch books to update the list
    refetch()
  }

  const handleDeleteBook = (book: Book) => {
    setBookToDelete(book)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDeleteBook = () => {
    deleteBookMutation.mutate()
  }

  const handleCancelDeleteBook = () => {
    setIsDeleteModalOpen(false)
    setBookToDelete(null)
  }

  const handleAddBook = () => {
    setSelectedBook(null)
    setIsAddModalOpen(true)
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBookFormSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const isEditing = !!selectedBook
      const url = isEditing 
        ? `${API_CONFIG.baseURL}${BOOK_ENDPOINTS.update}/${selectedBook.id}`
        : `${API_CONFIG.baseURL}${BOOK_ENDPOINTS.create}`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} book`)
      }

      const result = await response.json()
      console.log(`Book ${isEditing ? 'updated' : 'created'} successfully:`, result)
      
      // Show success toast
      showToast('success', `Book ${isEditing ? 'updated' : 'created'} successfully!`)
      
      // Close modal and refetch books
      setIsAddModalOpen(false)
      refetch()
    } catch (error) {
      console.error('Error saving book:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to save book')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBookFormCancel = () => {
    setIsAddModalOpen(false)
  }

  const closeOverlay = () => {
    // Delay the state change to allow the exit animation to complete
    setTimeout(() => {
      setIsOverlayOpen(false)
      setSelectedBook(null)
    }, 300) // Match the animation duration
  }

  // Loading shimmer component for book cards
  const BookCardShimmer = () => (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="animate-pulse">
        <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
        <div className="bg-gray-200 h-4 rounded mb-2"></div>
        <div className="bg-gray-200 h-3 rounded mb-2 w-3/4"></div>
        <div className="bg-gray-200 h-3 rounded w-1/2"></div>
      </div>
    </div>
  )

  return (
    <div className="py-3 lg:py-4">
      <div className='bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-35px)] max-h-[calc(100vh-35px)] overflow-y-auto px-4 lg:px-6 py-6 lg:py-10'>
      {/* Header */}
<div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Books</h1>
        <p className="text-sm lg:text-base text-gray-600">View & manage books.</p>
      </div>

      {/* Clean Filters */}
      <div className='py-6'>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-72">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search books by title, author, or published by..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-[10px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-xs"
            />
          </div>

          {/* Language Filter */}
          <CustomDropdown
            placeholder="All Languages"
            value={filters.contentLanguage}
            onChange={(value) => handleFilterChange('contentLanguage', value as string)}
            options={[
              { value: '', label: 'All Languages' },
              { value: 'English', label: 'English' },
              { value: 'Urdu', label: 'Urdu' },
              { value: 'Arabic', label: 'Arabic' },
            ]}
            className="w-[150px] text-xs"
          />

          {/* Status Filter */}
          <CustomDropdown
            placeholder="All Status"
            value={filters.isActive}
            onChange={(value) => handleFilterChange('isActive', value as string)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            className="w-[150px] text-xs"
          />

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { /* TODO: implement export */ }}
              className="px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors"
            >
              Export
            </button>
            {hasPermission('Books', 'create') && (
              <button
                onClick={handleAddBook}
                className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors"
              >
                <span>Add Book</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
        {loading ? (
          // Loading shimmer cards
          Array.from({ length: 12 }).map((_, index) => (
            <BookCardShimmer key={index} />
          ))
        ) : books.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No books found</p>
          </div>
        ) : (
          books.map((book: Book) => (
            <div
              key={book.id}
              onClick={() => handleViewBook(book)}
              className="p-3 lg:p-4 cursor-pointer group"
            >
              {/* Book Image with Language Chip */}
              <div className="relative mb-3">
                <img
                  src={book.imageUrl || '/placeholder-book.jpg'}
                  alt={book.title}
                  className="w-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-book.jpg'
                  }}
                />
                {/* Language Chip */}
                <div className="absolute top-2 right-2">
                  <span className="bg-black/20 border border-white/20 backdrop-blur-sm shadow-lg text-white text-xs px-2 py-1 rounded-[8px]">
                    {book.contentLanguage || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Book Info */}
              <div className="space-y-1">
                <h3 className="font-medium text-sm lg:text-base text-gray-900 line-clamp-2 group-hover:text-[#0c684b] transition-colors">
                  {book.title || 'Untitled'}
                </h3>
                <p className="text-xs lg:text-sm text-gray-600">
                  {book.author || 'Unknown Author'}
                </p>
                <p className="text-xs text-gray-500">
                  {book.publishedBy || 'Unknown Publisher'}
                </p>
              </div>
            </div>
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

      {/* Book Detail Sheet */}
      <EntityDetailSheet
        entity={selectedBook}
        open={isOverlayOpen}
        onClose={closeOverlay}
        onEdit={(book) => {
          setIsOverlayOpen(false)
          handleEditBook(book as Book)
        }}
        onDelete={(book) => {
          setIsOverlayOpen(false)
          handleDeleteBook(book as Book)
        }}
        hasUpdatePermission={hasPermission('Books', 'update')}
        hasDeletePermission={hasPermission('Books', 'delete')}
        titleAccessor={(book: Book) => book.title}
        imageAccessor={(book: Book) => book.imageUrl}
        statusToggle={{
          checked: Boolean(selectedBook?.isActive),
          onChange: async (checked: boolean) => {
            if (!selectedBook) return
            await handleToggleStatus({ ...selectedBook, isActive: checked })
          },
          enabled: hasPermission('Books', 'update'),
          labelActive: 'Active',
          labelInactive: 'Inactive',
        }}
        sections={[
          {
            title: 'Book Information',
            items: [
              { label: 'Author', value: selectedBook?.author || 'N/A' },
              { label: 'Published By', value: selectedBook?.publishedBy || 'N/A' },
              { label: 'Content Language', value: selectedBook?.contentLanguage || 'N/A' },
            ]
          },
          {
            title: 'Description',
            items: [
              { label: 'Description', value: selectedBook?.description || 'N/A' },
            ]
          },
        ]}
        linkSection={selectedBook?.url ? {
          title: 'PDF Link',
          links: [{
            url: selectedBook.url,
            typeTag: 'PDF'
          }],
          maxHeightClass: 'max-h-[60px] min-h-[40px]'
        } : undefined}
      />

      {/* Add/Edit Book Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleBookFormCancel}
          title={selectedBook ? 'Edit Book' : 'Add New Book'}
          size="xl"
        >
          <div className="h-[70vh] overflow-hidden">
            <BookForm
              book={selectedBook}
              onSubmit={handleBookFormSubmit}
              onCancel={handleBookFormCancel}
              loading={isSubmitting}
            />
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDeleteBook}
        onConfirm={handleConfirmDeleteBook}
        title="Delete Book"
        message="Are you sure you want to delete this book? This action cannot be undone."

        isLoading={deleteBookMutation.isPending}
      />
      </div>
      
    </div>
  )
}

export default Books 