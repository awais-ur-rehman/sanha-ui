import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { useNotificationContext } from '../context/NotificationContext'
import { API_CONFIG, getAuthHeaders } from '../config/api'

export const useNotificationHandler = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { markNotificationAsRead } = useNotificationContext()

  const handleNotificationClick = async (notification: any) => {
    // Mark notification as read
    markNotificationAsRead(notification.id)

    // Determine target route based on notification type
    let targetRoute = ''
    switch (notification.type) {
      case 'user_faq':
        targetRoute = ROUTES.FAQS
        break
      case 'enquiry':
        targetRoute = ROUTES.ENQUIRIES
        break
      case 'contact_us':
        targetRoute = ROUTES.CONTACT_US
        break
      default:
        return
    }

    // Check if user is already on the target page
    if (location.pathname === targetRoute) {
      // User is on the same page - fetch the specific item and dispatch event
      try {
        let itemData = null

        // Fetch the specific item based on type
        if (notification.type === 'user_faq') {
          const response = await fetch(`${API_CONFIG.baseURL}/faqs/${notification.id}`, {
            headers: getAuthHeaders()
          })
          if (response.ok) {
            const data = await response.json()
            itemData = data.data
          }
        } else if (notification.type === 'enquiry') {
          const response = await fetch(`${API_CONFIG.baseURL}/enquiries/${notification.id}`, {
            headers: getAuthHeaders()
          })
          if (response.ok) {
            const data = await response.json()
            itemData = data.data
          }
        } else if (notification.type === 'contact_us') {
          const response = await fetch(`${API_CONFIG.baseURL}/contact-us/${notification.id}`, {
            headers: getAuthHeaders()
          })
          if (response.ok) {
            const data = await response.json()
            itemData = data.data
          }
        }

        // Dispatch event with the fetched item data
        if (itemData) {
          window.dispatchEvent(new CustomEvent('notificationItemReceived', {
            detail: {
              type: notification.type,
              id: notification.id,
              route: targetRoute,
              itemData: itemData
            }
          }))
        }
      } catch (error) {
        console.error('Failed to fetch notification item:', error)
      }
    } else {
      // User is on a different page - navigate to target page
      // Pass the notification ID as state so the page can handle it
      navigate(targetRoute, {
        state: {
          notificationId: notification.id,
          notificationType: notification.type,
          fromNotification: true
        }
      })
    }
  }

  return { handleNotificationClick }
}
