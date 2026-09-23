import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import AuthLayout from '@/components/auth/AuthLayout'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { verifyLoginLink } from '@/services/authService'

export default function VerifyMagicLinkPage() {
    const [searchParams] = useSearchParams()
    const [error, setError] = useState('')
    const [verified, setVerified] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()
    const { showToast } = useToast()

    useEffect(() => {
        let active = true
        const token = searchParams.get('token')

        async function verify() {
            if (!token) {
                setError('This magic link is missing a token. Please request a new login link.')
                showToast({
                    type: 'error',
                    title: 'Invalid magic link',
                    description: 'Please request a fresh login link.',
                })
                return
            }

            try {
                const response = await verifyLoginLink(token)
                const data = response.data?.data

                if (!data?.accessToken || !data?.user) {
                    throw new Error('Invalid login response')
                }

                login(data.accessToken, data.user)

                if (!active) return

                setVerified(true)
                showToast({
                    type: 'success',
                    title: 'Login successful',
                    description: 'Your NITC email has been verified.',
                })

                const destination = data.user.onboardingStatus === 'PROFILE_COMPLETED'
                    ? '/'
                    : '/auth/complete-profile'

                window.setTimeout(() => navigate(destination, { replace: true }), 700)
            } catch (apiError) {
                if (!active) return

                const message = apiError instanceof Error && !apiError.response
                    ? apiError.message
                    : getApiErrorMessage(apiError, 'Invalid or expired magic link.')

                setError(message)
                showToast({
                    type: 'error',
                    title: 'Magic link failed',
                    description: message,
                })
            }
        }

        verify()

        return () => {
            active = false
        }
    }, [login, navigate, searchParams, showToast])

    if (!error && !verified) {
        return <LoadingScreen message="Verifying your magic link..." />
    }

    return (
        <AuthLayout showTabs={false} showTerms={false}>
            <div className="text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rideon-blue/10 text-rideon-blue">
                    {verified ? (
                        <CheckCircle2 className="size-7 text-rideon-green" strokeWidth={2.25} />
                    ) : (
                        <AlertTriangle className="size-7 text-red-500" strokeWidth={2.25} />
                    )}
                </div>

                <h1 className="mt-5 text-[1.75rem] leading-tight font-extrabold text-rideon-dark">
                    {verified ? 'Email Verified' : 'Link Not Valid'}
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    {verified ? 'Taking you to the next step.' : error}
                </p>

                {!verified && (
                    <Button
                        className="mt-7 h-11 w-full rounded-lg bg-rideon-blue font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90"
                        asChild
                    >
                        <Link to="/auth/login">Request New Link</Link>
                    </Button>
                )}
            </div>
        </AuthLayout>
    )
}
