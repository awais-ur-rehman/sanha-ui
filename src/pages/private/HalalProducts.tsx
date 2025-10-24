import { useState } from 'react'
import { usePermissions } from '../../hooks/usePermissions'

const HalalProducts = () => {
  const { hasPermission } = usePermissions()
  
  // Check if user has read permission for Products
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

        {/* Coming Soon Content */}
        <div className="flex flex-col items-center justify-center h-96">
          <svg 
            className="w-16 h-16 text-gray-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-500 text-center max-w-md">
            Halal Products management is coming soon. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  )
}

export default HalalProducts
