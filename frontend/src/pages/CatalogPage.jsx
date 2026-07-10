import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../api'

export default function CatalogPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    productsApi.list({ limit: 50, search: search || undefined })
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search])

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1F24', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
        Каталог товаров
      </h1>

      <div style={{ marginBottom: 24, maxWidth: 400 }}>
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={search}
          onChange={e => setSearch(e.target.value)}
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

  return (
    <Link
      to={`/products/${product.product_id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${hovered ? '#C8D9EE' : '#E8EDF4'}`,
        borderRadius: 18,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,103,184,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ height: 200, backgroundColor: '#F5F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48, color: '#C8D3E4' }}>📦</span>
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
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
          {Number(product.price).toLocaleString('ru-RU')} ₽
        </div>
        <div style={{ fontSize: 12, color: '#6C7685', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
          В наличии: {Number(product.stock_quantity)} {product.unit}
        </div>
      </div>
    </Link>
  )
}