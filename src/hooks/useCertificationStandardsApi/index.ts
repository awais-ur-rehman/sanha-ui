import { useGetApi } from '../useGetApi'
import { CERTIFICATION_STANDARD_ENDPOINTS } from '../../config/api'
import type { CertificationStandard } from '../../types/entities'

export const useCertificationStandardsApi = (
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
        data: CertificationStandard[]
        timestamp: string
    }>(CERTIFICATION_STANDARD_ENDPOINTS.getAll, {
        requireAuth: true,
        ...options,
    })
}

