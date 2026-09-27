import { useState } from 'react'
import {
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    FileText,
    Info,
    MousePointerClick,
    ShieldCheck,
} from 'lucide-react'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { cn } from '@/lib/utils'

const chargeTiers = [
    {
        label: 'More than 72 hours before pickup',
        charge: '25%',
        refund: "You'll receive 75% refund.",
        tone: 'green',
    },
    {
        label: '48 – 72 hours before pickup',
        charge: '50%',
        refund: "You'll receive 50% refund.",
        tone: 'blue',
    },
    {
        label: '24 – 48 hours before pickup',
        charge: '75%',
        refund: "You'll receive 25% refund.",
        tone: 'amber',
    },
    {
        label: 'Less than 24 hours before pickup',
        charge: '100%',
        refund: 'No refund.',
        tone: 'red',
    },
]

const toneStyles = {
    green: {
        card: 'border-green-100 bg-green-50/70',
        icon: 'bg-green-100 text-green-600',
        charge: 'text-green-600',
        refund: 'text-green-700/80',
    },
    blue: {
        card: 'border-blue-100 bg-blue-50/70',
        icon: 'bg-blue-100 text-blue-600',
        charge: 'text-blue-600',
        refund: 'text-blue-700/80',
    },
    amber: {
        card: 'border-amber-100 bg-amber-50/70',
        icon: 'bg-amber-100 text-amber-600',
        charge: 'text-amber-600',
        refund: 'text-amber-700/80',
    },
    red: {
        card: 'border-red-100 bg-red-50/70',
        icon: 'bg-red-100 text-red-500',
        charge: 'text-red-500',
        refund: 'text-red-600/80',
    },
}

const steps = [
    {
        n: 1,
        title: 'Go to Your Bookings',
        description: 'Open your booking from the app or website.',
        Icon: CalendarDays,
        color: 'bg-rideon-blue text-white',
        iconBg: 'bg-blue-50 text-rideon-blue',
    },
    {
        n: 2,
        title: 'Click Cancel Booking',
        description: 'Follow the cancellation steps.',
        Icon: MousePointerClick,
        color: 'bg-rideon-green text-white',
        iconBg: 'bg-green-50 text-rideon-green',
    },
    {
        n: 3,
        title: 'Get Confirmation',
        description: "You'll receive a confirmation with refund details (if applicable).",
        Icon: FileText,
        color: 'bg-rideon-blue text-white',
        iconBg: 'bg-blue-50 text-rideon-blue',
    },
    {
        n: 4,
        title: 'Refund Processed',
        description: 'The amount will be refunded to your original payment method as per the policy.',
        Icon: CheckCircle2,
        color: 'bg-rideon-green text-white',
        iconBg: 'bg-green-50 text-rideon-green',
    },
]

const faqs = [
    {
        q: 'Can I cancel my booking after the pickup time?',
        a: 'No. Once the scheduled pickup time has passed, the booking cannot be cancelled and is treated as a no-show. The full booking amount is non-refundable in that case.',
    },
    {
        q: 'When will I get my refund?',
        a: 'If a refund applies under this policy, it is initiated after you confirm cancellation. The amount is returned to your original payment method. Bank or card processing usually takes 5–7 business days.',
    },
    {
        q: 'Is there a cancellation fee?',
        a: 'Yes. A cancellation charge is applied based on how long before pickup you cancel. The charge is a percentage of the total booking amount, as shown in the Cancellation Charges section above. The remainder (if any) is refunded.',
    },
    {
        q: 'What if I face an issue while cancelling?',
        a: 'If something goes wrong while cancelling, contact our support team with your booking number. We’ll help you complete the cancellation or clarify the refund status.',
    },
]

