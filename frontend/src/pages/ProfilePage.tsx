import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { isAuthenticated, client, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (client) {
      setForm({
        full_name: client.full_name,
        phone: client.phone,
        email: client.email,
        address: client.address || '',
      })
    }
  }, [isAuthenticated, client])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await clientsApi.updateMe({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        address: form.address || null,
      })
      setMessage('Профиль обновлён')
      setEditing(false)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!client) {
    return (
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
        <p style={{ color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>Загрузка...</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '32px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
        Профиль
      </h1>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          backgroundColor: message === 'Профиль обновлён' ? '#F0FDF4' : '#FEF2F2',
          color: message === 'Профиль обновлён' ? '#16A34A' : '#DC2626',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          marginBottom: 20,
        }}>
          {message}
        </div>
      )}

      {!editing ? (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8EDF4', borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>ФИО</div>
            <div style={{ fontSize: 16, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>{client.full_name}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Телефон</div>
            <div style={{ fontSize: 16, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>{client.phone}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 16, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>{client.email}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Адрес</div>
            <div style={{ fontSize: 16, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>{client.address || 'Не указан'}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Роль</div>
            <div style={{ fontSize: 16, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>{client.role === 'admin' ? 'Администратор' : client.role === 'manager' ? 'Менеджер' : 'Клиент'}</div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Сумма покупок</div>
            <div style={{ fontSize: 16, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
              {Number(client.total_purchases_amount).toLocaleString('ru-RU')} ₽
              {client.is_regular && <span style={{ color: '#16A34A', marginLeft: 8, fontSize: 13 }}>Постоянный клиент (скидка 2%)</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                height: 40,
                padding: '0 20px',
                backgroundColor: '#0067B8',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
              }}
            >
              Редактировать
            </button>
            <button
              onClick={handleLogout}
              style={{
                height: 40,
                padding: '0 20px',
                backgroundColor: '#fff',
                color: '#DC2626',
                border: '1px solid #DC2626',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
              }}
            >
              Выйти
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8EDF4', borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
              ФИО
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
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
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
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
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
              Адрес
            </label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                height: 40,
                padding: '0 20px',
                backgroundColor: saving ? '#93C5FD' : '#0067B8',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: saving ? 'default' : 'pointer',
              }}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{
                height: 40,
                padding: '0 20px',
                backgroundColor: '#fff',
                color: '#6C7685',
                border: '1px solid #D4DCE8',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 12px',
  border: '1.5px solid #D4DCE8',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}
