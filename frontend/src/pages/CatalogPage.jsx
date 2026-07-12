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

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const [cartHovered, setCartHovered] = useState(false)
  const [adding, setAdding] = useState(false)
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
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const productImages = {
    1: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&h=400&fit=crop&auto=format',
    2: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&auto=format',
    3: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format',
    4: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop&auto=format',
    5: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop&auto=format',
    6: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop&auto=format',
    7: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&auto=format',
    8: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&auto=format',
    9: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop&auto=format',
    10: 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&h=400&fit=crop&auto=format',
    11: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop&auto=format',
    12: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format',
  }

  const imageUrl = productImages[product.product_id] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&auto=format'

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
      <div style={{ height: 200, backgroundColor: '#F5F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
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
            disabled={adding}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1.5px solid ${cartHovered ? '#0067B8' : '#E8EDF4'}`,
              backgroundColor: cartHovered ? '#0067B8' : '#fff',
              color: cartHovered ? '#fff' : '#0067B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              transform: cartHovered ? 'scale(1.08)' : 'scale(1)',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 1h2.5l1.6 8h8l2-5.5H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7.5" cy="15" r="1.5" fill="currentColor" />
              <circle cx="13.5" cy="15" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}