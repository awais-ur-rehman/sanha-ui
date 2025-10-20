import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_CONFIG, getAuthHeaders } from '../../config/api'
import { type UseApiOptions } from '../../types'

export const usePutApi = <T, R = any>(
  url: string,
  options: UseApiOptions = {}
) => {
  const queryClient = useQueryClient()
  const { onSuccess, onError, invalidateQueries = [], requireAuth = false } = options

  return useMutation({
    mutationFn: async (data: T): Promise<R> => {
      const headers = requireAuth ? getAuthHeaders() : API_CONFIG.headers

      const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // Try to parse the error response body
        let errorData
        try {
          errorData = await response.json()
        } catch {
          // If parsing fails, use generic error
          errorData = { message: `HTTP error! status: ${response.status}` }
        }

        // Create error object with response data
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`)
          ; (error as any).response = { data: errorData }
        throw error
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate and refetch queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
      onSuccess?.(data)
    },
    onError: (error: Error) => {
      onError?.(error)
    },
  })
} 