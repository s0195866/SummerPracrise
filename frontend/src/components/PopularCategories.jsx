import { useState } from 'react'

const CATEGORIES = [
  {
    name: 'Смартфоны',
    from: 'от 8 990 ₽',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop&auto=format',
    alt: 'Смартфоны',
  },
  {
    name: 'Ноутбуки',
    from: 'от 29 990 ₽',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&auto=format',
    alt: 'Ноутбуки',
  },
  {
    name: 'Аудио',
    from: 'от 1 490 ₽',
    image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&h=300&fit=crop&auto=format',
    alt: 'Наушники и аудиотехника',
  },
  {
    name: 'Умные часы',
    from: 'от 5 990 ₽',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&auto=format',
    alt: 'Умные часы',
  },
  {
    name: 'Компьютеры',
    from: 'от 39 990 ₽',
    image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop&auto=format',
    alt: 'Компьютеры и комплектующие',
  },
]

export default function PopularCategories() {
  return (
    <section style={{ marginTop: 64 }}>
      <SectionHeader title="Популярные категории" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          marginTop: 24,
        }}
      >
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.name} {...cat} />
        ))}
      </div>
    </section>
  )
}

function SectionHeader({ title }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        {title}
      </h2>
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
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        Смотреть все →
      </a>
    </div>
  )
}

function CategoryCard({ name, from, image, alt }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
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
      <div style={{ height: 160, backgroundColor: '#F0F4FA', overflow: 'hidden' }}>
        <img
          src={image}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>
      <div style={{ padding: '16px 16px 14px' }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1B1F24',
            fontFamily: 'Inter, sans-serif',
            marginBottom: 4,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#6C7685',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {from}
        </div>
      </div>
      {/* Arrow button */}
      <button
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          width: 30,
          height: 30,
          borderRadius: '50%',
          backgroundColor: hovered ? '#0067B8' : '#EEF4FB',
          color: hovered ? '#fff' : '#0067B8',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s, color 0.2s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}