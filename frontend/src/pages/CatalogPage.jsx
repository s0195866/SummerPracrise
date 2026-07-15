import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { productsApi, cartApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function CatalogPage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const categoryParam = searchParams.get('category')
  const brandParam = searchParams.get('brand')
  const searchParam = searchParams.get('search')

  useEffect(() => {
    if (searchParam) {
      setSearch(searchParam)
    }
  }, [searchParam])

  useEffect(() => {
    setLoading(true)
    const params = { limit: 50 }
    if (search || searchParam) params.search = search || searchParam
    if (categoryParam) params.category = categoryParam
    if (brandParam) params.brand = brandParam
    productsApi.list(params)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, categoryParam, brandParam, searchParam])

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
        Каталог товаров
      </h1>

      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: 300,
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
        {(categoryParam || brandParam) && (
          <Link
            to="/catalog"
            style={{
              height: 48,
              padding: '0 16px',
              backgroundColor: '#EEF4FB',
              border: '1px solid #C8D9EE',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              color: '#0067B8',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              textDecoration: 'none',
            }}
          >
            ✕ Сбросить фильтры
          </Link>
        )}
      </div>

      {(categoryParam || brandParam) && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categoryParam && (
            <span style={{
              padding: '6px 12px',
              backgroundColor: '#EEF4FB',
              borderRadius: 8,
              fontSize: 13,
              color: '#0067B8',
              fontFamily: 'Inter, sans-serif',
            }}>
              Категория: {categoryParam}
            </span>
          )}
          {brandParam && (
            <span style={{
              padding: '6px 12px',
              backgroundColor: '#EEF4FB',
              borderRadius: 8,
              fontSize: 13,
              color: '#0067B8',
              fontFamily: 'Inter, sans-serif',
            }}>
              Бренд: {brandParam}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>Загрузка...</p>
      ) : products.length === 0 ? (
        <p style={{ color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>Товары не найдены</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {products.map(product => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}

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
  if (!images) return null // will show placeholder
  const idx = images.length > 0 ? (product.product_id - 1) % images.length : 0
  return images[Math.min(idx, images.length - 1)]
}

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const [cartHovered, setCartHovered] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await cartApi.addItem({ product_id: product.product_id, quantity: 1 })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const imageUrl = getLocalProductImage(product)

  return (
    <div
      onClick={() => navigate(`/products/${product.product_id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${hovered ? '#C8D9EE' : '#E8EDF4'}`,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,103,184,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      <div style={{ height: 180, backgroundColor: '#F5F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 8 }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: hovered ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: 13, padding: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4DCE8" strokeWidth="1.5" style={{ marginBottom: 8 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <div>фото еще не добавлено</div>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          color: '#1B1F24',
          fontFamily: 'Inter, sans-serif',
          marginBottom: 10,
          minHeight: 40,
        }}>
          {product.name}
        </div>
        {product.brand && (
          <div style={{ fontSize: 12, color: '#6C7685', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
            {product.brand}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
              {Number(product.price).toLocaleString('ru-RU')} ₽
            </div>
            <div style={{ fontSize: 12, color: '#6C7685', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
              В наличии: {Number(product.stock_quantity)} {product.unit}
            </div>
          </div>
          <button
            onMouseEnter={() => setCartHovered(true)}
            onMouseLeave={() => setCartHovered(false)}
            onClick={handleAddToCart}
            disabled={adding || added}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1.5px solid ${added ? '#16A34A' : cartHovered ? '#0067B8' : '#E8EDF4'}`,
              backgroundColor: added ? '#16A34A' : cartHovered ? '#0067B8' : '#fff',
              color: added ? '#fff' : cartHovered ? '#fff' : '#0067B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              transform: cartHovered ? 'scale(1.08)' : 'scale(1)',
              flexShrink: 0,
            }}
          >
            {added ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1 1h2.5l1.6 8h8l2-5.5H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7.5" cy="15" r="1.5" fill="currentColor" />
                <circle cx="13.5" cy="15" r="1.5" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}