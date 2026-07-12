import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'ASUS', 'Sony', 'Lenovo', 'Dell']

export default function Brands() {
  return (
    <section style={{ marginTop: 64, marginBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
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
          Популярные бренды
        </h2>
        <SeeAllLink />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        {BRANDS.map((brand) => (
          <BrandLogo key={brand} name={brand} />
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

function BrandLogo({ name }) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/catalog?brand=${encodeURIComponent(name)}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        padding: '14px 28px',
        borderRadius: 12,
        transition: 'background-color 0.2s',
        backgroundColor: hovered ? '#F0F5FB' : 'transparent',
      }}
    >
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          color: hovered ? '#1B1F24' : '#A0ABBE',
          letterSpacing: name === 'Apple' ? '-0.5px' : '0px',
          transition: 'color 0.25s',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
    </div>
  )
}