import { useState } from 'react'
import { User } from 'lucide-react'

import AuthLayout, { Divider, PhoneInput, SocialButton } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
    const [signupName, setSignupName] = useState('')
    const [signupPhone, setSignupPhone] = useState('')

    const handleSignup = (e) => {
        e.preventDefault()

        console.log({
            name: signupName,
            phone: signupPhone,
        })
    }

    return (
        <AuthLayout activeTab="signup">
            <form onSubmit={handleSignup}>
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

                    <PhoneInput value={signupPhone} onChange={setSignupPhone} />
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
