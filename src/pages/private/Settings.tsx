import { FiSettings } from 'react-icons/fi'

const Settings = () => {
  return (
    <div className="py-4">
      <div className='bg-white rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-600">Access and manage portal settings</p>
        </div>

        {/* Content Container */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            {/* Settings Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-gray-100 rounded-full">
                <FiSettings size={48} className="text-gray-400" />
              </div>
            </div>
            
            {/* Coming Soon Content */}
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">Settings coming soon</p>
              <p className="text-sm">Portal configuration and management features will be available here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 