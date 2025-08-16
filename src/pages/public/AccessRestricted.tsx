import { FiLock } from 'react-icons/fi'


import MainLayout from '../../layout/MainLayout'

const AccessRestricted = () => {

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Access Restricted</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>

        {/* Access Restricted Content */}
        <div className="flex items-center justify-center min-h-[800px]">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FiLock className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Access Denied
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-md">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
            
            
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default AccessRestricted 