import {
    Bike,
    CalendarDays,
    CheckCircle2,
    Fuel,
    Gauge,
    HardHat,
    Leaf,
    MapPin,
    Settings2,
    ShieldCheck,
    Sofa,
    Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const highlights = [
    [Gauge, 'Automatic', 'Easy to ride', 'blue'],
    [Fuel, 'Fuel Efficient', 'Save more', 'green'],
    [ShieldCheck, 'Well Maintained', 'Regularly serviced', 'blue'],
    [Leaf, 'Comfortable', 'Smooth rides', 'green'],
]

const whyChoose = [
    [
        Gauge,
        'Smooth Performance',
        'Ideal for city and campus rides.',
        'green',
    ],
    [
        Fuel,
        'Fuel Efficient',
        'Great mileage for everyday use.',
        'blue',
    ],
    [
        Settings2,
        'Automatic Transmission',
        'Easy and convenient to ride.',
        'green',
    ],
    [
        ShieldCheck,
        'Reliable & Safe',
        'Regularly serviced and inspected.',
        'blue',
    ],
    [
        Sofa,
        'Comfortable Ride',
        'Ergonomic seating for long rides.',
        'green',
    ],
    [
        Users,
        'Student Friendly',
        'Perfect for campus commuting.',
        'blue',
    ],
]

const availabilityPoints = [
    'Free bike assigned at booking',
    'Regularly serviced',
    'Safety checked',
    'Student friendly',
]

const toneStyles = {
    blue: {
        icon: 'bg-rideon-blue text-white',
        soft: 'bg-blue-50 text-rideon-blue',
        border: 'border-blue-100/80',
        shadow: 'shadow-[0_8px_22px_rgba(29,140,248,0.07)]',
    },

    green: {
        icon: 'bg-rideon-green text-white',
        soft: 'bg-green-50 text-rideon-green',
        border: 'border-green-100/80',
        shadow: 'shadow-[0_8px_22px_rgba(76,175,80,0.07)]',
    },
}

export default function VehiclesPage() {
    useDocumentTitle('Vehicles')

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-20 sm:pt-24 lg:pt-28">
            <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
                {/* =====================================================
                    VEHICLE HERO
                ====================================================== */}

                <section className="relative overflow-hidden py-3 sm:py-5 lg:py-6">
                    {/* Subtle background glow */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-20 top-0 size-72 rounded-full bg-rideon-blue/[0.065] blur-3xl sm:size-96"
                    />

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 left-1/3 size-60 rounded-full bg-rideon-green/[0.045] blur-3xl"
                    />

                    <div className="relative grid items-center gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-9">
                        {/* =================================================
                            VEHICLE INFORMATION
                        ================================================== */}

                        <div className="relative z-10">
                            <div className="flex items-center gap-3">
                                

                                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-rideon-green sm:text-xs">
                                    Our Vehicle
                                </p>
                                <span className="h-px w-7 bg-rideon-green sm:w-8" />
                            </div>

                            {/* -------------------------------------------------
                                UPDATED SCALE
                                Matches the internal-page heading scale better.
                            -------------------------------------------------- */}

                            <h1 className="mt-3 text-[2.35rem] font-extrabold leading-[0.98] tracking-[-0.045em] text-rideon-dark sm:text-5xl lg:text-[3.25rem] xl:text-[3.35rem]">
                                Honda{' '}
                                <span className="text-rideon-blue">
                                    Act
                                </span>
                                <span className="text-rideon-green">
                                    iva
                                </span>
                            </h1>

                            <p className="mt-4 max-w-xl text-sm leading-6 text-[#40537e] sm:mt-4 sm:text-base sm:leading-7 lg:max-w-lg">
                                Reliable, fuel-efficient and built for
                                everyday campus rides. Comfort you can
                                count on.
                            </p>

                            {/* Actions */}
                            <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
                                <Button
                                    className="h-11 w-full rounded-xl bg-rideon-blue px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,140,248,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_26px_rgba(29,140,248,0.27)] sm:w-auto"
                                    asChild
                                >
                                    <Link to="/booking">
                                        <Bike
                                            className="size-4"
                                            strokeWidth={2.2}
                                        />

                                        Book This Ride
                                    </Link>
                                </Button>

                                <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-green-200 hover:bg-green-50/30 sm:w-auto sm:justify-start sm:text-sm">
                                    <MapPin
                                        className="size-4 shrink-0 text-rideon-green"
                                        strokeWidth={2}
                                    />

                                    NIT Calicut Campus
                                </div>
                            </div>

                            {/* Vehicle highlights — always 2 × 2 */}
                            <div className="mt-6 max-w-xl border-t border-slate-200/80 pt-5 sm:mt-7 sm:pt-5">
                                <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                                    {highlights.map(
                                        (
                                            [
                                                Icon,
                                                title,
                                                description,
                                                tone,
                                            ],
                                            index,
                                        ) => {
                                            const style = toneStyles[tone]

                                            return (
                                                <div
                                                    key={title}
                                                    className="group flex min-w-0 items-center gap-2.5 rounded-[14px] border border-slate-200/70 bg-white/75 px-3 py-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_10px_24px_rgba(28,55,113,0.07)] sm:gap-3 sm:px-3.5 sm:py-3.5"
                                                >
                                                    <span
                                                        className={`
                                                            flex
                                                            size-9
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-[11px]
                                                            transition-transform
                                                            duration-300
                                                            group-hover:scale-105
                                                            sm:size-10
                                                            sm:rounded-[12px]
                                                            ${style.soft}
                                                        `}
                                                    >
                                                        <Icon
                                                            className="size-4 sm:size-[18px]"
                                                            strokeWidth={2}
                                                        />
                                                    </span>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-[11px] font-extrabold leading-4 text-rideon-dark sm:text-[12px] sm:leading-5">
                                                            {title}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-[10px] leading-4 text-slate-500 sm:text-[11px]">
                                                            {description}
                                                        </p>
                                                    </div>

                                                    {/* Tiny index accent */}
                                                    <span
                                                        className={`ml-auto hidden self-start text-[8px] font-extrabold sm:block ${
                                                            index % 2 === 0
                                                                ? 'text-rideon-blue/50'
                                                                : 'text-rideon-green/60'
                                                        }`}
                                                    >
                                                        0{index + 1}
                                                    </span>
                                                </div>
                                            )
                                        },
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            VEHICLE VISUAL
                        ================================================== */}

                        <div className="relative min-h-[290px] overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-50/75 via-white to-green-50/65 shadow-[0_8px_28px_rgba(28,55,113,0.025)] sm:min-h-[350px] sm:rounded-[28px] lg:min-h-[430px]">
                            {/* Soft radial glow */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-0"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 50% 45%, rgba(29,140,248,0.10), transparent 38%)',
                                }}
                            />

                            {/* Decorative rings */}
                            <div
                                aria-hidden="true"
                                className="absolute left-1/2 top-1/2 size-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-rideon-blue/10 sm:size-[250px] lg:size-[300px]"
                            />

                            <div
                                aria-hidden="true"
                                className="absolute left-1/2 top-1/2 size-[140px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-rideon-green/10 sm:size-[190px] lg:size-[220px]"
                            />

                            {/* Small ambient dots */}
                            <span
                                aria-hidden="true"
                                className="absolute left-[18%] top-[28%] size-1.5 rounded-full bg-rideon-blue/20"
                            />

                            <span
                                aria-hidden="true"
                                className="absolute right-[20%] top-[23%] size-2 rounded-full bg-rideon-green/20"
                            />

                            <span
                                aria-hidden="true"
                                className="absolute bottom-[25%] left-[25%] size-1.5 rounded-full bg-rideon-green/20"
                            />

                            {/* Vehicle visual */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <div className="flex size-22 items-center justify-center rounded-[24px] bg-white shadow-[0_16px_38px_rgba(29,140,248,0.12)] transition-transform duration-500 hover:scale-[1.03] sm:size-26 lg:size-28">
                                        <Bike
                                            className="size-13 text-rideon-blue sm:size-15 lg:size-16"
                                            strokeWidth={1.3}
                                        />
                                    </div>

                                    <div className="mt-3 rounded-full border border-slate-100 bg-white/95 px-3.5 py-1.5 text-[10px] font-bold text-rideon-dark shadow-sm sm:mt-3.5 sm:px-4 sm:py-2 sm:text-[11px]">
                                        RideOn Campus Vehicle
                                    </div>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="absolute left-4 top-4 rounded-full border border-blue-100 bg-white/95 px-3 py-1.5 text-[9px] font-extrabold text-rideon-blue shadow-sm sm:left-5 sm:top-5 sm:px-3.5 sm:py-2 sm:text-[11px]">
                                Available for Booking
                            </div>

                            {/* Ready */}
                            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-green-100 bg-white/95 px-3 py-1.5 text-[9px] font-bold text-rideon-green shadow-sm sm:bottom-5 sm:right-5 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[11px]">
                                <span className="size-1.5 rounded-full bg-rideon-green sm:size-2" />
                                Ready to Ride
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    WHY THIS VEHICLE
                ====================================================== */}

                <section className="mt-9 sm:mt-11">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-rideon-green sm:text-xs">
                                Why This Vehicle
                            </p>

                            <span className="h-px w-8 bg-rideon-green/40" />
                        </div>

                        <h2 className="mt-2 text-[1.9rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-rideon-dark sm:mt-3 sm:text-[2.45rem]">
                            Built for{' '}
                            <span className="text-rideon-blue">
                                Campus
                            </span>{' '}
                            <span className="text-rideon-green">
                                Life
                            </span>
                        </h2>

                        <p className="mt-2.5 text-sm leading-6 text-slate-500 sm:text-base">
                            Everything you need for comfortable,
                            convenient everyday rides.
                        </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                        {whyChoose.map(
                            ([Icon, title, description, tone]) => {
                                const style = toneStyles[tone]

                                return (
                                    <article
                                        key={title}
                                        className={`
                                            group
                                            relative
                                            overflow-hidden
                                            rounded-[18px]
                                            border
                                            bg-white
                                            p-4
                                            sm:rounded-[20px]
                                            sm:p-5
                                            ${style.border}
                                            ${style.shadow}
                                            transition-all
                                            duration-300
                                            hover:-translate-y-1
                                            hover:shadow-[0_16px_34px_rgba(15,23,42,0.09)]
                                        `}
                                    >
                                        <div className="flex items-start gap-3.5 sm:gap-4">
                                            <span
                                                className={`
                                                    flex
                                                    size-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-[12px]
                                                    sm:size-11
                                                    sm:rounded-[13px]
                                                    ${style.icon}
                                                    transition-transform
                                                    duration-300
                                                    group-hover:scale-105
                                                `}
                                            >
                                                <Icon
                                                    className="size-[18px] sm:size-5"
                                                    strokeWidth={1.9}
                                                />
                                            </span>

                                            <div className="min-w-0">
                                                <h3 className="text-[13px] font-extrabold leading-5 text-rideon-dark sm:text-[14px]">
                                                    {title}
                                                </h3>

                                                <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:mt-1.5 sm:text-[12px]">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hover accent */}
                                        <div
                                            className={`
                                                absolute
                                                bottom-0
                                                left-5
                                                h-[2px]
                                                w-8
                                                rounded-t-full
                                                opacity-0
                                                transition-all
                                                duration-300
                                                group-hover:w-12
                                                group-hover:opacity-100
                                                ${
                                                    tone === 'green'
                                                        ? 'bg-rideon-green'
                                                        : 'bg-rideon-blue'
                                                }
                                            `}
                                        />
                                    </article>
                                )
                            },
                        )}
                    </div>
                </section>

                {/* =====================================================
                    HELMET + AVAILABILITY
                ====================================================== */}

                <section className="mt-7 grid gap-4 sm:mt-9 lg:grid-cols-2">
                    {/* Helmet */}
                    <article className="rounded-[20px] border border-green-100 bg-gradient-to-br from-white to-green-50/60 p-5 shadow-[0_10px_28px_rgba(76,175,80,0.06)] sm:rounded-[22px] sm:p-6">
                        <div className="flex items-start gap-3.5 sm:gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-rideon-green text-white shadow-[0_7px_16px_rgba(76,175,80,0.18)] sm:size-12 sm:rounded-[14px]">
                                <HardHat
                                    className="size-5"
                                    strokeWidth={1.9}
                                />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">
                                    Helmet Policy
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-extrabold text-rideon-dark sm:text-lg">
                                        1 Helmet Included
                                    </h3>

                                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-rideon-green sm:text-[10px]">
                                        Free
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-green-100 pt-4 sm:mt-5">
                            <span className="text-xs text-slate-500 sm:text-sm">
                                Additional helmet
                            </span>

                            <span className="rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-extrabold text-rideon-green sm:text-xs">
                                ₹30 / ride
                            </span>
                        </div>

                        <p className="mt-3 text-[11px] leading-5 text-slate-500 sm:text-xs">
                            Helmets are cleaned and sanitized before every
                            ride for your safety.
                        </p>
                    </article>

                    {/* Availability */}
                    <article className="rounded-[20px] border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-5 shadow-[0_10px_28px_rgba(29,140,248,0.06)] sm:rounded-[22px] sm:p-6">
                        <div className="flex items-start gap-3.5 sm:gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-rideon-blue text-white shadow-[0_7px_16px_rgba(29,140,248,0.18)] sm:size-12 sm:rounded-[14px]">
                                <MapPin
                                    className="size-5"
                                    strokeWidth={2}
                                />
                            </span>

                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">
                                    Available At
                                </p>

                                <h3 className="mt-1 text-base font-extrabold text-rideon-blue sm:text-lg">
                                    NIT Calicut Campus
                                </h3>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-2">
                            {availabilityPoints.map((point) => (
                                <div
                                    key={point}
                                    className="flex items-center gap-2.5 rounded-xl bg-white/75 px-3 py-2"
                                >
                                    <CheckCircle2
                                        className="size-4 shrink-0 text-rideon-blue"
                                        strokeWidth={2.2}
                                    />

                                    <span className="text-[11px] font-semibold text-slate-600 sm:text-xs">
                                        {point}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>

                {/* =====================================================
                    FINAL BOOKING CTA
                ====================================================== */}

                <section className="relative mt-7 overflow-hidden rounded-[22px] bg-gradient-to-r from-[#071a35] via-[#0b315f] to-[#0c4471] p-5 shadow-[0_16px_38px_rgba(7,34,66,0.17)] sm:mt-9 sm:rounded-[24px] sm:p-8 lg:px-10">
                    <div
                        aria-hidden="true"
                        className="absolute -right-16 -top-20 size-52 rounded-full bg-rideon-blue/20 blur-3xl"
                    />

                    <div
                        aria-hidden="true"
                        className="absolute -bottom-20 left-1/3 size-44 rounded-full bg-rideon-green/10 blur-3xl"
                    />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        <div className="flex items-start gap-3.5 sm:gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-white/10 text-white ring-1 ring-white/10 sm:size-12 sm:rounded-[14px]">
                                <CalendarDays
                                    className="size-5"
                                    strokeWidth={1.9}
                                />
                            </span>

                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-rideon-green sm:text-[11px]">
                                    Ready to Ride?
                                </p>

                                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-white sm:text-2xl">
                                    Book your Honda{' '}
                                    <span className="text-rideon-blue">
                                        ACT
                                    </span>
                                    <span className="text-rideon-green">
                                        IVA
                                    </span>
                                </h2>

                                <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/65 sm:text-sm sm:leading-6">
                                    Choose your time, book your ride, and
                                    enjoy a smooth campus experience.
                                </p>
                            </div>
                        </div>

                        <Button
                            className="h-11 w-full shrink-0 rounded-xl bg-rideon-blue px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,140,248,0.30)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_26px_rgba(29,140,248,0.40)] sm:h-12 sm:w-auto sm:px-6"
                            asChild
                        >
                            <Link to="/booking">
                                <Bike
                                    className="size-4"
                                    strokeWidth={2.2}
                                />

                                Book Your Ride
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    )
}