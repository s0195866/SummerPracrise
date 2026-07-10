import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.register({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        address: form.address || null,
      })
      login(res.access_token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
        Регистрация
      </h1>
      <p style={{ color: '#6C7685', marginBottom: 32, fontFamily: 'Inter, sans-serif' }}>
        Создайте аккаунт для покупок
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
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
            ФИО
          </label>
          <input
            type="text"
            value={form.full_name}
            onChange={handleChange('full_name')}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
            Телефон
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
            Пароль
          </label>
          <input
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            required
            minLength={6}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
            Адрес (необязательно)
          </label>
          <input
            type="text"
            value={form.address}
            onChange={handleChange('address')}
            style={inputStyle}
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
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: 'center', color: '#6C7685', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
        Уже есть аккаунт?{' '}
        <Link to="/login" style={{ color: '#0067B8', textDecoration: 'none', fontWeight: 500 }}>
          Войти
        </Link>
      </p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 48,
  padding: '0 16px',
  border: '1.5px solid #D4DCE8',
  borderRadius: 12,
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}
