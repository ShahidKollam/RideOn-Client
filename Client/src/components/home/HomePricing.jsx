import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock3, Sun, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPricingPackages } from '@/services/pricingService'

const money = (n) =>
    `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

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
            label: 'Hourly',
            icon: Clock3,
            unit: '/hour',
            features: ['Perfect for short rides', 'Minimum 1 hour', 'Ideal for quick trips'],
        }
    }
    if (hours <= 12) {
        return {
            label: 'Half Day',
            icon: Sun,
            unit: '',
            features: ['Up to 12 hours', 'Great for classes & errands', 'Best value for short trips'],
        }
    }
    return {
        label: 'Daily',
        icon: CalendarDays,
        unit: '',
        features: ['Up to 24 hours', 'Explore more, worry less', 'Best for longer rides'],
    }
}

function pickThreePackages(list) {
    const sorted = [...list].sort(
        (a, b) => Number(a.durationHours || 0) - Number(b.durationHours || 0),
    )
    const targets = [1, 12, 24]
    const picked = []
    const used = new Set()

    for (const t of targets) {
        const match = sorted.find(
            (p) => !used.has(p.id) && Math.abs(Number(p.durationHours || 0) - t) < 0.5,
        )
        if (match) {
            picked.push(match)
            used.add(match.id)
        }
    }

    if (picked.length < 3) {
        for (const p of sorted) {
            if (picked.length >= 3) break
            if (!used.has(p.id)) {
                picked.push(p)
                used.add(p.id)
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
                if (active && Array.isArray(list) && list.length > 0) {
                    setPackages(list)
                }
            } catch {
                // keep dummy
            } finally {
                if (active) setLoading(false)
            }
        })()
        return () => {
            active = false
        }
    }, [])

    const cards = useMemo(() => pickThreePackages(packages), [packages])

    return (
        <section className="bg-white py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-rideon-green sm:text-sm">
                            Simple pricing
                        </p>
                        <h2 className="mt-2 text-[2rem] font-extrabold tracking-tight text-rideon-dark sm:text-[2.5rem] lg:text-[2.75rem] lg:leading-tight">
                            Flexible Plans for <span className="text-rideon-blue">Every</span> <span className="text-rideon-green">Need</span>
                        </h2>
                        <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
                            Choose the plan that works best for you. No hidden charges.
                        </p>
                    </div>
                    <Button
                        className="h-11 shrink-0 rounded-lg bg-rideon-blue px-5 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] hover:bg-rideon-blue/90 hover:shadow-[0_8px_20px_rgba(29,140,248,0.35)]"
                        asChild
                    >
                        <Link to="/pricing">
                            View Pricing
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

                {loading ? (
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
                        ))}
                    </div>
                ) : (
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {cards.map((pkg) => {
                            const meta = packageMeta(pkg)
                            const Icon = meta.icon
                            const name = pkg.packageName || meta.label
                            const hours = Number(pkg.durationHours || 0)

                            return (
                                <article
                                    key={pkg.id || name}
                                    className="flex h-full flex-col rounded-2xl border border-slate-100 bg-slate-50/70 p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-rideon-blue/25 hover:bg-white hover:shadow-[0_14px_32px_rgba(29,140,248,0.1)] sm:p-8"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <span className="flex size-12 items-center justify-center rounded-xl bg-rideon-blue/10 text-rideon-blue">
                                            <Icon className="size-5" strokeWidth={2} />
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-bold text-rideon-dark">{name}</h3>
                                            {hours > 0 && (
                                                <p className="text-xs font-medium text-slate-500">
                                                    {hours} hour{hours === 1 ? '' : 's'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <p className="mt-6 text-4xl font-extrabold tracking-tight text-rideon-dark sm:text-[2.5rem]">
                                        {money(pkg.price)}
                                        {meta.unit && (
                                            <span className="ml-0.5 text-lg font-semibold text-slate-500">
                                                {meta.unit}
                                            </span>
                                        )}
                                    </p>

                                    <ul className="mt-6 flex-1 space-y-3 text-[15px] text-slate-600">
                                        {meta.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2.5">
                                                <Check
                                                    className="mt-0.5 size-4 shrink-0 text-rideon-green"
                                                    strokeWidth={2.5}
                                                />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}
