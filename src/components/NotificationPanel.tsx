import { useEffect } from 'react'
import { FiX, FiBell } from 'react-icons/fi'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 "
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-white right-2 rounded-lg shadow-xl border border-gray-200 w-80 max-h-[calc(100vh-2rem)] mt-16 mr-4 sm:mt-20 sm:mr-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiBell className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiBell className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-md font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-500 text-xs max-w-xs">
                You'll receive notifications for new FAQs, enquiries, and contact us submissions here.
              </p>
            </div>

            {/* Future notifications will be rendered here */}
            {/* 
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.priority === 'high' ? 'bg-red-500' : 
                      notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{notification.timestamp}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPanel
