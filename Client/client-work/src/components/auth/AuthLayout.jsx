import { GraduationCap, Headphones, IndianRupee, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function FeatureCard({ icon: Icon, title, subtitle, tone = 'blue' }) {
    return (
        <div className="flex w-[160px] items-center gap-2.5 rounded-lg bg-white/62 px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/55 backdrop-blur">
            <div
                className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-white',
                    tone === 'green' ? 'bg-rideon-green' : 'bg-rideon-blue'
                )}
            >
                <Icon className="size-4" strokeWidth={2.25} />
            </div>

            <div className="min-w-0">
                <p className="truncate text-[11px] leading-tight font-bold text-rideon-dark">{title}</p>
                <p className="mt-0.5 truncate text-[9px] leading-tight text-slate-500">{subtitle}</p>
            </div>
        </div>
    )
}

export function EmailInput({ value, onChange }) {
    return (
        <div className="flex h-12 overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors focus-within:border-rideon-blue">
            <input
                type="email"
                inputMode="email"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter your NIT student email"
                className="min-w-0 flex-1 px-4 text-sm outline-none placeholder:text-slate-400"
                required
            />
        </div>
    )
}

function AuthTabs({ active }) {
    return (
        <div className="mx-auto mb-5 w-full max-w-[390px]">
            <div className="relative flex border-b border-blue-100">
                <Link
                    to="/auth/login"
                    className={cn(
                        'relative flex h-11 flex-1 items-center justify-center text-3xl font-semibold transition-colors duration-300',
                        active === 'login' ? 'text-rideon-blue' : 'text-slate-500 hover:text-rideon-dark'
                    )}
                >
                    Login
                </Link>
            </div>
        </div>
    )
}

function AuthTerms() {
    return (
        <div className="mx-auto mt-8 max-w-[390px] text-center text-xs leading-relaxed text-slate-500">
            By continuing, you agree to our{' '}
            <a href="/terms" className="font-medium text-rideon-blue">
                Terms & Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-medium text-rideon-blue">
                Privacy Policy
            </a>
        </div>
    )
}

function AuthVisualPanel() {
    return (
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#eaf3ff] via-[#f3f8ff] to-[#eefcf2] lg:block">
            {/* Background city skyline, faded */}
            <div
                className="absolute inset-0 bg-cover bg-bottom opacity-25"
                style={{ backgroundImage: "url('/city-skyline.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-white/70" />

            {/* Decorative rings */}
            <div className="absolute top-20 left-1/2 h-[280px] w-[280px] -translate-x-1/2 rounded-full border-[28px] border-rideon-blue/15" />
            <div className="absolute bottom-[120px] -right-[50px] h-[170px] w-[170px] rounded-full border-[24px] border-rideon-green/20" />

            {/* Logo */}
            <div className="absolute top-8 left-10 z-30">
                <img src="/favicon.png" alt="RideOn" className="h-12 w-auto" />
            </div>

            {/* Headline */}
            <div className="absolute top-28 left-10 z-30 max-w-[340px]">
                <h2 className="text-[2.15rem] leading-[1.1] font-extrabold text-rideon-dark">
                    Ride <span className="text-rideon-blue">Smart,</span>
                    <br />
                    Ride <span className="text-rideon-green">Anywhere.</span>
                </h2>
                <div className="mt-3 h-1 w-10 rounded-full bg-rideon-blue" />
                <p className="mt-3 text-sm font-medium text-slate-500">Trusted by NIT Students</p>
            </div>

            {/* Hero scooter image */}
            <img
                src="/image.png"
                alt="RideOn Scooter"
                className="absolute top-[180px] left-1/2 z-20 w-[88%] -translate-x-1/2 object-contain drop-shadow-[0_20px_32px_rgba(15,23,42,0.18)]"
            />

            {/* Feature pills row */}
            <div className="absolute bottom-8 left-1/2 z-30 flex w-[92%] -translate-x-1/2 items-center justify-between gap-2">
                <FeatureCard icon={ShieldCheck} title="Safe & Secure" subtitle="Verified Rides" />
                <FeatureCard icon={IndianRupee} title="Affordable" subtitle="Best Prices" tone="green" />
                <FeatureCard icon={Headphones} title="24/7 Support" subtitle="We're Here" />
            </div>

            {/* NIT-only badge */}
            <div className="absolute top-8 right-10 z-30 flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 shadow-sm ring-1 ring-slate-200/60 backdrop-blur">
                <GraduationCap className="size-4 text-rideon-blue" strokeWidth={2.25} />
                <span className="text-[11px] font-bold text-rideon-dark">NIT Students Only</span>
            </div>
        </div>
    )
}
export default function AuthLayout({ activeTab, children, showTabs = true, showTerms = true }) {
    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-white lg:px-8">
            {/* Background Decorations */}
            <div className="pointer-events-none fixed inset-0 hidden lg:block">
                {/* Left Half Circle */}
                <div className="absolute left-0 top-6/8 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[44px] border-rideon-green/10" />

                {/* Right Half Circle */}
                <div className="absolute right-0 top-3/8 h-[250px] w-[250px] translate-x-1/2 -translate-y-1/2 rounded-full border-[44px] border-rideon-blue/10" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center">
                <div className="min-h-dvh w-full overflow-hidden bg-white lg:h-[min(650px,calc(100dvh-48px))] lg:min-h-0 lg:max-w-[1080px] lg:rounded-2xl">
                    <div className="lg:grid lg:h-full lg:grid-cols-[49%_51%]">
                        <AuthVisualPanel />

                        <div className="relative flex min-h-dvh flex-col justify-center border border-rideon-blue/20 px-5 py-8 sm:px-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:px-16 lg:py-8">
                            <div className="mb-8 flex justify-center lg:hidden">
                                <img src="/favicon.png" alt="RideOn" className="h-20 w-auto" />
                            </div>

                            {showTabs && <AuthTabs active={activeTab} />}

                            <div className="mx-auto w-full max-w-[390px]">{children}</div>

                            {showTerms && <AuthTerms />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
