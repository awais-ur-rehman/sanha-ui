import { createContext, useContext, type ReactNode } from 'react'
import { useWebSocket } from '../hooks'

interface NotificationContextType {
  notifications: any[]
  isConnected: boolean
  connectionStatus: string
  markNotificationAsRead: (id: string | number) => void
  clearAllNotifications: () => void
  getUnreadCount: () => number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const webSocketData = useWebSocket()

  return (
    <NotificationContext.Provider value={webSocketData}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
