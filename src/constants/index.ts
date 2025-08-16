// App Constants
export const APP_CONSTANTS = {
  name: 'Sanha Admin',
  version: '1.0.0',
  description: 'Admin Dashboard for Sanha Library System',
}

// Route Constants
export const ROUTES = {
  // Public Routes
  public: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
  },
  // Private Routes
  private: {
    dashboard: '/dashboard',
    users: '/users',
    books: '/books',
    news: '/news',
    research: '/research',
    modules: '/modules',
    roles: '/roles',
    profile: '/profile',
    settings: '/settings',
  },
}

// Status Constants
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  PUBLISHED: 'published',
  DRAFT: 'draft',
}

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user',
  MODERATOR: 'moderator',
} 