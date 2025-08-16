// Module permission interface
export interface ModulePermission {
    moduleId: number
    moduleName: string
    permissions: string[]
}

// User interface
export interface User {
    id: number
    email: string
    username: string
    role: string
    firstName?: string
    lastName?: string
    avatar?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    rolePermissions: ModulePermission[]
}

// Login form data
export interface LoginFormData {
    email: string
    password: string
}

// Login API response
export interface LoginResponse {
    success: boolean
    message: string
    data: {
        token: string
        admin: User
    }
}

// Register form data
export interface RegisterFormData {
    username: string
    email: string
    password: string
    confirmPassword: string
    firstName?: string
    lastName?: string
}

// Auth context state
export interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

// Auth context actions
export interface AuthActions {
    login: (userData: User) => void
    logout: () => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
}

// Auth context type
export interface AuthContextType extends AuthState, AuthActions { }

// Password reset form
export interface PasswordResetFormData {
    email: string
}

// Change password form
export interface ChangePasswordFormData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

// Profile update form
export interface ProfileUpdateFormData {
    firstName?: string
    lastName?: string
    email?: string
    avatar?: File
} 