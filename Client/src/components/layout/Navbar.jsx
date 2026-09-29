import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    Bike,
    CalendarDays,
    ChevronDown,
    LogOut,
    Menu,
    UserCircle,
    X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const navLinks = [
    { label: 'Home', path: '/' },
    // { label: 'How It Works', section: 'how-it-works' },
    { label: 'Vehicles', path: '/vehicles' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Team', path: '/about' },
    { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    const profileMenuRef = useRef(null)

    const navigate = useNavigate()
    const location = useLocation()

    const { isAuthenticated, user, logout } = useAuth()
    const { showToast } = useToast()

    /* ============================================================
       LOCK BODY WHEN MOBILE MENU IS OPEN
    ============================================================ */

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : ''

        return () => {
            document.body.style.overflow = ''
        }
    }, [mobileOpen])

    /* ============================================================
       SCROLL STATE
    ============================================================ */

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        handleScroll()

        window.addEventListener('scroll', handleScroll, {
            passive: true,
        })

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    /* ============================================================
       CLOSE PROFILE MENU
    ============================================================ */

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (!profileMenuRef.current?.contains(event.target)) {
                setProfileOpen(false)
            }
        }

        document.addEventListener('mousedown', closeOnOutsideClick)

        return () => {
            document.removeEventListener(
                'mousedown',
                closeOnOutsideClick,
            )
        }
    }, [])

    /* ============================================================
       CLOSE MOBILE MENU ON ROUTE CHANGE
    ============================================================ */

    useEffect(() => {
        setMobileOpen(false)
        setProfileOpen(false)
    }, [location.pathname])

    /* ============================================================
       NAVIGATION
    ============================================================ */

    const handleNavigation = (link) => {
        setMobileOpen(false)
        setProfileOpen(false)

        if (link.path) {
            navigate(link.path)
            return
        }

        if (location.pathname !== '/') {
            navigate('/', {
                state: {
                    scrollTo: link.section,
                },
            })

            return
        }

        const element = document.getElementById(link.section)

        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        }
    }

    /* ============================================================
       ACTIVE LINK
    ============================================================ */

    const isActiveLink = (link) => {
        if (link.path) {
            return location.pathname === link.path
        }

        return false
    }

    /* ============================================================
       LOGOUT
    ============================================================ */

    const handleLogout = async () => {
        try {
            await logout()

            setMobileOpen(false)
            setProfileOpen(false)

            showToast({
                type: 'success',
                title: 'Logged out',
                description: 'Your RideOn session has ended.',
            })

            navigate('/')
        } catch {
            showToast({
                type: 'error',
                title: 'Logout failed',
                description: 'Please try again.',
            })
        }
    }

    return (
        <>
            {/* ========================================================
                NAVBAR
            ========================================================= */}

            <header
                className={cn(
                    `
                    fixed
                    left-1/2
                    z-[100]
                    -translate-x-1/2
                    transition-all
                    duration-500
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    `,
                    mobileOpen
                        ? `
                            top-0
                            w-full
                            rounded-none
                            bg-white
                            shadow-[0_10px_30px_rgba(15,23,42,0.08)]
                        `
                        : isScrolled
                          ? `
                            top-2
                            w-[calc(100%-1rem)]
                            max-w-[1400px]
                            rounded-2xl
                            border
                            border-white/70
                            bg-white/80
                            shadow-[0_14px_45px_rgba(15,23,42,0.10)]
                            backdrop-blur-2xl
                            sm:top-3
                            sm:w-[95%]
                        `
                          : `
                            top-0
                            w-full
                            rounded-none
                            bg-white
                        `,
                )}
            >
                {/* ====================================================
                    SCROLL GLOW
                ===================================================== */}

                {isScrolled && !mobileOpen && (
                    <>
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                            <div className="absolute -left-20 top-0 h-20 w-40 rounded-full bg-rideon-blue/[0.04] blur-2xl" />

                            <div className="absolute -right-20 top-0 h-20 w-40 rounded-full bg-rideon-green/[0.04] blur-2xl" />
                        </div>

                        <div className="pointer-events-none absolute inset-x-4 bottom-[-14px] h-5 rounded-full bg-slate-900/[0.04] blur-md" />
                    </>
                )}

                {/* ====================================================
                    MAIN BAR
                ===================================================== */}

                <div
                    className="
                        relative
                        z-50
                        mx-auto
                        flex
                        max-w-7xl
                        items-center
                        justify-between
                        gap-3
                        px-4
                        py-2.5
                        sm:px-6
                        sm:py-3
                        lg:px-8
                    "
                >
                    {/* =================================================
                        LOGO
                    ================================================== */}

                    <Link
                        to="/"
                        onClick={() => {
                            setMobileOpen(false)
                            setProfileOpen(false)
                        }}
                        className="
                            group
                            relative
                            shrink-0
                            outline-none
                        "
                    >
                        {/* Logo glow */}

                        <span
                            className="
                                pointer-events-none
                                absolute
                                -inset-2
                                rounded-full
                                bg-rideon-blue/[0.08]
                                opacity-0
                                blur-lg
                                transition-opacity
                                duration-500
                                group-hover:opacity-100
                            "
                        />

                        <img
                            src="/logo.png"
                            alt="RideOn"
                            className="
                                relative
                                h-9
                                w-auto
                                max-w-[132px]
                                object-contain
                                object-left
                                transition-all
                                duration-500
                                ease-out
                                group-hover:scale-[1.045]
                                sm:h-10
                                sm:max-w-[150px]
                                lg:h-11
                                lg:max-w-[168px]
                            "
                        />
                    </Link>

                    {/* =================================================
                        DESKTOP NAVIGATION
                    ================================================== */}

                    <nav
                        className="
                            hidden
                            items-center
                            gap-1
                            lg:flex
                            xl:gap-1.5
                        "
                    >
                        {navLinks.map((link) => {
                            const active = isActiveLink(link)

                            return (
                                <button
                                    key={link.label}
                                    type="button"
                                    onClick={() =>
                                        handleNavigation(link)
                                    }
                                    className={cn(
                                        `
                                        group
                                        relative
                                        rounded-xl
                                        px-3
                                        py-2
                                        text-[13px]
                                        font-semibold
                                        transition-all
                                        duration-300
                                        xl:px-3.5
                                        `,
                                        active
                                            ? 'text-rideon-blue'
                                            : 'text-rideon-dark hover:text-rideon-blue',
                                    )}
                                >
                                    {/* Hover background */}

                                    <span
                                        className={cn(
                                            `
                                            absolute
                                            inset-0
                                            -z-10
                                            rounded-xl
                                            bg-rideon-blue/[0.05]
                                            opacity-0
                                            transition-all
                                            duration-300
                                            group-hover:scale-100
                                            group-hover:opacity-100
                                            `,
                                            active &&
                                                'scale-100 opacity-100',
                                        )}
                                    />

                                    {link.label}

                                    {/* Active indicator */}

                                    <span
                                        className={cn(
                                            `
                                            absolute
                                            bottom-0.5
                                            left-1/2
                                            h-0.5
                                            -translate-x-1/2
                                            rounded-full
                                            bg-rideon-blue
                                            transition-all
                                            duration-300
                                            `,
                                            active
                                                ? 'w-5'
                                                : 'w-0 group-hover:w-4',
                                        )}
                                    />
                                </button>
                            )
                        })}
                    </nav>

                    {/* =================================================
                        RIGHT ACTIONS
                    ================================================== */}

                    <div className="flex items-center gap-2 sm:gap-2.5">
                        {isAuthenticated ? (
                            <>
                                {/* =====================================
                                    BOOK BUTTON
                                ====================================== */}

                                <Button
                                    asChild
                                    className="
                                        group
                                        hidden
                                        h-9
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-rideon-blue
                                        px-4
                                        text-xs
                                        font-bold
                                        text-white
                                        shadow-[0_6px_18px_rgba(29,140,248,0.24)]
                                        transition-all
                                        duration-300
                                        hover:-translate-y-0.5
                                        hover:bg-rideon-blue/90
                                        hover:shadow-[0_10px_26px_rgba(29,140,248,0.32)]
                                        active:scale-[0.97]
                                        sm:inline-flex
                                        lg:h-9
                                    "
                                >
                                    <Link
                                        to="/booking"
                                        onClick={() =>
                                            setProfileOpen(false)
                                        }
                                    >
                                        <Bike
                                            className="
                                                size-4
                                                transition-transform
                                                duration-300
                                                group-hover:rotate-[-8deg]
                                            "
                                            strokeWidth={2.2}
                                        />

                                        <span>Book</span>
                                    </Link>
                                </Button>

                                {/* =====================================
                                    PROFILE
                                ====================================== */}

                                <div
                                    ref={profileMenuRef}
                                    className="
                                        relative
                                        hidden
                                        sm:block
                                    "
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setProfileOpen(
                                                (open) => !open,
                                            )
                                        }
                                        aria-expanded={profileOpen}
                                        className="
                                            group
                                            inline-flex
                                            h-9
                                            items-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white/80
                                            px-3
                                            text-xs
                                            font-bold
                                            text-rideon-dark
                                            shadow-sm
                                            transition-all
                                            duration-300
                                            hover:border-rideon-blue/30
                                            hover:bg-blue-50/30
                                            hover:text-rideon-blue
                                            active:scale-[0.98]
                                            lg:h-9
                                        "
                                    >
                                        <UserCircle
                                            className="
                                                size-4
                                                text-rideon-blue
                                                transition-transform
                                                duration-300
                                                group-hover:scale-110
                                            "
                                        />

                                        <span className="max-w-[100px] truncate">
                                            {user?.name || 'Profile'}
                                        </span>

                                        <ChevronDown
                                            className={cn(
                                                `
                                                size-3.5
                                                text-slate-400
                                                transition-transform
                                                duration-300
                                                `,
                                                profileOpen &&
                                                    'rotate-180 text-rideon-blue',
                                            )}
                                        />
                                    </button>

                                    {/* Profile dropdown */}

                                    <div
                                        className={cn(
                                            `
                                            absolute
                                            right-0
                                            top-full
                                            z-[120]
                                            mt-2
                                            w-52
                                            origin-top-right
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-slate-100
                                            bg-white
                                            p-1.5
                                            shadow-[0_20px_50px_rgba(15,23,42,0.14)]
                                            transition-all
                                            duration-200
                                            `,
                                            profileOpen
                                                ? 'translate-y-0 scale-100 opacity-100'
                                                : 'pointer-events-none -translate-y-2 scale-95 opacity-0',
                                        )}
                                    >
                                        <DropdownLink
                                            to="/bookings"
                                            icon={CalendarDays}
                                            label="My bookings"
                                            onClick={() =>
                                                setProfileOpen(false)
                                            }
                                        />

                                        <DropdownLink
                                            to="/profile"
                                            icon={UserCircle}
                                            label="Profile"
                                            onClick={() =>
                                                setProfileOpen(false)
                                            }
                                        />

                                        <div className="my-1 h-px bg-slate-100" />

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="
                                                group
                                                flex
                                                w-full
                                                items-center
                                                gap-2.5
                                                rounded-xl
                                                px-3
                                                py-2.5
                                                text-left
                                                text-xs
                                                font-semibold
                                                text-red-500
                                                transition-all
                                                duration-200
                                                hover:bg-red-50
                                            "
                                        >
                                            <LogOut
                                                className="
                                                    size-4
                                                    transition-transform
                                                    duration-200
                                                    group-hover:-translate-x-0.5
                                                "
                                            />

                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* LOGIN */}

                                <Button
                                    variant="outline"
                                    asChild
                                    className="
                                        hidden
                                        h-9
                                        rounded-xl
                                        border-rideon-blue/30
                                        bg-white/80
                                        px-4
                                        text-xs
                                        font-bold
                                        text-rideon-blue
                                        transition-all
                                        duration-300
                                        hover:-translate-y-0.5
                                        hover:border-rideon-blue
                                        hover:bg-blue-50/40
                                        sm:inline-flex
                                    "
                                >
                                    <Link to="/auth/login">
                                        Log In
                                    </Link>
                                </Button>

                                {/* SIGN UP */}

                                <Button
                                    asChild
                                    className="
                                        hidden
                                        h-9
                                        rounded-xl
                                        bg-rideon-blue
                                        px-4
                                        text-xs
                                        font-bold
                                        text-white
                                        shadow-[0_6px_18px_rgba(29,140,248,0.20)]
                                        transition-all
                                        duration-300
                                        hover:-translate-y-0.5
                                        hover:bg-rideon-blue/90
                                        hover:shadow-[0_10px_26px_rgba(29,140,248,0.30)]
                                        sm:inline-flex
                                    "
                                >
                                    <Link to="/auth/signup">
                                        Sign Up
                                    </Link>
                                </Button>
                            </>
                        )}

                        {/* =================================================
                            MOBILE MENU BUTTON
                        ================================================== */}

                        <button
                            type="button"
                            aria-label={
                                mobileOpen
                                    ? 'Close menu'
                                    : 'Open menu'
                            }
                            aria-expanded={mobileOpen}
                            onClick={() =>
                                setMobileOpen((open) => !open)
                            }
                            className="
                                group
                                relative
                                z-[110]
                                inline-flex
                                size-10
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                text-rideon-dark
                                shadow-[0_5px_16px_rgba(15,23,42,0.06)]
                                transition-all
                                duration-300
                                hover:border-rideon-blue/30
                                hover:text-rideon-blue
                                hover:shadow-[0_8px_22px_rgba(29,140,248,0.10)]
                                active:scale-90
                                lg:hidden
                            "
                        >
                            {/* Button glow */}

                            <span
                                className={cn(
                                    `
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    rounded-xl
                                    bg-rideon-blue/[0.06]
                                    transition-all
                                    duration-300
                                    `,
                                    mobileOpen
                                        ? 'scale-100 opacity-100'
                                        : 'scale-75 opacity-0',
                                )}
                            />

                            <div className="relative size-5">
                                <Menu
                                    className={cn(
                                        `
                                        absolute
                                        inset-0
                                        size-5
                                        transition-all
                                        duration-300
                                        ease-out
                                        `,
                                        mobileOpen
                                            ? 'rotate-90 scale-0 opacity-0'
                                            : 'rotate-0 scale-100 opacity-100',
                                    )}
                                />

                                <X
                                    className={cn(
                                        `
                                        absolute
                                        inset-0
                                        size-5
                                        transition-all
                                        duration-300
                                        ease-out
                                        `,
                                        mobileOpen
                                            ? 'rotate-0 scale-100 opacity-100'
                                            : '-rotate-90 scale-0 opacity-0',
                                    )}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* ========================================================
                    MOBILE OVERLAY
                ========================================================= */}

                <div
                    className={cn(
                        `
                        fixed
                        inset-0
                        z-40
                        bg-slate-950/25
                        backdrop-blur-[3px]
                        transition-all
                        duration-500
                        lg:hidden
                        `,
                        mobileOpen
                            ? 'visible opacity-100'
                            : 'invisible opacity-0',
                    )}
                    onClick={() => setMobileOpen(false)}
                />

                {/* ========================================================
                    MOBILE MENU
                ========================================================= */}

                <div
                    className={cn(
                        `
                        absolute
                        left-0
                        right-0
                        top-full
                        z-[105]
                        overflow-hidden
                        border-t
                        border-slate-100
                        bg-white
                        shadow-[0_22px_45px_rgba(15,23,42,0.12)]
                        transition-all
                        duration-500
                        ease-[cubic-bezier(0.22,1,0.36,1)]
                        lg:hidden
                        `,
                        mobileOpen
                            ? 'max-h-[650px] translate-y-0 opacity-100'
                            : 'pointer-events-none max-h-0 -translate-y-3 opacity-0',
                    )}
                >
                    <div className="max-h-[calc(100vh-72px)] overflow-y-auto px-4 pb-5 pt-4 sm:px-6">

                        {/* Mobile menu header */}

                        <div
                            className={cn(
                                `
                                mb-3
                                flex
                                items-center
                                justify-between
                                rounded-2xl
                                border
                                border-slate-100
                                bg-[#f8fafc]
                                px-4
                                py-3
                                transition-all
                                duration-500
                                `,
                                mobileOpen
                                    ? 'translate-y-0 opacity-100'
                                    : '-translate-y-3 opacity-0',
                            )}
                        >
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-rideon-green">
                                    RideOn
                                </p>

                                <p className="mt-0.5 text-sm font-extrabold text-rideon-dark">
                                    Campus rides, made easy.
                                </p>
                            </div>

                            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-rideon-blue">
                                <Bike
                                    className="size-4"
                                    strokeWidth={2}
                                />
                            </div>
                        </div>

                        {/* =================================================
                            MOBILE NAV
                        ================================================== */}

                        <nav className="space-y-1">
                            {navLinks.map((link, index) => {
                                const active = isActiveLink(link)

                                return (
                                    <button
                                        key={link.label}
                                        type="button"
                                        onClick={() =>
                                            handleNavigation(link)
                                        }
                                        style={{
                                            transitionDelay:
                                                mobileOpen
                                                    ? `${index * 45}ms`
                                                    : '0ms',
                                        }}
                                        className={cn(
                                            `
                                            group
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            rounded-2xl
                                            px-4
                                            py-3.5
                                            text-left
                                            text-sm
                                            font-bold
                                            transition-all
                                            duration-300
                                            `,
                                            mobileOpen
                                                ? 'translate-x-0 opacity-100'
                                                : '-translate-x-4 opacity-0',
                                            active
                                                ? 'bg-blue-50 text-rideon-blue'
                                                : 'text-rideon-dark hover:bg-slate-50 hover:text-rideon-blue',
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    `
                                                    size-1.5
                                                    rounded-full
                                                    transition-all
                                                    duration-300
                                                    `,
                                                    active
                                                        ? 'bg-rideon-blue shadow-[0_0_0_4px_rgba(29,140,248,0.10)]'
                                                        : 'bg-slate-300 group-hover:bg-rideon-blue',
                                                )}
                                            />

                                            {link.label}
                                        </span>

                                        <ChevronDown
                                            className="
                                                size-4
                                                -rotate-90
                                                text-slate-300
                                                transition-all
                                                duration-300
                                                group-hover:translate-x-0.5
                                                group-hover:text-rideon-blue
                                            "
                                        />
                                    </button>
                                )
                            })}
                        </nav>

                        {/* =================================================
                            MOBILE ACTIONS
                        ================================================== */}

                        <div
                            className={cn(
                                `
                                mt-4
                                border-t
                                border-slate-100
                                pt-4
                                transition-all
                                duration-500
                                `,
                                mobileOpen
                                    ? 'translate-y-0 opacity-100'
                                    : 'translate-y-3 opacity-0',
                            )}
                        >
                            {isAuthenticated ? (
                                <div className="grid grid-cols-2 gap-2.5">

                                    {/* Book */}

                                    <Button
                                        asChild
                                        className="
                                            group
                                            col-span-2
                                            h-11
                                            rounded-xl
                                            bg-rideon-blue
                                            text-xs
                                            font-bold
                                            text-white
                                            shadow-[0_8px_20px_rgba(29,140,248,0.22)]
                                            transition-all
                                            duration-300
                                            active:scale-[0.98]
                                        "
                                    >
                                        <Link
                                            to="/booking"
                                            onClick={() =>
                                                setMobileOpen(false)
                                            }
                                        >
                                            <Bike
                                                className="
                                                    mr-2
                                                    size-4
                                                    transition-transform
                                                    duration-300
                                                    group-hover:rotate-[-8deg]
                                                "
                                            />

                                            Book Your Ride

                                            <span className="ml-1 text-white/60">
                                                →
                                            </span>
                                        </Link>
                                    </Button>

                                    {/* Bookings */}

                                    <Button
                                        variant="outline"
                                        asChild
                                        className="
                                            h-10
                                            rounded-xl
                                            border-slate-200
                                            bg-white
                                            text-xs
                                            font-bold
                                            text-rideon-dark
                                            transition-all
                                            duration-300
                                            hover:border-rideon-blue/30
                                            hover:bg-blue-50/40
                                            hover:text-rideon-blue
                                        "
                                    >
                                        <Link
                                            to="/bookings"
                                            onClick={() =>
                                                setMobileOpen(false)
                                            }
                                        >
                                            <CalendarDays className="mr-1.5 size-4" />
                                            My Bookings
                                        </Link>
                                    </Button>

                                    {/* Profile */}

                                    <Button
                                        variant="outline"
                                        asChild
                                        className="
                                            h-10
                                            rounded-xl
                                            border-slate-200
                                            bg-white
                                            text-xs
                                            font-bold
                                            text-rideon-dark
                                            transition-all
                                            duration-300
                                            hover:border-rideon-blue/30
                                            hover:bg-blue-50/40
                                            hover:text-rideon-blue
                                        "
                                    >
                                        <Link
                                            to="/profile"
                                            onClick={() =>
                                                setMobileOpen(false)
                                            }
                                        >
                                            <UserCircle className="mr-1.5 size-4" />
                                            Profile
                                        </Link>
                                    </Button>

                                    {/* Logout */}

                                    <Button
                                        type="button"
                                        onClick={handleLogout}
                                        variant="outline"
                                        className="
                                            col-span-2
                                            h-10
                                            rounded-xl
                                            border-red-100
                                            bg-red-50/40
                                            text-xs
                                            font-bold
                                            text-red-500
                                            transition-all
                                            duration-300
                                            hover:bg-red-50
                                        "
                                    >
                                        <LogOut className="mr-1.5 size-4" />
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2.5">

                                    {/* Login */}

                                    <Button
                                        variant="outline"
                                        asChild
                                        className="
                                            h-11
                                            rounded-xl
                                            border-rideon-blue/25
                                            bg-white
                                            text-xs
                                            font-bold
                                            text-rideon-blue
                                            transition-all
                                            duration-300
                                            hover:border-rideon-blue
                                            hover:bg-blue-50/40
                                        "
                                    >
                                        <Link
                                            to="/auth/login"
                                            onClick={() =>
                                                setMobileOpen(false)
                                            }
                                        >
                                            Log In
                                        </Link>
                                    </Button>

                                    {/* Signup */}

                                    <Button
                                        asChild
                                        className="
                                            h-11
                                            rounded-xl
                                            bg-rideon-blue
                                            text-xs
                                            font-bold
                                            text-white
                                            shadow-[0_7px_18px_rgba(29,140,248,0.22)]
                                            transition-all
                                            duration-300
                                            hover:bg-rideon-blue/90
                                        "
                                    >
                                        <Link
                                            to="/auth/signup"
                                            onClick={() =>
                                                setMobileOpen(false)
                                            }
                                        >
                                            Sign Up
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Mobile bottom note */}

                        <div
                            className="
                                mt-4
                                flex
                                items-center
                                justify-center
                                gap-1.5
                                text-[10px]
                                font-medium
                                text-slate-400
                            "
                        >
                            <span className="size-1.5 rounded-full bg-rideon-green" />

                            Made for NIT Calicut students
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}

/* ================================================================
   DROPDOWN LINK
================================================================ */

function DropdownLink({
    to,
    icon: Icon,
    label,
    onClick,
}) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="
                group
                flex
                items-center
                gap-2.5
                rounded-xl
                px-3
                py-2.5
                text-xs
                font-semibold
                text-slate-600
                transition-all
                duration-200
                hover:bg-blue-50
                hover:text-rideon-blue
            "
        >
            <Icon
                className="
                    size-4
                    text-slate-400
                    transition-colors
                    duration-200
                    group-hover:text-rideon-blue
                "
            />

            {label}
        </Link>
    )
}