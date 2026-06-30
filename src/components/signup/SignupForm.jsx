import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'

import SignupStepOne from '@/components/signup/SignupStepOne'
import SignupStepTwo from '@/components/signup/SignupStepTwo'

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
const mobilePattern = /^[6-9]\d{9}$/
const licensePattern = /^[A-Z]{2}[0-9]{2}[\s-]?[0-9A-Z]{4,13}$/i

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

function validateStepTwo(values) {
    const errors = {}

    if (!values.mobileNumber.trim()) {
        errors.mobileNumber = 'Mobile number is required.'
    } else if (!mobilePattern.test(values.mobileNumber.trim())) {
        errors.mobileNumber = 'Enter a valid 10-digit Indian mobile number.'
    }

    if (!values.hostel) {
        errors.hostel = 'Hostel is required.'
    }

    if (!values.department) {
        errors.department = 'Department is required.'
    }

    if (!values.yearOfStudy) {
        errors.yearOfStudy = 'Year of study is required.'
    }

    if (!values.licenseNumber.trim()) {
        errors.licenseNumber = 'Driving license number is required.'
    } else if (!licensePattern.test(values.licenseNumber.trim())) {
        errors.licenseNumber = 'Enter a valid driving license number.'
    }

    return errors
}

export default function SignupForm() {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [emailVerified, setEmailVerified] = useState(false)
    const [verifying, setVerifying] = useState(false)

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
            setEmailVerified(false)
        }
    }

    const handleVerifyIdentity = (event) => {
        event.preventDefault()

        const stepErrors = validateStepOne(values)
        setErrors((current) => ({
            ...current,
            ...stepErrors,
        }))

        if (Object.keys(stepErrors).length > 0) return

        setVerifying(true)

        window.setTimeout(() => {
            setEmailVerified(true)
            setVerifying(false)
        }, 450)
    }

    const handleCreateAccount = (event) => {
        event.preventDefault()

        if (!emailVerified) return

        const stepErrors = validateStepTwo(values)
        setErrors((current) => ({
            ...current,
            ...stepErrors,
        }))

        if (Object.keys(stepErrors).length > 0) return

        console.log({
            fullName: values.fullName.trim(),
            studentId: values.studentId.trim(),
            nitcEmail: values.nitcEmail.trim().toLowerCase(),
            mobileNumber: values.mobileNumber.trim(),
            hostel: values.hostel,
            department: values.department,
            yearOfStudy: values.yearOfStudy,
            licenseNumber: values.licenseNumber.trim(),
        })
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            <SignupStepOne
                values={values}
                errors={errors}
                verified={emailVerified}
                verifying={verifying}
                onChange={updateValue}
                onVerify={handleVerifyIdentity}
            />

            <SignupStepTwo
                values={values}
                errors={errors}
                unlocked={emailVerified}
                onChange={updateValue}
                onSubmit={handleCreateAccount}
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
