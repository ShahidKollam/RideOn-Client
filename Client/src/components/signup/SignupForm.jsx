import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

import SignupProgress from '@/components/signup/SignupProgress'
import SignupStepOne from '@/components/signup/SignupStepOne'
import { getApiErrorMessage } from '@/lib/apiClient'
import { useToast } from '@/context/ToastContext'
import { getSignupCampuses, sendLoginLink, signupStudent } from '@/services/authService'

const campuses = getSignupCampuses()

const initialValues = {
    fullName: '',
    studentId: '',
    nitcEmail: '',
    campusId: campuses[0]?.id || '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateStepOne(values) {
    const errors = {}

    if (!values.fullName.trim()) {
        errors.fullName = 'Full name is required.'
    }

    if (!values.nitcEmail.trim()) {
        errors.nitcEmail = 'Email address is required.'
    } else if (!emailPattern.test(values.nitcEmail.trim())) {
        errors.nitcEmail = 'Enter a valid email address.'
    }

    if (!values.campusId) {
        errors.campusId = 'Select a pickup location.'
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
        if (field === '__resetLinkSent') {
            setLinkSent(false)
            return
        }

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
                studentId: values.studentId.trim() || undefined,
                email: values.nitcEmail.trim().toLowerCase(),
                campusId: values.campusId,
            })
            setLinkSent(true)
            showToast({
                type: 'success',
                title: 'Check your email',
                description: 'A verification link is on its way.',
            })
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Signup failed',
                description: getApiErrorMessage(error, 'Could not create your account. Please try again.'),
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleResendLink = async () => {
        if (!values.nitcEmail.trim()) return
        setResending(true)
        try {
            await sendLoginLink(values.nitcEmail.trim().toLowerCase())
            showToast({
                type: 'success',
                title: 'Link sent',
                description: 'A new verification link has been sent to your email.',
            })
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Could not resend',
                description: getApiErrorMessage(error, 'Please try again in a moment.'),
            })
        } finally {
            setResending(false)
        }
    }

    const progressStep = linkSent ? 2 : 1

    return (
        <div className="w-full">
            {/* Progress — same width rhythm as Complete Profile */}
            <div className="mx-auto mb-8 max-w-xl sm:mb-10">
                <SignupProgress current={progressStep} />
            </div>

            {/* Main card — matches SignupStepTwo / Complete Profile proportions */}
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:px-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 lg:px-8 lg:py-12">
                {/* Left rail — desktop only, mirrors complete-profile side panel */}
                <div className="hidden lg:block">
                    <p className="text-sm font-bold text-rideon-blue">
                        {linkSent ? 'Step 2' : 'Step 1'}
                    </p>
                    <h2 className="mt-2 text-lg font-extrabold text-rideon-dark sm:text-xl">
                        {linkSent ? 'Verify Email' : 'Create Account'}
                    </h2>
                    <p className="mt-3 max-w-[14rem] text-sm leading-6 text-slate-500">
                        {linkSent
                            ? 'Open the magic link we sent to confirm your email and continue.'
                            : 'Sign up with any email. Students can add a Student ID; everyone needs a pickup location.'}
                    </p>
                </div>

                {/* Form column */}
                <div className="min-w-0">
                    <div className="mb-6 lg:hidden">
                        <h2 className="text-xl font-extrabold tracking-tight text-rideon-dark">
                            {linkSent ? (
                                <>
                                    Verify your <span className="text-rideon-blue">email</span>
                                </>
                            ) : (
                                <>
                                    Create your <span className="text-rideon-blue">account</span>
                                </>
                            )}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {linkSent
                                ? 'Open the link we sent to continue onboarding.'
                                : 'Students and general customers can both sign up. Profile details come after verification.'}
                        </p>
                    </div>

                    <div className="hidden lg:block lg:mb-6">
                        <h2 className="text-xl font-extrabold tracking-tight text-rideon-dark sm:text-2xl">
                            {linkSent ? (
                                <>
                                    Check your <span className="text-rideon-green">inbox</span>
                                </>
                            ) : (
                                <>
                                    {/* Create your <span className="text-rideon-blue">Ride</span>
                                    <span className="text-rideon-green">On</span> account */}
                                </>
                            )}
                        </h2>
                        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                            {linkSent
                                ? 'Open the verification link to unlock the final profile step.'
                                : ''}
                        </p>
                    </div>

                    <SignupStepOne
                        values={values}
                        errors={errors}
                        campuses={campuses}
                        linkSent={linkSent}
                        submitting={submitting}
                        resending={resending}
                        onChange={updateValue}
                        onSubmit={handleSignup}
                        onResend={handleResendLink}
                    />
                </div>
            </section>

            {/* Trust strip — same pattern as complete-profile footer card */}
            <section className="mt-3 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:mt-4 sm:px-8">
                <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rideon-blue/10 text-rideon-blue">
                        <ShieldCheck className="size-6" strokeWidth={2.25} />
                    </div>
                    <div>
                        <h3 className="text-sm font-extrabold text-rideon-dark">Your data is secure</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            We never share your information. Read our{' '}
                            <Link to="/privacy" className="font-semibold text-rideon-blue underline-offset-4 hover:underline">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </section>

            <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/auth/login" className="font-bold text-rideon-blue hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    )
}
