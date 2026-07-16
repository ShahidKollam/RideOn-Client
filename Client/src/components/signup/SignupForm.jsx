import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'

import SignupStepOne from '@/components/signup/SignupStepOne'
import SignupStepTwo from '@/components/signup/SignupStepTwo'
import { getApiErrorMessage } from '@/lib/apiClient'
import { useToast } from '@/context/ToastContext'
import { sendLoginLink, signupStudent } from '@/services/authService'

const initialValues = {
    fullName: '',
    studentId: '',
    nitcEmail: '',
    mobileNumber: '',
    hostel: '',
    department: '',
    yearOfStudy: '',
    licenseNumber: '',
}

const nitcEmailPattern = /^[^\s@]+@nitc\.ac\.in$/i

function validateStepOne(values) {
    const errors = {}

    if (!values.fullName.trim()) {
        errors.fullName = 'Full name is required.'
    }

    if (!values.studentId.trim()) {
        errors.studentId = 'Student ID is required.'
    }

    if (!values.nitcEmail.trim()) {
        errors.nitcEmail = 'NITC email is required.'
    } else if (!nitcEmailPattern.test(values.nitcEmail.trim())) {
        errors.nitcEmail = 'Use your @nitc.ac.in email address.'
    }

    return errors
}

export default function SignupForm() {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [linkSent, setLinkSent] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [resending, setResending] = useState(false)
    const { showToast } = useToast()

    const updateValue = (field, value) => {
        setValues((current) => ({
            ...current,
            [field]: value,
        }))

        setErrors((current) => {
            if (!current[field]) return current

            const next = { ...current }
            delete next[field]
            return next
        })

        if (field === 'nitcEmail') {
            setLinkSent(false)
        }
    }

    const handleSignup = async (event) => {
        event.preventDefault()

        const stepErrors = validateStepOne(values)
        setErrors(stepErrors)

        if (Object.keys(stepErrors).length > 0) return

        setSubmitting(true)

        try {
            await signupStudent({
                name: values.fullName.trim(),
                studentId: values.studentId.trim(),
                email: values.nitcEmail.trim().toLowerCase(),
            })

            setLinkSent(true)
            showToast({
                type: 'success',
                title: 'Signup successful',
                description: 'Check your NITC email for the magic login link.',
            })
        } catch (error) {
            const message = error instanceof Error && !error.response
                ? error.message
                : getApiErrorMessage(error, 'Unable to create your account.')

            showToast({
                type: 'error',
                title: 'Signup failed',
                description: message,
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleResendLink = async () => {
        const email = values.nitcEmail.trim().toLowerCase()

        if (!nitcEmailPattern.test(email)) {
            setErrors({ nitcEmail: 'Use your @nitc.ac.in email address.' })
            return
        }

        setResending(true)

        try {
            await sendLoginLink(email)
            showToast({
                type: 'success',
                title: 'Magic link sent',
                description: 'Please check your NITC inbox.',
            })
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Could not resend link',
                description: getApiErrorMessage(error, 'Please try again in a moment.'),
            })
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            <SignupStepOne
                values={values}
                errors={errors}
                linkSent={linkSent}
                submitting={submitting}
                resending={resending}
                onChange={updateValue}
                onSubmit={handleSignup}
                onResend={handleResendLink}
            />

            <SignupStepTwo
                values={values}
                errors={errors}
                unlocked={false}
                onChange={updateValue}
                onSubmit={(event) => event.preventDefault()}
                submitLabel="Complete After Email Verification"
            />

            <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-8">
                <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rideon-blue/10 text-rideon-blue">
                        <ShieldCheck className="size-6" strokeWidth={2.25} />
                    </div>

                    <div>
                        <h2 className="text-sm font-extrabold text-rideon-dark">
                            Your data is secure
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            We never share your information with anyone. Read our{' '}
                            <a href="/privacy" className="font-semibold text-rideon-blue underline-offset-4 hover:underline">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
