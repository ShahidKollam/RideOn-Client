import { Facebook, Headphones, IndianRupee, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function FeatureCard({ icon: Icon, title, subtitle, tone = 'blue' }) {
    return (
        <div className="flex w-[160px] items-center gap-2.5 rounded-lg bg-white/62 px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/55 backdrop-blur">
            <div
                className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-white',
                    tone === 'green' ? 'bg-rideon-green' : 'bg-rideon-blue',
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

export function PhoneInput({ value, onChange }) {
    return (
        <div className="flex h-12 overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors focus-within:border-rideon-blue">
            <button
                type="button"
                className="flex w-[130px] shrink-0 items-center justify-center gap-2 border-r border-slate-200 text-sm font-semibold text-rideon-dark"
                aria-label="Selected country code India plus ninety one"
            >
                <span className="text-lg leading-none">{'\uD83C\uDDEE\uD83C\uDDF3'}</span>
                <span>+91</span>
                <span className="text-slate-500">v</span>
            </button>

            <input
                type="tel"
                inputMode="numeric"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter your mobile number"
                className="min-w-0 flex-1 px-4 text-sm outline-none placeholder:text-slate-400"
                required
            />
        </div>
    )
}

export function SocialButton({ provider }) {
    return (
        <button
            type="button"
            className="flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-rideon-dark transition-all duration-200 hover:border-rideon-blue/40 hover:bg-slate-50"
        >
            {provider === 'Google' ? (
                <span className="text-xl font-bold text-[#4285F4]">G</span>
            ) : (
                <Facebook className="size-5 fill-rideon-blue text-rideon-blue" />
            )}
            {provider}
        </button>
    )
}

export function Divider() {
    return (
        <div className="my-8 flex items-center gap-6 text-xs text-slate-500">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or continue with</span>
            <div className="h-px flex-1 bg-slate-200" />
        </div>
    )
}

function AuthTabs({ active }) {
    return (
        <div className="mx-auto mb-9 w-full max-w-[390px]">
            <div className="relative flex border-b border-slate-200">
                <Link
                    to="/auth/login"
                    className={cn(
                        'relative flex h-11 flex-1 items-center justify-center text-sm font-semibold transition-colors duration-300',
                        active === 'login' ? 'text-rideon-blue' : 'text-slate-500 hover:text-rideon-dark',
                    )}
                >
                    Login
                </Link>
                <Link
                    to="/auth/signup"
                    className={cn(
                        'relative flex h-11 flex-1 items-center justify-center text-sm font-semibold transition-colors duration-300',
                        active === 'signup' ? 'text-rideon-blue' : 'text-slate-500 hover:text-rideon-dark',
                    )}
                >
                    Sign Up
                </Link>
                <span
                    className={cn(
                        'absolute bottom-[-1px] h-0.5 w-1/2 rounded-full bg-rideon-blue transition-transform duration-300 ease-out',
                        active === 'signup' && 'translate-x-full',
                    )}
                />
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
        <div className="relative hidden overflow-hidden bg-[#f5f9ff] lg:block">
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-white/80" />

            <div className="absolute top-9 left-14 z-30">
                <img
                    src="/favicon.png"
                    alt="RideOn"
                    className="h-20 w-auto"
                />
            </div>

            <div className="absolute top-28 left-40 h-[300px] w-[300px] rounded-full border-[34px] border-rideon-blue/22" />
            <div className="absolute top-[200px] -right-[60px] h-[190px] w-[190px] rounded-full border-[28px] border-rideon-green/25" />

            <div className="absolute top-[340px] left-8 z-30 flex flex-col gap-3">
                <FeatureCard
                    icon={ShieldCheck}
                    title="Safe & Secure"
                    subtitle="Verified vehicles"
                />
                <FeatureCard
                    icon={IndianRupee}
                    title="Affordable Rides"
                    subtitle="Best prices in town"
                    tone="green"
                />
                <FeatureCard
                    icon={Headphones}
                    title="24/7 Support"
                    subtitle="We're here to help"
                />
            </div>

            <img
                src="/image.png"
                alt="RideOn Scooter"
                className="absolute top-[2px] right- z-20 w-full object-contain drop-shadow-[0_20px_32px_rgba(15,23,42,0.18)]"
            />

            <div className="absolute bottom-10 left-10 z-30">
                <h2 className="text-[2.35rem] leading-[1.08] font-extrabold text-rideon-dark">
                    Your Ride,
                    <br />
                    Your <span className="text-rideon-green">Freedom.</span>
                </h2>
            </div>
        </div>
    )
}

export default function AuthLayout({
    activeTab,
    children,
    showTabs = true,
    showTerms = true,
}) {
    return (
        <div className="min-h-dvh bg-white lg:px-8 lg:py-6">
            <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center">
                <div className="min-h-dvh w-full overflow-hidden bg-white lg:h-[min(650px,calc(100dvh-48px))] lg:min-h-0 lg:max-w-[1080px] lg:rounded-2xl lg:shadow-[0_20px_70px_rgba(15,23,42,0.14)]">
                    <div className="lg:grid lg:h-full lg:grid-cols-[49%_51%]">
                        <AuthVisualPanel />

                        <div className="relative flex min-h-dvh flex-col justify-center px-5 py-8 sm:px-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:px-16 lg:py-8">
                            <div className="mb-8 flex justify-center lg:hidden">
                                <img
                                    src="/favicon.png"
                                    alt="RideOn"
                                    className="h-20 w-auto"
                                />
                            </div>

                            {showTabs && <AuthTabs active={activeTab} />}

                            <div className="mx-auto w-full max-w-[390px]">
                                {children}
                            </div>

                            {showTerms && <AuthTerms />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
