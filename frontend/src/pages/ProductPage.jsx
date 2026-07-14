import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsApi, cartApi, reviewsApi } from '../api'
import { useAuth } from '../context/AuthContext'

// Get product image: use uploaded photo if available, otherwise fallback to local mapping
const getLocalProductImage = (product) => {
  // If product has an uploaded photo, use it
  if (product.photo) {
    return product.photo
  }

  const categoryMap = {
    'Смартфоны': [
      '/catalog_photo/smartphone/Xiaomi Redmi 15 256 ГБ черный.webp',
      '/catalog_photo/smartphone/Apple iPhone 15 128 ГБ черный.webp',
      '/catalog_photo/smartphone/Apple iPhone 17 Pro 256 ГБ серебристый.webp',
      '/catalog_photo/smartphone/Samsung Galaxy S25 FE 512 ГБ черный.webp',
      '/catalog_photo/smartphone/Apple iPhone 17 256 ГБ черный.webp',
    ],
    'Ноутбуки': [
      '/catalog_photo/laptop/HUAWEI MateBook D 16 2024 MCLF-X серый.webp',
      '/catalog_photo/laptop/HONOR MagicBook X16 AMD 2025 серый.webp',
      '/catalog_photo/laptop/ASUS Vivobook S S3607VA-RP103 серый.webp',
      '/catalog_photo/laptop/ASUS TUF Gaming FA808UM-S8030 серый.webp',
      '/catalog_photo/laptop/Apple MacBook Air M4 серебристый.webp',
    ],
    'Компьютеры': [
      '/catalog_photo/pc/ARDOR GAMING NEO M171.webp',
      '/catalog_photo/pc/ARDOR GAMING NEO M279.webp',
      '/catalog_photo/pc/ARDOR GAMING NEO M299.webp',
      '/catalog_photo/pc/ARDOR GAMING NEO M276.webp',
      '/catalog_photo/pc/ARDOR GAMING NEO M256.webp',
    ],
    'Аудио': [
      '/catalog_photo/audio/Apple EarPods (Type-C) белый 2023.webp',
      '/catalog_photo/audio/Apple AirPods Pro 3 белый 2025.webp',
      '/catalog_photo/audio/Apple AirPods 4 ANC белый 2024.webp',
      '/catalog_photo/audio/Xiaomi Redmi Buds 6 Play черный 2024.webp',
      '/catalog_photo/audio/Samsung Galaxy Buds 4 Pro черный 2026.webp',
    ],
    'Умные часы': [
      '/catalog_photo/smart-watch/Apple Watch SE 3 40 mm.webp',
      '/catalog_photo/smart-watch/Xiaomi Smart Band 10.webp',
      '/catalog_photo/smart-watch/Xiaomi REDMI Watch 5 Active.webp',
      '/catalog_photo/smart-watch/Apple Watch Series 11 42 mm.webp',
      '/catalog_photo/smart-watch/Samsung Galaxy Watch8 40 mm LTE.webp',
    ],
  }
  const images = categoryMap[product.category]
  if (!images) return null
  const idx = (product.product_id - 1) % images.length
  return images[Math.min(idx, images.length - 1)]
}

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
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

  const handleReviewSubmit = async (e) => {
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

  const imageUrl = getLocalProductImage(product)
  const descriptionLines = product.description ? product.description.split('\n') : []

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#0067B8', cursor: 'pointer', fontSize: 14, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
        ← Назад
      </button>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 400px', height: 400, backgroundColor: '#F5F8FC', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 24 }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: 14, padding: 24 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D4DCE8" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <div>фото еще не добавлено</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>
            {product.name}
          </h1>

          {product.brand && (
            <div style={{ fontSize: 14, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
              Бренд: {product.brand}
            </div>
          )}

          <div style={{ fontSize: 36, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>
            {Number(product.price).toLocaleString('ru-RU')} ₽
          </div>

          <div style={{ fontSize: 14, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
            Единица измерения: {product.unit}
          </div>

          <div style={{ fontSize: 14, color: '#6C7685', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>
            В наличии: {Number(product.stock_quantity)} {product.unit}
          </div>

          {descriptionLines.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1B1F24', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
                Характеристики
              </h3>
              <div style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                padding: '16px 20px',
              }}>
                {descriptionLines.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 14,
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: 1.6,
                      padding: '6px 0',
                      borderBottom: i < descriptionLines.length - 1 ? '1px solid #E8EDF4' : 'none',
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
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