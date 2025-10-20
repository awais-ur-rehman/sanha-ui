import { useEffect, useCallback } from 'react'
import { API_CONFIG, getAuthHeaders } from '../config/api'

interface UseRealTimeUpdatesProps {
  itemType: 'faq' | 'enquiry' | 'contact-us' | 'reported-products'
  onNewItem: (item: any) => void
  currentPath?: string
}

export const useRealTimeUpdates = ({ itemType, onNewItem, currentPath }: UseRealTimeUpdatesProps) => {
  // Map notification types to API endpoints
  const getApiEndpoint = useCallback((type: string, id: string | number) => {
    const baseUrl = API_CONFIG.baseURL

    switch (type) {
      case 'user_faq':
        return `${baseUrl}/user-faqs/${id}`
      case 'enquiry':
        return `${baseUrl}/enquiries/${id}`
      case 'contact_us':
        return `${baseUrl}/contact-us/${id}`
      case 'report_product':
        return `${baseUrl}/report-products/${id}`
      default:
        return null
    }
  }, [])

  // Map notification types to page types
  const getPageType = useCallback((type: string) => {
    switch (type) {
      case 'user_faq':
        return 'faq'
      case 'enquiry':
        return 'enquiry'
      case 'contact_us':
        return 'contact-us'
      case 'report_product':
        return 'reported-products'
      default:
        return null
    }
  }, [])

  // Fetch item by ID
  const fetchItemById = useCallback(async (type: string, id: string | number) => {
    const endpoint = getApiEndpoint(type, id)

    if (!endpoint) {
      return null
    }

    try {
      const response = await fetch(endpoint, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        return data.data
      }
    } catch (error) {
      console.error(`Failed to fetch ${type} with ID ${id}:`, error)
    }

    return null
  }, [getApiEndpoint])

  useEffect(() => {
    const handleNewNotification = async (event: CustomEvent) => {
      const { type, id } = event.detail

      // Check if this notification is for the current page type
      const pageType = getPageType(type)

      if (pageType !== itemType) {
        return
      }

      // Check if user is on the correct page (optional, for extra safety)
      // Map itemType to actual route paths
      const routeMapping = {
        'faq': 'faqs',
        'enquiry': 'enquiries',
        'contact-us': 'contact-us',
        'reported-products': 'reported-products'
      }
      const expectedRoute = routeMapping[itemType as keyof typeof routeMapping] || itemType

      if (currentPath && !currentPath.includes(expectedRoute)) {
        return
      }

      // Fetch the new item and add it to the list
      const newItem = await fetchItemById(type, id)

      if (newItem) {
        onNewItem(newItem)
      }
    }

    // Listen for new notification events
    window.addEventListener('newNotificationReceived', handleNewNotification as unknown as EventListener)

    return () => {
      window.removeEventListener('newNotificationReceived', handleNewNotification as unknown as EventListener)
    }
  }, [itemType, onNewItem, currentPath, getPageType, fetchItemById])
}
