import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useGetFaqById, useGetEnquiryById, useGetContactUsById } from './useNotificationApi'

interface UseNotificationPageHandlerProps {
  onNewItem?: (item: any) => void
  itemType: 'faq' | 'enquiry' | 'contact-us'
}

export const useNotificationPageHandler = ({ onNewItem, itemType }: UseNotificationPageHandlerProps) => {
  const location = useLocation()
  const [pendingNotificationId, setPendingNotificationId] = useState<string | number | null>(null)

  // Get the appropriate API hook based on item type
  const getApiHook = () => {
    switch (itemType) {
      case 'faq':
        return useGetFaqById(pendingNotificationId)
      case 'enquiry':
        return useGetEnquiryById(pendingNotificationId)
      case 'contact-us':
        return useGetContactUsById(pendingNotificationId)
      default:
        return null
    }
  }

  const apiResult = getApiHook()

  // Handle navigation from notification
  useEffect(() => {
    const state = location.state as any
    if (state?.fromNotification && state?.notificationId && state?.notificationType === itemType) {
      setPendingNotificationId(state.notificationId)

      // Clear the state to prevent re-processing
      window.history.replaceState({}, document.title, location.pathname)
    }
  }, [location.state, itemType])

  // Handle notification click event (when user is already on the same page)
  useEffect(() => {
    const handleNotificationItemReceived = (event: CustomEvent) => {
      const { type, itemData } = event.detail

      // Check if this notification is for the current page type
      const typeMapping = {
        'user_faq': 'faq',
        'enquiry': 'enquiry',
        'contact_us': 'contact-us'
      }

      if (typeMapping[type as keyof typeof typeMapping] === itemType) {
        // Directly add the item to the list since we already have the data
        if (onNewItem && itemData) {
          onNewItem(itemData)
        }
      }
    }

    window.addEventListener('notificationItemReceived', handleNotificationItemReceived as EventListener)

    return () => {
      window.removeEventListener('notificationItemReceived', handleNotificationItemReceived as EventListener)
    }
  }, [itemType, onNewItem])

  // Handle API result and add new item to list
  useEffect(() => {
    if (apiResult?.data && onNewItem) {
      onNewItem(apiResult.data)
      setPendingNotificationId(null)
    }
  }, [apiResult?.data, onNewItem])

  return {
    isLoading: apiResult?.isLoading || false,
    error: apiResult?.error || null
  }
}
