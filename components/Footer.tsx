'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Find a Vet', href: '/vet-search' },
  { label: 'Directory', href: '/directory' },
  { label: 'Reviews', href: '/review' },
  { label: 'Sponsorship', href: '/sponsorship' },
  { label: 'Contact', href: '/contact' },
]

const supportLinks = [
  { label: 'Terms & Conditions', href: '/terms-and-condition' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
]

const Footer = () => {
  const [email, setEmail] = useState('')

  return (
    <footer style={{ background: '#0d2e5e', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      {/* Newsletter Section */}
      <div style={{ padding: '50px 60px 0' }}>
        <div
          style={{
            background: 'linear-gradient(130deg, #13b8a8 60%, #0fa89a 100%)',
            borderRadius: '18px',
            padding: '24px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative paw top-left */}
        

          {/* Decorative paw right */}
        

          {/* Left text */}
          <div style={{ zIndex: 1 }}>
            <h2
              style={{
                color: '#ffffff',
                fontFamily: 'var(--font-manrope), sans-serif',
                fontSize: '32px',
                fontWeight: 800,
                marginBottom: '8px',
              }}
            >
              Stay Updated
            </h2>
            <p className='font-sans text-[16px] font-normal text-white'>
              Get tips, updates, and new veterinary listings in your area.
            </p>
          </div>

          {/* Email form */}
          <div className="relative z-10 flex items-center gap-3 bg-white rounded-xl px-3 py-3 min-w-[620px] shadow-lg">
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-600 outline-none placeholder:text-gray-400 bg-white"
            />
            <button className="bg-[#0d2e5e] text-white text-sm font-semibold px-6 py-3 rounded-md whitespace-nowrap cursor-pointer">
              Subcribe Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div
        style={{
          padding: '60px 60px 40px',
          display: 'grid',
          gridTemplateColumns: '2fr 1.1fr 1.1fr 1.1fr',
          gap: '60px',
        }}
      >
        {/* Column 1: Logo + Description + Socials */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Image
              src="/images/footer-logo.png"
              alt="My Vet Logo"
              width={90}
              height={70}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <p
           className='font-sans text-[16px] text-white font-normal'
            style={{
             
            }}
          >
            My Vet is a trusted UK veterinary directory helping animal owners find the right care through
            transparent reviews and verified practices.
          </p>

          {/* Social Icons */}
          <div className='pt-6' style={{ display: 'flex', gap: '10px' }}>
            {/* Facebook */}
            <a
              href="#"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* X / Twitter */}
            <a
              href="#"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="#"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="#"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4
            style={{
              color: '#ffffff',
              fontFamily: 'var(--font-manrope), sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '22px',
            }}
          >
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {quickLinks.map((link) => (
              <li key={link.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="7" height="11" viewBox="0 0 7 11" fill="none">
                  <path d="M1 1L5.5 5.5L1 10" stroke="#13b8a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <Link
                  href={link.href}
                  style={{
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h4
            style={{
              color: '#ffffff',
              fontFamily: 'var(--font-manrope), sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '22px',
            }}
          >
            Support
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {supportLinks.map((link) => (
              <li key={link.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="7" height="11" viewBox="0 0 7 11" fill="none">
                  <path d="M1 1L5.5 5.5L1 10" stroke="#13b8a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <Link
                  href={link.href}
                  style={{
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Get in Touch */}
        <div>
          <h4
            style={{
              color: '#ffffff',
              fontFamily: 'var(--font-manrope), sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '22px',
            }}
          >
            Get in Touch
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#13b8a8" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <polyline points="2,4 12,13 22,4" />
                </svg>
              </div>
              <a href="mailto:info@myvet.co.uk" style={{ color: '#ffffff', fontSize: '14px', textDecoration: 'none' }}>
                info@myvet.co.uk
              </a>
            </li>
            {/* Address */}
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#13b8a8" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <span style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.5' }}>
                123 Street, London Ltd.
              </span>
            </li>
            {/* Phone */}
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#13b8a8" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z" />
                </svg>
              </div>
              <a href="tel:012345676789" style={{ color: '#ffffff', fontSize: '14px', textDecoration: 'none' }}>
                0 12345676789
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Paw prints decoration - footer right side */}
      <div style={{ position: 'relative' }}>
        <svg
          style={{ position: 'absolute', right: 60, top: -200, opacity: 0.05, pointerEvents: 'none' }}
          width="180"
          height="180"
          viewBox="0 0 60 60"
          fill="white"
        >
          <ellipse cx="12" cy="10" rx="5" ry="7" />
          <ellipse cx="24" cy="6" rx="5" ry="7" />
          <ellipse cx="36" cy="6" rx="5" ry="7" />
          <ellipse cx="48" cy="10" rx="5" ry="7" />
          <path d="M8 28 Q15 18 30 20 Q45 18 52 28 Q56 40 48 50 Q40 58 30 56 Q20 58 12 50 Q4 40 8 28Z" />
        </svg>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: '1px solid white',
          margin: '0 60px',
          padding: '12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p className="text-white text-[18px] m-0 font-sans">
          © 2026{' '}
          <Link href="/" style={{ color: '#13b8a8', textDecoration: 'none' }}>
            My Vet
          </Link>
          . All Rights Reserved.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/privacy-policy" style={{ color: 'white', fontSize: '16px', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>·</span>
          <Link href="/terms-and-condition" style={{ color: 'white', fontSize: '16px', textDecoration: 'none' }}>
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
