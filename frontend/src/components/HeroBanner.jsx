import { useState } from 'react'

const SLIDES = [
  {
    title: 'Мы выбираем лучшее',
    subtitle: 'Современные устройства для работы, развлечений и повседневной жизни.',
    cta: 'Перейти в каталог',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&h=470&fit=crop&auto=format',
    imageAlt: 'MacBook Pro на рабочем столе',
  },
  {
    title: 'Смартфоны нового\nпоколения',
    subtitle: 'Флагманы и доступные модели от ведущих мировых брендов.',
    cta: 'Смотреть смартфоны',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&h=470&fit=crop&auto=format',
    imageAlt: 'Смартфон на светлом фоне',
  },
  {
    title: 'Звук без\nкомпромиссов',
    subtitle: 'Беспроводные наушники и акустика для истинных ценителей качества.',
    cta: 'Смотреть аудио',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=470&fit=crop&auto=format',
    imageAlt: 'Беспроводные наушники',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length)
  const slide = SLIDES[current]

  return (
    <div style={{ marginTop: 24, position: 'relative' }}>
      <div
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #EEF6FF 0%, #F5F9FF 40%, #E8F0FA 100%)',
          minHeight: 470,
          display: 'flex',
          alignItems: 'stretch',
          position: 'relative',
        }}
      >
        {/* Left: text */}
        <div
          style={{
            flex: 1,
            padding: '64px 56px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#1B1F24',
              lineHeight: 1.12,
              margin: 0,
              marginBottom: 20,
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'pre-line',
              letterSpacing: '-1px',
            }}
          >
            {slide.title}
          </h1>
          <p
            style={{
              fontSize: 18,
              color: '#6C7685',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: 36,
              fontFamily: 'Inter, sans-serif',
              maxWidth: 380,
            }}
          >
            {slide.subtitle}
          </p>
          <CtaButton label={slide.cta} />
        </div>

        {/* Right: image */}
        <div
          style={{
            flex: '0 0 50%',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={slide.image}
            alt={slide.imageAlt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transform: hovered ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.4s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, #EEF6FF 0%, transparent 20%)',
            }}
          />
        </div>

        {/* Prev/Next buttons */}
        <NavButton direction="prev" onClick={prev} />
        <NavButton direction="next" onClick={next} />
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              backgroundColor: i === current ? '#0067B8' : '#C8D3E4',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function CtaButton({ label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 220,
        height: 56,
        backgroundColor: hovered ? '#005299' : '#0067B8',
        color: '#fff',
        border: 'none',
        borderRadius: 14,
        fontSize: 16,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        letterSpacing: '0.2px',
      }}
    >
      {label}
    </button>
  )
}

function NavButton({ direction, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [direction === 'prev' ? 'left' : 'right']: 20,
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: hovered ? '#0067B8' : '#FFFFFF',
        color: hovered ? '#fff' : '#1B1F24',
        border: '1px solid #E8EDF4',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'background-color 0.2s, color 0.2s',
      }}
    >
      {direction === 'prev' ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}