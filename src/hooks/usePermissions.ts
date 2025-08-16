import { useAuthStore } from '../store'

export const usePermissions = () => {
  const { user } = useAuthStore()

  const hasPermission = (moduleName: string, permission: string): boolean => {
    if (!user || !user.rolePermissions) {
      console.log('No user or rolePermissions found:', { user, rolePermissions: user?.rolePermissions })
      return false
    }

    const modulePermission = user.rolePermissions.find(
      (mp: any) => mp.moduleName.toLowerCase() === moduleName.toLowerCase()
    )

    const hasPerm = modulePermission?.permissions.includes(permission) || false
    
    // Debug logging
    console.log('Permission check:', {
      moduleName,
      permission,
      modulePermission,
      hasPerm,
      allPermissions: user.rolePermissions
    })

    return hasPerm
  }

  const hasAnyPermission = (moduleName: string, permissions: string[]): boolean => {
    if (!user || !user.rolePermissions) return false

    const modulePermission = user.rolePermissions.find(
      (mp: any) => mp.moduleName.toLowerCase() === moduleName.toLowerCase()
    )

    return permissions.some(permission =>
      modulePermission?.permissions.includes(permission)
    ) || false
  }

  const hasAllPermissions = (moduleName: string, permissions: string[]): boolean => {
    if (!user || !user.rolePermissions) return false

    const modulePermission = user.rolePermissions.find(
      (mp: any) => mp.moduleName.toLowerCase() === moduleName.toLowerCase()
    )

    return permissions.every(permission =>
      modulePermission?.permissions.includes(permission)
    ) || false
  }

  const getModulePermissions = (moduleName: string): string[] => {
    if (!user || !user.rolePermissions) return []

    const modulePermission = user.rolePermissions.find(
      (mp: any) => mp.moduleName.toLowerCase() === moduleName.toLowerCase()
    )

    return modulePermission?.permissions || []
  }

  const getAccessibleModules = (): string[] => {
    if (!user || !user.rolePermissions) return []

    return user.rolePermissions.map((mp: any) => mp.moduleName)
  }

  const canAccessModule = (moduleName: string): boolean => {
    if (!user || !user.rolePermissions) return false

    return user.rolePermissions.some(
      (mp: any) => mp.moduleName.toLowerCase() === moduleName.toLowerCase()
    )
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getModulePermissions,
    getAccessibleModules,
    canAccessModule,
    userPermissions: user?.rolePermissions || []
  }
} 