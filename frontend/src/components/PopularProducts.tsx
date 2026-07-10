import { useState } from 'react'

const PRODUCTS = [
  {
    id: 1,
    name: 'Samsung Galaxy S24 Ultra 256 ГБ',
    price: 89990,
    oldPrice: 109990,
    badge: '-18%',
    badgeColor: '#E8453C',
    image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&h=400&fit=crop&auto=format',
    alt: 'Samsung Galaxy S24 Ultra',
  },
  {
    id: 2,
    name: 'Apple MacBook Air M3 13" 8/256 ГБ',
    price: 119990,
    oldPrice: null,
    badge: 'Новинка',
    badgeColor: '#0067B8',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&auto=format',
    alt: 'Apple MacBook Air M3',
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5 Беспроводные наушники',
    price: 24990,
    oldPrice: 34990,
    badge: 'Хит',
    badgeColor: '#F57C00',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format',
    alt: 'Sony WH-1000XM5',
  },
  {
    id: 4,
    name: 'Apple Watch Series 9 45 мм GPS',
    price: 39990,
    oldPrice: null,
    badge: 'Новинка',
    badgeColor: '#0067B8',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop&auto=format',
    alt: 'Apple Watch Series 9',
  },
  {
    id: 5,
    name: 'Xiaomi 14T Pro 256 ГБ Titanium',
    price: 69990,
    oldPrice: 79990,
    badge: '-13%',
    badgeColor: '#E8453C',
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop&auto=format',
    alt: 'Xiaomi 14T Pro',
  },
  {
    id: 6,
    name: 'ASUS ROG Zephyrus G14 Ryzen 9',
    price: 149990,
    oldPrice: 169990,
    badge: 'Хит',
    badgeColor: '#F57C00',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop&auto=format',
    alt: 'ASUS ROG Zephyrus G14',
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

      {/* Dots */}
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
  return (
    <a
      href="#"
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

function CarouselNav({
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['prev', 'next'] as const).map((dir) => {
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

function ProductCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  const [hovered, setHovered] = useState(false)
  const [cartHovered, setCartHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
      {/* Image area */}
      <div style={{ height: 200, backgroundColor: '#F5F8FC', position: 'relative', overflow: 'hidden' }}>
        <img
          src={product.image}
          alt={product.alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
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

      {/* Info */}
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
            onClick={(e) => e.stopPropagation()}
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
