import { FiHome } from 'react-icons/fi'
import { useAuthStore } from '../../store'

const Dashboard = () => {
  const { user } = useAuthStore()

  return (
    <div className="py-4">
        <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[18px] md:text-[20px] lg:text-[20px] xl:text-[22px] font-semibold text-gray-900">Dashboard</h1>
          <p className="text-[12px] md:text-[13px] lg:text-[13px] xl:text-[14px] text-gray-600">Welcome to the Sanha Admin Portal</p>
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
              <p className="text-[14px] md:text-[15px] lg:text-[15px] xl:text-[16px] font-medium mb-2">Dashboard coming soon</p>
              <p className="text-[12px] md:text-[13px] lg:text-[13px] xl:text-[14px] mb-4">Analytics, insights, and overview features will be available here</p>
              <p className="text-[12px] md:text-[13px] lg:text-[13px] xl:text-[14px] text-gray-400">
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