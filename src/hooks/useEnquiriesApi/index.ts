import { useGetApi } from '../useGetApi'
import { usePutApi } from '../usePutApi'
import { useDeleteApi } from '../useDeleteApi'
import { ENQUIRY_ENDPOINTS } from '../../config/api'
import type { Enquiry, EnquiryUpdateRequest } from '../../types/entities'

export const useEnquiriesApi = (
    queryParams: string,
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
        data: {
            data: Enquiry[]
            pagination: {
                page: number
                limit: number
                total: number | string
                totalPages: number
            }
        }
        timestamp: string
    }>(`${ENQUIRY_ENDPOINTS.getAll}?${queryParams}`, {
        requireAuth: true,
        ...options,
    })
}

export const useUpdateEnquiryState = (id?: number) => {
    return usePutApi<EnquiryUpdateRequest, {
        success: boolean
        message: string
        data: Enquiry
        timestamp: string
    }>(`${ENQUIRY_ENDPOINTS.update}/${id}`, {
        requireAuth: true,
    })
}

export const useDeleteEnquiry = (id?: number) => {
    return useDeleteApi<{
        success: boolean
        message: string
        data: Record<string, never>
        timestamp: string
    }>(`${ENQUIRY_ENDPOINTS.delete}/${id}?hardDelete=true`, {
        requireAuth: true,
    })
}


