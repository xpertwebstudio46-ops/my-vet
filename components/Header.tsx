"use client";

import Link from 'next/link'
import { useState } from 'react'
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
    const { user } = useAuth()

    return (
        <>
        <header className="w-full bg-transparent">
            <div className=" mx-auto  mx-6 flex items-center justify-evenly  gap-8">

                {/* Logo — shaped container: white bg + dark navy diagonal swoosh */}
                <Link href="/" className="shrink-0">
                    <div className="relative left-0" >
                        <img src="/images/header-logo.png" alt="" className="h-auto w-[166px]" />
                    </div>
                </Link>

                {/* Navigation */}
                <div className="flex justify-center  items-center gap-12">
                <nav className="hidden lg:flex items-center gap-12">
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

                {/* Action Buttons */}
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
                        href="/register-practice"
                        className="px-5 py-3 text-sm font-semibold text-white bg-[#085A9E] rounded-full flex items-center gap-1.5 hover:bg-[#0a2550] transition-colors whitespace-nowrap"
                    >
                        Register Your Practice
                        <img src="/images/arrow.png" alt="" className="w-4 h-4 object-contain" aria-hidden="true" />
                    </Link>
                </div>
                </div>

            </div>
        </header>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    )
}

export default Header
