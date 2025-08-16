// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning'

// Button sizes
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

// Input types
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date'

// Input icons
export type InputIcon = 'email' | 'password' | 'search' | 'user' | 'phone' | 'none'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

// Modal sizes
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Table column types
export type ColumnType = 'text' | 'number' | 'date' | 'status' | 'action' | 'image'

// Status types
export type StatusType = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft'

// Button props
export interface ButtonProps {
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    disabled?: boolean
    fullWidth?: boolean
    children: React.ReactNode
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    className?: string
}

// Input props
export interface InputProps {
    label?: string
    placeholder?: string
    type?: InputType
    icon?: InputIcon
    error?: string
    helperText?: string
    required?: boolean
    disabled?: boolean
    fullWidth?: boolean
    className?: string
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
    onFocus?: () => void
}

// Toast props
export interface ToastProps {
    type: ToastType
    message: string
    duration?: number
    onClose: () => void
}

// Modal props
export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    size?: ModalSize
    children: React.ReactNode
    showCloseButton?: boolean
    closeOnOverlayClick?: boolean
}

// Table column definition
export interface TableColumn<T = any> {
    key: string
    header: string
    type: ColumnType
    sortable?: boolean
    filterable?: boolean
    width?: string
    render?: (value: any, row: T) => React.ReactNode
}

// Table props
export interface TableProps<T = any> {
    data: T[]
    columns: TableColumn<T>[]
    loading?: boolean
    pagination?: any
    onPageChange?: (page: number) => void
    onSort?: (key: string, order: 'asc' | 'desc') => void
    onFilter?: (filters: Record<string, any>) => void
    emptyMessage?: string
    className?: string
}

// Form field validation
export interface FormValidation {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => boolean | string
}

// Form field
export interface FormField {
    name: string
    label: string
    type: InputType
    placeholder?: string
    validation?: FormValidation
    options?: Array<{ label: string; value: any }>
    icon?: InputIcon
}

// Form configuration
export interface FormConfig {
    fields: FormField[]
    submitButtonText?: string
    cancelButtonText?: string
    onSubmit: (data: any) => void
    onCancel?: () => void
    loading?: boolean
}

// Loading states
export interface LoadingState {
    isLoading: boolean
    error?: string
    data?: any
}

// Pagination props
export interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    showPageNumbers?: boolean
    showPrevNext?: boolean
    className?: string
} 