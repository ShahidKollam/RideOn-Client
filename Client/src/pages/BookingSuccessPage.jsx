import { CheckCircle2, Clock3, IndianRupee, MapPin } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { getBooking } from '@/services/bookingService'

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function BookingSuccessPage() {
    const { id } = useParams()
    const { state } = useLocation()
    const [booking, setBooking] = useState(state?.booking || null)
    const payment = state?.payment

    useEffect(() => {
        if (!booking) getBooking(id).then(setBooking).catch(() => {})
    }, [booking, id])

    return <div className="flex min-h-[75vh] items-center bg-slate-50/60 px-4 pt-20"><div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-10"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rideon-green/15"><CheckCircle2 className="size-9 text-rideon-green" /></div><p className="mt-5 text-sm font-bold uppercase tracking-[.16em] text-rideon-green">Payment successful</p><h1 className="mt-2 text-3xl font-extrabold text-rideon-dark">Your ride is confirmed</h1><p className="mt-3 text-sm leading-6 text-slate-500">Your payment was verified and an available bike has been assigned to your booking.</p>{booking && <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left"><p className="text-xs font-semibold text-slate-400">BOOKING NUMBER</p><p className="mt-1 font-extrabold text-rideon-dark">{booking.bookingNumber}</p><div className="mt-4 space-y-3 text-sm text-slate-600"><p className="flex items-center gap-2"><MapPin className="size-4 text-rideon-blue" />{booking.bike?.name || booking.bike?.registrationNumber || 'Assigned campus bike'}</p><p className="flex items-center gap-2"><Clock3 className="size-4 text-rideon-blue" />{new Date(booking.pickupAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p><p className="flex items-center gap-2"><Clock3 className="size-4 text-rideon-blue" />{new Date(booking.returnAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p><p className="flex items-center gap-2 font-bold text-rideon-dark"><IndianRupee className="size-4 text-rideon-blue" />Amount paid: {money(payment?.amount ?? booking.totalAmount)}</p></div></div>}<div className="mt-7 grid gap-3 sm:grid-cols-2"><Button variant="outline" className="border-rideon-blue text-rideon-blue" asChild><Link to="/booking">Book another ride</Link></Button><Button className="bg-rideon-blue text-white" asChild><Link to={`/bookings/${id}`}>View booking</Link></Button></div></div></div>
}
