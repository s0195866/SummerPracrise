import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ordersApi, type OrderOut } from '../api'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const STATUS_COLORS: Record<string, string> = {
  new: '#0067B8',
  processing: '#F59E0B',
  shipped: '#8B5CF6',
  delivered: '#16A34A',
  cancelled: '#DC2626',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [order, setOrder] = useState<OrderOut | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!id) return
    setLoading(true)
    ordersApi.getById(parseInt(id))
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, isAuthenticated])

  const handleCancel = async () => {
    if (!order) return
    try {
      const updated = await ordersApi.cancel(order.order_id)
      setOrder(updated)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
        <p style={{ color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>Загрузка...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
        <p style={{ color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>Заказ не найден</p>
        <Link to="/orders" style={{ color: '#0067B8' }}>← К списку заказов</Link>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
      <Link to="/orders" style={{ color: '#0067B8', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif', display: 'inline-block', marginBottom: 20 }}>
        ← К списку заказов
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
            Заказ #{order.order_id}
          </h1>
          <div style={{ fontSize: 14, color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>
            {new Date(order.sale_date).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            backgroundColor: `${STATUS_COLORS[order.status]}15`,
            color: STATUS_COLORS[order.status],
          }}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
          {(order.status === 'new' || order.status === 'processing') && (
            <button
              onClick={handleCancel}
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
              Отменить заказ
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>
            Состав заказа
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.items.map(item => (
              <div key={item.order_item_id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                backgroundColor: '#F9FAFB',
                borderRadius: 8,
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
                    {item.product_name}
                  </div>
                  <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>
                    {Number(item.quantity)} × {Number(item.price_at_sale).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
                  {Number(item.line_total).toLocaleString('ru-RU')} ₽
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: 16, backgroundColor: '#F0F4FA', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>Сумма</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
                {Number(order.total_amount + order.discount_applied).toLocaleString('ru-RU')} ₽
              </span>
            </div>
            {order.discount_applied > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#16A34A', fontFamily: 'Inter, sans-serif' }}>Скидка</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#16A34A', fontFamily: 'Inter, sans-serif' }}>
                  −{Number(order.discount_applied).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #D4DCE8', paddingTop: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>Итого</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0067B8', fontFamily: 'Inter, sans-serif' }}>
                {Number(order.total_amount).toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: '0 0 350px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>
            Детали доставки
          </h2>

          <div style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Адрес доставки</div>
              <div style={{ fontSize: 15, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
                {order.delivery_address || 'Не указан'}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Способ доставки</div>
              <div style={{ fontSize: 15, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
                {order.delivery_method || 'Не указан'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Способ оплаты</div>
              <div style={{ fontSize: 15, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
                {order.payment_method || 'Не указан'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
