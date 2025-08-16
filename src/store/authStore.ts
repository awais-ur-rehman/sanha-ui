import { create } from 'zustand'
import { type User } from '../types'

// JWT token decoder utility
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (userData: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initializeAuth: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Actions
  login: (userData: User) => {
    // Store user data in localStorage for persistence
    localStorage.setItem('userData', JSON.stringify(userData))
    set({
      user: userData,
      isAuthenticated: true,
      error: null,
      isLoading: false
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false
    })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  initializeAuth: () => {
    const token = localStorage.getItem('token')
    console.log('Initializing auth with token:', token ? 'exists' : 'not found')

    if (token) {
      // Decode the JWT token to get user information
      const decodedToken = decodeToken(token)
      console.log('Decoded token:', decodedToken)

      if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
        // Token is valid, try to get user data from localStorage
        const storedUserData = localStorage.getItem('userData')
        console.log('Stored user data:', storedUserData ? 'exists' : 'not found')

        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData)
            console.log('Parsed user data:', userData)
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false
            })
          } catch (error) {
            console.error('Error parsing stored user data:', error)
            // If stored data is corrupted, clear it and redirect to login
            localStorage.removeItem('userData')
            localStorage.removeItem('token')
            set({ isLoading: false })
          }
        } else {
          // No stored user data, token might be expired or invalid
          console.log('No stored user data found, clearing token')
          localStorage.removeItem('token')
          set({ isLoading: false })
        }
      } else {
        // Token is expired or invalid
        console.log('Token is expired or invalid, clearing data')
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
        set({ isLoading: false })
      }
    } else {
      console.log('No token found')
      set({ isLoading: false })
    }
  }
})) 