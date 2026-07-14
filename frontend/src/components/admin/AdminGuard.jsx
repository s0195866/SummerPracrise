import { useAuth } from '../../context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

const ROLE_REQUIREMENTS = {
  admin: ['admin'],
  manager: ['manager', 'admin'],
}

export default function AdminGuard({ children, pageRole = 'manager' }) {
  const { isAuthenticated, client, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        color: '#6C7685',
        fontSize: 16,
      }}>
        Загрузка...
      </div>
    )
  }

  if (!isAuthenticated || !client) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const allowedRoles = ROLE_REQUIREMENTS[pageRole] || ['manager', 'admin']
  if (!allowedRoles.includes(client.role)) {
    return <Navigate to="/" replace />
  }

  return children
}