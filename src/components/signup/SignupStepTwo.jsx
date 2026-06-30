import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import SignupProgress from '@/components/signup/SignupProgress'

const departments = [
    'Architecture and Planning',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Science and Engineering',
    'Electrical Engineering',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Production Engineering',
]

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
    onChange,
    onSubmit,
}) {
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
                        <div className="mt-3 flex h-12 overflow-hidden rounded-lg border border-slate-300 bg-white transition-colors focus-within:border-rideon-blue focus-within:ring-2 focus-within:ring-rideon-blue/15">
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
                                placeholder="Enter your mobile number"
                                aria-invalid={Boolean(errors.mobileNumber)}
                                aria-describedby={errors.mobileNumber ? 'mobileNumber-error' : undefined}
                                className="min-w-0 flex-1 px-4 text-sm text-rideon-dark outline-none"
                            />
                        </div>
                        {errors.mobileNumber && (
                            <p id="mobileNumber-error" className="mt-2 text-sm font-medium text-rideon-blue">
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
                            className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15"
                        >
                            <option value="">Select your hostel</option>
                            {hostels.map((hostel) => (
                                <option key={hostel} value={hostel}>
                                    {hostel}
                                </option>
                            ))}
                        </select>
                        {errors.hostel && (
                            <p id="hostel-error" className="mt-2 text-sm font-medium text-rideon-blue">
                                {errors.hostel}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="department" className="block text-sm font-bold text-rideon-dark">
                            Department
                        </label>
                        <select
                            id="department"
                            name="department"
                            value={values.department}
                            onChange={(event) => onChange('department', event.target.value)}
                            aria-invalid={Boolean(errors.department)}
                            aria-describedby={errors.department ? 'department-error' : undefined}
                            className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15"
                        >
                            <option value="">Select your department</option>
                            {departments.map((department) => (
                                <option key={department} value={department}>
                                    {department}
                                </option>
                            ))}
                        </select>
                        {errors.department && (
                            <p id="department-error" className="mt-2 text-sm font-medium text-rideon-blue">
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
                            className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15"
                        >
                            <option value="">Select your year</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        {errors.yearOfStudy && (
                            <p id="yearOfStudy-error" className="mt-2 text-sm font-medium text-rideon-blue">
                                {errors.yearOfStudy}
                            </p>
                        )}
                    </div>

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
                            placeholder="Enter your driving license number"
                            aria-invalid={Boolean(errors.licenseNumber)}
                            aria-describedby={errors.licenseNumber ? 'licenseNumber-error' : undefined}
                            className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15"
                        />
                        {errors.licenseNumber && (
                            <p id="licenseNumber-error" className="mt-2 text-sm font-medium text-rideon-blue">
                                {errors.licenseNumber}
                            </p>
                        )}
                    </div>
                </fieldset>

                <Button
                    type="submit"
                    disabled={!unlocked}
                    className="h-12 w-full rounded-lg bg-rideon-green text-sm font-bold text-white shadow-[0_8px_20px_rgba(118,192,67,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-green/90 hover:shadow-[0_12px_28px_rgba(118,192,67,0.32)] disabled:pointer-events-none disabled:opacity-60"
                >
                    <Lock className="size-4" strokeWidth={2.25} />
                    Create Account
                </Button>
            </form>
        </section>
    )
}
