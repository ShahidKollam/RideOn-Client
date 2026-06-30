import { useState } from 'react'

import AuthLayout, { EmailInput } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
    const [loginEmail, setLoginEmail] = useState('')

    const handleLogin = (e) => {
        e.preventDefault()

        console.log({
            email: loginEmail,
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

                    <p className="mt-1 text-xs font-medium text-rideon-blue">
                        Exclusive for NIT students only
                    </p>
                </div>

                <div className="mt-8">
                    <EmailInput value={loginEmail} onChange={setLoginEmail} />
                </div>

                <Button
                    type="submit"
                    className="mt-6 h-11 w-full rounded-lg bg-rideon-blue font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.35)]"
                >
                    Continue
                </Button>
            </form>
        </AuthLayout>
    )
}