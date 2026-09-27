import { Fuel, Gauge, MapPin, Settings2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const points = [
    [Gauge, '124cc Engine'],
    [Settings2, 'Comfortable & smooth ride'],
    [Fuel, '55+ kmpl Mileage'],
    [MapPin, 'Ideal for city and highway'],
]

export default function HomeVehicle() {
    return (
        <section className="bg-slate-50/80 py-16 sm:py-20 lg:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
                <div>
                    <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-rideon-green sm:text-sm">
                        Our vehicle
                    </p>
                    <h2 className="mt-2 text-[2rem] font-extrabold tracking-tight text-rideon-dark sm:text-[2.5rem] lg:text-[2.75rem] lg:leading-tight">
                        Honda <span className="text-rideon-blue">Activa</span>
                    </h2>
                    <p className="mt-3 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                        A trusted, comfortable and fuel-efficient scooter, perfect for your campus rides.
                    </p>

                    <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {points.map(([Icon, label]) => (
                            <li
                                key={label}
                                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3.5 text-[15px] font-semibold text-rideon-dark shadow-sm"
                            >
                                <span className="flex size-10 items-center justify-center rounded-full bg-rideon-blue/10 text-rideon-blue">
                                    <Icon className="size-4.5" strokeWidth={2} />
                                </span>
                                {label}
                            </li>
                        ))}
                    </ul>

                    <Button
                        className="mt-9 h-12 rounded-lg bg-rideon-blue px-7 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] hover:bg-rideon-blue/90 hover:shadow-[0_8px_20px_rgba(29,140,248,0.35)]"
                        asChild
                    >
                        <Link to="/vehicles">
                            View Vehicle Details
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="relative">
                    <div
                        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-rideon-blue/10 via-white to-rideon-green/10 blur-2xl"
                        aria-hidden
                    />
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)] sm:p-10">
                        <img
                            src="/honda-activa.png"
                            alt="Honda Activa"
                            className="mx-auto h-auto w-full max-w-lg object-contain"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
