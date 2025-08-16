import { useState, useEffect } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import Modal from '../../components/Modal'
import BookForm from '../../forms/BookForm'
import BookDetailSheet from '../../components/BookDetailSheet'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import type { Book } from '../../types/entities'
import { BOOK_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../../config/api'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi, useDeleteApi } from '../../hooks'
import CustomDropdown from '../../components/CustomDropdown'
import { useToast } from '../../components/CustomToast/ToastContext'

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
    const response = await fetch(`${API_CONFIG.baseURL}${BOOK_ENDPOINTS.update}/${book.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        isActive: !book.isActive,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update book status')
    }

    // Update selected book if it's the same
    if (selectedBook?.id === book.id) {
      setSelectedBook(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
    }
    
    showToast('success', `Book ${!book.isActive ? 'activated' : 'deactivated'} successfully!`)
    
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

  const handleBookFormSubmit = async (formData: any) => {
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
    <div className="py-4">
      <div className='bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-35px)] max-h-[calc(100vh-35px)] overflow-y-auto px-6 py-10'>
{/* Header */}
<div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Books</h1>
        <p className="text-gray-600">View & manage books.</p>
      </div>

      {/* Clean Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search books by title, author, or published by..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            />
          </div>

          {/* Language Filter */}
          <div className="w-48">
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
            />
          </div>

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

          {/* Add Book Button */}
          <button
            onClick={handleAddBook}
            className="flex items-center space-x-2 cursor-pointer px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-900 transition-colors"
          >
            <FiPlus size={16} />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
              className=" p-4 cursor-pointer group"
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
                <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-[#0c684b] transition-colors">
                  {book.title || 'Untitled'}
                </h3>
                <p className="text-sm text-gray-600">
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
        <div className="flex items-center justify-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Book Detail Sheet */}
      <BookDetailSheet
        book={selectedBook}
        open={isOverlayOpen}
        onClose={closeOverlay}
        onEdit={(book) => {
          setIsOverlayOpen(false)
          handleEditBook(book)
        }}
        onDelete={(book) => {
          setIsOverlayOpen(false)
          handleDeleteBook(book)
        }}
        onToggleStatus={handleToggleStatus}
        hasUpdatePermission={hasPermission('books', 'update')}
        hasDeletePermission={hasPermission('books', 'delete')}
      />

      {/* Add/Edit Book Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleBookFormCancel}
          title={selectedBook ? 'Edit Book' : 'Add New Book'}
        >
          <BookForm
            book={selectedBook}
            onSubmit={handleBookFormSubmit}
            onCancel={handleBookFormCancel}
          />
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