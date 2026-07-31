import { CalendarDays, Check, Clock3, Gauge, Info, MapPin, Settings2 } from 'lucide-react'

const formatDateTime = (value) => value ? new Date(value).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
const money = (value) => value === undefined ? '—' : `₹${value}`

function DetailRow({ icon: Icon, label, value }) {
    return <div className="flex items-center justify-between gap-5 text-[14px]"><span className="flex items-center gap-4 text-[#40537e]"><Icon className="size-[19px] text-[#31558d]" />{label}</span><strong className="text-right font-semibold text-[#101c45]">{value}</strong></div>
}

export default function BookingSummary({ vehicle, pickupAt, returnAt, availability, status = 'AVAILABLE', className = '' }) {
    const image = vehicle?.imageUrls?.[0]
    const name = vehicle?.name || `${vehicle?.brand || ''} ${vehicle?.model || ''}`.trim()
    const isAvailable = availability?.available ?? status === 'AVAILABLE'
    const includedKm = availability?.includedKm

    return (
        <aside className={`h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(28,55,113,0.045)] xl:sticky xl:top-24 ${className}`}>
            <h2 className="text-[22px] font-extrabold tracking-[-0.025em] text-[#0b1742]">Booking summary</h2>
            <div className="mt-5 flex gap-5">
                <div className="flex size-[150px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-2">{image ? <img src={image} alt={name} className="size-full object-contain" /> : <Gauge className="size-9 text-rideon-blue/40" />}</div>
                <div className="min-w-0 pt-1"><h3 className="truncate text-[18px] font-bold text-[#0b1742]">{name}</h3><span className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ${isAvailable ? 'bg-[#e7f9e9] text-[#138a34]' : 'bg-amber-100 text-amber-700'}`}>{isAvailable ? 'Available' : 'Unavailable'}</span><div className="mt-4 space-y-3 text-[14px] text-[#40537e]"><p className="flex items-center gap-3"><MapPin className="size-[18px] text-rideon-blue" />{vehicle?.campus?.name || 'Campus pickup'}</p><p className="flex items-center gap-3"><Settings2 className="size-[18px] text-[#40537e]" />{vehicle?.model || 'Automatic Transmission'}</p></div></div>
            </div>

            <section className="mt-7 border-t border-slate-200 pt-5"><p className="text-[13px] font-bold uppercase text-rideon-blue">Ride details</p><div className="mt-5 space-y-5"><DetailRow icon={CalendarDays} label="Pickup" value={formatDateTime(pickupAt)} /><DetailRow icon={CalendarDays} label="Return" value={formatDateTime(returnAt)} /><DetailRow icon={Clock3} label="Duration" value={availability?.durationHours ? `${availability.durationHours} Hours` : '—'} /></div></section>

            <section className="mt-8"><p className="text-[13px] font-bold uppercase text-rideon-blue">Pricing breakdown</p><div className="mt-4 space-y-4 text-[14px]"><div className="flex justify-between gap-4 text-[#40537e]"><span>Base amount{availability?.pricing?.packageName ? ` (${availability.durationHours} Hours package)` : ''}</span><strong className="text-[#101c45]">{money(availability?.baseAmount)}</strong></div><div className="flex justify-between gap-4 text-[#40537e]"><span>Included KM</span><strong className="text-[#148a36]">{includedKm === undefined ? '—' : `${includedKm} km`}</strong></div><div className="flex justify-between gap-4 text-[#40537e]"><span>Extra KM rate</span><strong className="text-[#101c45]">{availability?.extraKmRate === undefined ? '—' : `₹${availability.extraKmRate} / km`}</strong></div><div className="flex justify-between gap-4 text-[#40537e]"><span>Security deposit (Refundable)</span><strong className="text-[#101c45]">{money(availability?.depositAmount)}</strong></div></div></section>

            <section className="mt-7 overflow-hidden rounded-lg border border-[#c9dbff]"><div className="flex items-center justify-between bg-[#f7faff] px-5 py-4"><h3 className="text-[15px] font-bold">TOTAL AMOUNT</h3><strong className="text-[26px] leading-none text-rideon-blue">{money(availability?.totalAmount)}</strong></div><div className="space-y-4 border-t border-[#dbe6fa] px-5 py-4 text-[14px]"><div className="flex justify-between"><span className="text-[#40537e]">Includes</span><strong className="flex items-center gap-2 text-[#148a36]"><Check className="size-4" />{includedKm === undefined ? '—' : `${includedKm} km`}</strong></div><div className="flex justify-between"><span className="text-[#40537e]">Extra KM charge <Info className="ml-1 inline size-4" /></span><strong>After {includedKm === undefined ? '—' : `${includedKm} km`}</strong></div><div className="flex justify-between"><span className="text-[#40537e]">Payment status</span><strong className="rounded-md bg-[#fff2d8] px-2 py-1 text-xs text-[#c97800]">PENDING</strong></div></div></section>
            <div className="mt-6 flex items-center gap-4 rounded-lg border border-[#e5edf9] bg-[#f7faff] px-5 py-3 text-[13px] text-[#40537e]"><Info className="size-5 shrink-0 text-rideon-blue" />You can cancel while payment is pending.</div>
        </aside>
    )
}
