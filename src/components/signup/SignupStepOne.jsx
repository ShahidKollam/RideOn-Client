import { CheckCircle2, Send, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import SignupProgress from '@/components/signup/SignupProgress'

export default function SignupStepOne({
    values,
    errors,
    verified,
    verifying,
    onChange,
    onVerify,
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:px-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 lg:px-8 lg:py-12">
            <SignupProgress
                step={1}
                title="Verify Your Identity"
                description="Enter your details below. We'll send a verification code to your NITC email."
                active={!verified}
                complete={verified}
            />

            <form onSubmit={onVerify} className="mt-8 space-y-6 lg:mt-0">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-bold text-rideon-dark">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={values.fullName}
                        onChange={(event) => onChange('fullName', event.target.value)}
                        placeholder="Enter your full name"
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                        className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15"
                    />
                    {errors.fullName && (
                        <p id="fullName-error" className="mt-2 text-sm font-medium text-rideon-blue">
                            {errors.fullName}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="studentId" className="block text-sm font-bold text-rideon-dark">
                        Student ID
                    </label>
                    <input
                        id="studentId"
                        name="studentId"
                        type="text"
                        value={values.studentId}
                        onChange={(event) => onChange('studentId', event.target.value)}
                        placeholder="Enter your NITC Student ID"
                        aria-invalid={Boolean(errors.studentId)}
                        aria-describedby={errors.studentId ? 'studentId-error' : undefined}
                        className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15"
                    />
                    {errors.studentId && (
                        <p id="studentId-error" className="mt-2 text-sm font-medium text-rideon-blue">
                            {errors.studentId}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="nitcEmail" className="block text-sm font-bold text-rideon-dark">
                        NITC Email
                    </label>
                    <input
                        id="nitcEmail"
                        name="nitcEmail"
                        type="email"
                        value={values.nitcEmail}
                        onChange={(event) => onChange('nitcEmail', event.target.value)}
                        placeholder="Enter your NITC email (e.g. b220123cs@nitc.ac.in)"
                        aria-invalid={Boolean(errors.nitcEmail)}
                        aria-describedby={errors.nitcEmail ? 'nitcEmail-error' : undefined}
                        className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-rideon-dark outline-none transition-colors focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15"
                    />
                    {errors.nitcEmail && (
                        <p id="nitcEmail-error" className="mt-2 text-sm font-medium text-rideon-blue">
                            {errors.nitcEmail}
                        </p>
                    )}
                </div>

                {verified ? (
                    <div className="flex h-12 items-center justify-center gap-2 rounded-lg border border-rideon-green bg-rideon-green/10 text-sm font-bold text-rideon-green transition-all duration-300">
                        <CheckCircle2 className="size-5" strokeWidth={2.25} />
                        Email Verified
                    </div>
                ) : (
                    <Button
                        type="submit"
                        disabled={verifying}
                        className="h-12 w-full rounded-lg bg-rideon-blue text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,140,248,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.3)] disabled:pointer-events-none disabled:opacity-70"
                    >
                        <Send className="size-4" strokeWidth={2.25} />
                        {verifying ? 'Verifying...' : 'Send Verification Code'}
                    </Button>
                )}

                <div className="flex items-center gap-5 text-sm text-slate-500">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span>or</span>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="flex items-start justify-center gap-3 text-center text-sm text-slate-500">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-rideon-dark" strokeWidth={1.8} />
                    <p>We only use your email for verification and account updates.</p>
                </div>
            </form>
        </section>
    )
}
