import { FiLock } from 'react-icons/fi'
import MainLayout from '../../layout/MainLayout'

const AccessRestricted = () => {
  return (
    <MainLayout>
      <div className="py-4">
        <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Access Restricted</h1>
            <p className="text-gray-600">You don't have permission to access this page</p>
          </div>

          {/* Content Container */}
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              {/* Lock Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-gray-100 rounded-full">
                  <FiLock size={48} className="text-gray-400" />
                </div>
              </div>
              
              {/* Access Denied Content */}
              <div className="text-gray-500">
                <p className="text-lg font-medium mb-2">Access Denied</p>
                <p className="text-sm w-md">You don't have permission to access this page. Please contact your administrator if you believe this is an error.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default AccessRestricted 