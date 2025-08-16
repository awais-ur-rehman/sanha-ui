import { useGetApi } from '../useGetApi'
import { CLIENT_ENDPOINTS } from '../../config/api'
import type { ClientName } from '../../types/entities'

export const useClientNamesApi = (
  options: {
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    staleTime?: number
    cacheTime?: number
    requireAuth?: boolean
  } = {}
) => {
  return useGetApi<{
    success: boolean
    message: string
    data: ClientName[]
    timestamp: string
  }>(CLIENT_ENDPOINTS.getNames, {
    requireAuth: true,
    ...options,
  })
}
