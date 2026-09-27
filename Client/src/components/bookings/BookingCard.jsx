import { Bike, Clock3, Eye, MapPin } from 'lucide-react'
import { formatDisplayTime } from '@/lib/dateFormat'
import { cn } from '@/lib/utils'

const money = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatBookingStamp(value) {
    if (value == null || value === '') return '—'
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${formatDisplayTime(d)}`
}

export function bookingDurationLabel(pickupAt, returnAt) {
    if (!pickupAt || !returnAt) return '—'
    const ms = new Date(returnAt) - new Date(pickupAt)
    if (!Number.isFinite(ms) || ms <= 0) return '—'
    const hours = Math.round(ms / 3600000)
    if (hours < 1) {
        const mins = Math.max(1, Math.round(ms / 60000))
        return `${mins} min`
    }
    return hours === 1 ? '1 hour' : `${hours} hours`
}

function statusStyles(status) {
    const s = String(status || '').toUpperCase()
    if (s === 'CANCELLED') return { badge: 'bg-red-50 text-red-600', icon: 'bg-red-50 text-red-500' }
    if (s === 'CONFIRMED') return { badge: 'bg-emerald-50 text-emerald-700', icon: 'bg-emerald-50 text-emerald-600' }
    if (s === 'ACTIVE') return { badge: 'bg-blue-50 text-blue-700', icon: 'bg-blue-50 text-blue-600' }
    if (s === 'COMPLETED') return { badge: 'bg-emerald-50 text-emerald-700', icon: 'bg-emerald-50 text-emerald-600' }
    if (s === 'PAYMENT_PENDING') return { badge: 'bg-amber-50 text-amber-800', icon: 'bg-amber-50 text-amber-700' }
    return { badge: 'bg-slate-100 text-slate-600', icon: 'bg-slate-100 text-slate-500' }
}

export default function BookingCard({ booking, onViewDetails }) {
    const styles = statusStyles(booking?.status)
    const bikeName = booking?.bike?.name || 'HONDA ACTIVA'
    const bikeNo = booking?.bike?.bikeNumber || booking?.bike?.label || ''
    const reg = booking?.bike?.registrationNumber || ''
    const campus = booking?.campus?.name || 'NIT Calicut'
    const duration = bookingDurationLabel(booking?.pickupAt, booking?.returnAt)
    const statusLabel = String(booking?.status || '').replaceAll('_', ' ')

    return (
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.04)] transition hover:border-rideon-blue/25 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-3 sm:gap-4">
                    <span
                        className={cn(
                            'flex size-12 shrink-0 items-center justify-center rounded-full sm:size-14',
                            styles.icon,
                        )}
                    >
                        <Bike className="size-6 sm:size-7" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={cn(
                                    'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                    styles.badge,
                                )}
                            >
                                {statusLabel}
                            </span>
                        </div>
                        <h3 className="mt-1.5 text-base font-extrabold text-rideon-dark sm:text-lg">
                            {booking?.bookingNumber || 'Booking'}
                        </h3>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                            {bikeName}
                            {bikeNo ? ` · ${bikeNo}` : ''}
                        </p>
                        {reg && <p className="truncate text-xs text-slate-400">{reg}</p>}
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="size-3.5 text-slate-400" />
                                {formatBookingStamp(booking?.pickupAt)}
                                <span className="text-slate-300">→</span>
                                {formatBookingStamp(booking?.returnAt)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3.5 text-rideon-blue" />
                                {campus}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Clock3 className="size-3.5 text-slate-400" />
                                {duration}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-slate-50 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <div className="text-right">
                        <p className="text-[11px] font-medium text-slate-400">Total Amount</p>
                        <p className="text-lg font-extrabold text-rideon-blue sm:text-xl">
                            {money(booking?.totalAmount)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onViewDetails?.(booking)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-rideon-blue/40 hover:bg-rideon-blue/5 hover:text-rideon-blue"
                    >
                        <Eye className="size-4" />
                        View Details
                        <span className="text-slate-300">›</span>
                    </button>
                </div>
            </div>
        </article>
    )
}
