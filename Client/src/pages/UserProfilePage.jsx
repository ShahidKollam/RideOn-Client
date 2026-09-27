import { Link } from 'react-router-dom'
import {
    Building2,
    CalendarDays,
    GraduationCap,
    IdCard,
    Mail,
    Phone,
    UserCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

function Field({ icon: Icon, label, value }) {
    return (
        <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rideon-blue/10 text-rideon-blue">
                <Icon className="size-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold text-rideon-dark">
                    {value || '—'}
                </p>
            </div>
        </div>
    )
}

export default function UserProfilePage() {
    useDocumentTitle('My profile')
    const { user } = useAuth()

    const name = user?.name || user?.fullName || 'Rider'
    const email = user?.email || ''
    const phone = user?.phone || user?.mobileNumber || user?.mobile || ''
    const hostel = user?.hostel || ''
    const department = user?.department || ''
    const yearOfStudy = user?.yearOfStudy != null ? String(user.yearOfStudy) : ''
    const license =
        user?.drivingLicenseNumber || user?.licenseNumber || user?.drivingLicense || ''
    const studentId = user?.studentId || user?.collegeId || ''
    const onboarding = user?.onboardingStatus || ''

    const needsComplete = onboarding === 'EMAIL_VERIFIED'

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50/60 pb-14 pt-24 sm:pt-28 sm:pb-16">
            <div
                className="pointer-events-none absolute -right-16 top-16 size-64 rounded-full bg-rideon-blue/10 blur-3xl"
                aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-rideon-green">Account</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-rideon-dark sm:text-4xl">
                    My <span className="text-rideon-blue">Profile</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Your RideOn account details used for campus bookings.
                </p>

                <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    {/* Identity card */}
                    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                        <div className="flex flex-col items-center text-center">
                            <span className="flex size-20 items-center justify-center rounded-full bg-rideon-blue/10 text-rideon-blue">
                                <UserCircle className="size-12" strokeWidth={1.4} />
                            </span>
                            <h2 className="mt-4 text-lg font-extrabold text-rideon-dark">{name}</h2>
                            {email && <p className="mt-1 text-sm text-slate-500 break-all">{email}</p>}
                            {onboarding && (
                                <span className="mt-3 rounded-full bg-rideon-green/10 px-3 py-1 text-xs font-bold text-rideon-green">
                                    {onboarding === 'PROFILE_COMPLETED' ? 'Profile complete' : onboarding.replace(/_/g, ' ')}
                                </span>
                            )}
                        </div>
                        <div className="mt-6 space-y-2">
                            <Button className="w-full bg-rideon-blue text-white" asChild>
                                <Link to="/bookings">
                                    <CalendarDays className="size-4" />
                                    My bookings
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full border-rideon-blue text-rideon-blue" asChild>
                                <Link to="/booking">Book a ride</Link>
                            </Button>
                            {needsComplete && (
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to="/auth/complete-profile">Complete profile</Link>
                                </Button>
                            )}
                        </div>
                    </aside>

                    {/* Details */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                        <h3 className="text-base font-extrabold text-rideon-dark">Account details</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Information on file for verification and campus rentals.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <Field icon={Mail} label="Email" value={email} />
                            <Field icon={Phone} label="Mobile" value={phone} />
                            <Field icon={IdCard} label="Student ID" value={studentId} />
                            <Field icon={Building2} label="Hostel" value={hostel} />
                            <Field icon={GraduationCap} label="Department" value={department} />
                            <Field icon={CalendarDays} label="Year of study" value={yearOfStudy} />
                            <Field icon={IdCard} label="Driving licence" value={license} />
                        </div>
                        <p className="mt-6 text-xs leading-5 text-slate-400">
                            Need to update something? Contact support via the Contact page with your booking or student
                            email.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
