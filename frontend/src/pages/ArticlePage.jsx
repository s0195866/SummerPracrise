import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const ARTICLES_DATA = [
  {
    id: 1,
    date: '5 июля 2026',
    title: 'Обзор Samsung Galaxy S24 Ultra: камера, которая меняет всё',
    image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=1200&h=600&fit=crop&auto=format',
    alt: 'Samsung Galaxy S24 Ultra',
    content: `Samsung Galaxy S24 Ultra — это не просто очередной флагман, а настоящий прорыв в мире мобильной фотографии. Устройство оснащено 200-мегапиксельной основной камерой, которая позволяет получать невероятно детализированные снимки даже в условиях низкой освещённости.

Новый процессор Qualcomm Snapdragon 8 Gen 3 обеспечивает высокую производительность в играх и приложениях. 12 ГБ оперативной памяти гарантируют плавную многозадачность, а аккумулятор ёмкостью 5000 мАч позволяет работать без подзарядки до двух дней.

Дисплей Dynamic AMOLED 2X с диагональю 6.8 дюйма и частотой обновления 120 Гц дарит яркие и насыщенные цвета. Встроенный стилус S Pen делает управление устройством ещё более удобным.

В целом, Samsung Galaxy S24 Ultra — это идеальный выбор для тех, кто хочет получить лучшее из мира мобильных технологий.`,
  },
  {
    id: 2,
    date: '28 июня 2026',
    title: 'Топ-5 ноутбуков для дизайнеров и разработчиков в 2026 году',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=600&fit=crop&auto=format',
    alt: 'Ноутбуки для работы',
    content: `Выбор ноутбука для профессиональной работы — задача непростая. Мы подготовили подборку лучших моделей 2026 года для дизайнеров и разработчиков.

1. Apple MacBook Pro 16" M3 Max — идеальный выбор для видеомонтажёров и 3D-дизайнеров. Процессор M3 Max с 40 ядрами GPU справляется с самыми сложными задачами.

2. Dell XPS 16 — мощный ультрабук с дисплеем OLED 4K, отличной цветопередачей и тонким корпусом.

3. ASUS ProArt Studiobook 16 — ноутбук, сертифицированный для работы с цветом, оснащённый дискретной графикой NVIDIA RTX.

4. Lenovo ThinkPad X1 Carbon Gen 12 — лёгкий и надёжный ноутбук для веб-разработчиков с отличной клавиатурой.

5. Microsoft Surface Laptop 6 — стильный и производительный ноутбук для повседневной работы.

Каждая из этих моделей заслуживает внимания в зависимости от ваших задач и бюджета.`,
  },
  {
    id: 3,
    date: '20 июня 2026',
    title: 'Умный дом: с чего начать и какие устройства выбрать первыми',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop&auto=format',
    alt: 'Умный дом',
    content: `Умный дом перестал быть фантастикой — сегодня это доступная реальность. Рассказываем, с чего начать создание своей экосистемы.

Первое устройство, которое стоит приобрести — это умная колонка с голосовым ассистентом. Она станет центром управления всеми остальными гаджетами.

Далее рекомендуем обратить внимание на умные лампочки — они не только создают уютную атмосферу, но и помогают экономить электроэнергию.

Умные розетки позволяют управлять любыми электроприборами удалённо через смартфон. Можно настроить таймеры и сценарии работы.

Камеры видеонаблюдения и датчики движения обеспечат безопасность вашего дома, а умные термостаты помогут поддерживать комфортную температуру.

Начинать лучше всего с небольшого набора устройств от одного производителя — это обеспечит совместимость и простоту настройки.`,
  },
]

export default function ArticlePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const article = ARTICLES_DATA.find(a => a.id === parseInt(id))

  if (!article) {
    return (
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
        <p style={{ color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>Статья не найдена</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#0067B8', cursor: 'pointer', fontSize: 14, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
        ← Назад
      </button>

      <article style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          fontSize: 12,
          color: '#6C7685',
          fontFamily: 'Inter, sans-serif',
          marginBottom: 12,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {article.date}
        </div>
        <h1 style={{
          fontSize: 36,
          fontWeight: 700,
          color: '#1B1F24',
          fontFamily: 'Inter, sans-serif',
          marginBottom: 32,
          lineHeight: 1.2,
        }}>
          {article.title}
        </h1>
        <div style={{
          width: '100%',
          height: 400,
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 32,
          backgroundColor: '#E8EDF4',
        }}>
          <img
            src={article.image}
            alt={article.alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{
          fontSize: 16,
          color: '#374151',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.8,
          whiteSpace: 'pre-line',
        }}>
          {article.content}
        </div>
      </article>
    </main>
  )
}