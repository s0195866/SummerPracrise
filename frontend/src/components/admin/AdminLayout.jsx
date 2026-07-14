import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS_MANAGER = [
  { path: '/admin/orders', label: 'Заказы', icon: OrderIcon },
  { path: '/admin/products', label: 'Товары', icon: ProductIcon },
  { path: '/admin/statistics', label: 'Финансы', icon: ChartIcon },
]

const NAV_ITEMS_ADMIN = [
  { path: '/admin/orders', label: 'Заказы', icon: OrderIcon },
  { path: '/admin/products', label: 'Товары', icon: ProductIcon },
  { path: '/admin/statistics', label: 'Финансы', icon: ChartIcon },
  { path: '/admin/users', label: 'Пользователи', icon: UsersIcon },
]

export default function AdminLayout({ children }) {
  const { client, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAdmin = client?.role === 'admin'
  const navItems = isAdmin ? NAV_ITEMS_ADMIN : NAV_ITEMS_MANAGER

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFD' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E8EDF4',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E8EDF4',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/favicon.svg" alt="ST" style={{ width: 36, height: 36, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1B1F24', lineHeight: 1.2, letterSpacing: '0.5px' }}>
                SIGMA-TECH
              </div>
              <div style={{ fontSize: 11, color: '#6C7685', lineHeight: 1, fontWeight: 400 }}>
                Панель управления
              </div>
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: '16px 24px 8px' }}>
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            backgroundColor: isAdmin ? '#0067B815' : '#F59E0B15',
            color: isAdmin ? '#0067B8' : '#D97706',
          }}>
            {isAdmin ? 'Администратор' : 'Менеджер'}
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'Inter, sans-serif',
                color: isActive ? '#0067B8' : '#374151',
                backgroundColor: isActive ? '#0067B808' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
                marginBottom: 2,
              })}
            >
              <item.icon active={location.pathname.startsWith(item.path)} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #E8EDF4' }}>
          <div style={{ fontSize: 13, color: '#1B1F24', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {client?.full_name}
          </div>
          <div style={{ fontSize: 12, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {client?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={e => e.target.style.backgroundColor = '#F3F4F6'}
          >
            <LogoutIcon />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 260, padding: '32px 40px', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}

function OrderIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#0067B8' : '#6C7685'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" />
      <path d="M3 6H21" />
      <path d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10" />
    </svg>
  )
}

function ProductIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#0067B8' : '#6C7685'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ChartIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#0067B8' : '#6C7685'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20V14" />
    </svg>
  )
}

function UsersIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#0067B8' : '#6C7685'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21V19C22.99 17.18 21.78 15.6 20 15.14" />
      <path d="M16 3.14C17.79 3.6 18.99 5.18 19 7" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H9" />
      <path d="M16 17L21 12L16 7" />
      <path d="M21 12H9" />
    </svg>
  )
}