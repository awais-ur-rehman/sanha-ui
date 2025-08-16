import { FiHome } from 'react-icons/fi'
import { useAuthStore } from '../../store'
import { testApiConnection, testTokenValidity } from '../../utils/apiTest'

const Dashboard = () => {
  const { user } = useAuthStore()

  const handleTestApi = async () => {
    console.log('🧪 Starting API test...')
    await testApiConnection()
  }

  const handleTestToken = async () => {
    console.log('🔑 Testing token validity...')
    const isValid = await testTokenValidity()
    console.log('Token valid:', isValid)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <FiHome className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Sanha Admin
        </h1>
        
        <p className="text-lg text-gray-600 mb-4">
          Hello, {user?.firstName || user?.username || 'Admin'}!
        </p>
        
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Use the sidebar to navigate through different sections of the admin panel.
        </p>

        {/* Debug Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleTestApi}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test API Connection
          </button>
          <button
            onClick={handleTestToken}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Test Token Validity
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Check browser console for test results
        </p>
      </div>
    </div>
  )
}

export default Dashboard 