import { useQuery } from '@tanstack/react-query'
import { API_CONFIG, getAuthHeaders } from '../config/api'

// Hook to fetch FAQ by ID
export const useGetFaqById = (id: string | number | null) => {
    return useQuery({
        queryKey: ['faq', id],
        queryFn: async () => {
            if (!id) return null

            const response = await fetch(`${API_CONFIG.baseURL}/api/v1/faqs/${id}`, {
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error('Failed to fetch FAQ')
            }

            const data = await response.json()
            return data.data
        },
        enabled: !!id
    })
}

// Hook to fetch Enquiry by ID
export const useGetEnquiryById = (id: string | number | null) => {
    return useQuery({
        queryKey: ['enquiry', id],
        queryFn: async () => {
            if (!id) return null

            const response = await fetch(`${API_CONFIG.baseURL}/api/v1/enquiries/${id}`, {
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error('Failed to fetch Enquiry')
            }

            const data = await response.json()
            return data.data
        },
        enabled: !!id
    })
}

// Hook to fetch Contact Us by ID
export const useGetContactUsById = (id: string | number | null) => {
    return useQuery({
        queryKey: ['contact-us', id],
        queryFn: async () => {
            if (!id) return null

            const response = await fetch(`${API_CONFIG.baseURL}/api/v1/contact-us/${id}`, {
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error('Failed to fetch Contact Us')
            }

            const data = await response.json()
            return data.data
        },
        enabled: !!id
    })
}
