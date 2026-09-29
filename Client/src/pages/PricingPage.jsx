import { useEffect, useMemo, useState } from 'react'
import {
    ArrowRight,
    Bike,
    CheckCircle2,
    Clock3,
    Fuel,
    Gauge,
    Info,
    ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ErrorState, SkeletonCard } from '@/components/ui/PageStates'
import { getApiErrorMessage } from '@/lib/apiClient'
import { getPricingPackages } from '@/services/pricingService'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

/* ============================================================
   HELPERS
============================================================ */

const money = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN')}`

const durationLabel = (hours) =>
    `${hours} ${Number(hours) === 1 ? 'Hour' : 'Hours'}`

const packageName = (item) =>
    item.packageName || durationLabel(item.durationHours)

/* ============================================================
   PAGE
============================================================ */

export default function PricingPage() {
    useDocumentTitle('Pricing')

    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getPricingPackages()
            .then(setPackages)
            .catch((requestError) =>
                setError(
                    getApiErrorMessage(
                        requestError,
                        'We could not load pricing packages.',
                    ),
                ),
            )
            .finally(() => setLoading(false))
    }, [])

    /* ---------------------------------------------------------
       SORT PACKAGES
    --------------------------------------------------------- */

    const sortedPackages = useMemo(() => {
        return [...packages].sort(
            (a, b) =>
                Number(a.durationHours || 0) -
                Number(b.durationHours || 0),
        )
    }, [packages])

    /* ---------------------------------------------------------
       SHARED PRICING VALUES
    --------------------------------------------------------- */

    const deposit = useMemo(
        () => packages[0]?.depositAmount,
        [packages],
    )

    const extraKmRate = useMemo(
        () => packages[0]?.extraKmRate,
        [packages],
    )

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-20 sm:pt-24 lg:pt-28">
            <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">

                {/* =====================================================
                    HERO
                ====================================================== */}

                <section className="relative overflow-hidden pb-1 sm:pb-3">
                    {/* Ambient background */}

                    <div className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full bg-rideon-blue/[0.045] blur-3xl" />

                    <div className="pointer-events-none absolute -left-32 top-20 size-64 rounded-full bg-rideon-green/[0.04] blur-3xl" />

                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-rideon-green">
                                Ride pricing
                            </span>

                            <span className="h-px w-8 bg-rideon-green/60" />
                        </div>

                        <h1 className="mt-3 whitespace-normal text-3xl font-extrabold leading-[1.05] tracking-tight text-rideon-dark sm:whitespace-nowrap sm:text-5xl lg:text-[52px]">
                            Clear pricing.{' '}
                            <span className="text-rideon-blue">
                                Confident
                            </span>{' '}
                            <span className="text-rideon-green">
                                riding.
                            </span>
                        </h1>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#40537e] sm:text-base">
                            Choose the time that works for your ride.
                            Every package includes a generous KM
                            allowance with no complicated pricing.
                        </p>
                    </div>
                </section>

                {/* =====================================================
                    ALL RENTAL PACKAGES
                ====================================================== */}

                <section className="mt-8 sm:mt-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-rideon-green">
                                    Rental packages
                                </span>

                                <span className="h-px w-8 bg-rideon-green/60" />
                            </div>

                            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-rideon-dark sm:text-3xl">
                                Choose{' '}
                                <span className="text-rideon-blue">
                                    your
                                </span>{' '}
                                <span className="text-rideon-green">
                                    duration
                                </span>
                            </h2>

                            <p className="mt-1.5 text-sm text-[#40537e]">
                                Simple pricing for every kind of campus ride.
                            </p>
                        </div>

                        {!loading &&
                            !error &&
                            packages.length > 0 && (
                                <div className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#7181a1] shadow-[0_4px_14px_rgba(28,55,113,0.04)]">
                                    <Bike className="size-3.5 text-rideon-blue" />
                                    {packages.length} packages
                                </div>
                            )}
                    </div>

                    {/* Loading */}

                    {loading ? (
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from(
                                { length: 12 },
                                (_, index) => (
                                    <SkeletonCard
                                        key={index}
                                        className="h-[148px] rounded-2xl"
                                    />
                                ),
                            )}
                        </div>
                    ) : error ? (
                        <div className="mt-5">
                            <ErrorState message={error} />
                        </div>
                    ) : sortedPackages.length ? (
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                            {sortedPackages.map((item, index) => (
                                <PackageCard
                                    key={item.id}
                                    item={item}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                            Pricing packages are not available at the moment.
                        </div>
                    )}
                </section>

                {/* =====================================================
                    EXTENSION INFO
                ====================================================== */}

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3.5 sm:px-5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-rideon-blue shadow-sm transition-transform duration-300 hover:scale-105">
                        <Info className="size-4" />
                    </span>

                    <p className="text-xs leading-5 text-[#40537e] sm:text-sm">
                        <span className="font-bold text-rideon-dark">
                            Need more time?
                        </span>{' '}
                        Extend your ride easily from your dashboard.
                    </p>
                </div>

                {/* =====================================================
                    PRICING DETAILS
                ====================================================== */}

                <section className="mt-9 sm:mt-11">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-rideon-green">
                            Good to know
                        </span>

                        <span className="h-px w-8 bg-rideon-green/60" />
                    </div>

                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-rideon-dark sm:text-3xl">
                        Everything you{' '}
                        <span className="text-rideon-blue">
                            need
                        </span>{' '}
                        <span className="text-rideon-green">
                            to know
                        </span>
                    </h2>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <InfoCard
                            icon={ShieldCheck}
                            title="Refundable security deposit"
                            value={
                                deposit === undefined
                                    ? 'Shown at booking'
                                    : money(deposit)
                            }
                            description="Refunded after safe return of the bike."
                            tone="green"
                        />

                        <InfoCard
                            icon={Gauge}
                            title="Extra KM charge"
                            value={
                                extraKmRate === undefined
                                    ? 'Shown at booking'
                                    : `${money(extraKmRate)} / km`
                            }
                            description="Applies after the included KM limit."
                            tone="blue"
                        />

                        <InfoCard
                            icon={Fuel}
                            title="Fuel policy"
                            description="Return the bike with the same fuel level as provided."
                            tone="amber"
                        />
                    </div>
                </section>

                {/* =====================================================
                    FINAL CTA
                ====================================================== */}

                <section className="relative mt-9 overflow-hidden rounded-3xl bg-[#09294f] px-5 py-7 shadow-[0_18px_45px_rgba(9,41,79,0.16)] sm:mt-11 sm:px-8 sm:py-8">
                    {/* Background effects */}

                    <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-rideon-blue/20 blur-2xl" />

                    <div className="pointer-events-none absolute -bottom-24 right-24 size-48 rounded-full bg-rideon-green/15 blur-2xl" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rideon-green">
                                Ready to ride?
                            </p>

                            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                Pick your plan and{' '}
                                <span className="text-rideon-green">
                                    hit the road.
                                </span>
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-white/70">
                                Pick your duration, confirm your booking and
                                get moving.
                            </p>
                        </div>

                        <Button
                            className="h-11 shrink-0 rounded-xl bg-white px-5 font-bold text-rideon-dark shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl"
                            asChild
                        >
                            <Link to="/booking">
                                Book a Ride
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* =====================================================
                    SAFETY NOTE
                ====================================================== */}

                <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3.5 sm:items-center sm:px-5">
                    <Info className="size-4 shrink-0 text-rideon-blue" />

                    <p className="text-xs leading-5 text-[#40537e] sm:text-sm">
                        All prices are inclusive of basic insurance. Helmets
                        and essential safety gear are provided at no extra
                        cost.
                    </p>
                </div>
            </main>
        </div>
    )
}

