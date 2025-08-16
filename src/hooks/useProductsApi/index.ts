import { useGetApi } from '../useGetApi'
import { usePostApi } from '../usePostApi'
import { usePutApi } from '../usePutApi'
import { useDeleteApi } from '../useDeleteApi'
import { PRODUCT_ENDPOINTS } from '../../config/api'
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '../../types/entities'

export const useProductsApi = (
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
      data: Product[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }
    timestamp: string
  }>(`${PRODUCT_ENDPOINTS.getAll}?${queryParams}`, {
    requireAuth: true,
    ...options,
  })
}

export const useCreateProduct = () => {
  return usePostApi<{
    success: boolean
    message: string
    data: Product
    timestamp: string
  }, ProductCreateRequest>(PRODUCT_ENDPOINTS.create, {
    requireAuth: true,
  })
}

export const useUpdateProduct = () => {
  return usePutApi<{
    success: boolean
    message: string
    data: Product
    timestamp: string
  }, ProductUpdateRequest>(PRODUCT_ENDPOINTS.update, {
    requireAuth: true,
  })
}

export const useDeleteProduct = () => {
  return useDeleteApi<{
    success: boolean
    message: string
    timestamp: string
  }>(PRODUCT_ENDPOINTS.delete, {
    requireAuth: true,
  })
}

export const useToggleProductStatus = () => {
  return usePutApi<{
    success: boolean
    message: string
    data: Product
    timestamp: string
  }, ProductUpdateRequest>(PRODUCT_ENDPOINTS.update, {
    requireAuth: true,
  })
}
