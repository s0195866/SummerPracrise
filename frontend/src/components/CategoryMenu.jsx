import { useState } from 'react'

const CATEGORIES = [
  'Смартфоны',
  'Ноутбуки',
  'Планшеты',
  'Компьютеры',
  'Аксессуары',
  'Аудио',
  'Умный дом',
  'Акции',
  'Бренды',
]

export default function CategoryMenu() {
  const [active, setActive] = useState('Смартфоны')

  return (
    <nav
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #EEF2F6',
        height: 56,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 32px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          overflowX: 'auto',
        }}
      >
        {CATEGORIES.map((cat) => (
          <CategoryItem
            key={cat}
            label={cat}
            active={active === cat}
            onClick={() => setActive(cat)}
          />
        ))}
      </div>
    </nav>
  )
}

function CategoryItem({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  const highlighted = active || hovered

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0 14px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        color: highlighted ? '#0067B8' : '#1B1F24',
        borderBottom: `2px solid ${highlighted ? '#0067B8' : 'transparent'}`,
        transition: 'color 0.2s, border-color 0.2s, font-weight 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}