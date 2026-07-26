import { CalendarDays, ChevronRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const statusStyles = { PAYMENT_PENDING: 'bg-amber-100 text-amber-800', CONFIRMED: 'bg-blue-100 text-blue-700', ACTIVE: 'bg-rideon-green/15 text-rideon-green', COMPLETED: 'bg-slate-100 text-slate-600', CANCELLED: 'bg-red-100 text-red-600' }
export function StatusBadge({ status }) { return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>{status?.replaceAll('_', ' ')}</span> }

export default function BookingCard({ booking }) {
    return <Link to={`/bookings/${booking.id}`} className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.05)] transition-all hover:border-rideon-blue/20 hover:shadow-md sm:p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-400">{booking.bookingNumber}</p><h2 className="mt-1 text-base font-bold text-rideon-dark">{booking.bike?.name || 'Campus vehicle'}</h2></div><StatusBadge status={booking.status} /></div>
        <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2"><span className="flex items-center gap-2"><CalendarDays className="size-4 text-rideon-blue" />{new Date(booking.pickupAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span><span className="flex items-center gap-2"><MapPin className="size-4 text-rideon-blue" />{booking.campus?.name || 'Campus'}</span></div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-sm font-bold text-rideon-dark">₹{Number(booking.totalAmount || 0).toLocaleString()}</span><ChevronRight className="size-5 text-rideon-blue" /></div>
    </Link>
}
