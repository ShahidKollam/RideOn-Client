import { useEffect, useState } from 'react'
import { ChevronDown, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import SignupProgress from '@/components/signup/SignupProgress'
import departments from '@/data/departments.json'

const hostels = [
    'A Hostel',
    'B Hostel',
    'C Hostel',
    'D Hostel',
    'E Hostel',
    'Ladies Hostel',
    'Mega Hostel',
]

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

export default function SignupStepTwo({
    values,
    errors,
    unlocked,
    loading = false,
    onChange,
    onSubmit,
    submitLabel = 'Complete Profile',
}) {
    const [deptOpen, setDeptOpen] = useState(false)

    // Lock background page while department modal is open
    useEffect(() => {
        if (!deptOpen) return
        const prevOverflow = document.body.style.overflow
        const prevTouch = document.body.style.touchAction
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'
        return () => {
            document.body.style.overflow = prevOverflow
            document.body.style.touchAction = prevTouch
        }
    }, [deptOpen])

    const selectDepartment = (department) => {
        onChange('department', department)
        setDeptOpen(false)
    }

    return (
        <section
            className={cn(
                'rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] transition-all duration-500 sm:px-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 lg:px-8 lg:py-12',
                !unlocked && 'opacity-65',
            )}
        >
            <SignupProgress
                step={2}
                title="Complete Your Profile"
                description="Fill in the remaining details to complete your account setup."
                active={unlocked}
                locked={!unlocked}
            />

            <form onSubmit={onSubmit} className="mt-8 space-y-5 lg:mt-0">
                <fieldset disabled={!unlocked} className="space-y-5 disabled:pointer-events-none">
                    <div>
                        <label htmlFor="mobileNumber" className="block text-sm font-bold text-rideon-dark">
                            Mobile Number
                        </label>
                        <div
                            className={cn(
                                'mt-3 flex h-12 overflow-hidden rounded-lg border bg-white transition-colors focus-within:border-rideon-blue focus-within:ring-2 focus-within:ring-rideon-blue/15',
                                errors.mobileNumber ? 'border-red-500 ring-2 ring-red-500/15' : 'border-slate-300',
                            )}
                        >
                            <div className="flex w-20 shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-sm font-bold text-rideon-dark">
                                +91
                            </div>
                            <input
                                id="mobileNumber"
                                name="mobileNumber"
                                type="tel"
                                inputMode="numeric"
                                value={values.mobileNumber}
                                onChange={(event) => onChange('mobileNumber', event.target.value)}
                                aria-invalid={Boolean(errors.mobileNumber)}
                                aria-describedby={errors.mobileNumber ? 'mobileNumber-error' : undefined}
                                className="h-full w-full border-0 bg-transparent px-4 text-sm text-rideon-dark outline-none placeholder:text-slate-400"
                                placeholder="10-digit mobile number"
                                autoComplete="tel"
                            />
                        </div>
                        {errors.mobileNumber && (
                            <p id="mobileNumber-error" className="mt-2 text-sm font-medium text-red-600">
                                {errors.mobileNumber}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="hostel" className="block text-sm font-bold text-rideon-dark">
                            Hostel
                        </label>
                        <select
                            id="hostel"
                            name="hostel"
                            value={values.hostel}
                            onChange={(event) => onChange('hostel', event.target.value)}
                            aria-invalid={Boolean(errors.hostel)}
                            aria-describedby={errors.hostel ? 'hostel-error' : undefined}
                            className={cn(
                                'mt-3 h-12 w-full rounded-lg border bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15',
                                errors.hostel ? 'border-red-500 ring-2 ring-red-500/15' : 'border-slate-300',
                            )}
                        >
                            <option value="">Select your hostel</option>
                            {hostels.map((hostel) => (
                                <option key={hostel} value={hostel}>
                                    {hostel}
                                </option>
                            ))}
                        </select>
                        {errors.hostel && (
                            <p id="hostel-error" className="mt-2 text-sm font-medium text-red-600">
                                {errors.hostel}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="department" className="block text-sm font-bold text-rideon-dark">
                            Department
                        </label>

                        {/* Desktop: native select */}
                        <select
                            id="department"
                            name="department"
                            value={values.department}
                            onChange={(event) => onChange('department', event.target.value)}
                            aria-invalid={Boolean(errors.department)}
                            aria-describedby={errors.department ? 'department-error' : undefined}
                            className={cn(
                                'mt-3 hidden h-12 w-full rounded-lg border bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15 sm:block',
                                errors.department ? 'border-red-500 ring-2 ring-red-500/15' : 'border-slate-300',
                            )}
                        >
                            <option value="">Select your department</option>
                            {departments.map((department) => (
                                <option key={department} value={department}>
                                    {department}
                                </option>
                            ))}
                        </select>

                        {/* Mobile: opens scrollable modal */}
                        <button
                            type="button"
                            id="department-mobile-trigger"
                            onClick={() => unlocked && setDeptOpen(true)}
                            aria-haspopup="dialog"
                            aria-expanded={deptOpen}
                            aria-invalid={Boolean(errors.department)}
                            aria-describedby={errors.department ? 'department-error' : undefined}
                            className={cn(
                                'mt-3 flex h-12 w-full items-center justify-between rounded-lg border bg-white px-4 text-left text-sm outline-none transition-colors sm:hidden',
                                errors.department ? 'border-red-500 ring-2 ring-red-500/15' : 'border-slate-300',
                                values.department ? 'text-rideon-dark' : 'text-slate-400',
                            )}
                        >
                            <span className="truncate">
                                {values.department || 'Select your department'}
                            </span>
                            <ChevronDown className="size-4 shrink-0 text-slate-400" strokeWidth={2} />
                        </button>

                        {errors.department && (
                            <p id="department-error" className="mt-2 text-sm font-medium text-red-600">
                                {errors.department}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="yearOfStudy" className="block text-sm font-bold text-rideon-dark">
                            Year of Study
                        </label>
                        <select
                            id="yearOfStudy"
                            name="yearOfStudy"
                            value={values.yearOfStudy}
                            onChange={(event) => onChange('yearOfStudy', event.target.value)}
                            aria-invalid={Boolean(errors.yearOfStudy)}
                            aria-describedby={errors.yearOfStudy ? 'yearOfStudy-error' : undefined}
                            className={cn(
                                'mt-3 h-12 w-full rounded-lg border bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15',
                                errors.yearOfStudy ? 'border-red-500 ring-2 ring-red-500/15' : 'border-slate-300',
                            )}
                        >
                            <option value="">Select your year</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        {errors.yearOfStudy && (
                            <p id="yearOfStudy-error" className="mt-2 text-sm font-medium text-red-600">
                                {errors.yearOfStudy}
                            </p>
                        )}
                    </div>

                    {/* ===== MISSING FIELD ADDED ===== */}
                    <div>
                        <label htmlFor="licenseNumber" className="block text-sm font-bold text-rideon-dark">
                            Driving License Number
                        </label>
                        <input
                            id="licenseNumber"
                            name="licenseNumber"
                            type="text"
                            value={values.licenseNumber}
                            onChange={(event) => onChange('licenseNumber', event.target.value.toUpperCase())}
                            aria-invalid={Boolean(errors.licenseNumber)}
                            aria-describedby={errors.licenseNumber ? 'licenseNumber-error' : undefined}
                            className={cn(
                                'mt-3 h-12 w-full rounded-lg border bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15',
                                errors.licenseNumber ? 'border-red-500 ring-2 ring-red-500/15' : 'border-slate-300',
                            )}
                            placeholder="e.g. KL01 20201234567"
                            autoComplete="off"
                        />
                        {errors.licenseNumber && (
                            <p id="licenseNumber-error" className="mt-2 text-sm font-medium text-red-600">
                                {errors.licenseNumber}
                            </p>
                        )}
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                        <input
                            id="acceptedTerms"
                            name="acceptedTerms"
                            type="checkbox"
                            checked={Boolean(values.acceptedTerms)}
                            onChange={(event) => onChange('acceptedTerms', event.target.checked)}
                            aria-invalid={Boolean(errors.acceptedTerms)}
                            className="mt-1 size-4 rounded border-slate-300 text-rideon-blue focus:ring-rideon-blue/20"
                        />
                        <label htmlFor="acceptedTerms" className="text-sm leading-6 text-slate-600">
                            I agree to the terms and privacy policy.
                        </label>
                    </div>
                    {errors.acceptedTerms && (
                        <p className="text-sm font-medium text-red-600">{errors.acceptedTerms}</p>
                    )}
                </fieldset>

                <Button
                    type="submit"
                    disabled={!unlocked || loading}
                    className="h-12 w-full rounded-lg bg-rideon-green text-sm font-bold text-white shadow-[0_8px_20px_rgba(118,192,67,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-green/90 hover:shadow-[0_12px_28px_rgba(118,192,67,0.32)] disabled:pointer-events-none disabled:opacity-60"
                >
                    <Lock className="size-4" strokeWidth={2.25} />
                    {loading ? 'Saving...' : submitLabel}
                </Button>
            </form>

            {/* Mobile department selection modal */}
            {deptOpen && (
                <div
                    className="fixed inset-0 z-[80] flex items-end justify-center sm:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="department-modal-title"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/45"
                        aria-label="Close department list"
                        onClick={() => setDeptOpen(false)}
                    />
                    <div
                        className="relative z-10 flex w-full max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.18)]"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                    >
                        <div className="shrink-0 border-b border-slate-100 px-5 py-4">
                            <h2
                                id="department-modal-title"
                                className="text-base font-bold text-rideon-dark"
                            >
                                Select your department
                            </h2>
                        </div>

                        <div
                            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            <ul className="py-1">
                                {departments.map((department) => {
                                    const selected = values.department === department
                                    return (
                                        <li key={department}>
                                            <button
                                                type="button"
                                                onClick={() => selectDepartment(department)}
                                                className={cn(
                                                    'flex w-full items-center px-5 py-3.5 text-left text-sm transition-colors',
                                                    selected
                                                        ? 'bg-rideon-blue/10 font-semibold text-rideon-blue'
                                                        : 'text-rideon-dark hover:bg-slate-50 active:bg-slate-100',
                                                )}
                                            >
                                                {department}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}