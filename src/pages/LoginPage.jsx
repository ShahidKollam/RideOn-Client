import { useState } from 'react'

import AuthLayout, { Divider, PhoneInput, SocialButton } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
    const [loginPhone, setLoginPhone] = useState('')

    const handleLogin = (e) => {
        e.preventDefault()

        console.log({
            phone: loginPhone,
        })
    }

    return (
        <AuthLayout activeTab="login">
            <form onSubmit={handleLogin}>
                <div className="text-center">
                    <h1 className="text-[1.75rem] leading-tight font-extrabold text-rideon-dark">
                        Welcome Back! <span aria-hidden>{'\uD83D\uDC4B'}</span>
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        Login to continue your ride with RideOn
                    </p>
                </div>

                <div className="mt-8">
                    <PhoneInput value={loginPhone} onChange={setLoginPhone} />
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
        </AuthLayout>
    )
}
