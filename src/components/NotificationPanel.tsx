import { useEffect } from 'react'
import { FiX, FiBell } from 'react-icons/fi'
import { useWebSocket } from '../hooks'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useWebSocket()

  // Format timestamp to a more readable format
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) {
        return 'Just now'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
      } else if (diffInMinutes < 1440) { // 24 hours
        const hours = Math.floor(diffInMinutes / 60)
        return `${hours}h ago`
      } else if (diffInMinutes < 10080) { // 7 days
        const days = Math.floor(diffInMinutes / 1440)
        return `${days}d ago`
      } else {
        // For older dates, show the actual date
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    } catch (error) {
      return 'Recently'
    }
  }
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
      <div className="relative bg-white right-2 rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 mt-16 mr-4 sm:mt-20 sm:mr-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FiBell className="w-3 h-3 text-gray-600" />
            <h2 className="text-xs font-medium text-gray-900">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">

            {/* Notifications List */}
            {notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="p-2 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-2">
                   
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                  
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <FiBell className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-xs font-medium text-gray-900 mb-1">No notifications yet</h3>
                <p className="text-gray-500 text-xs max-w-xs">
                  You'll receive notifications for new FAQs, enquiries, and contact us submissions here.
                </p>
              </div>
            )}

            {/* Clear All Button */}
            {notifications.length > 0 && (
              <div className="mt-1 pt-1">
                <button
                  onClick={clearAllNotifications}
                  className="w-full py-1 px-2 text-gray-400 flex justify-end items-end hover:text-gray-600 rounded transition-all duration-200 text-xs"
                >
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPanel
