import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    Check,
    Clock3,
    Sun,
    CalendarDays,
    Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPricingPackages } from '@/services/pricingService'

const money = (n) =>
    `₹${Number(n || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`

/** Dummy fallback so section never looks empty */
const DUMMY_PACKAGES = [
    {
        id: 'dummy-1h',
        packageName: 'Hourly',
        durationHours: 1,
        price: 66.95,
    },
    {
        id: 'dummy-12h',
        packageName: 'Half Day',
        durationHours: 12,
        price: 566.95,
    },
    {
        id: 'dummy-24h',
        packageName: 'Daily',
        durationHours: 24,
        price: 720.34,
    },
]

function packageMeta(pkg) {
    const hours = Number(pkg.durationHours || 0)

    if (hours <= 1) {
        return {
            label: '1 Hour',
            subtitle: 'Short & quick rides',
            icon: Clock3,
            unit: '/hour',
            features: [
                'Perfect for short rides',
                'Minimum 1 hour',
                'Ideal for quick trips',
            ],
        }
    }

    if (hours <= 12) {
        return {
            label: '12 Hours',
            subtitle: 'Half-day freedom',
            icon: Sun,
            unit: '/12 hours',
            features: [
                'Up to 12 hours',
                'Great for classes & errands',
                'Best value for short trips',
            ],
        }
    }

    return {
        label: '24 Hours',
        subtitle: 'Full-day exploration',
        icon: CalendarDays,
        unit: '/24 hours',
        features: [
            'Up to 24 hours',
            'Explore more, worry less',
            'Best for longer rides',
        ],
    }
}

function pickThreePackages(list) {
    const sorted = [...list].sort(
        (a, b) =>
            Number(a.durationHours || 0) -
            Number(b.durationHours || 0),
    )

    const targets = [1, 12, 24]
    const picked = []
    const used = new Set()

    for (const target of targets) {
        const match = sorted.find(
            (pkg) =>
                !used.has(pkg.id) &&
                Math.abs(
                    Number(pkg.durationHours || 0) - target,
                ) < 0.5,
        )

        if (match) {
            picked.push(match)
            used.add(match.id)
        }
    }

    if (picked.length < 3) {
        for (const pkg of sorted) {
            if (picked.length >= 3) break

            if (!used.has(pkg.id)) {
                picked.push(pkg)
                used.add(pkg.id)
            }
        }
    }

    return picked.slice(0, 3)
}

