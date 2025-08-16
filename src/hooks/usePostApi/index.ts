import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_CONFIG, getAuthHeaders } from '../../config/api'
import { type UseApiOptions } from '../../types'

export const usePostApi = <T, R = any>(
  url: string,
  options: UseApiOptions = {}
) => {
  const queryClient = useQueryClient()
  const { onSuccess, onError, invalidateQueries = [], requireAuth = false } = options

  return useMutation({
    mutationFn: async (data: T): Promise<R> => {
      const headers = requireAuth ? getAuthHeaders() : API_CONFIG.headers

      const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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