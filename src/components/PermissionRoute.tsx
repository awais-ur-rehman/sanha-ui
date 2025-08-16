import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { usePermissions } from '../hooks/usePermissions'
import { ROUTES } from '../config/routes'

interface PermissionRouteProps {
  children: ReactNode
  moduleName: string
  requiredPermission?: string
}

const PermissionRoute = ({ children, moduleName, requiredPermission = 'read' }: PermissionRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const { canAccessModule, hasPermission } = usePermissions()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Check if user can access the module
  if (!canAccessModule(moduleName)) {
    return <Navigate to={ROUTES.ACCESS_RESTRICTED} replace />
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(moduleName, requiredPermission)) {
    return <Navigate to={ROUTES.ACCESS_RESTRICTED} replace />
  }

  return <>{children}</>
}

export default PermissionRoute 