import { useState } from 'react'
import { Facebook, Headphones, IndianRupee, ShieldCheck, User, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AuthModal({
    open = true,
    onClose,
    isPage = false,
}) {
    const [activeTab, setActiveTab] = useState('login')
    const [loginPhone, setLoginPhone] = useState('')
    const [signupName, setSignupName] = useState('')
    const [signupPhone, setSignupPhone] = useState('')

    const handleLogin = (e) => {
        e.preventDefault()

        console.log({
            phone: loginPhone,
        })
    }

    const handleSignup = (e) => {
        e.preventDefault()

        console.log({
            name: signupName,
            phone: signupPhone,
        })
    }

    if (!open && !isPage) return null

    const FeatureCard = ({ icon: Icon, title, subtitle, tone = 'blue' }) => (
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

    const PhoneInput = ({ value, onChange }) => (
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

    const SocialButton = ({ provider }) => (
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

    const Divider = () => (
        <div className="my-8 flex items-center gap-6 text-xs text-slate-500">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or continue with</span>
            <div className="h-px flex-1 bg-slate-200" />
        </div>
    )

    const TabButton = ({ tab, children }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
                'relative h-11 flex-1 text-sm font-semibold transition-colors duration-300',
                activeTab === tab ? 'text-rideon-blue' : 'text-slate-500 hover:text-rideon-dark',
            )}
        >
            {children}
        </button>
    )

    const content = (
        <div
            className={cn(
                'overflow-hidden bg-white',
                isPage
                    ? 'min-h-screen'
                    : 'min-h-dvh w-full lg:min-h-0 lg:max-w-[1080px] lg:rounded-2xl lg:shadow-[0_20px_70px_rgba(15,23,42,0.18)]',
            )}
        >
            <div className="lg:grid lg:min-h-[650px] lg:grid-cols-[49%_51%]">
                <div className="relative hidden overflow-hidden bg-[#f5f9ff] lg:block">
                    
                    {/* no need this image  */}
                    {/* <img
                        src="/bg-croped-bike-2.png"
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
                    /> */}
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

                        {/* <p className="mt-4 max-w-[330px] text-sm leading-relaxed text-slate-600">
                            Rent scooters easily and explore the city with style and convenience.
                        </p> */}
                    </div>
                </div>

                <div className="relative flex min-h-dvh flex-col justify-center px-5 py-8 sm:px-6 lg:min-h-0 lg:px-16">
                    <div className="mb-8 flex justify-center lg:hidden">
                        <img
                            src="/favicon.png"
                            alt="RideOn"
                            className="h-20 w-auto"
                        />
                    </div>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-slate-50 lg:top-6 lg:right-6"
                            aria-label="Close auth dialog"
                        >
                            <X className="size-6 text-slate-600" />
                        </button>
                    )}

                    <div className="mx-auto mb-9 w-full max-w-[390px]">
                        <div className="relative flex border-b border-slate-200">
                            <TabButton tab="login">Login</TabButton>
                            <TabButton tab="signup">Sign Up</TabButton>
                            <span
                                className={cn(
                                    'absolute bottom-[-1px] h-0.5 w-1/2 rounded-full bg-rideon-blue transition-transform duration-300 ease-out',
                                    activeTab === 'signup' && 'translate-x-full',
                                )}
                            />
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-[390px] overflow-hidden">
                        <div
                            className={cn(
                                'flex w-[200%] transition-transform duration-300 ease-out',
                                activeTab === 'signup' && '-translate-x-1/2',
                            )}
                        >
                            <form
                                onSubmit={handleLogin}
                                className="w-1/2 shrink-0"
                            >
                                <div className="text-center">
                                    <h1 className="text-[1.75rem] leading-tight font-extrabold text-rideon-dark">
                                        Welcome Back! <span aria-hidden>{'\uD83D\uDC4B'}</span>
                                    </h1>

                                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                                        Login to continue your ride with RideOn
                                    </p>
                                </div>

                                <div className="mt-8">
                                    {/* <PhoneInput value={loginPhone} onChange={setLoginPhone} /> */}
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-6 h-11 w-full rounded-lg bg-rideon-blue font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.35)]"
                                >
                                    Send OTP
                                </Button>

                                {/* <Divider /> */}

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SocialButton provider="Google" />
                                    <SocialButton provider="Facebook" />
                                </div>
                            </form>

                            <form
                                onSubmit={handleSignup}
                                className="w-1/2 shrink-0"
                            >
                                <div className="text-center">
                                    <h1 className="text-[1.75rem] leading-tight font-extrabold text-rideon-dark">
                                        Create Account <span aria-hidden>{'\uD83D\uDE80'}</span>
                                    </h1>

                                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                                        Join RideOn and start booking scooters in minutes.
                                    </p>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="relative">
                                        <User className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            value={signupName}
                                            onChange={(e) => setSignupName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="h-12 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-11 text-sm outline-none transition-all focus:border-rideon-blue"
                                            required
                                        />
                                    </div>

                                    {/* <PhoneInput value={signupPhone} onChange={setSignupPhone} /> */}
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-6 h-11 w-full rounded-lg bg-rideon-blue font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.35)]"
                                >
                                    Send OTP
                                </Button>

                                <Divider />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SocialButton provider="Google" />
                                    <SocialButton provider="Facebook" />
                                </div>
                            </form>
                        </div>
                    </div>

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
                </div>
            </div>
        </div>
    )

    if (isPage) {
        return (
            <div className="min-h-screen bg-white">
                {content}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-0 lg:p-6">
            {content}
        </div>
    )
}
