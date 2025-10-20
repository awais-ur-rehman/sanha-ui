import { useQuery } from '@tanstack/react-query'
import { API_CONFIG, getAuthHeaders } from '../../config/api'
import { type UseApiOptions } from '../../types'

export const useGetApi = <T>(
    url: string,
    options: UseApiOptions = {}
) => {
    const {
        enabled = true,
        refetchOnWindowFocus = false,
        staleTime = 5 * 60 * 1000, // 5 minutes
        cacheTime = 10 * 60 * 1000, // 10 minutes
        requireAuth = false,
        responseType = 'json',
    } = options

    return useQuery({
        queryKey: [url],
        queryFn: async (): Promise<T> => {
            const headersBase = requireAuth ? getAuthHeaders() : API_CONFIG.headers
            const headers = responseType === 'blob' ? { ...headersBase, Accept: 'text/csv' } : headersBase

            const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
                method: 'GET',
                headers,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            if (responseType === 'blob') {
                // @ts-ignore - cast for blob
                return (await response.blob()) as T
            }
            return response.json()
        },
        enabled,
        refetchOnWindowFocus,
        staleTime,
        gcTime: cacheTime, // React Query v5 uses gcTime instead of cacheTime
    })
} 