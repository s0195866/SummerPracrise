import { useState, useEffect } from 'react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: hovered ? '#005299' : '#0067B8',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,103,184,0.3)',
        transition: 'background-color 0.2s, transform 0.2s',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        zIndex: 200,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 15V5M5 10l5-5 5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