export default function HomePricing() {
    const [packages, setPackages] = useState(DUMMY_PACKAGES)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        ;(async () => {
            try {
                const list = await getPricingPackages()

                if (
                    active &&
                    Array.isArray(list) &&
                    list.length > 0
                ) {
                    setPackages(list)
                }
            } catch {
                // Keep dummy fallback
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        })()

        return () => {
            active = false
        }
    }, [])

    const cards = useMemo(
        () => pickThreePackages(packages),
        [packages],
    )

    return (
        <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-rideon-green sm:text-xs">
                            Simple Pricing
                        </p>

                        <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-rideon-dark sm:text-[2.75rem] lg:text-[3.5rem]">
                            Flexible Plans for{' '}
                            <span className="text-rideon-blue">
                                Every
                            </span>{' '}
                            <span className="text-rideon-green">
                                Need
                            </span>
                        </h2>

                        <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">
                            Choose the plan that works best for you.
                            No hidden charges.
                        </p>
                    </div>

                    <Button
                        className="h-11 shrink-0 self-start rounded-xl bg-rideon-blue px-5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(29,140,248,0.24)] transition-all duration-200 hover:bg-rideon-blue/90 hover:shadow-[0_12px_26px_rgba(29,140,248,0.30)] sm:self-auto"
                        asChild
                    >
                        <Link to="/pricing">
                            View Pricing
                            <ArrowRight className="ml-1 size-4" />
                        </Link>
                    </Button>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-12 lg:gap-6">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-[360px] animate-pulse rounded-[24px] border border-blue-100 bg-blue-50/30"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-12 lg:gap-6">
                        {cards.map((pkg) => {
                            const meta = packageMeta(pkg)
                            const Icon = meta.icon
                            const hours = Number(
                                pkg.durationHours || 0,
                            )

                            const isPopular = hours === 12

                            return (
                                <article
                                    key={pkg.id || meta.label}
                                    className={`
                                        group
                                        relative
                                        flex
                                        min-h-[360px]
                                        h-full
                                        flex-col
                                        overflow-hidden
                                        rounded-[24px]
                                        border
                                        p-6
                                        transition-all
                                        duration-300
                                        hover:-translate-y-1
                                        sm:p-7
                                        lg:p-8
                                        ${
                                            isPopular
                                                ? 'border-rideon-green/30 bg-gradient-to-b from-white via-white to-rideon-green/10 shadow-[0_14px_38px_rgba(76,175,80,0.12)] hover:border-rideon-green/45 hover:shadow-[0_20px_46px_rgba(76,175,80,0.18)]'
                                                : 'border-rideon-blue/15 bg-gradient-to-b from-white via-white to-rideon-blue/8 shadow-[0_12px_32px_rgba(29,140,248,0.08)] hover:border-rideon-blue/25 hover:shadow-[0_18px_42px_rgba(29,140,248,0.15)]'
                                        }
                                    `}
                                >
                                    {/* Soft top-right glow */}
                                    <div
                                        className={`
                                            pointer-events-none
                                            absolute
                                            -right-16
                                            -top-16
                                            size-40
                                            rounded-full
                                            transition-transform
                                            duration-500
                                            group-hover:scale-110
                                            ${
                                                isPopular
                                                    ? 'bg-rideon-green/[0.09]'
                                                    : 'bg-rideon-blue/[0.08]'
                                            }
                                        `}
                                    />

                                    {/* Soft bottom-right glow */}
                                    <div
                                        className={`
                                            pointer-events-none
                                            absolute
                                            -bottom-20
                                            -right-16
                                            size-44
                                            rounded-full
                                            ${
                                                isPopular
                                                    ? 'bg-rideon-green/[0.10]'
                                                    : 'bg-rideon-blue/[0.09]'
                                            }
                                        `}
                                    />

                                    {/* Most Popular */}
                                    {isPopular && (
                                        <div className="absolute right-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full border border-rideon-green/20 bg-rideon-green/10 px-3 py-1.5 text-xs font-bold text-rideon-green shadow-sm">
                                            <Crown
                                                className="size-3.5"
                                                strokeWidth={2.2}
                                            />
                                            Most Popular
                                        </div>
                                    )}

                                    {/* Plan header */}
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div
                                            className={`
                                                flex
                                                size-[62px]
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-[18px]
                                                transition-transform
                                                duration-300
                                                group-hover:scale-105
                                                ${
                                                    isPopular
                                                        ? 'bg-rideon-green/10 text-rideon-green ring-1 ring-inset ring-rideon-green/10'
                                                        : 'bg-rideon-blue/10 text-rideon-blue ring-1 ring-inset ring-rideon-blue/10'
                                                }
                                            `}
                                        >
                                            <Icon
                                                className="size-7"
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="text-lg font-extrabold tracking-tight text-rideon-dark sm:text-xl">
                                                {meta.label}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {meta.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="relative z-10 mt-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[2.75rem] font-extrabold leading-none tracking-[-0.04em] text-rideon-dark sm:text-[3rem]">
                                                {money(pkg.price)}
                                            </span>

                                            <span className="text-base font-semibold text-slate-500 sm:text-lg">
                                                {meta.unit}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div
                                        className={`
                                            relative
                                            z-10
                                            my-6
                                            h-px
                                            bg-gradient-to-r
                                            from-transparent
                                            to-transparent
                                            ${
                                                isPopular
                                                    ? 'via-rideon-green/20'
                                                    : 'via-rideon-blue/15'
                                            }
                                        `}
                                    />

                                    {/* Features */}
                                    <ul className="relative z-10 flex-1 space-y-4 text-sm text-slate-600 sm:text-[15px]">
                                        {meta.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-rideon-green/10 text-rideon-green">
                                                    <Check
                                                        className="size-3.5"
                                                        strokeWidth={3}
                                                    />
                                                </span>

                                                <span className="leading-6">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Bottom accent */}
                                    <div
                                        className={`
                                            pointer-events-none
                                            absolute
                                            bottom-0
                                            left-8
                                            h-1
                                            w-20
                                            rounded-t-full
                                            opacity-40
                                            transition-all
                                            duration-300
                                            group-hover:w-28
                                            ${
                                                isPopular
                                                    ? 'bg-rideon-green'
                                                    : 'bg-rideon-blue'
                                            }
                                        `}
                                    />
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}