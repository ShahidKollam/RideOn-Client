import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogOut, Menu, UserCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { cn } from "@/lib/utils"

const navLinks = [
    { label: "Home", path: "/" },
    { label: "How It Works", section: "how-it-works" },
    { label: "Vehicles", section: "vehicles" },
    { label: "Pricing", section: "pricing" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", section: "contact" },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated, user, logout } = useAuth()
    const { showToast } = useToast()

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : ""

        return () => {
            document.body.style.overflow = ""
        }
    }, [mobileOpen])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        handleScroll()
        window.addEventListener("scroll", handleScroll)

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleNavigation = (link) => {
        setMobileOpen(false)

        if (link.path) {
            navigate(link.path)
            return
        }

        if (location.pathname !== "/") {
            navigate("/", {
                state: {
                    scrollTo: link.section,
                },
            })
            return
        }

        const element = document.getElementById(link.section)

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            })
        }
    }

    const isActiveLink = (link) => {
        if (link.path) {
            return location.pathname === link.path
        }

        return false
    }

    const handleLogout = async () => {
        try {
            await logout()
            setMobileOpen(false)
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
        <header
            className={cn(
                "fixed left-1/2 z-50 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isScrolled
                    ? "top-3 w-[95%] rounded-2xl bg-white/55 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-[24px]"
                    : "top-0 w-full rounded-none bg-white",
            )}
        >
            {isScrolled && (
                <>
                    <div className="pointer-events-none absolute inset-0 bg-white/10 backdrop-blur-2xl" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-[-24px] h-6 bg-gradient-to-b from-slate-900/8 to-transparent" />
                </>
            )}

            <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
                <Link
                    to="/"
                    className="shrink-0"
                    onClick={() => setMobileOpen(false)}
                >
                    <img
                        src="/logo.png"
                        alt="RIDEON"
                        className="h-24 w-auto transition-all duration-300 hover:scale-[1.04] sm:h-10 lg:h-20"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            type="button"
                            onClick={() => handleNavigation(link)}
                            className={cn(
                                "group relative text-sm font-medium text-rideon-dark transition-all duration-300 hover:text-rideon-blue",
                                isActiveLink(link) && "text-rideon-blue",
                            )}
                        >
                            {link.label}

                            <span
                                className={cn(
                                    "absolute -bottom-1.5 left-1/2 h-0.5 rounded-full bg-rideon-blue transition-all duration-300",
                                    isActiveLink(link)
                                        ? "w-full -translate-x-1/2"
                                        : "w-0 -translate-x-1/2 group-hover:w-full",
                                )}
                            />
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-2.5">
                    {isAuthenticated ? (
                        <>
                            <Button
                                variant="outline"
                                className="hidden h-9 rounded-sm border-rideon-blue px-3 text-sm font-medium text-rideon-blue transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/5 hover:shadow-md sm:inline-flex lg:h-7 lg:px-4"
                                asChild
                            >
                                <Link to="/auth/complete-profile">
                                    <UserCircle className="size-4" strokeWidth={2.25} />
                                    {user?.name || 'Profile'}
                                </Link>
                            </Button>

                            <Button
                                type="button"
                                onClick={handleLogout}
                                className="hidden h-9 rounded-sm bg-rideon-blue px-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_30px_rgba(29,140,248,0.35)] sm:inline-flex lg:h-7 lg:px-5"
                            >
                                <LogOut className="size-4" strokeWidth={2.25} />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                className="hidden h-9 rounded-sm border-rideon-blue px-4 text-sm font-medium text-rideon-blue transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/5 hover:shadow-md sm:inline-flex lg:h-7 lg:px-6"
                                asChild
                            >
                                <Link to="/auth/login">Log In</Link>
                            </Button>

                            <Button
                                className="hidden h-9 rounded-sm bg-rideon-blue px-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_30px_rgba(29,140,248,0.35)] sm:inline-flex lg:h-7 lg:px-6"
                                asChild
                            >
                                <Link to="/auth/signup">Sign Up</Link>
                            </Button>
                        </>
                    )}

                    <button
                        type="button"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((open) => !open)}
                        className="relative z-50 inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-rideon-dark shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-rideon-blue/30 hover:shadow-md active:scale-95 lg:hidden"
                    >
                        <div className="relative size-5">
                            <Menu
                                className={cn(
                                    "absolute pr-1 pb-1 inset-0 transition-all duration-300",
                                    mobileOpen
                                        ? "rotate-90 scale-0 opacity-0"
                                        : "rotate-0 scale-100 opacity-100",
                                )}
                            />

                            <X
                                className={cn(
                                    "absolute inset-0 transition-all duration-300",
                                    mobileOpen
                                        ? "rotate-0 scale-100 opacity-100"
                                        : "-rotate-90 scale-0 opacity-0",
                                )}
                            />
                        </div>
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <div
                className={cn(
                    "relative overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out lg:hidden",
                    mobileOpen
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 border-t-0 opacity-0",
                )}
            >
                <div className="px-4 py-4 sm:px-6">
                    <nav className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                type="button"
                                onClick={() => handleNavigation(link)}
                                className={cn(
                                    "rounded-xl px-3 py-3 text-left text-sm font-medium text-rideon-dark transition-all duration-300 hover:translate-x-1 hover:bg-rideon-blue/5 hover:text-rideon-blue",
                                    isActiveLink(link) &&
                                        "bg-rideon-blue/5 text-rideon-blue",
                                )}
                            >
                                {link.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-4 sm:flex-row">
                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="h-10 w-full rounded-lg border-rideon-blue text-rideon-blue transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/5 hover:shadow-md sm:flex-1"
                                    asChild
                                >
                                    <Link
                                        to="/auth/complete-profile"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <UserCircle className="size-4" strokeWidth={2.25} />
                                        Profile
                                    </Link>
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleLogout}
                                    className="h-10 w-full rounded-lg bg-rideon-blue text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_30px_rgba(29,140,248,0.35)] sm:flex-1"
                                >
                                    <LogOut className="size-4" strokeWidth={2.25} />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    className="h-10 w-full rounded-lg border-rideon-blue text-rideon-blue transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/5 hover:shadow-md sm:flex-1"
                                    asChild
                                >
                                    <Link
                                        to="/auth/login"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Log In
                                    </Link>
                                </Button>

                                <Button
                                    className="h-10 w-full rounded-lg bg-rideon-blue text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_30px_rgba(29,140,248,0.35)] sm:flex-1"
                                    asChild
                                >
                                    <Link
                                        to="/auth/signup"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
