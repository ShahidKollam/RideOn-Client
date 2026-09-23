import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, MapPin } from 'lucide-react'
import { formatDisplayDateTime } from '@/lib/dateFormat'

const money = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

function statusBadgeClass(status) {
    const s = String(status || '').toUpperCase()
    if (s === 'CANCELLED') return 'bg-red-50 text-red-700'
    if (s === 'CONFIRMED') return 'bg-emerald-50 text-emerald-700'
    if (s === 'ACTIVE') return 'bg-blue-50 text-blue-700'
    if (s === 'COMPLETED') return 'bg-slate-100 text-slate-600'
    if (s === 'PAYMENT_PENDING') return 'bg-amber-50 text-amber-800'
    return 'bg-slate-100 text-slate-600'
}

export default function BookingCard({ booking }) {
    const bikeLabel =
        booking?.bike?.bikeNumber ||
        booking?.bike?.name ||
        booking?.bike?.registrationNumber ||
        'Campus bike'

    return (
        <Link
            to={`/bookings/${booking.id}`}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition hover:border-rideon-blue/40 hover:bg-blue-50/30"
        >
            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#0b1742]">{booking.bookingNumber || 'Booking'}</span>
                    {booking.status && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(
                                booking.status
                            )}`}
                        >
                            {String(booking.status).replaceAll('_', ' ')}
                        </span>
                    )}
                </div>
                <p className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="size-3.5 shrink-0 text-rideon-blue" />
                    <span className="truncate">{bikeLabel}</span>
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="size-3.5 shrink-0" />
                    {formatDisplayDateTime(booking.pickupAt)}
                </p>
                <p className="text-sm font-semibold text-rideon-blue">{money(booking.totalAmount)}</p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-slate-300" />
        </Link>
    )
}
