import { CheckCircle2, MailCheck, Send, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import SignupProgress from '@/components/signup/SignupProgress'

export default function SignupStepOne({
    values,
    errors,
    linkSent,
    submitting,
    resending,
    onChange,
    onSubmit,
    onResend,
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:px-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 lg:px-8 lg:py-12">
            <SignupProgress
                step={1}
                title="Create Your Account"
                description="Enter your student details. We'll send a secure magic link to your NITC email."
                active={!linkSent}
                complete={linkSent}
            />

            <form onSubmit={onSubmit} className="mt-8 space-y-6 lg:mt-0">
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

                {linkSent ? (
                    <div className="rounded-lg border border-rideon-green bg-rideon-green/10 px-4 py-4 text-center text-sm text-rideon-dark transition-all duration-300">
                        <div className="flex items-center justify-center gap-2 font-bold text-rideon-green">
                            <MailCheck className="size-5" strokeWidth={2.25} />
                            Check your email
                        </div>
                        <p className="mt-2 leading-6 text-slate-500">
                            We sent a magic login link to your NITC inbox. Open it to verify your email and finish your profile.
                        </p>
                        <button
                            type="button"
                            onClick={onResend}
                            disabled={resending}
                            className="mt-3 inline-flex items-center justify-center gap-2 text-sm font-bold text-rideon-blue transition-colors hover:text-rideon-blue/80 disabled:pointer-events-none disabled:opacity-60"
                        >
                            <CheckCircle2 className="size-4" strokeWidth={2.25} />
                            {resending ? 'Sending...' : 'Resend magic link'}
                        </button>
                    </div>
                ) : (
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="h-12 w-full rounded-lg bg-rideon-blue text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,140,248,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.3)] disabled:pointer-events-none disabled:opacity-70"
                    >
                        <Send className="size-4" strokeWidth={2.25} />
                        {submitting ? 'Sending...' : 'Send Magic Link'}
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