function FaqItem({ item, open, onToggle }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open}
            >
                <span className="text-sm font-semibold text-rideon-dark sm:text-[15px]">{item.q}</span>
                <ChevronDown
                    className={cn(
                        'size-5 shrink-0 text-slate-400 transition-transform duration-200',
                        open && 'rotate-180 text-rideon-blue',
                    )}
                />
            </button>
            <div
                className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
            >
                <div className="overflow-hidden">
                    <p className="border-t border-slate-100 px-5 pb-4 pt-3 text-sm leading-6 text-slate-500">
                        {item.a}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function CancellationPolicyPage() {
    useDocumentTitle('Cancellation Policy')
    const [openFaq, setOpenFaq] = useState(null)

    return (
        <div className="relative overflow-hidden bg-slate-50/50 pt-24 pb-14 sm:pt-28 sm:pb-16">
            {/* Soft background blobs */}
            <div
                className="pointer-events-none absolute -right-16 top-10 size-72 rounded-full bg-rideon-blue/10 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-20 top-40 size-64 rounded-full bg-rideon-green/10 blur-3xl"
                aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-rideon-green">
                            Cancellation Policy
                        </p>
                        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-rideon-dark sm:text-4xl lg:text-[2.75rem]">
                            Flexible Plans,{' '}
                            <span className="text-rideon-blue">Fair</span>{' '}
                            <span className="text-rideon-green">Cancellation.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-[15px]">
                            We understand that plans can change. Our cancellation policy is designed to be
                            simple, transparent, and fair for everyone.
                        </p>
                    </div>

                    {/* Decorative calendar illustration */}
                    <div className="relative mx-auto hidden h-44 w-44 items-center justify-center lg:flex" aria-hidden>
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100/80 to-green-100/60 blur-sm" />
                        <div className="relative flex size-36 flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-[0_16px_40px_rgba(29,140,248,0.15)]">
                            <div className="flex h-9 items-center justify-center bg-rideon-blue">
                                <div className="flex gap-1.5">
                                    <span className="size-1.5 rounded-full bg-white/80" />
                                    <span className="size-1.5 rounded-full bg-white/80" />
                                    <span className="size-1.5 rounded-full bg-white/80" />
                                </div>
                            </div>
                            <div className="grid flex-1 grid-cols-4 gap-1.5 p-3">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <span
                                        key={i}
                                        className={cn(
                                            'rounded-md bg-slate-100',
                                            i === 5 && 'bg-rideon-blue/20',
                                            i === 6 && 'bg-rideon-green/25',
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex size-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30">
                            <span className="text-2xl font-bold leading-none">×</span>
                        </div>
                    </div>
                </div>

                {/* Policy intro card */}
                <div className="mt-10 flex gap-4 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-5 sm:p-6">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rideon-blue/10 text-rideon-blue">
                        <ShieldCheck className="size-5" strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold text-rideon-dark">Cancellation Policy</h2>
                        <p className="mt-1.5 text-sm leading-6 text-slate-500">
                            You can cancel your booking based on the time remaining before your scheduled
                            pickup time. The refund amount depends on how early you cancel.
                        </p>
                    </div>
                </div>

                {/* Cancellation Charges */}
                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                    <h2 className="text-xl font-extrabold text-rideon-dark">
                        Cancellation <span className="text-rideon-blue">Charges</span>
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Cancellation charges are based on the time remaining before your scheduled pickup time.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {chargeTiers.map((tier) => {
                            const s = toneStyles[tier.tone]
                            return (
                                <div
                                    key={tier.label}
                                    className={cn(
                                        'flex flex-col rounded-xl border p-4',
                                        s.card,
                                    )}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <span
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                                s.icon,
                                            )}
                                        >
                                            <CalendarDays className="size-4" strokeWidth={2} />
                                        </span>
                                        <p className="text-xs font-semibold leading-5 text-slate-600">
                                            {tier.label}
                                        </p>
                                    </div>
                                    <p className={cn('mt-4 text-3xl font-extrabold tracking-tight', s.charge)}>
                                        {tier.charge}
                                    </p>
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">of total amount</p>
                                    <p
                                        className={cn(
                                            'mt-3 border-t border-black/5 pt-3 text-xs font-medium',
                                            s.refund,
                                        )}
                                    >
                                        {tier.refund}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* How to Cancel */}
                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                    <h2 className="text-xl font-extrabold text-rideon-dark">
                        How to <span className="text-rideon-blue">Cancel</span>
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Follow these simple steps to cancel your booking.
                    </p>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, idx) => (
                            <div key={step.n} className="relative flex flex-col items-start">
                                {idx < steps.length - 1 && (
                                    <div
                                        className="pointer-events-none absolute left-[calc(50%+1.5rem)] top-5 hidden h-px w-[calc(100%-3rem)] border-t border-dashed border-slate-200 lg:block"
                                        aria-hidden
                                    />
                                )}
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className={cn(
                                            'flex size-8 items-center justify-center rounded-full text-sm font-bold',
                                            step.color,
                                        )}
                                    >
                                        {step.n}
                                    </span>
                                    <span
                                        className={cn(
                                            'flex size-10 items-center justify-center rounded-xl',
                                            step.iconBg,
                                        )}
                                    >
                                        <step.Icon className="size-5" strokeWidth={1.9} />
                                    </span>
                                </div>
                                <h3 className="mt-4 text-sm font-bold text-rideon-dark">{step.title}</h3>
                                <p className="mt-1.5 text-xs leading-5 text-slate-500">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="mt-10">
                    <h2 className="text-xl font-extrabold text-rideon-dark sm:text-2xl">
                        Frequently Asked <span className="text-rideon-blue">Questions</span>
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">Got questions? We&apos;ve got answers.</p>

                    <div className="mt-5 space-y-3">
                        {faqs.map((item, i) => (
                            <FaqItem
                                key={item.q}
                                item={item}
                                open={openFaq === i}
                                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                            />
                        ))}
                    </div>
                </section>

                {/* Support note */}
                <div className="mt-8 flex gap-3 rounded-xl border border-blue-100 bg-[#f4f8ff] px-4 py-3.5 text-sm text-slate-600">
                    <Info className="mt-0.5 size-5 shrink-0 text-rideon-blue" strokeWidth={2} />
                    <p>
                        If you need any support regarding a cancellation, feel free to contact our team.
                    </p>
                </div>
            </div>
        </div>
    )
}
