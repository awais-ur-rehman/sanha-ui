// Module types
export interface Module {
  id?: number
  name: string
  description: string
  permissions?: string[]
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ModuleCreateRequest {
  name: string
  description: string
  permissions?: string[]
  isActive?: boolean
}

export interface ModuleUpdateRequest {
  name?: string
  description?: string
  permissions?: string[]
  isActive?: boolean
}

// Role types
export interface ModulePermission {
  moduleId: number
  moduleName: string
  permissions: string[]
}

export interface Role {
  id?: number
  name: string
  description: string
  modulePermissions?: ModulePermission[]
  createdAt?: string
  updatedAt?: string
}

export interface RoleCreateRequest {
  name: string
  description: string
  modulePermissions?: ModulePermission[]
}

export interface RoleUpdateRequest {
  name?: string
  description?: string
  modulePermissions?: ModulePermission[]
}

// Admin types
export interface Admin {
  id?: number
  username: string
  email: string
  role: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AdminCreateRequest {
  username: string
  email: string
  password: string
  role: string
}

export interface AdminUpdateRequest {
  username?: string
  email?: string
  role?: string
  isActive?: boolean
}

// Pagination types
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Common types
export interface TableData<T> {
  data: T[]
  total: number
  page: number
  limit: number
  loading: boolean
}

export type TabType = 'admins' | 'modules' | 'roles'

export interface Permission {
  module: string
  actions: string[]
} 