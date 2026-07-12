import { useState } from 'react'

const CATALOG_LINKS = ['Смартфоны', 'Ноутбуки', 'Компьютеры', 'Аксессуары', 'Аудио', 'Умный дом']

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #EEF2F6' }}>
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '56px 32px 0',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1.2fr',
            gap: 64,
            paddingBottom: 48,
          }}
        >
          {/* Left: brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img src="/favicon.svg" alt="ST" style={{ width: 40, height: 40, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1B1F24', letterSpacing: '0.5px' }}>
                  SIGMA-TECH
                </div>
                <div style={{ fontSize: 11, color: '#6C7685' }}>Техника для жизни</div>
              </div>
            </div>
            <p
              style={{
                fontSize: 14,
                color: '#6C7685',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
                margin: 0,
                marginBottom: 24,
                maxWidth: 320,
              }}
            >
              Sigma-Tech — ваш надежный магазин современной техники и аксессуаров.
              Качество, сервис и выгодные цены для каждого.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <SocialIcon label="VK">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8.67 11.5c-4.17 0-6.55-2.87-6.67-7.5h2.09c.08 3.44 1.58 4.9 2.77 5.19V4H9v3.2c1.17-.13 2.4-1.47 2.82-3.2h2.09c-.33 2.13-1.67 3.47-2.63 4.03.96.47 2.5 1.63 3.1 3.47h-2.3c-.47-1.47-1.63-2.61-3.08-2.75V11.5H8.67z" fill="currentColor" />
                </svg>
              </SocialIcon>
              <SocialIcon label="TG">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.86 2.31L1.63 6.87c-.83.32-.82 1.02.03 1.27l3.14.98 1.22 3.73c.17.5.78.67 1.15.32l1.75-1.6 3.43 2.52c.6.42 1.37.16 1.57-.56l2.3-9.02c.26-.97-.4-1.54-1.36-1.2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </SocialIcon>
              <SocialIcon label="YT">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Center: catalog */}
          <div>
            <h4
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#1B1F24',
                fontFamily: 'Inter, sans-serif',
                margin: 0,
                marginBottom: 18,
              }}
            >
              Каталог
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CATALOG_LINKS.map((link) => (
                <li key={link}>
                  <FooterLink label={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Right: contacts */}
          <div>
            <h4
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#1B1F24',
                fontFamily: 'Inter, sans-serif',
                margin: 0,
                marginBottom: 18,
              }}
            >
              Контакты
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ContactItem icon={<PhoneIcon />}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
                  8 (800) 123-45-67
                </div>
                <div style={{ fontSize: 12, color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>
                  Ежедневно 9:00–21:00
                </div>
              </ContactItem>
              <ContactItem icon={<EmailIcon />}>
                <div style={{ fontSize: 14, color: '#1B1F24', fontFamily: 'Inter, sans-serif' }}>
                  info@sigma-tech.ru
                </div>
              </ContactItem>
              <ContactItem icon={<PinIcon />}>
                <div style={{ fontSize: 14, color: '#1B1F24', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                  г. Москва,<br />ул. Технопарк, 1
                </div>
              </ContactItem>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #EEF2F6',
            padding: '18px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 13, color: '#6C7685', fontFamily: 'Inter, sans-serif' }}>
            © 2026 Sigma-Tech. Все права защищены.
          </span>
          <div style={{ display: 'flex', gap: 24 }}>
            <FooterLink label="Политика конфиденциальности" />
            <FooterLink label="Пользовательское соглашение" />
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 14,
        color: hovered ? '#0067B8' : '#6C7685',
        textDecoration: 'none',
        fontFamily: 'Inter, sans-serif',
        transition: 'color 0.2s',
      }}
    >
      {label}
    </a>
  )
}

function SocialIcon({ children, label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={label}
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: `1px solid ${hovered ? '#0067B8' : '#E8EDF4'}`,
        backgroundColor: hovered ? '#0067B8' : '#F8FAFD',
        color: hovered ? '#fff' : '#6C7685',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  )
}

function ContactItem({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ color: '#0067B8', marginTop: 2, flexShrink: 0 }}>{icon}</div>
      <div>{children}</div>
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 9 9 11.5 11.25 12.25L12.5 10.5 16 12v3c0 1.1-1.9 3-10-5S.9 3.1 2 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 5l8 5 8-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1a6 6 0 0 1 6 6c0 4-6 10-6 10S3 11 3 7a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}