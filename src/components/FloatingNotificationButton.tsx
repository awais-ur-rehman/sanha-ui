import { useState } from 'react'
import { FiBell } from 'react-icons/fi'
import NotificationPanel from './NotificationPanel'
import { useWebSocket } from '../hooks'

const FloatingNotificationButton = () => {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const { isConnected, connectionStatus, getUnreadCount } = useWebSocket()

  const handleNotificationClick = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen)
  }

  const unreadCount = getUnreadCount()

  return (
    <>
      {/* Floating Notification Button */}
      <button
        onClick={handleNotificationClick}
        className="fixed top-8 right-8 z-50 w-10 h-10 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer"
        style={{ backgroundColor: '#1f222a' }}
      >
        <FiBell className="w-5 h-5 text-white group-hover:text-gray-100 transition-colors duration-200 mx-auto" />
        
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
      </button>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  )
}

export default FloatingNotificationButton
