import { useState } from 'react'

const ITEMS = [
  {
    icon: <TruckIcon />,
    title: 'Быстрая доставка',
    desc: 'Курьером или в пункт выдачи за 1–2 дня по всей России',
  },
  {
    icon: <ShieldIcon />,
    title: 'Официальная гарантия',
    desc: 'Все товары сертифицированы и имеют заводскую гарантию',
  },
  {
    icon: <RefundIcon />,
    title: 'Лёгкий возврат',
    desc: 'Возврат и обмен в течение 30 дней без лишних вопросов',
  },
  {
    icon: <PriceIcon />,
    title: 'Выгодные цены',
    desc: 'Честные цены и регулярные акции на популярные товары',
  },
]

export default function Advantages() {
  return (
    <div
      style={{
        marginTop: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}
    >
      {ITEMS.map((item, i) => (
        <AdvantageCard key={i} {...item} />
      ))}
    </div>
  )
}

function AdvantageCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${hovered ? '#C8D9EE' : '#E8EDF4'}`,
        borderRadius: 18,
        padding: '24px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 6px 24px rgba(0,103,184,0.08)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{ color: '#0067B8', flexShrink: 0 }}>{icon}</div>
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1B1F24',
            fontFamily: 'Inter, sans-serif',
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#6C7685',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  )
}

function TruckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M2 6h18v14H2V6z" stroke="#0067B8" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 10h5l4 6v4h-9V10z" stroke="#0067B8" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8" cy="22" r="2.5" stroke="#0067B8" strokeWidth="1.6" />
      <circle cx="24" cy="22" r="2.5" stroke="#0067B8" strokeWidth="1.6" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3L4 8v8c0 7 6 11.5 12 13 6-1.5 12-6 12-13V8L16 3z" stroke="#0067B8" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 16l4 4 8-8" stroke="#0067B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RefundIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M8 12H4V8" stroke="#0067B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12A12 12 0 1 1 6 20" stroke="#0067B8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 10v6l4 2" stroke="#0067B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PriceIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3v26M10 8h9a4 4 0 0 1 0 8H10M10 16h10a4 4 0 0 1 0 8H10" stroke="#0067B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
