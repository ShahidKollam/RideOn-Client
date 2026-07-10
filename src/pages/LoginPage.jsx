import { useState } from 'react'

import AuthLayout, { EmailInput } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { sendLoginLink } from '@/services/authService'

const nitcEmailPattern = /^[^\s@]+@nitc\.ac\.in$/i

export default function LoginPage() {
    const [loginEmail, setLoginEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [linkSent, setLinkSent] = useState(false)
    const { showToast } = useToast()

    const handleLogin = async (e) => {
        e.preventDefault()

        const email = loginEmail.trim().toLowerCase()

        if (!nitcEmailPattern.test(email)) {
            setError('Use your @nitc.ac.in email address.')
            return
        }

        setError('')
        setLoading(true)

        try {
            await sendLoginLink(email)
            setLinkSent(true)
            showToast({
                type: 'success',
                title: 'Magic link sent',
                description: 'Check your NITC inbox to continue.',
            })
        } catch (apiError) {
            const message = getApiErrorMessage(apiError, 'Unable to send magic link.')
            showToast({
                type: 'error',
                title: 'Login link failed',
                description: message,
            })
        } finally {
            setLoading(false)
        }
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
                    <EmailInput
                        value={loginEmail}
                        onChange={(value) => {
                            setLoginEmail(value)
                            setError('')
                            setLinkSent(false)
                        }}
                    />
                    {error && (
                        <p className="mt-2 text-sm font-medium text-rideon-blue">
                            {error}
                        </p>
                    )}
                </div>

                {linkSent && (
                    <div className="mt-4 rounded-lg border border-rideon-green bg-rideon-green/10 px-4 py-3 text-center text-sm leading-6 text-slate-600">
                        Magic link sent. Open it from your email to login securely.
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="mt-6 h-11 w-full rounded-lg bg-rideon-blue font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.35)]"
                >
                    {loading ? 'Sending...' : 'Send Magic Link'}
                </Button>
            </form>
        </AuthLayout>
    )
}
