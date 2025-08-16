// Base entity interface
export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt: string
}

// Soft delete entity
export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: string
  isDeleted: boolean
}

// Select option
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// Key-value pair
export interface KeyValuePair<T = any> {
  key: string
  value: T
}

// Sort order
export type SortOrder = 'asc' | 'desc'

// Sort configuration
export interface SortConfig {
  field: string
  order: SortOrder
}

// Filter configuration
export interface FilterConfig {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'notIn'
  value: any
}

// Search configuration
export interface SearchConfig {
  query: string
  fields: string[]
}

// Date range
export interface DateRange {
  startDate: string
  endDate: string
}

// File information
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
}

// Breadcrumb item
export interface BreadcrumbItem {
  label: string
  path?: string
  active?: boolean
}

// Navigation item
export interface NavigationItem {
  id: string
  label: string
  path: string
  icon?: string
  children?: NavigationItem[]
  active?: boolean
  disabled?: boolean
  badge?: {
    text: string
    variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  }
}

// Theme configuration
export interface ThemeConfig {
  primary: string
  secondary: string
  success: string
  danger: string
  warning: string
  info: string
  light: string
  dark: string
}

// App configuration
export interface AppConfig {
  name: string
  version: string
  description: string
  theme: ThemeConfig
  features: {
    [key: string]: boolean
  }
}

// Environment variables
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test'
  API_BASE_URL: string
  API_TIMEOUT: number
  APP_NAME: string
  APP_VERSION: string
}

// Error information
export interface ErrorInfo {
  message: string
  code?: string
  details?: any
  timestamp: string
  stack?: string
}

// Success information
export interface SuccessInfo {
  message: string
  data?: any
  timestamp: string
}

// Loading state
export interface LoadingState {
  isLoading: boolean
  error?: ErrorInfo
  data?: any
}

// Async operation result
export interface AsyncResult<T = any> {
  data?: T
  error?: ErrorInfo
  loading: boolean
}

// Event handler
export type EventHandler<T = any> = (event: T) => void

// Void function
export type VoidFunction = () => void

// Async function
export type AsyncFunction<T = any, R = any> = (params: T) => Promise<R>

// Callback function
export type CallbackFunction<T = any> = (result: T) => void

// Predicate function
export type PredicateFunction<T = any> = (item: T) => boolean

// Mapper function
export type MapperFunction<T = any, R = any> = (item: T) => R

// Reducer function
export type ReducerFunction<T = any, R = any> = (accumulator: R, item: T) => R 