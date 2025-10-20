import { FiHome } from 'react-icons/fi'
import { useAuthStore } from '../../store'

const Dashboard = () => {
  const { user } = useAuthStore()

  return (
    <div className="py-4">
        <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the Sanha Admin Portal</p>
        </div>

        {/* Content Container */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            {/* Dashboard Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-gray-100 rounded-full">
                <FiHome size={48} className="text-gray-400" />
              </div>
            </div>
            
            {/* Welcome Content */}
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">Dashboard coming soon</p>
              <p className="text-sm mb-4">Analytics, insights, and overview features will be available here</p>
              <p className="text-sm text-gray-400">
                Hello, {user?.firstName || user?.username || 'Admin'}! Use the sidebar to navigate through different sections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 