/* ============================================================
   PACKAGE CARD
============================================================ */

function PackageCard({ item, index }) {
    /*
     * IMPORTANT:
     * API uses `isFeatured`, not `featured`.
     */

    const isFeatured = item.isFeatured === true

    /*
     * Alternate the featured accent between RideOn colors.
     *
     * Featured:
     *   Blue
     *   Green
     *   Blue
     *
     * Normal:
     *   Mostly neutral with subtle blue/green hover.
     */

    const featuredIsGreen = index % 2 === 1

    const featuredStyles = featuredIsGreen
        ? {
              card: [
                  'border-rideon-green/25',
                  'bg-gradient-to-br',
                  'from-white',
                  'via-white',
                  'to-green-50/70',
                  'shadow-[0_8px_28px_rgba(102,191,57,0.07)]',
                  'hover:border-rideon-green/45',
                  'hover:shadow-[0_16px_38px_rgba(102,191,57,0.12)]',
              ].join(' '),

              accent:
                  'bg-rideon-green',

              icon:
                  'bg-green-50 text-rideon-green ring-green-100',

              badge:
                  'bg-green-50 text-rideon-green ring-green-100',

              included:
                  'text-rideon-green',

              extra:
                  'text-rideon-green',

              hoverIcon:
                  'group-hover:bg-rideon-green group-hover:text-white',
          }
        : {
              card: [
                  'border-rideon-blue/25',
                  'bg-gradient-to-br',
                  'from-white',
                  'via-white',
                  'to-blue-50/70',
                  'shadow-[0_8px_28px_rgba(29,140,248,0.07)]',
                  'hover:border-rideon-blue/45',
                  'hover:shadow-[0_16px_38px_rgba(29,140,248,0.12)]',
              ].join(' '),

              accent:
                  'bg-rideon-blue',

              icon:
                  'bg-blue-50 text-rideon-blue ring-blue-100',

              badge:
                  'bg-blue-50 text-rideon-blue ring-blue-100',

              included:
                  'text-rideon-blue',

              extra:
                  'text-rideon-blue',

              hoverIcon:
                  'group-hover:bg-rideon-blue group-hover:text-white',
          }

    const normalStyles = index % 2 === 1
        ? {
              border:
                  'hover:border-rideon-green/25 hover:shadow-[0_14px_32px_rgba(102,191,57,0.08)]',
              icon:
                  'bg-green-50 text-rideon-green group-hover:bg-rideon-green group-hover:text-white',
              accent:
                  'bg-rideon-green',
              text:
                  'text-rideon-green',
          }
        : {
              border:
                  'hover:border-rideon-blue/25 hover:shadow-[0_14px_32px_rgba(29,140,248,0.08)]',
              icon:
                  'bg-blue-50 text-rideon-blue group-hover:bg-rideon-blue group-hover:text-white',
              accent:
                  'bg-rideon-blue',
              text:
                  'text-rideon-blue',
          }

    return (
        <article
            className={[
                'group relative flex min-h-[148px] flex-col overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 ease-out sm:min-h-[154px] sm:p-4',

                isFeatured
                    ? featuredStyles.card
                    : [
                          'border-slate-200',
                          'bg-white',
                          'shadow-[0_6px_20px_rgba(28,55,113,0.035)]',
                          normalStyles.border,
                      ].join(' '),

                'hover:-translate-y-0.5',
            ].join(' ')}
        >
            {/* =====================================================
                FEATURED TOP ACCENT
            ====================================================== */}

            {isFeatured && (
                <span
                    className={[
                        'absolute left-4 right-4 top-0 h-0.5 rounded-full',
                        featuredStyles.accent,
                    ].join(' ')}
                />
            )}

            {/* =====================================================
                FEATURED BADGE
            ====================================================== */}

            {isFeatured && (
                <span
                    className={[
                        'absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] ring-1 sm:right-4 sm:top-3.5',
                        featuredStyles.badge,
                    ].join(' ')}
                >
                    <span
                        className={[
                            'size-1.5 rounded-full',
                            featuredStyles.accent,
                        ].join(' ')}
                    />

                    Featured
                </span>
            )}

            {/* =====================================================
                TOP ROW
            ====================================================== */}

            <div className="flex items-start justify-between gap-2">
                <span
                    className={[
                        'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition-all duration-300 sm:size-9',
                        isFeatured
                            ? featuredStyles.icon
                            : normalStyles.icon,
                    ].join(' ')}
                >
                    <Clock3
                        className="size-4 sm:size-[17px]"
                        strokeWidth={1.9}
                    />
                </span>

                <span
                    className={[
                        'rounded-full px-2 py-1 text-[9px] font-bold',
                        isFeatured
                            ? 'bg-white/80 text-[#7181a1] ring-1 ring-slate-100'
                            : 'bg-slate-50 text-[#7181a1]',
                    ].join(' ')}
                >
                    {item.includedKm} km
                </span>
            </div>

            {/* =====================================================
                PACKAGE NAME + PRICE
            ====================================================== */}

            <div className="mt-2.5">
                <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-[#40537e] sm:text-[13px]">
                        {packageName(item)}
                    </p>

                    {isFeatured && (
                        <span
                            className={[
                                'hidden text-[9px] font-bold sm:inline',
                                featuredIsGreen
                                    ? 'text-rideon-green'
                                    : 'text-rideon-blue',
                            ].join(' ')}
                        >
                            Popular
                        </span>
                    )}
                </div>

                <p
                    className={[
                        'mt-0.5 text-lg font-extrabold tracking-tight transition-transform duration-300 sm:text-xl',
                        'group-hover:translate-x-0.5',
                        isFeatured
                            ? 'text-rideon-dark'
                            : 'text-rideon-dark',
                    ].join(' ')}
                >
                    {money(item.price)}
                </p>
            </div>

            {/* =====================================================
                BOTTOM INFORMATION
            ====================================================== */}

            <div
                className={[
                    'mt-auto flex items-center justify-between gap-2 border-t pt-2.5',
                    isFeatured
                        ? 'border-slate-200/80'
                        : 'border-slate-100/80',
                ].join(' ')}
            >
                <span className="flex min-w-0 items-center gap-1.5 text-[10px] text-[#7181a1] sm:text-[11px]">
                    <CheckCircle2
                        className={[
                            'size-3.5 shrink-0',
                            isFeatured
                                ? featuredStyles.included
                                : normalStyles.text,
                        ].join(' ')}
                        strokeWidth={2}
                    />

                    <span className="truncate">
                        {item.includedKm} km included
                    </span>
                </span>

                <span
                    className={[
                        'whitespace-nowrap text-[10px] font-bold sm:text-[11px]',
                        isFeatured
                            ? featuredStyles.extra
                            : normalStyles.text,
                    ].join(' ')}
                >
                    {money(item.extraKmRate)}/km
                </span>
            </div>
        </article>
    )
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
    icon: Icon,
    title,
    value,
    description,
    tone,
}) {
    const styles = {
        green: {
            card: 'border-green-100 bg-green-50/50 hover:border-green-200 hover:shadow-[0_14px_30px_rgba(76,175,80,0.08)]',
            icon: 'bg-green-100 text-rideon-green',
            value: 'text-rideon-green',
        },

        blue: {
            card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 hover:shadow-[0_14px_30px_rgba(29,140,248,0.08)]',
            icon: 'bg-blue-100 text-rideon-blue',
            value: 'text-rideon-blue',
        },

        amber: {
            card: 'border-amber-100 bg-amber-50/60 hover:border-amber-200 hover:shadow-[0_14px_30px_rgba(245,158,11,0.08)]',
            icon: 'bg-amber-100 text-amber-500',
            value: 'text-amber-500',
        },
    }

    const current = styles[tone]

    return (
        <div
            className={[
                'group rounded-2xl border p-4 transition-all duration-300 sm:p-5',
                current.card,
            ].join(' ')}
        >
            <div className="flex items-start gap-3.5">
                <span
                    className={[
                        'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
                        current.icon,
                    ].join(' ')}
                >
                    <Icon
                        className="size-5"
                        strokeWidth={1.8}
                    />
                </span>

                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-rideon-dark">
                        {title}
                    </h3>

                    {value && (
                        <p
                            className={`mt-0.5 text-xl font-extrabold tracking-tight ${current.value}`}
                        >
                            {value}
                        </p>
                    )}

                    <p className="mt-1 text-xs leading-5 text-[#40537e]">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    )
}