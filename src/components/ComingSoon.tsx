import { FiClock } from 'react-icons/fi'

interface ComingSoonProps {
  title: string
  description?: string
}

const ComingSoon = ({ title, description = 'This feature is coming soon. Stay tuned!' }: ComingSoonProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <FiClock className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          {description}
        </p>
      </div>
    </div>
  )
}

export default ComingSoon 