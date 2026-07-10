import { useState } from 'react'

const ARTICLES = [
  {
    id: 1,
    date: '5 июля 2026',
    title: 'Обзор Samsung Galaxy S24 Ultra: камера, которая меняет всё',
    image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600&h=340&fit=crop&auto=format',
    alt: 'Samsung Galaxy S24 Ultra',
  },
  {
    id: 2,
    date: '28 июня 2026',
    title: 'Топ-5 ноутбуков для дизайнеров и разработчиков в 2026 году',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=340&fit=crop&auto=format',
    alt: 'Ноутбуки для работы',
  },
  {
    id: 3,
    date: '20 июня 2026',
    title: 'Умный дом: с чего начать и какие устройства выбрать первыми',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=340&fit=crop&auto=format',
    alt: 'Умный дом',
  },
]

export default function NewsArticles() {
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
          Новости и статьи
        </h2>
        <SeeAllLink />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {ARTICLES.map((a) => (
          <ArticleCard key={a.id} article={a} />
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

function ArticleCard({ article }: { article: (typeof ARTICLES)[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 16px 40px rgba(0,0,0,0.1)'
          : '0 2px 16px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ height: 200, backgroundColor: '#E8EDF4', overflow: 'hidden' }}>
        <img
          src={article.image}
          alt={article.alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>
      <div style={{ padding: '20px 22px 22px' }}>
        <div
          style={{
            fontSize: 12,
            color: '#6C7685',
            fontFamily: 'Inter, sans-serif',
            marginBottom: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {article.date}
        </div>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#1B1F24',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
            marginBottom: 16,
            lineHeight: 1.45,
          }}
        >
          {article.title}
        </h3>
        <ReadMore />
      </div>
    </div>
  )
}

function ReadMore() {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: hovered ? '#005299' : '#0067B8',
        textDecoration: 'none',
        fontFamily: 'Inter, sans-serif',
        transition: 'color 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      Читать статью →
    </a>
  )
}
