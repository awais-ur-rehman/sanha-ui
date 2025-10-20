import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../../forms/LoginForm'
import { useAuthStore } from '../../store'
import { type LoginResponse } from '../../types'
import { ROUTES } from '../../config/routes'
import logo from "../../assets/logo/sanhaLogo.png";

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD)
    }
  }, [isAuthenticated, navigate])

  const handleLoginSuccess = (data: LoginResponse) => {
    if (data.success && data.data) {
      localStorage.setItem('token', data.data.token)
      login(data.data.admin)
      navigate(ROUTES.DASHBOARD)
    }
  }

  const handleLoginError = (error: Error) => {
    console.error('Login error:', error)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4">
      {/* Mobile Brand Header */}
      <div className="lg:hidden flex justify-center items-center py-8 order-1">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sanha</h1>
         
        </div>
      </div>

      {/* Left side - Brand (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1f222a] items-start text-start justify-start p-4 rounded-xl relative overflow-hidden order-2 lg:order-1">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 md:top-10 md:left-10 w-16 h-16 md:w-32 md:h-32 bg-white rounded-full blur-2xl md:blur-3xl"></div>
              <div className="absolute bottom-4 right-4 md:bottom-20 md:right-10 w-12 h-12 md:w-24 md:h-24 bg-white rounded-full blur-xl md:blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-40 md:h-40 bg-white rounded-full blur-2xl md:blur-3xl"></div>
        </div>
            
            {/* Spinning Element */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-black/80 flex items-center justify-center transition-all duration-1000 hover:rotate-360 hover:scale-110 group bubble-animation bubble-distort">
                <div className="w-full h-full relative">
                  {/* Outer glow effect - distorted ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 blur-xl opacity-30 bubble-glow bubble-distort" style={{ borderRadius: '50% 45% 55% 40% / 40% 50% 50% 55%' }}></div>
                  
                  {/* Blue glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 blur-lg opacity-20 crescent-glow bubble-distort" style={{ borderRadius: '50% 45% 55% 40% / 40% 50% 50% 55%' }}></div>
                  
                  {/* Main ring with shadow - distorted ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 shadow-2xl bubble-breathe bubble-distort" style={{ borderRadius: '50% 45% 55% 40% / 40% 50% 50% 55%' }}></div>
                  
                  {/* Inner spinning glow */}
                  <div className="absolute inset-2 bg-[#1f222a] blur-md opacity-60 inner-spin-glow bubble-distort" style={{ borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' }}></div>
                  
                  {/* Inner cutout to make it completely hollow - distorted ring */}
                  <div className="absolute inset-4 bg-[#1f222a] bubble-distort" style={{ borderRadius: '50% 45% 55% 40% / 40% 50% 50% 55%' }}></div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 h-full p-4 left-20 md:p-6 lg:p-8 text-white">
              <div className="absolute top-2 -left-20 md:top-6 flex justify-center items-center gap-2">
                <img src={logo} alt="logo" className='w-8 h-8' />
                <h3 className="text-sm md:text-[18px] font-semibold opacity-80">SANHA</h3>
              </div>
            </div>

            <div className="space-y-1 absolute bottom-4 left-4">
                <h2 className="text-xl font-serif font-medium leading-tight text-white">
                Sanha Pakistan Portal
                </h2>
                <p className="text-md opacity-50 leading-relaxed text-white">
                  Track your business performance and manage your business with ease.
                </p>
              </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 order-1 lg:order-2">
        <div className="w-full max-w-sm md:max-w-md">
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
        </div>
      </div>
    </div>
  )
}

export default Login 