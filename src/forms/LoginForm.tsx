import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Input from '../components/Input'
import Button from '../components/Button'
import { usePostApi } from '../hooks'
import { AUTH_ENDPOINTS } from '../config/api'
import { useToast } from '../components/CustomToast/ToastContext'
import { type LoginFormData, type LoginResponse } from '../types'

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

interface LoginFormProps {
  onSuccess?: (data: LoginResponse) => void
  onError?: (error: Error) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })



  const loginMutation = usePostApi<LoginFormData, LoginResponse>(AUTH_ENDPOINTS.adminLogin, {
    onSuccess: (data) => {
      showToast('success', 'Login successful! Welcome back.')
      onSuccess?.(data)
    },
    onError: async (error) => {
      // Handle fetch errors (network issues, etc.)
      if (error.message.includes('fetch')) {
        showToast('error', 'Unable to connect to server. Please check your internet connection.')
      } else if (error.message.includes('timeout')) {
        showToast('error', 'Request timed out. Please try again.')
      } else if (error.message.includes('HTTP error! status:')) {
        // Extract status code from error message
        const statusMatch = error.message.match(/status: (\d+)/)
        const status = statusMatch ? parseInt(statusMatch[1]) : 0
        
        // Use the same error messages as before
        let userFriendlyMessage = 'Login failed. Please check your credentials and try again.'
        switch (status) {
          case 401:
            userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.'
            break
          case 404:
            userFriendlyMessage = 'Account not found. Please check your email address.'
            break
          case 429:
            userFriendlyMessage = 'Too many login attempts. Please try again later.'
            break
          case 500:
            userFriendlyMessage = 'Server is temporarily unavailable. Please try again in a few minutes.'
            break
          case 408:
            userFriendlyMessage = 'Request timed out. Please try again.'
            break
        }
        showToast('error', userFriendlyMessage)
      } else {
        showToast('error', 'Login failed. Please check your credentials and try again.')
      }
      onError?.(error)
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Login to your account</p>
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        icon="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        icon="password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loginMutation.isPending}
        className="w-full"
      >
        {loginMutation.isPending ? 'Logging In...' : 'Login'}
      </Button>
    </form>
  )
}

export default LoginForm 