import { Loader2, MailCheck, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const inputClass =
    'mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-rideon-dark outline-none transition-colors placeholder:text-slate-400 focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15'

export default function SignupStepOne({
    values,
    errors,
    campuses = [],
    linkSent,
    submitting,
    resending,
    onChange,
    onSubmit,
    onResend,
}) {
    if (linkSent) {
        return (
            <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-5 py-6 text-center sm:px-8 sm:py-8">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rideon-green/15 text-rideon-green">
                        <MailCheck className="size-7" strokeWidth={2.25} />
                    </div>
                    <h2 className="mt-4 text-lg font-extrabold text-rideon-dark sm:text-xl">
                        Check your email
                    </h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        We sent a verification link to{' '}
                        <span className="font-semibold text-rideon-dark">{values.nitcEmail}</span>.
                        Open it to verify your account and continue.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    disabled={resending}
                    onClick={onResend}
                    className="h-12 w-full rounded-xl border-slate-200 text-sm font-bold"
                >
                    {resending ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Sending…
                        </>
                    ) : (
                        <>
                            <Send className="size-4" />
                            Resend verification link
                        </>
                    )}
                </Button>

                <p className="text-center text-xs text-slate-500">
                    Wrong email?{' '}
                    <button
                        type="button"
                        className="font-semibold text-rideon-blue hover:underline"
                        onClick={() => onChange('__resetLinkSent', true)}
                    >
                        Use a different address
                    </button>
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-rideon-dark">
                    Full name <span className="text-red-500">*</span>
                </label>
                <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={values.fullName}
                    onChange={(e) => onChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    aria-invalid={Boolean(errors.fullName)}
                    className={cn(inputClass, errors.fullName && 'border-red-400 focus:border-red-500 focus:ring-red-500/15')}
                />
                {errors.fullName && (
                    <p className="mt-1.5 text-sm font-medium text-red-600">{errors.fullName}</p>
                )}
            </div>

            <div>
                <label htmlFor="nitcEmail" className="block text-sm font-bold text-rideon-dark">
                    Email address <span className="text-red-500">*</span>
                </label>
                <input
                    id="nitcEmail"
                    name="nitcEmail"
                    type="email"
                    autoComplete="email"
                    value={values.nitcEmail}
                    onChange={(e) => onChange('nitcEmail', e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.nitcEmail)}
                    className={cn(inputClass, errors.nitcEmail && 'border-red-400 focus:border-red-500 focus:ring-red-500/15')}
                />
                {errors.nitcEmail && (
                    <p className="mt-1.5 text-sm font-medium text-red-600">{errors.nitcEmail}</p>
                )}
            </div>

            <div>
                <label htmlFor="campusId" className="block text-sm font-bold text-rideon-dark">
                    Campus / Pickup location <span className="text-red-500">*</span>
                </label>
                <select
                    id="campusId"
                    name="campusId"
                    value={values.campusId}
                    onChange={(e) => onChange('campusId', e.target.value)}
                    aria-invalid={Boolean(errors.campusId)}
                    className={cn(inputClass, errors.campusId && 'border-red-400 focus:border-red-500 focus:ring-red-500/15')}
                >
                    <option value="">Select pickup location</option>
                    {campuses.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                            {c.location ? ` — ${c.location}` : ''}
                        </option>
                    ))}
                </select>
                {errors.campusId && (
                    <p className="mt-1.5 text-sm font-medium text-red-600">{errors.campusId}</p>
                )}
                <p className="mt-1.5 text-xs text-slate-500">Where you will pick up the bike.</p>
            </div>

            <div>
                <label htmlFor="studentId" className="block text-sm font-bold text-rideon-dark">
                    Student ID <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={values.studentId}
                    onChange={(e) => onChange('studentId', e.target.value)}
                    placeholder="Only if you are a student"
                    className={inputClass}
                />
            </div>

            <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-xl bg-rideon-blue text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,140,248,0.28)] transition-all hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.35)] disabled:opacity-60"
            >
                {submitting ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending link…
                    </>
                ) : (
                    'Send Verification Link'
                )}
            </Button>

            <p className="text-center text-xs leading-5 text-slate-500">
                By continuing you agree to our{' '}
                <a href="/terms" className="font-semibold text-rideon-blue hover:underline">
                    Terms
                </a>{' '}
                and{' '}
                <a href="/privacy" className="font-semibold text-rideon-blue hover:underline">
                    Privacy Policy
                </a>
                . Profile details come after email verification.
            </p>
        </form>
    )
}
