import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PRODUCTS = [
  {
    id: 1,
    name: 'Xiaomi Redmi 15 256 ГБ черный',
    price: 15999,
    oldPrice: 18999,
    badge: '-16%',
    badgeColor: '#E8453C',
    image: '/catalog_photo/smartphone/Xiaomi Redmi 15 256 ГБ черный.webp',
    alt: 'Xiaomi Redmi 15',
  },
  {
    id: 2,
    name: 'Apple iPhone 15 128 ГБ черный',
    price: 57999,
    oldPrice: null,
    badge: 'Новинка',
    badgeColor: '#0067B8',
    image: '/catalog_photo/smartphone/Apple iPhone 15 128 ГБ черный.webp',
    alt: 'Apple iPhone 15',
  },
  {
    id: 3,
    name: 'Apple MacBook Air M4 серебристый',
    price: 105999,
    oldPrice: null,
    badge: 'Хит',
    badgeColor: '#F57C00',
    image: '/catalog_photo/laptop/Apple MacBook Air M4 серебристый.webp',
    alt: 'Apple MacBook Air M4',
  },
  {
    id: 4,
    name: 'Apple AirPods Pro 3 белый 2025',
    price: 23999,
    oldPrice: 27999,
    badge: '-14%',
    badgeColor: '#E8453C',
    image: '/catalog_photo/audio/Apple AirPods Pro 3 белый 2025.webp',
    alt: 'Apple AirPods Pro 3',
  },
  {
    id: 5,
    name: 'ARDOR GAMING NEO M256',
    price: 100999,
    oldPrice: null,
    badge: 'Хит',
    badgeColor: '#F57C00',
    image: '/catalog_photo/pc/ARDOR GAMING NEO M256.webp',
    alt: 'ARDOR GAMING NEO M256',
  },
  {
    id: 6,
    name: 'Apple Watch Series 11 42 mm',
    price: 34799,
    oldPrice: 39999,
    badge: '-13%',
    badgeColor: '#E8453C',
    image: '/catalog_photo/smart-watch/Apple Watch Series 11 42 mm.webp',
    alt: 'Apple Watch Series 11',
  },
]

export default function PopularProducts() {
  const [start, setStart] = useState(0)
  const visible = 5

  const canPrev = start > 0
  const canNext = start + visible < PRODUCTS.length

  return (
    <section style={{ marginTop: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1B1F24',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
            letterSpacing: '-0.5px',
          }}
        >
          Популярные товары
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SeeAllLink />
          <CarouselNav canPrev={canPrev} canNext={canNext} onPrev={() => setStart(s => s - 1)} onNext={() => setStart(s => s + 1)} />
        </div>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${PRODUCTS.length}, 250px)`,
            gap: 16,
            transform: `translateX(calc(-${start} * (250px + 16px)))`,
            transition: 'transform 0.35s ease',
          }}
        >
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
        {Array.from({ length: PRODUCTS.length - visible + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setStart(i)}
            style={{
              width: i === start ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              backgroundColor: i === start ? '#0067B8' : '#C8D3E4',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </section>
  )
}

function SeeAllLink() {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); navigate('/catalog') }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 14,
        fontWeight: 500,
        color: hovered ? '#005299' : '#0067B8',
        textDecoration: 'none',
        fontFamily: 'Inter, sans-serif',
        transition: 'color 0.2s',
      }}
    >
      Смотреть все →
    </a>
  )
}

function CarouselNav({ canPrev, canNext, onPrev, onNext }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['prev', 'next']).map((dir) => {
        const can = dir === 'prev' ? canPrev : canNext
        const [hov, setHov] = useState(false)
        return (
          <button
            key={dir}
            onClick={dir === 'prev' ? onPrev : onNext}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            disabled={!can}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `1px solid ${can ? '#E8EDF4' : '#F0F4FA'}`,
              backgroundColor: can && hov ? '#0067B8' : '#FFFFFF',
              color: !can ? '#C8D3E4' : hov ? '#fff' : '#1B1F24',
              cursor: can ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s, color 0.2s',
            }}
          >
            {dir === 'prev' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const [cartHovered, setCartHovered] = useState(false)
  const navigate = useNavigate()

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/products/${product.id}`)}
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${hovered ? '#C8D9EE' : '#E8EDF4'}`,
        borderRadius: 18,
        width: 250,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,103,184,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div style={{ height: 180, backgroundColor: '#F5F8FC', position: 'relative', overflow: 'hidden', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={product.image}
          alt={product.alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: hovered ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        />
        {product.badge && (
          <span
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: product.badgeColor,
              color: '#fff',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 8px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {product.badge}
          </span>
        )}
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#1B1F24',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4,
            marginBottom: 10,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 40,
          }}
        >
          {product.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            {product.oldPrice && (
              <div
                style={{
                  fontSize: 13,
                  color: '#6C7685',
                  textDecoration: 'line-through',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: 2,
                }}
              >
                {product.oldPrice.toLocaleString('ru-RU')} ₽
              </div>
            )}
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#1B1F24',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {product.price.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          <button
            onMouseEnter={() => setCartHovered(true)}
            onMouseLeave={() => setCartHovered(false)}
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`) }}
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