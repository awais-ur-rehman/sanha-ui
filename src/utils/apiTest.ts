// API Test Utility for debugging authentication issues
import { API_CONFIG, getAuthHeaders } from '../config/api'

export const testApiConnection = async () => {
  console.log('🔍 Testing API Connection...')
  
  try {
    // Test 1: Health endpoint (no auth required)
    console.log('📡 Testing health endpoint...')
    const healthResponse = await fetch(`${API_CONFIG.baseURL}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health endpoint:', healthData)
    
    // Test 2: Books endpoint (no auth required)
    console.log('📚 Testing books endpoint...')
    const booksResponse = await fetch(`${API_CONFIG.baseURL}/books`)
    const booksData = await booksResponse.json()
    console.log('✅ Books endpoint:', booksData)
    
    // Test 3: Check if token exists
    const token = localStorage.getItem('token')
    console.log('🔑 Token exists:', !!token)
    if (token) {
      console.log('🔑 Token length:', token.length)
      console.log('🔑 Token preview:', token.substring(0, 50) + '...')
    }
    
    // Test 4: Test authenticated endpoint
    if (token) {
      console.log('🔐 Testing authenticated endpoint...')
      const authHeaders = getAuthHeaders()
      console.log('📋 Auth headers:', authHeaders)
      
      const profileResponse = await fetch(`${API_CONFIG.baseURL}/admin/profile`, {
        headers: authHeaders
      })
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        console.log('✅ Authenticated endpoint:', profileData)
      } else {
        const errorData = await profileResponse.json()
        console.log('❌ Authenticated endpoint failed:', errorData)
        console.log('📊 Response status:', profileResponse.status)
        console.log('📊 Response headers:', Object.fromEntries(profileResponse.headers.entries()))
      }
    } else {
      console.log('⚠️ No token found, skipping authenticated test')
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

export const testTokenValidity = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.log('❌ No token found')
    return false
  }
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/admin/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('✅ Token is valid')
      return true
    } else {
      console.log('❌ Token is invalid or expired')
      return false
    }
  } catch (error) {
    console.error('❌ Token validation failed:', error)
    return false
  }
} 