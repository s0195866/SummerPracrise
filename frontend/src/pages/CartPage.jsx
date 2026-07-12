import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartApi, ordersApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderForm, setOrderForm] = useState({ delivery_address: '', delivery_method: 'Курьер', payment_method: 'Карта' })
  const [ordering, setOrdering] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadCart()
  }, [isAuthenticated])

  const loadCart = async () => {
    setLoading(true)
    try {
      const data = await cartApi.get()
      setCart(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      const data = await cartApi.updateItem(itemId, quantity)
      setCart(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      const data = await cartApi.deleteItem(itemId)
      setCart(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    setOrdering(true)
    setOrderMessage('')
    try {
      await ordersApi.create(orderForm)
      setOrderMessage('Заказ оформлен!')
      // Очищаем корзину
      loadCart()
    } catch (err) {
      setOrderMessage(err instanceof Error ? err.message : 'Ошибка оформления заказа')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
        <p style={{ color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>Загрузка корзины...</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
        Корзина
      </h1>

      {orderMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          backgroundColor: orderMessage.includes('ошиб') ? '#FEF2F2' : '#F0FDF4',
          color: orderMessage.includes('ошиб') ? '#DC2626' : '#16A34A',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          marginBottom: 20,
        }}>
          {orderMessage}
        </div>
      )}

      {!cart || cart.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 18, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
            Корзина пуста
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
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            {cart.items.map(item => (
              <div key={item.cart_item_id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8EDF4',
                borderRadius: 12,
                marginBottom: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
                    {item.product_name}
                  </div>
                  <div style={{ fontSize: 14, color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>
                    {Number(item.price).toLocaleString('ru-RU')} ₽ × {Number(item.quantity)} {item.unit}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0067B8', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
                    {(Number(item.price) * Number(item.quantity)).toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => handleUpdateQuantity(item.cart_item_id, Math.max(1, Number(item.quantity) - 1))}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #D4DCE8', background: '#fff', cursor: 'pointer', fontSize: 16 }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 600, fontFamily: 'Inter, sans-serif', minWidth: 24, textAlign: 'center' }}>
                    {Number(item.quantity)}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.cart_item_id, Number(item.quantity) + 1)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #D4DCE8', background: '#fff', cursor: 'pointer', fontSize: 16 }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.cart_item_id)}
                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 20, padding: 4 }}
                >
                  ✕
                </button>
              </div>
            ))}

            <div style={{ fontSize: 24, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginTop: 16, textAlign: 'right' }}>
              Итого: {Number(cart.total).toLocaleString('ru-RU')} ₽
            </div>
          </div>

          <div style={{ flex: '0 0 380px', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
              Оформление заказа
            </h2>
            <form onSubmit={handleCreateOrder}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                  Адрес доставки
                </label>
                <input
                  type="text"
                  value={orderForm.delivery_address}
                  onChange={e => setOrderForm(prev => ({ ...prev, delivery_address: e.target.value }))}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                  Способ доставки
                </label>
                <select
                  value={orderForm.delivery_method}
                  onChange={e => setOrderForm(prev => ({ ...prev, delivery_method: e.target.value }))}
                  style={inputStyle}
                >
                  <option>Курьер</option>
                  <option>Самовывоз</option>
                  <option>Почта</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                  Способ оплаты
                </label>
                <select
                  value={orderForm.payment_method}
                  onChange={e => setOrderForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  style={inputStyle}
                >
                  <option>Карта</option>
                  <option>Наличные</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={ordering}
                style={{
                  width: '100%',
                  height: 48,
                  backgroundColor: ordering ? '#93C5FD' : '#0067B8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  cursor: ordering ? 'default' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                {ordering ? 'Оформление...' : `Оформить заказ (${Number(cart.total).toLocaleString('ru-RU')} ₽)`}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

const inputStyle = {
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