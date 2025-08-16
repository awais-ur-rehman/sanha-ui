// RBAC API Endpoints
export const RBAC_ENDPOINTS = {
  // Module endpoints
  modules: {
    getAll: '/modules',
    getById: '/modules',
    create: '/modules',
    update: '/modules',
    delete: '/modules',
  },

  // Role endpoints
  roles: {
    getAll: '/roles',
    getById: '/roles',
    create: '/roles',
    update: '/roles',
    delete: '/roles',
  },

  // Admin endpoints (replacing users)
  admins: {
    getAll: '/admin',
    getById: '/admin',
    create: '/admin/signup',
    update: '/admin',
    delete: '/admin',
  },
}

// Available permissions for modules
export const AVAILABLE_PERMISSIONS = [
  'create',
  'read',
  'update',
  'delete',
  'export',
  'import',
  'approve',
  'reject',
] as const

export type PermissionType = typeof AVAILABLE_PERMISSIONS[number] 