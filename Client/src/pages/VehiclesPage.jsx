import { BadgeCheck, Bike, CalendarDays, FileText, Fuel, Headphones, HardHat, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

const highlights = [
    [Bike, 'Automatic', 'Easy to ride'],
    [Fuel, 'Fuel efficient', 'Save more'],
    [ShieldCheck, 'Well maintained', 'Regularly serviced'],
    [BadgeCheck, 'Comfortable', 'Smooth rides'],
]

const policies = [
    ['Return the bike with the same fuel level as provided.', Fuel],
    ['Refundable security deposit applicable.', ShieldCheck],
    ['Late return charges apply as per our pricing policy.', FileText],
    ['Ride responsibly and follow all campus rules.', BadgeCheck],
]

export default function VehiclesPage() {
    return (
        <div className="min-h-screen bg-[#fcfdff] pb-8 pt-24 sm:pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="grid items-center gap-6 lg:min-h-[25rem] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <div className="relative z-10">
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-rideon-green">Our vehicle</p>
                        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-rideon-dark sm:text-5xl">
                            Honda Activa <span className="text-rideon-green">6G</span>
                        </h1>
                        <p className="mt-4 max-w-md text-base leading-7 text-[#40537e] sm:text-lg">
                            Reliable, fuel-efficient and built for everyday campus rides. Comfort you can count on.
                        </p>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                            {highlights.map(([Icon, title, description]) => (
                                <div
                                    key={title}
                                    className="flex items-center gap-3 lg:border-r lg:border-slate-200 lg:px-4 lg:first:pl-0 lg:last:border-0"
                                >
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-rideon-blue">
                                        <Icon className="size-6" />
                                    </span>
                                    <div>
                                        <h2 className="text-sm font-bold text-rideon-dark">{title}</h2>
                                        <p className="mt-0.5 text-xs text-[#40537e]">{description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden sm:min-h-[24rem] lg:min-h-[25rem]">
                        <div className="absolute size-[88%] rounded-full bg-[#eef5ff]" />
                        <img
                            src="/login scooter.png"
                            alt="Blue Honda Activa scooter"
                            className="relative z-10 w-full max-w-[42rem] scale-x-[-1] object-contain drop-shadow-[0_22px_22px_rgba(15,23,42,0.2)]"
                        />
                    </div> */}
                </section>

                <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(28,55,113,0.035)] lg:grid-cols-3 lg:p-5">
                    <article className="rounded-xl border border-slate-100 bg-[#fcfefd] p-5">
                        <div className="flex gap-4">
                            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-green-50 text-rideon-green">
                                <HardHat className="size-8" />
                            </span>
                            <div>
                                <h2 className="text-base font-bold text-rideon-dark">Helmet policy</h2>
                                <p className="mt-2 text-xl font-extrabold text-rideon-green">1 Helmet Included</p>
                                <span className="mt-2 inline-flex rounded-md bg-green-100 px-3 py-1 text-xs font-bold text-rideon-green">
                                    FREE
                                </span>
                            </div>
                        </div>
                        <div className="mt-5 border-t border-slate-100 pt-5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold text-[#40537e]">Additional helmet</span>
                                <strong className="rounded-xl bg-green-50 px-3 py-2 text-lg text-rideon-green">
                                    ₹30 / ride
                                </strong>
                            </div>
                            <p className="mt-5 text-sm leading-6 text-[#40537e]">
                                Helmets are clean and sanitized before every ride.
                            </p>
                        </div>
                    </article>
                    <article className="rounded-xl border border-slate-100 bg-[#fcfdff] p-5">
                        <div className="flex gap-4">
                            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-rideon-blue">
                                <MapPin className="size-8" />
                            </span>
                            <div>
                                <h2 className="text-base font-bold text-rideon-dark">Available at</h2>
                                <p className="mt-2 text-2xl font-extrabold text-rideon-blue">NIT Calicut</p>
                            </div>
                        </div>
                        <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 text-sm text-[#40537e]">
                            <p className="flex items-center gap-3">
                                <Bike className="size-5 text-rideon-blue" />
                                Free bike assigned at booking
                            </p>
                            <p className="flex items-center gap-3">
                                <BadgeCheck className="size-5 text-rideon-blue" />
                                Regularly serviced
                            </p>
                            <p className="flex items-center gap-3">
                                <ShieldCheck className="size-5 text-rideon-blue" />
                                Safety checked
                            </p>
                            <p className="flex items-center gap-3">
                                <BadgeCheck className="size-5 text-rideon-blue" />
                                Student friendly
                            </p>
                        </div>
                    </article>
                    <article className="rounded-xl border border-slate-100 bg-[#fffefd] p-5">
                        <div className="flex gap-4">
                            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                                <FileText className="size-8" />
                            </span>
                            <div>
                                <h2 className="text-base font-bold text-rideon-dark">Important policies</h2>
                            </div>
                        </div>
                        <div className="mt-5 space-y-4">
                            {policies.map(([text, Icon]) => (
                                <p
                                    key={text}
                                    className="flex gap-4 border-t border-slate-100 pt-4 text-sm leading-5 text-[#40537e]"
                                >
                                    <Icon className="size-5 shrink-0 text-amber-500" />
                                    {text}
                                </p>
                            ))}
                        </div>
                    </article>
                </section>

                <section className="mt-5 flex flex-col gap-5 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div className="flex items-center gap-4">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-rideon-blue">
                            <CalendarDays className="size-8" />
                        </span>
                        <div>
                            <h2 className="text-2xl font-extrabold text-rideon-dark">Ready to ride?</h2>
                            <p className="mt-1 text-sm leading-6 text-[#40537e]">
                                Book your ride in just a few steps and enjoy a smooth campus experience.
                            </p>
                        </div>
                    </div>
                    <Button
                        className="h-14 min-w-[18rem] rounded-xl bg-[#0764f5] px-7 text-base font-bold text-white hover:bg-[#075be0] sm:w-auto"
                        asChild
                    >
                        <Link to="/booking">
                            <CalendarDays className="size-5" />
                            Book your ride
                        </Link>
                    </Button>
                </section>
            </div>
        </div>
    )
}
