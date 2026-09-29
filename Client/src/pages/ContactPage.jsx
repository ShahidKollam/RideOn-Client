import { useDocumentTitle } from '@/lib/useDocumentTitle'
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useToast } from '@/context/ToastContext'

const contactItems = [
    {
        icon: Mail,
        title: 'Email us',
        value: 'support@rideon.in',
        description: 'For questions, support and general enquiries.',
        tone: 'blue',
    },
    {
        icon: Phone,
        title: 'Call us',
        value: '+91 98765 43210',
        description: 'Talk to the RideOn support team directly.',
        tone: 'green',
    },
    {
        icon: MapPin,
        title: 'Campus location',
        value: 'Student Activity Centre, Campus',
        description: 'Visit us at our designated campus location.',
        tone: 'blue',
    },
]

export default function ContactPage() {
    useDocumentTitle('Contact')

    const { showToast } = useToast()
    const [sent, setSent] = useState(false)

    const submit = (e) => {
        e.preventDefault()

        setSent(true)

        showToast({
            type: 'success',
            title: 'Message saved',
            description:
                'Our support team will get back to you soon.',
        })
    }

    return (
        <div className="min-h-screen bg-white">
            <main>

                {/* =====================================================
                    HERO
                ====================================================== */}

                <section className="bg-[#f8fafc] pt-24 sm:pt-28 lg:pt-30">
                    <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-9 lg:px-8">

                        <div className="max-w-3xl">
                            {/* Eyebrow */}

                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-rideon-green sm:text-xs">
                                    Contact us
                                </span>

                                <span className="h-px w-8 bg-rideon-green/60" />
                            </div>

                            {/* Heading */}

                            <h1 className="mt-3 text-[36px] font-extrabold leading-[1] tracking-[-0.04em] text-rideon-dark sm:text-5xl lg:text-[52px]">
                                We’re{' '}
                                <span className="text-rideon-blue">
                                    here
                                </span>{' '}
                                to{' '}
                                <span className="text-rideon-green">
                                    help.
                                </span>
                            </h1>

                            <p className="mt-4 max-w-xl text-sm leading-6 text-[#52668f] sm:text-base">
                                Have a question about your campus ride?
                                Reach out and we’ll point you in the
                                right direction.
                            </p>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    CONTACT CARDS
                ====================================================== */}

                <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-7 lg:px-8">
                    <div className="grid gap-3 md:grid-cols-3">
                        {contactItems.map(
                            ({
                                icon: Icon,
                                title,
                                value,
                                description,
                                tone,
                            }) => {
                                const isGreen = tone === 'green'

                                return (
                                    <div
                                        key={title}
                                        className={[
                                            'group relative overflow-hidden rounded-[18px] border bg-white p-4 transition-all duration-300',
                                            isGreen
                                                ? 'border-green-100 hover:border-rideon-green/30 hover:shadow-[0_12px_30px_rgba(102,191,57,0.08)]'
                                                : 'border-blue-100 hover:border-rideon-blue/30 hover:shadow-[0_12px_30px_rgba(29,140,248,0.08)]',
                                            'hover:-translate-y-0.5',
                                        ].join(' ')}
                                    >
                                        {/* Accent */}

                                        <span
                                            className={[
                                                'absolute left-0 top-4 h-9 w-0.5 rounded-r-full',
                                                isGreen
                                                    ? 'bg-rideon-green'
                                                    : 'bg-rideon-blue',
                                            ].join(' ')}
                                        />

                                        <div className="flex items-start gap-3">
                                            <span
                                                className={[
                                                    'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
                                                    isGreen
                                                        ? 'bg-green-50 text-rideon-green'
                                                        : 'bg-blue-50 text-rideon-blue',
                                                ].join(' ')}
                                            >
                                                <Icon
                                                    className="size-[18px]"
                                                    strokeWidth={1.8}
                                                />
                                            </span>

                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-[#7181a1]">
                                                    {title}
                                                </p>

                                                <p
                                                    className={[
                                                        'mt-0.5 truncate text-sm font-extrabold',
                                                        isGreen
                                                            ? 'text-rideon-green'
                                                            : 'text-rideon-blue',
                                                    ].join(' ')}
                                                >
                                                    {value}
                                                </p>

                                                <p className="mt-1 text-[11px] leading-5 text-[#7181a1]">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                        )}
                    </div>
                </section>

                {/* =====================================================
                    MAIN CONTACT AREA
                ====================================================== */}

                <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">

                        {/* =================================================
                            SUPPORT PANEL
                        ================================================== */}

                        <div className="relative overflow-hidden rounded-[22px] bg-[#09294f] p-5 shadow-[0_16px_38px_rgba(9,41,79,0.12)] sm:p-6">

                            <div className="relative">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10">
                                    <MessageCircle
                                        className="size-[18px]"
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-rideon-green">
                                    RideOn support
                                </p>

                                <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-[28px]">
                                    We’re only a{' '}
                                    <span className="text-rideon-green">
                                        message
                                    </span>{' '}
                                    away.
                                </h2>

                                <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
                                    Whether you need help with a booking,
                                    payment or pickup, our team is here
                                    to help.
                                </p>

                                {/* Support points */}

                                <div className="mt-6 space-y-3">
                                    <SupportPoint
                                        icon={Clock3}
                                        text="Quick support for campus rides"
                                    />

                                    <SupportPoint
                                        icon={ShieldCheck}
                                        text="Help with booking and payments"
                                    />

                                    <SupportPoint
                                        icon={MapPin}
                                        text="Pickup location assistance"
                                    />
                                </div>

                                {/* Contact number */}

                                <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3">
                                    <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-rideon-green">
                                        <Phone className="size-4" />
                                    </span>

                                    <div>
                                        <p className="text-[10px] text-white/45">
                                            Call us
                                        </p>

                                        <p className="mt-0.5 text-xs font-bold text-white">
                                            +91 98765 43210
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            FORM
                        ================================================== */}

                        <form
                            onSubmit={submit}
                            className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_7px_24px_rgba(28,55,113,0.04)] sm:p-6"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-rideon-green sm:text-xs">
                                    Send a message
                                </span>

                                <span className="h-px w-8 bg-rideon-green/60" />
                            </div>

                            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-rideon-dark">
                                How can we{' '}
                                <span className="text-rideon-blue">
                                    help?
                                </span>
                            </h2>

                            <p className="mt-1.5 text-sm leading-6 text-[#7181a1]">
                                Tell us what you need and we’ll get back
                                to you.
                            </p>

                            {/* Fields */}

                            <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
                                <FormField
                                    id="name"
                                    label="Your name"
                                    placeholder="Enter your name"
                                />

                                <FormField
                                    id="email"
                                    label="Email address"
                                    type="email"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="mt-3.5">
                                <label
                                    htmlFor="message"
                                    className="mb-1.5 block text-xs font-bold text-rideon-dark"
                                >
                                    Message
                                </label>

                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={5}
                                    placeholder="Tell us how we can help..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-rideon-dark outline-none transition-all placeholder:text-slate-400 focus:border-rideon-blue focus:ring-4 focus:ring-rideon-blue/10"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="group mt-4 h-11 w-full rounded-xl bg-rideon-blue font-bold text-white shadow-[0_7px_18px_rgba(29,140,248,0.17)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_10px_24px_rgba(29,140,248,0.22)]"
                            >
                                {sent ? (
                                    <>
                                        Message sent
                                        <CheckCircle2 className="ml-2 size-4" />
                                    </>
                                ) : (
                                    <>
                                        Send message
                                        <Send className="ml-2 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </>
                                )}
                            </Button>

                            <p className="mt-2.5 text-center text-[10px] text-[#8a98b1]">
                                We’ll use your details only to respond
                                to your enquiry.
                            </p>
                        </form>
                    </div>
                </section>

                {/* =====================================================
                    CAMPUS LOCATION
                ====================================================== */}

                <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 rounded-[18px] border border-slate-200 bg-[#f8fafc] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-rideon-blue">
                                <MapPin className="size-4" />
                            </span>

                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-rideon-green">
                                    Campus pickup point
                                </p>

                                <p className="mt-0.5 text-sm font-bold text-rideon-dark">
                                    Student Activity Centre
                                </p>
                            </div>
                        </div>

                        <span className="text-xs font-semibold text-[#7181a1]">
                            NIT Calicut campus
                        </span>
                    </div>
                </section>

                {/* =====================================================
                    FINAL CTA
                ====================================================== */}

                <section className="mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-6 sm:pb-14 lg:px-8">
                    <div className="relative overflow-hidden rounded-[22px] bg-[#061b35] px-5 py-6 shadow-[0_18px_42px_rgba(6,27,53,0.14)] sm:px-7 sm:py-7">
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-rideon-green">
                                    Ready to ride?
                                </p>

                                <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                    Your ride is just a{' '}
                                    <span className="text-rideon-blue">
                                        click
                                    </span>{' '}
                                    <span className="text-rideon-green">
                                        away.
                                    </span>
                                </h2>

                                <p className="mt-1.5 text-xs text-white/55 sm:text-sm">
                                    Book your campus scooter in just a
                                    few simple steps.
                                </p>
                            </div>

                            <Button
                                asChild
                                className="group h-10 shrink-0 rounded-xl bg-rideon-blue px-5 text-xs font-bold text-white shadow-lg hover:bg-rideon-blue/90"
                            >
                                <Link to="/booking">
                                    Book Your Ride
                                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

/* ============================================================
   SUPPORT POINT
============================================================ */

function SupportPoint({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-rideon-green ring-1 ring-white/10">
                <Icon
                    className="size-4"
                    strokeWidth={1.8}
                />
            </span>

            <p className="text-xs font-medium text-white/70">
                {text}
            </p>
        </div>
    )
}

/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
    id,
    label,
    type = 'text',
    placeholder,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-xs font-bold text-rideon-dark"
            >
                {label}
            </label>

            <input
                id={id}
                name={id}
                type={type}
                required
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-rideon-dark outline-none transition-all placeholder:text-slate-400 focus:border-rideon-blue focus:ring-4 focus:ring-rideon-blue/10"
            />
        </div>
    )
}