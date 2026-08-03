import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Bike, CalendarClock, Clock3, Fuel, Gauge, Headphones, Info, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ErrorState, SkeletonCard } from '@/components/ui/PageStates'
import { getApiErrorMessage } from '@/lib/apiClient'
import { getPricingPackages } from '@/services/pricingService'

const benefits = [
    [ShieldCheck, 'Well maintained', 'Regularly serviced bikes'],
    [Fuel, 'Great mileage', 'Fuel-efficient rides'],
    [Bike, 'Safety first', 'Helmet included'],
    [Headphones, '24/7 support', 'We’re here to help'],
]

const reassurances = [
    [CalendarClock, 'Quick booking', 'Book in minutes and start your ride.'],
    [Sparkles, 'Instant confirmation', 'Get instant booking confirmation.'],
    [Clock3, 'Flexible changes', 'Modify or extend your booking anytime.'],
    [ShieldCheck, 'Safe & secure', 'Your safety is our priority.'],
    [Headphones, '24/7 support', 'We’re always here to help you.'],
]

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`
const durationLabel = (hours) => `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`

export default function PricingPage() {
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getPricingPackages()
            .then(setPackages)
            .catch((requestError) => setError(getApiErrorMessage(requestError, 'We could not load pricing packages.')))
            .finally(() => setLoading(false))
    }, [])

    const deposit = useMemo(() => packages[0]?.depositAmount, [packages])

    return (
        <div className="min-h-screen bg-[#fcfdff] pb-12 pt-24 sm:pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="max-w-3xl">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-rideon-green">Ride pricing</p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-rideon-dark sm:text-[42px] sm:leading-[1.12]">Clear pricing. <span className="text-rideon-blue">Confident</span> <span className="text-rideon-green">riding.</span></h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#40537e] sm:text-base">Flexible hourly rental packages with included kilometers, refundable deposit, and transparent pricing for every campus trip.</p>
                </section>

                <section className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                    {benefits.map(([Icon, title, description]) => <div key={title} className="flex items-center gap-3 lg:border-r lg:border-slate-200 lg:px-8 lg:first:pl-0 lg:last:border-0"><Icon className="size-9 shrink-0 text-rideon-blue" strokeWidth={1.8} /><div><h2 className="text-sm font-bold text-rideon-dark">{title}</h2><p className="mt-1 text-xs text-[#40537e]">{description}</p></div></div>)}
                </section>

                <section className="mt-9 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_20px_rgba(28,55,113,0.035)] lg:grid lg:grid-cols-[minmax(0,1.75fr)_minmax(340px,0.95fr)]">
                    <div className="p-5 sm:p-6">
                        <h2 className="text-2xl font-extrabold tracking-tight text-rideon-dark">Hourly rental packages</h2>
                        <p className="mt-2 text-sm text-[#40537e]">Choose the duration that fits your plan. All prices include basic coverage.</p>
                        {loading ? <div className="mt-5 space-y-3">{Array.from({ length: 5 }, (_, index) => <SkeletonCard key={index} className="h-14" />)}</div> : error ? <div className="mt-5"><ErrorState message={error} /></div> : packages.length ? <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-[#f4f8ff] text-xs uppercase tracking-wide text-[#40537e]"><tr><th className="px-4 py-3 font-bold">Duration</th><th className="px-4 py-3 font-bold">Price</th><th className="px-4 py-3 font-bold">Included KM</th><th className="px-4 py-3 font-bold">Extra KM rate</th></tr></thead><tbody>{packages.map((item) => <tr key={item.id} className="border-t border-slate-200"><td className="px-4 py-3 font-bold text-rideon-dark"><span className="flex items-center gap-3"><Clock3 className="size-[18px] text-rideon-blue" />{item.packageName || durationLabel(item.durationHours)}</span></td><td className="px-4 py-3 font-bold text-rideon-dark">{money(item.price)}</td><td className="px-4 py-3 text-[#40537e]">{item.includedKm} km</td><td className="px-4 py-3 font-semibold text-rideon-green">{money(item.extraKmRate)} / km</td></tr>)}</tbody></table></div> : <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Pricing packages are not available at the moment.</div>}
                        <div className="mt-3 flex items-center gap-3 rounded-lg border border-blue-100 bg-[#f4f8ff] px-4 py-3 text-sm text-[#40537e]"><Info className="size-5 shrink-0 text-rideon-blue" />Need more time? Extend your ride easily from your dashboard.</div>
                    </div>
                    <aside className="border-t border-slate-200 bg-white p-5 sm:p-6 lg:border-t-0 lg:border-l">
                        <div className="space-y-3"><InfoCard icon={ShieldCheck} title="Refundable security deposit" value={deposit === undefined ? 'Shown at booking' : money(deposit)} description="Refunded after safe return of the bike." tone="green" /><InfoCard icon={Gauge} title="Extra KM charge" value={packages[0] ? `${money(packages[0].extraKmRate)} / km` : 'Shown at booking'} description="Applicable for every km after the included limit." tone="blue" /><InfoCard icon={Fuel} title="Fuel policy" description="Return the bike with the same fuel level as provided." tone="amber" /></div>
                        <Button className="mt-3 h-auto w-full justify-between rounded-lg bg-[#0764f5] px-5 py-4 text-left text-white hover:bg-[#075be0]" asChild><Link to="/booking"><span><span className="block text-base font-bold">Book your ride</span><span className="mt-1 block text-sm font-normal text-white/90">Pick your time, confirm and ride!</span></span><ArrowRight className="size-5 shrink-0" /></Link></Button>
                    </aside>
                </section>

                <section className="mt-4 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-5">{reassurances.map(([Icon, title, description]) => <div key={title} className="flex gap-3 border-t border-slate-200 p-5 first:border-t-0 sm:odd:border-r sm:odd:border-t-0 lg:border-r lg:border-t-0 lg:last:border-r-0"><Icon className="size-8 shrink-0 text-rideon-blue" strokeWidth={1.8} /><div><h2 className="text-sm font-bold text-rideon-dark">{title}</h2><p className="mt-1 text-xs leading-5 text-[#40537e]">{description}</p></div></div>)}</section>
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-blue-100 bg-[#f4f8ff] px-5 py-4 text-sm text-[#40537e]"><Info className="size-5 shrink-0 text-rideon-blue" />All prices are inclusive of basic insurance. Helmets and essential safety gear are provided at no extra cost.</div>
            </div>
        </div>
    )
}

function InfoCard({ icon: Icon, title, value, description, tone }) {
    const styles = { green: 'border-green-100 bg-green-50/60 text-rideon-green', blue: 'border-blue-100 bg-blue-50/60 text-rideon-blue', amber: 'border-amber-100 bg-amber-50/70 text-amber-500' }
    return <div className={`flex gap-4 rounded-xl border p-4 ${styles[tone]}`}><span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/70"><Icon className="size-6" strokeWidth={1.8} /></span><div><h3 className="text-sm font-bold text-rideon-dark">{title}</h3>{value && <p className="mt-1 text-xl font-extrabold">{value}</p>}<p className="mt-1 text-sm leading-5 text-[#40537e]">{description}</p></div></div>
}
