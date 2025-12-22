import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'

type ProtectedRouteProps = {
  children?: React.ReactNode
  requireAdmin?: boolean
  allowSetup?: boolean
}

const ProtectedRoute = ({ children, requireAdmin = false, allowSetup = false }: ProtectedRouteProps) => {
  const { user, requiresSetup, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ink border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (requiresSetup && !allowSetup && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/recipes" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute




