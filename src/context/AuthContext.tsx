import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type User, type AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // TODO: Validate token with backend
      // For now, we'll just set a dummy user
      const dummyUser: User = {
        id: 1,
        email: 'admin@sanha.com',
        username: 'admin',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rolePermissions: [
          {
            moduleId: 1,
            moduleName: 'Access Control',
            permissions: ['read', 'write', 'update', 'delete']
          },
          {
            moduleId: 2,
            moduleName: 'Books',
            permissions: ['read', 'write', 'update', 'delete']
          },
          {
            moduleId: 3,
            moduleName: 'Research',
            permissions: ['read', 'write', 'update', 'delete']
          },
          {
            moduleId: 4,
            moduleName: 'News',
            permissions: ['read', 'write', 'update', 'delete']
          },
          {
            moduleId: 5,
            moduleName: 'Dashboard',
            permissions: ['read', 'write', 'update', 'delete']
          }
        ]
      }
      setUser(dummyUser)
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    setError(null)
  }

  const logout = () => {
    setUser(null)
    setError(null)
    localStorage.removeItem('token')
  }

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const setErrorState = (errorMessage: string | null) => {
    setError(errorMessage)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    setLoading,
    setError: setErrorState,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 