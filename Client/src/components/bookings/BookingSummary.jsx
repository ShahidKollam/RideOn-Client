import { CalendarDays, CheckCircle2, Clock3, Gauge, Info, MapPin } from 'lucide-react'

const formatDateTime = (value) => {
    if (!value) return 'Not selected'
    return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

export default function BookingSummary({ vehicle, pickupAt, returnAt, duration = 0, status = 'AVAILABLE' }) {
    const image = vehicle?.imageUrls?.[0]
    const isAvailable = status === 'AVAILABLE'

    return (
        <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)] lg:sticky lg:top-28 sm:p-6">
            <h2 className="text-lg font-extrabold text-rideon-dark">Booking summary</h2>

            <div className="mt-5 flex gap-4">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    {image ? <img src={image} alt={vehicle?.name} className="size-full object-contain p-2" /> : <Gauge className="size-7 text-rideon-blue/40" />}
                </div>
                <div className="min-w-0">
                    <h3 className="truncate text-base font-extrabold text-rideon-dark">{vehicle?.name || `${vehicle?.brand || ''} ${vehicle?.model || ''}`}</h3>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${isAvailable ? 'bg-rideon-green/15 text-rideon-green' : 'bg-amber-100 text-amber-700'}`}>
                        {isAvailable ? 'Available' : 'Currently unavailable'}
                    </span>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="size-3.5 text-rideon-blue" />{vehicle?.campus?.name || 'Campus pickup'}</p>
                    {vehicle?.model && <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Gauge className="size-3.5 text-rideon-blue" />{vehicle.model}</p>}
                </div>
            </div>

            <section className="mt-5 border-t border-slate-100 pt-5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-rideon-blue">Ride details</p>
                <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-rideon-blue" /><div className="min-w-0"><dt className="text-xs font-semibold text-slate-400">PICKUP</dt><dd className="mt-0.5 font-semibold text-slate-600">{formatDateTime(pickupAt)}</dd></div></div>
                    <div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-rideon-blue" /><div className="min-w-0"><dt className="text-xs font-semibold text-slate-400">RETURN</dt><dd className="mt-0.5 font-semibold text-slate-600">{formatDateTime(returnAt)}</dd></div></div>
                    <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-3 text-slate-600"><Clock3 className="size-4 text-rideon-blue" />Duration</span><strong className="text-rideon-dark">{duration ? `${duration} hour${duration === 1 ? '' : 's'}` : '—'}</strong></div>
                </dl>
            </section>

            <section className="mt-5 border-t border-slate-100 pt-5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-rideon-blue">Pricing</p>
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-bold text-rideon-dark">Calculated at confirmation</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Your eligible package, deposit, and included distance are applied when your reservation is created.</p>
                </div>
            </section>

            <div className="mt-5 flex gap-2 rounded-xl bg-rideon-blue/5 p-3 text-xs leading-5 text-slate-600"><Info className="mt-0.5 size-4 shrink-0 text-rideon-blue" />You can cancel while payment is pending.</div>
        </aside>
    )
}
