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
    [Fuel, 'Fuel efficient', 'Save more', 'green'],
    [ShieldCheck, 'Well maintained', 'Regularly serviced', 'blue'],
    [Leaf, 'Comfortable', 'Smooth rides', 'green'],
]

const whyChoose = [
    [Gauge, 'Smooth Performance', 'Ideal for city and campus rides.', 'green'],
    [Fuel, 'Fuel Efficient', 'Great mileage for everyday use.', 'blue'],
    [Settings2, 'Automatic Transmission', 'Easy and convenient to ride.', 'green'],
    [ShieldCheck, 'Reliable & Safe', 'Regularly serviced and inspected.', 'blue'],
    [Sofa, 'Comfortable Ride', 'Ergonomic seating for long rides.', 'green'],
    [Users, 'Student Friendly', 'Perfect for campus commuting.', 'blue'],
]

const availabilityPoints = [
    'Free bike assigned at booking',
    'Regularly serviced',
    'Safety checked',
    'Student friendly',
]

const toneIcon = {
    blue: 'bg-blue-50 text-rideon-blue',
    green: 'bg-green-50 text-rideon-green',
}

export default function VehiclesPage() {
    useDocumentTitle('Vehicles')

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#fcfdff] pb-12 pt-24 sm:pt-28">
            <div
                className="pointer-events-none absolute -right-20 top-20 size-72 rounded-full bg-rideon-blue/10 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-16 top-48 size-56 rounded-full bg-rideon-green/10 blur-3xl"
                aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Hero — left-aligned with max-w-7xl edge */}
                <section>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-rideon-green">Our vehicle</p>
                    <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-rideon-dark sm:text-5xl">
                        Honda <span className="text-rideon-blue">Activa</span>
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[#40537e] sm:text-lg">
                        Reliable, fuel-efficient and built for everyday campus rides. Comfort you can count on.
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0">
                        {highlights.map(([Icon, title, description, tone], i) => (
                            <div
                                key={title}
                                className={`flex items-center gap-3 sm:px-5 ${i > 0 ? 'sm:border-l sm:border-slate-200' : 'sm:pl-0'}`}
                            >
                                <span
                                    className={`flex size-11 shrink-0 items-center justify-center rounded-full ${toneIcon[tone]}`}
                                >
                                    <Icon className="size-5" strokeWidth={1.9} />
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-rideon-dark">{title}</p>
                                    <p className="text-xs text-[#40537e]">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why Choose */}
                <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-7">
                    <h2 className="text-xl font-extrabold text-rideon-dark sm:text-2xl">
                        Why Choose <span className="text-rideon-blue">Honda Activa?</span>
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#40537e]">
                        Designed for student life, the perfect balance of comfort, performance, and convenience.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {whyChoose.map(([Icon, title, description, tone]) => (
                            <div
                                key={title}
                                className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-rideon-blue/20 hover:bg-white"
                            >
                                <span
                                    className={`flex size-11 shrink-0 items-center justify-center rounded-full ${toneIcon[tone]}`}
                                >
                                    <Icon className="size-5" strokeWidth={1.9} />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-rideon-dark">{title}</h3>
                                    <p className="mt-1 text-xs leading-5 text-[#40537e]">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Helmet + Available */}
                <section className="mt-5 grid gap-5 lg:grid-cols-2">
                    <article className="rounded-2xl border border-green-100 bg-green-50/40 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-rideon-green">
                                <HardHat className="size-5" strokeWidth={1.9} />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-slate-600">Helmet Policy</p>
                                <p className="mt-1 flex flex-wrap items-center gap-2 text-lg font-extrabold text-rideon-green">
                                    1 Helmet Included
                                    <span className="rounded-full bg-rideon-green/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rideon-green">
                                        Free
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between border-t border-green-100/80 pt-4 text-sm">
                            <span className="text-slate-600">Additional helmet</span>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-rideon-green">
                                ₹30 / ride
                            </span>
                        </div>
                        <p className="mt-4 text-xs leading-5 text-slate-500">
                            Helmets are cleaned and sanitized before every ride for your safety.
                        </p>
                    </article>

                    <article className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-rideon-blue">
                                <MapPin className="size-5" strokeWidth={1.9} />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-slate-600">Available at</p>
                                <p className="mt-1 text-lg font-extrabold text-rideon-blue">NIT Calicut Campus</p>
                            </div>
                        </div>
                        <ul className="mt-5 space-y-2.5">
                            {availabilityPoints.map((point) => (
                                <li key={point} className="flex items-center gap-2.5 text-sm text-slate-600">
                                    <CheckCircle2 className="size-4 shrink-0 text-rideon-blue" strokeWidth={2.2} />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>

                {/* CTA */}
                <section className="mt-5 flex flex-col gap-5 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div className="flex items-center gap-4">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-rideon-blue">
                            <CalendarDays className="size-6" strokeWidth={1.9} />
                        </span>
                        <div>
                            <h2 className="text-xl font-extrabold text-rideon-dark sm:text-2xl">Ready to ride?</h2>
                            <p className="mt-1 text-sm leading-6 text-[#40537e]">
                                Book your ride in just a few steps and enjoy a smooth campus experience.
                            </p>
                        </div>
                    </div>
                    <Button
                        className="h-12 shrink-0 rounded-xl bg-rideon-blue px-6 text-sm font-bold text-white hover:bg-rideon-blue/90 sm:h-14 sm:min-w-[14rem] sm:text-base"
                        asChild
                    >
                        <Link to="/booking">
                            <Bike className="size-5" />
                            Book your Ride →
                        </Link>
                    </Button>
                </section>
            </div>
        </div>
    )
}
