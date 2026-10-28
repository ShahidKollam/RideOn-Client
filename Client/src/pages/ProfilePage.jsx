import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import SignupProgress from '@/components/signup/SignupProgress'
import SignupStepTwo from '@/components/signup/SignupStepTwo'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { completeProfile } from '@/services/authService'

const initialValues = {
    mobileNumber: '',
    hostel: '',
    department: '',
    yearOfStudy: '',
    licenseNumber: '',
    acceptedTerms: false,
}

const mobilePattern = /^[6-9]\d{9}$/
// const licensePattern = /^[A-Z]{2}[0-9]{2}[\s-]?[0-9A-Z]{4,13}$/i

function normalizeLicense(raw) {
    return String(raw || '').trim().toUpperCase()
}

function isPlausibleIndianDl(raw) {
    const compact = normalizeLicense(raw).replace(/[\s-]+/g, '')
    if (!compact) return 'Driving licence number is required.'
    if (!/^[A-Z0-9]+$/.test(compact)) {
        return 'Use only letters and numbers (spaces and hyphens are fine).'
    }
    if (compact.length < 8 || compact.length > 20) {
        return 'This does not look like a valid Indian driving licence number. Please check and try again.'
    }
    const modern = /^[A-Z]{2}[0-9]{2}[0-9A-Z]{4,16}$/.test(compact)
    if (modern || (compact.length >= 10 && /[A-Z]/.test(compact) && /\d/.test(compact))) {
        return null
    }
    if (compact.length >= 10) return null
    return 'This does not look like a common Indian driving licence format. Please double-check the number.'
}

function validateProfile(values) {
    const errors = {}

    if (!values.mobileNumber.trim()) {
        errors.mobileNumber = 'Mobile number is required.'
    } else if (!mobilePattern.test(values.mobileNumber.trim())) {
        errors.mobileNumber = 'Enter a valid 10-digit Indian mobile number.'
    }

    // Hostel, department, year of study — optional for general customers

    const licenseError = isPlausibleIndianDl(values.licenseNumber)
    if (licenseError) {
        errors.licenseNumber = licenseError
    }

    if (!values.acceptedTerms) {
        errors.acceptedTerms = 'You must accept the terms to continue.'
    }

    return errors
}

export default function ProfilePage() {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()
    const { showToast } = useToast()

    useEffect(() => {
        if (user?.onboardingStatus === 'PROFILE_COMPLETED') {
            navigate('/', { replace: true })
        }
    }, [navigate, user?.onboardingStatus])

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
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const nextErrors = validateProfile(values)
        setErrors(nextErrors)

        if (Object.keys(nextErrors).length > 0) {
            // Show toast so user knows why nothing happened
            showToast({
                type: 'error',
                title: 'Please fix the errors',
                description: 'Some required fields are missing or invalid.',
            })

            // Scroll to the first error field
            const firstErrorField = Object.keys(nextErrors)[0]
            const el = document.getElementById(firstErrorField) || 
                       document.getElementById(`${firstErrorField}-error`)
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            return
        }

        setLoading(true)

        try {
            const payload = {
                phone: values.mobileNumber.trim(),
                drivingLicenseNumber: normalizeLicense(values.licenseNumber),
                acceptedTerms: values.acceptedTerms,
            }
            if (values.hostel) payload.hostel = values.hostel
            if (values.department) payload.department = values.department
            if (values.yearOfStudy) {
                const y = Number.parseInt(values.yearOfStudy, 10)
                if (!Number.isNaN(y)) payload.yearOfStudy = y
            }

            const response = await completeProfile(payload)

            updateUser({
                ...user,
                ...response.data?.data,
                onboardingStatus: 'PROFILE_COMPLETED',
            })

            showToast({
                type: 'success',
                title: 'Profile completed',
                description: 'Your RideOn account is ready.',
            })

            navigate('/', { replace: true })
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Could not complete profile',
                description: getApiErrorMessage(error, 'Please review your details and try again.'),
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen overflow-hidden bg-white">
            <section className="relative px-4 pt-32 pb-8 sm:px-6 sm:pt-36 lg:px-8 lg:pt-40">
                <div className="pointer-events-none absolute top-32 -right-24 hidden size-64 rounded-full border-[42px] border-rideon-blue/10 lg:block" />
                <div className="pointer-events-none absolute bottom-28 -left-24 hidden size-52 rounded-full border-[36px] border-rideon-green/12 lg:block" />

                <div className="relative mx-auto max-w-7xl">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-3xl leading-tight font-extrabold text-rideon-dark sm:text-4xl lg:text-[2.65rem]">
                            Complete Your Ride<span className="text-rideon-green">On</span> Profile
                        </h1>

                        <p className="mt-5 text-base leading-relaxed text-slate-500 sm:text-lg">
                            Add your ride-ready details to start booking.
                        </p>
                    </div>

                    <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
                        <div className="mx-auto mb-8 max-w-xl sm:mb-10">
                            <SignupProgress current={3} />
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <SignupStepTwo
                                values={values}
                                errors={errors}
                                unlocked
                                loading={loading}
                                onChange={updateValue}
                                onSubmit={handleSubmit}
                                submitLabel="Complete Profile"
                            />

                            <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rideon-blue/10 text-rideon-blue">
                                        <ShieldCheck className="size-6" strokeWidth={2.25} />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-extrabold text-rideon-dark">
                                            Secure booking profile
                                        </h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                            Phone and driving licence details help us verify riders at pickup.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}