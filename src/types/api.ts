// API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean
    message: string
    data?: T
    error?: string
    statusCode?: number
}

// API Error response
export interface ApiError {
    message: string
    statusCode: number
    error: string
    timestamp: string
}

// Pagination interface
export interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: Pagination
}

// API request options
export interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    headers?: Record<string, string>
    body?: any
    timeout?: number
    requireAuth?: boolean
}

// API hook options
export interface UseApiOptions {
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    staleTime?: number
    cacheTime?: number
    requireAuth?: boolean
    onSuccess?: (data: any) => void
    onError?: (error: Error) => void
    invalidateQueries?: string[]
    responseType?: 'json' | 'blob'
}

// API configuration
export interface ApiConfig {
    baseURL: string
    timeout: number
    headers: Record<string, string>
}

// Query parameters
export interface QueryParams {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    filter?: Record<string, any>
}

// File upload response
export interface FileUploadResponse {
    filename: string
    originalName: string
    mimetype: string
    size: number
    url: string
} 