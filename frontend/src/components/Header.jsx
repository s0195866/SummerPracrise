import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cartApi } from '../api'

export default function Header() {
  const { isAuthenticated, client, logout } = useAuth()
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      cartApi.get()
        .then(cart => setCartCount(cart.items.reduce((sum, item) => sum + Number(item.quantity), 0)))
        .catch(() => setCartCount(0))
    } else {
      setCartCount(0)
    }
  }, [isAuthenticated])

  return (
    <header
      style={{
        height: 90,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #EEF2F6',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 32px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/favicon.svg" alt="ST" style={{ width: 45, height: 45, flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1B1F24', lineHeight: 1.1, letterSpacing: '0.5px' }}>
              SIGMA-TECH
            </span>
            <span style={{ fontSize: 11, color: '#6C7685', lineHeight: 1, fontWeight: 400 }}>
              Техника для жизни
            </span>
          </div>
        </Link>

        {/* Catalog button */}
        <Link to="/catalog" style={{ textDecoration: 'none' }}>
          <CatalogButton />
        </Link>

        {/* Search */}
        <SearchBar />

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexShrink: 0, marginLeft: 'auto' }}>
          {isAuthenticated && client ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <NavAction icon={<UserIcon />} label={getFirstName(client.full_name)} />
              </Link>
            </div>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <NavAction icon={<UserIcon />} label="Войти" />
            </Link>
          )}
          <Link to="/orders" style={{ textDecoration: 'none' }}>
            <NavAction icon={<HeartIcon />} label="Заказы" />
          </Link>
          <Link to="/cart" style={{ textDecoration: 'none' }}>
            <CartAction count={cartCount} />
          </Link>
        </div>
      </div>
    </header>
  )
}

function getFirstName(fullName) {
  if (!fullName) return ''
  const parts = fullName.trim().split(' ')
  // Return the first name if there are at least 2 words, otherwise return the full name
  if (parts.length >= 2) {
    return parts[0]
  }
  return parts[0]
}

function CatalogButton() {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 48,
        padding: '0 18px',
        backgroundColor: hovered ? '#005299' : '#0067B8',
        color: '#fff',
        border: 'none',
        borderRadius: 14,
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: 15,
        fontWeight: 600,
        transition: 'background-color 0.2s',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      <MenuIcon />
      Каталог
    </button>
  )
}

function SearchBar() {
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const handleSearch = () => {
    const trimmed = query.trim()
    if (trimmed) {
      navigate(`/catalog?search=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/catalog')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div
      style={{
        flex: 1,
        maxWidth: 520,
        height: 48,
        backgroundColor: '#FFFFFF',
        border: `1.5px solid ${focused ? '#0067B8' : '#D4DCE8'}`,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
        transition: 'border-color 0.2s',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Поиск по товарам..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: 15,
          color: '#1B1F24',
          fontFamily: 'Inter, sans-serif',
          backgroundColor: 'transparent',
        }}
      />
      <button
        onClick={handleSearch}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6C7685', display: 'flex' }}
      >
        <SearchIcon />
      </button>
    </div>
  )
}

function NavAction({ icon, label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        color: hovered ? '#0067B8' : '#6C7685',
        transition: 'color 0.2s',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fontWeight: 500,
        padding: 0,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function CartAction({ count }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        color: hovered ? '#0067B8' : '#6C7685',
        transition: 'color 0.2s',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fontWeight: 500,
        padding: 0,
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative' }}>
        <CartIcon />
        <span
          style={{
            position: 'absolute',
            top: -6,
            right: -8,
            backgroundColor: '#0067B8',
            color: '#fff',
            borderRadius: '50%',
            width: 18,
            height: 18,
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {count}
        </span>
      </div>
      Корзина
    </button>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <rect width="18" height="2" rx="1" fill="white" />
      <rect y="6" width="18" height="2" rx="1" fill="white" />
      <rect y="12" width="18" height="2" rx="1" fill="white" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}