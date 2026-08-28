"use client";

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import LoginModal from "@/components/sharedComponents/modal";
import { dashboardForRole, useAuth } from '@/components/auth/AuthProvider'

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Find a Vet', href: '/vet-search' },
    { label: 'Directory', href: '/directory' },
    { label: 'Reviews', href: '/review' },
    { label: 'Blog', href: '/blog' },
    { label: 'Sponsorship', href: '/sponsorship' },
]

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
                <div className="mx-4 flex items-center justify-between gap-4 sm:mx-6 lg:justify-evenly lg:gap-8">
                    <Link href="/" className="shrink-0">
                        <picture>
                            <source media="(min-width: 1024px)" srcSet="/images/header-logo.png" />
                            <img src="/images/change-logo.png" alt="MY VET" className="h-auto w-[132px] sm:w-[150px] lg:w-[166px]" />
                        </picture>
                    </Link>

                    <div className="hidden items-center justify-center gap-12 lg:flex">
                        <nav className="flex items-center gap-12">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-white/90 text-sm font-medium hover:text-[#13b8a8] transition-colors whitespace-nowrap"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3 shrink-0">
                            {user ? (
                                <Link
                                    href={dashboardForRole(user.role)}
                                    className="px-6 py-3 text-sm font-semibold text-white bg-[#13b8a8] rounded-full hover:bg-[#0fa598] transition-colors"
                                >
                                    My account
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsLoginOpen(true)}
                                    className="px-6 py-3 text-sm font-semibold text-white bg-[#13b8a8] rounded-full hover:bg-[#0fa598] transition-colors"
                                >
                                    Login
                                </button>
                            )}
                            <Link
                                href="/register?role=vet"
                                className="px-5 py-3 text-sm font-semibold text-white bg-[#085A9E] rounded-full flex items-center gap-1.5 hover:bg-[#0a2550] transition-colors whitespace-nowrap"
                            >
                                Register Your Practice
                                <img src="/images/arrow.png" alt="" className="w-4 h-4 object-contain" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open navigation menu"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#064071] shadow-lg lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </header>

            {isMenuOpen ? (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <button
                        type="button"
                        aria-label="Close navigation overlay"
                        onClick={closeMenu}
                        className="absolute inset-0 bg-black/45"
                    />
                    <aside className="mobile-menu-sheet absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white p-5 shadow-2xl">
                        <div className="flex items-center justify-between gap-4">
                            <Link href="/" onClick={closeMenu} className="shrink-0">
                                <img src="/images/header-logo.png" alt="MY VET" className="h-auto w-[132px]" />
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
                                Register Your Practice
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

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    )
}

export default Header
