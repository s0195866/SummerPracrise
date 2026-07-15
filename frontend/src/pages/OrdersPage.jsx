import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ordersApi } from '../api'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const STATUS_COLORS = {
  new: '#0067B8',
  processing: '#F59E0B',
  shipped: '#8B5CF6',
  delivered: '#16A34A',
  cancelled: '#DC2626',
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadOrders()
  }, [isAuthenticated])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await ordersApi.list()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (orderId) => {
    try {
      const updated = await ordersApi.cancel(orderId)
      setOrders(prev => prev.map(o => o.order_id === orderId ? updated : o))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
        <p style={{ color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>Загрузка заказов...</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
        Мои заказы
      </h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 18, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
            У вас пока нет заказов
          </p>
          <button
            onClick={() => navigate('/catalog')}
            style={{
              height: 48,
              padding: '0 24px',
              backgroundColor: '#0067B8',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
            }}
          >
            Перейти в каталог
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <div key={order.order_id} style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8EDF4',
              borderRadius: 16,
              padding: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
                    Заказ #{order.order_id}
                  </div>
                  <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>
                    {new Date(order.sale_date).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: `${STATUS_COLORS[order.status]}15`,
                    color: STATUS_COLORS[order.status],
                  }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
                Товаров: {order.items.length} | Сумма: {Number(order.total_amount).toLocaleString('ru-RU')} ₽
              </div>

              {order.discount_applied > 0 && (
                <div style={{ fontSize: 13, color: '#16A34A', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
                  Скидка: {Number(order.discount_applied).toLocaleString('ru-RU')} ₽
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <Link
                  to={`/orders/${order.order_id}`}
                  style={{
                    height: 36,
                    padding: '0 16px',
                    backgroundColor: '#0067B8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  Подробнее
                </Link>
                {(order.status === 'new' || order.status === 'processing') && (
                  <button
                    onClick={() => handleCancel(order.order_id)}
                    style={{
                      height: 36,
                      padding: '0 16px',
                      backgroundColor: '#fff',
                      color: '#DC2626',
                      border: '1px solid #DC2626',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'Inter, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}