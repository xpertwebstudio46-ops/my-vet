"use client";

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import LoginModal from "@/components/sharedComponents/modal";
import { dashboardForRole, useAuth } from '@/components/auth/AuthProvider'

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Find a Vet', href: '/vet-search' },
    { label: 'Directory', href: '/directory' },
    { label: 'Price & Comparison', href: '/price-comparison' },
    { label: 'Reviews', href: '/review' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Blog', href: '/blog' },
    { label: 'Sponsorship', href: '/sponsorship' },
]

function HeaderLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const searchParams = useSearchParams()
    const loginRequest = searchParams.get('login')
    const [dismissedLoginRequest, setDismissedLoginRequest] = useState<string | null>(null)
    const requestedLoginOpen = (loginRequest === 'vet' || loginRequest === 'pet-owner') && dismissedLoginRequest !== loginRequest
    return <LoginModal key={loginRequest ?? 'header-login'} initialRole={loginRequest === 'vet' ? 'VET' : 'PET_OWNER'} isOpen={isOpen || requestedLoginOpen} onClose={() => { onClose(); setDismissedLoginRequest(loginRequest) }} />
}

const Header = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth()

    const closeMenu = () => setIsMenuOpen(false)
    const openLogin = () => {
        closeMenu()
        setIsLoginOpen(true)
    }

    return (
        <>
            <header className="w-full bg-transparent">
                <div className="site-header-row mx-4  flex items-center justify-between gap-4 sm:mx-6">
                    <Link href="/" className="shrink-0 ">
                        <picture>
                            <img src="/images/maker.png" alt="MY VET" className="h-auto overflow-hidden large-scrren-image w-[132px]  " />
                        </picture>
                    </Link>

                    <div className="site-header-desktop hidden min-w-0 flex-1 items-center justify-between gap-6 2xl:gap-10">
                        <nav className="flex flex-1 items-center justify-between gap-4 2xl:gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="site-header-nav-link text-white/90 text-sm font-medium hover:text-[#13b8a8] transition-colors whitespace-nowrap"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex shrink-0 items-center gap-4">
                            {user ? (
                                <Link
                                    href={dashboardForRole(user.role)}
                                    className="site-header-action px-6 py-3 text-sm font-semibold text-white bg-[#13b8a8] rounded-full hover:bg-[#0fa598] transition-colors"
                                >
                                    My account
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsLoginOpen(true)}
                                    className="site-header-action px-6 py-3 text-sm font-semibold text-white bg-[#13b8a8] rounded-full hover:bg-[#0fa598] transition-colors"
                                >
                                    Login
                                </button>
                            )}
                            <Link
                                href="/register?role=vet"
                                className="site-header-action px-5 py-3 text-sm font-semibold text-white bg-[#085A9E] rounded-full flex items-center gap-1.5 hover:bg-[#0a2550] transition-colors whitespace-nowrap"
                            >
                                Register today
                                <img src="/images/arrow.png" alt="" className="w-4 h-4 object-contain" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open navigation menu"
                        className="site-header-menu-trigger inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#064071] shadow-lg"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </header>

            {isMenuOpen ? (
                <div className="site-header-mobile-overlay fixed inset-0 z-[100]">
                    <button
                        type="button"
                        aria-label="Close navigation overlay"
                        onClick={closeMenu}
                        className="absolute inset-0 bg-black/45"
                    />
                    <aside className="mobile-menu-sheet absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white p-5 shadow-2xl">
                        <div className="flex items-center justify-between gap-4">
                            <Link href="/" onClick={closeMenu} className="shrink-0">
                                <img src="/images/long.jpeg" alt="MY VET" className="h-auto w-[132px]" />
                            </Link>
                            <button
                                type="button"
                                onClick={closeMenu}
                                aria-label="Close navigation menu"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#064071] text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <nav className="mt-8 grid gap-2">
                            {navLinks.map((link, index) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={closeMenu}
                                    className="mobile-menu-item rounded-xl px-4 py-3 text-base font-semibold text-[#064071] hover:bg-[#EEF7F5] hover:text-[#13b8a8]"
                                    style={{ animationDelay: `${120 + index * 45}ms` }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto grid gap-3 pt-8">
                            {user ? (
                                <Link
                                    href={dashboardForRole(user.role)}
                                    onClick={closeMenu}
                                    className="mobile-menu-item inline-flex h-12 items-center justify-center rounded-full bg-[#13b8a8] px-5 text-sm font-semibold text-white"
                                    style={{ animationDelay: `${120 + navLinks.length * 45}ms` }}
                                >
                                    My account
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={openLogin}
                                    className="mobile-menu-item inline-flex h-12 items-center justify-center rounded-full bg-[#13b8a8] px-5 text-sm font-semibold text-white"
                                    style={{ animationDelay: `${120 + navLinks.length * 45}ms` }}
                                >
                                    Login
                                </button>
                            )}
                            <Link
                                href="/register?role=vet"
                                onClick={closeMenu}
                                className="mobile-menu-item inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#085A9E] px-5 text-sm font-semibold text-white"
                                style={{ animationDelay: `${165 + navLinks.length * 45}ms` }}
                            >
                                Register today
                                <img src="/images/arrow.png" alt="" className="h-4 w-4 object-contain" aria-hidden="true" />
                            </Link>
                        </div>
                    </aside>
                </div>
            ) : null}

            <style>{`
                @keyframes mobileMenuSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes mobileMenuItemFadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(18px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .mobile-menu-sheet {
                    animation: mobileMenuSlideIn 260ms ease-out both;
                }

                .mobile-menu-item {
                    opacity: 0;
                    animation: mobileMenuItemFadeUp 320ms ease-out both;
                }
            `}</style>

            <Suspense fallback={null}><HeaderLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} /></Suspense>
        </>
    )
}

export default Header
