import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      login(res.access_token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
        Вход
      </h1>
      <p style={{ color: '#6C7685', marginBottom: 32, fontFamily: 'Inter, sans-serif' }}>
        Войдите в аккаунт, чтобы продолжить покупки
      </p>

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          color: '#DC2626',
          padding: '12px 16px',
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              height: 48,
              padding: '0 16px',
              border: '1.5px solid #D4DCE8',
              borderRadius: 12,
              fontSize: 15,
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              height: 48,
              padding: '0 16px',
              border: '1.5px solid #D4DCE8',
              borderRadius: 12,
              fontSize: 15,
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: 48,
            backgroundColor: loading ? '#93C5FD' : '#0067B8',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            cursor: loading ? 'default' : 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: 'center', color: '#6C7685', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
        Нет аккаунта?{' '}
        <Link to="/register" style={{ color: '#0067B8', textDecoration: 'none', fontWeight: 500 }}>
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
