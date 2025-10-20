import { useGetApi } from '../useGetApi'
import { usePostApi } from '../usePostApi'
import { usePutApi } from '../usePutApi'
import { type FAQ, type UserFAQ, type FAQType } from '../../types/entities'

export const useFaqsApi = (
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
      data: FAQ[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }
    timestamp: string
  }>(`/faqs?${queryParams}`, {
    requireAuth: false, // FAQs are public
    ...options,
  })
}

export const useUserFaqsApi = (
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
      data: UserFAQ[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }
    timestamp: string
  }>(`/user-faqs?${queryParams}`, {
    requireAuth: true, // User FAQs are protected
    ...options,
  })
}

export const useRespondToUserFaq = () => {
  return usePostApi<{
    success: boolean
    message: string
    data: {
      emailSent: boolean
      recipient: string
      userName: string
      question: string
      answer: string
      sentAt: string
    }
    timestamp: string
  }>('/user-faqs/respond', {
    requireAuth: true,
  })
}

export const useCreateFaq = () => {
  return usePostApi<{
    success: boolean
    message: string
    data: FAQ
    timestamp: string
  }, { question: string; answer: string; faqType: FAQType; isActive?: boolean }>('/faqs', {
    requireAuth: true,
  })
}

export const useUpdateFaq = () => {
  return usePutApi<{
    success: boolean
    message: string
    data: FAQ
    timestamp: string
  }, { question: string; answer: string; faqType: FAQType; isActive?: boolean }>('/faqs', {
    requireAuth: true,
  })
}
