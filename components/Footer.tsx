'use client'

import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient, ApiClientError } from '@/lib/api/client'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Find a Vet', href: '/vet-search' },
  { label: 'Directory', href: '/directory' },
  { label: 'Reviews', href: '/review' },
  { label: 'Blog', href: '/blog' },
  { label: 'Sponsorship', href: '/sponsorship' },
  { label: 'Contact', href: '/contact' },
]

const supportLinks = [
  { label: 'Terms & Conditions', href: '/terms-and-condition' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
]

const socialLinks = [
  { label: 'Facebook', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
  { label: 'X', icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
  { label: 'LinkedIn', icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><path d="M2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></> },
  { label: 'Instagram', icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1" /></> },
]

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden="true">
        <path d="M1 1L5.5 5.5L1 10" stroke="#13b8a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Link href={href} className="text-sm text-white transition-colors hover:text-[#13b8a8]">
        {children}
      </Link>
    </li>
  )
}

const Footer = () => {
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [subscribing, setSubscribing] = useState(false)

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubscribing(true)
    setNewsletterStatus(null)

    try {
      await apiClient('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) }, { authenticated: false })
      setEmail('')
      setNewsletterStatus({ type: 'success', message: 'Thanks - you are subscribed.' })
    } catch (caught) {
      setNewsletterStatus({ type: 'error', message: caught instanceof ApiClientError ? caught.message : 'Subscription could not be completed.' })
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="bg-[#0d2e5e] font-sans text-white">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <div className="grid gap-5 rounded-2xl bg-[#13b8a8] p-5 sm:p-6 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <h2 className="font-heading text-[28px] font-extrabold leading-tight sm:text-[32px] lg:text-[40px]">
              Stay Updated
            </h2>
            <p className="mt-2 text-sm sm:text-base">
              Get tips, updates, and new veterinary listings in your area.
            </p>
          </div>

          <form onSubmit={(event) => void subscribe(event)} className="relative grid min-w-0 gap-2 rounded-xl bg-white p-3 shadow-lg sm:grid-cols-[1fr_auto]">
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="min-w-0 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 outline-none placeholder:text-gray-400"
            />
            <button disabled={subscribing} className="rounded-md bg-[#0d2e5e] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {subscribing ? 'Subscribing...' : 'Subscribe Now'}
            </button>
            {newsletterStatus ? (
              <p role={newsletterStatus.type === 'error' ? 'alert' : 'status'} className={`text-xs sm:absolute sm:left-3 sm:top-full sm:mt-1 ${newsletterStatus.type === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
                {newsletterStatus.message}
              </p>
            ) : null}
          </form>
        </div>

        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr] lg:gap-12 lg:py-14">
          <div>
            <Image src="/images/footer-logo.png" alt="My Vet Logo" width={90} height={70} className="h-auto w-[90px] object-contain" />
            <p className="mt-4 max-w-md text-sm leading-7 text-white/90 sm:text-base">
              My Vet is a trusted UK veterinary directory helping animal owners find the right care through transparent reviews and verified practices.
            </p>

            <div className="mt-6 flex gap-2.5">
              {socialLinks.map((social) => (
                <a key={social.label} href="#" aria-label={social.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-[#13b8a8] hover:text-[#13b8a8]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 font-heading text-lg font-bold">Quick Links</h4>
            <ul className="grid gap-3">
              {quickLinks.map((link) => <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>)}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-heading text-lg font-bold">Support</h4>
            <ul className="grid gap-3">
              {supportLinks.map((link) => <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>)}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-heading text-lg font-bold">Get in Touch</h4>
            <ul className="grid gap-4 text-sm">
              <li>
                <a href="mailto:info@myvet.co.uk" className="break-words text-white hover:text-[#13b8a8]">info@myvet.co.uk</a>
              </li>
              <li className="leading-6 text-white/90">123 Street, London Ltd.</li>
              <li>
                <a href="tel:012345676789" className="text-white hover:text-[#13b8a8]">0 12345676789</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/50 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; 2026 <Link href="/" className="text-[#13b8a8]">My Vet</Link>. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/privacy-policy" className="hover:text-[#13b8a8]">Privacy Policy</Link>
            <span className="text-white/60">&middot;</span>
            <Link href="/terms-and-condition" className="hover:text-[#13b8a8]">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
