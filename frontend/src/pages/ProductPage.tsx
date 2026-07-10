import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsApi, cartApi, reviewsApi, type ProductOut, type ReviewOut } from '../api'
import { useAuth } from '../context/AuthContext'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<ProductOut | null>(null)
  const [reviews, setReviews] = useState<ReviewOut[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    if (!id) return
    const productId = parseInt(id)
    setLoading(true)
    Promise.all([
      productsApi.getById(productId),
      reviewsApi.listByProduct(productId),
    ])
      .then(([prod, revs]) => {
        setProduct(prod)
        setReviews(revs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setAddingToCart(true)
    setCartMessage('')
    try {
      await cartApi.addItem({ product_id: product.product_id, quantity })
      setCartMessage('Товар добавлен в корзину!')
    } catch (err) {
      setCartMessage(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setReviewError('')
    try {
      const review = await reviewsApi.create(product.product_id, { rating: reviewRating, text: reviewText || null })
      setReviews(prev => [...prev, review])
      setReviewText('')
      setReviewRating(5)
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Ошибка')
    }
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
        <p style={{ color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>Загрузка...</p>
      </main>
    )
  }

  if (!product) {
    return (
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
        <p style={{ color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>Товар не найден</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#0067B8', cursor: 'pointer', fontSize: 14, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
        ← Назад
      </button>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 400px', height: 400, backgroundColor: '#F5F8FC', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 100, color: '#C8D3E4' }}>📦</span>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>
            {product.name}
          </h1>

          <div style={{ fontSize: 36, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>
            {Number(product.price).toLocaleString('ru-RU')} ₽
          </div>

          <div style={{ fontSize: 14, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
            Единица измерения: {product.unit}
          </div>

          <div style={{ fontSize: 14, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>
            В наличии: {Number(product.stock_quantity)} {product.unit}
          </div>

          {product.description && (
            <p style={{ fontSize: 15, color: '#374151', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginBottom: 24 }}>
              {product.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #D4DCE8', background: '#fff', cursor: 'pointer', fontSize: 18 }}
              >
                −
              </button>
              <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'Inter, sans-serif', minWidth: 30, textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(Number(product.stock_quantity), q + 1))}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #D4DCE8', background: '#fff', cursor: 'pointer', fontSize: 18 }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              style={{
                height: 48,
                padding: '0 24px',
                backgroundColor: addingToCart ? '#93C5FD' : '#0067B8',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: addingToCart ? 'default' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {addingToCart ? 'Добавление...' : 'В корзину'}
            </button>
          </div>

          {cartMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 10,
              backgroundColor: cartMessage.includes('ошиб') ? '#FEF2F2' : '#F0FDF4',
              color: cartMessage.includes('ошиб') ? '#DC2626' : '#16A34A',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              marginBottom: 16,
            }}>
              {cartMessage}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
          Отзывы ({reviews.length})
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleReviewSubmit} style={{ marginBottom: 24, padding: 20, backgroundColor: '#F9FAFB', borderRadius: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>
              Оставить отзыв
            </h3>
            {reviewError && (
              <div style={{ color: '#DC2626', fontSize: 14, marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>{reviewError}</div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                Оценка:
              </label>
              <select
                value={reviewRating}
                onChange={e => setReviewRating(Number(e.target.value))}
                style={{ height: 40, padding: '0 12px', border: '1.5px solid #D4DCE8', borderRadius: 8, fontSize: 14, fontFamily: 'Inter, sans-serif' }}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Ваш отзыв..."
                rows={3}
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1.5px solid #D4DCE8',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
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
              Отправить
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>Отзывов пока нет</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map(review => (
              <div key={review.review_id} style={{ padding: 16, backgroundColor: '#FFFFFF', border: '1px solid #E8EDF4', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
                    {review.client_name}
                  </span>
                  <span style={{ fontSize: 14, color: '#F59E0B' }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                {review.review_text && (
                  <p style={{ fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                    {review.review_text}
                  </p>
                )}
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>
                  {new Date(review.review_date).toLocaleDateString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
