// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://quiet-similarly-cattle.ngrok-free.app/api/v1',
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
}

// Get headers with authorization token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    ...API_CONFIG.headers,
    'ngrok-skip-browser-warning': 'true',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Auth Endpoints from Backend
export const AUTH_ENDPOINTS = {
  // Admin Auth
  adminLogin: '/admin/login',
  adminSignup: '/admin/signup',
  adminProfile: '/admin/profile',
  adminUpdateProfile: '/admin/profile',
  adminGetAll: '/admin',
  adminDelete: '/admin',

  // User Auth
  userLogin: '/user/login',
  userSignup: '/user/signup',
  userGetAll: '/user',
  userGetById: '/user',
  userUpdate: '/user',
  userDelete: '/user',
}

// Book Endpoints
export const BOOK_ENDPOINTS = {
  getAll: '/books',
  getById: '/books',
  create: '/books',
  update: '/books',
  delete: '/books',
}

// File Upload Endpoints
export const FILE_ENDPOINTS = {
  upload: '/files/upload',
}

// E-Code Endpoints
export const ECODE_ENDPOINTS = {
  getAll: '/ecodes',
  getById: '/ecodes',
  create: '/ecodes',
  update: '/ecodes',
  delete: '/ecodes',
}

// Resources Endpoints
export const RESOURCE_ENDPOINTS = {
  getAll: '/resources',
  getById: '/resources',
  create: '/resources',
  update: '/resources',
  delete: '/resources',
}

// FAQ Endpoints
export const FAQ_ENDPOINTS = {
  getAll: '/faqs',
  getById: '/faqs',
  create: '/faqs',
  update: '/faqs',
  delete: '/faqs',
}

// User FAQ Endpoints
export const USER_FAQ_ENDPOINTS = {
  getAll: '/user-faqs',
  getById: '/user-faqs',
  create: '/user-faqs',
  update: '/user-faqs',
  delete: '/user-faqs',
  respond: '/user-faqs/respond',
}

// Client Endpoints
export const CLIENT_ENDPOINTS = {
  getAll: '/clients',
  getById: '/clients',
  create: '/clients',
  update: '/clients',
  delete: '/clients',
  getNames: '/clients/names',
}

// Product Endpoints
export const PRODUCT_ENDPOINTS = {
  getAll: '/products',
  getById: '/products',
  create: '/products',
  update: '/products',
  delete: '/products',
  getByName: '/products/name',
}

// Non-Halal Product Endpoints
export const NON_HALAL_PRODUCT_ENDPOINTS = {
  getAll: '/non-halal-products',
  getById: '/non-halal-products',
  create: '/non-halal-products',
  update: '/non-halal-products',
  delete: '/non-halal-products',
  getManufacturers: '/non-halal-products/manufacturers',
  exportCsv: '/non-halal-products/export/csv',
}

export const HALAL_PRODUCT_ENDPOINTS = {
  getAll: '/products',
  getById: '/products',
  create: '/products',
  update: '/products',
  delete: '/products',
  getClients: '/clients',
  exportCsv: '/products/export/csv',
}

// Enquiry Endpoints
export const ENQUIRY_ENDPOINTS = {
  getAll: '/enquiries',
  getById: '/enquiries',
  update: '/enquiries',
  delete: '/enquiries',
  exportCsv: '/enquiries/export/csv',
}

// Contact Us Endpoints
export const CONTACT_US_ENDPOINTS = {
  getAll: '/contact-us',
  reply: '/contact-us/reply',
  exportCsv: '/contact-us/export/csv',
}

// Reported Product Endpoints
export const REPORTED_PRODUCT_ENDPOINTS = {
  getAll: '/report-products',
  getById: '/report-products',
  exportCsv: '/report-products/export/csv',
  respond: '/report-products/respond',
}

// Newsletter Endpoints
export const NEWSLETTER_ENDPOINTS = {
  getAll: '/newsletter',
  subscribe: '/newsletter/subscribe',
  sendSingle: '/newsletter/send/single',
  sendBulk: '/newsletter/send/bulk',
  getJobStatus: '/newsletter/jobs',
  getAllJobs: '/newsletter/jobs',
}

// Certification Standards Endpoints
export const CERTIFICATION_STANDARD_ENDPOINTS = {
  getAll: '/certification-standards',
  getById: '/certification-standards',
  create: '/certification-standards',
  update: '/certification-standards',
  delete: '/certification-standards',
}

// Export Endpoints for other modules
export const CLIENT_EXPORT_ENDPOINT = '/clients/export/csv'
export const ECODE_EXPORT_ENDPOINT = '/ecodes/export/csv'
export const FAQ_EXPORT_ENDPOINT = '/faqs/export/csv'
export const USER_FAQ_EXPORT_ENDPOINT = '/user-faqs/export/csv'
export const PRODUCT_EXPORT_ENDPOINT = '/products/export/csv'