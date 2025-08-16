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
    } = options

    return useQuery({
        queryKey: [url],
        queryFn: async (): Promise<T> => {
            const headers = requireAuth ? getAuthHeaders() : API_CONFIG.headers

            const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
                method: 'GET',
                headers,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return response.json()
        },
        enabled,
        refetchOnWindowFocus,
        staleTime,
        gcTime: cacheTime, // React Query v5 uses gcTime instead of cacheTime
    })
} 