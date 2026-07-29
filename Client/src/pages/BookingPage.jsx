import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, Info, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import BookingSummary from '@/components/bookings/BookingSummary'
import { Button } from '@/components/ui/button'
import { ErrorState, SkeletonCard } from '@/components/ui/PageStates'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { createBooking } from '@/services/bookingService'
import { getVehicle } from '@/services/vehicleService'

const toLocalInput = (date) => {
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date - offset).toISOString().slice(0, 16)
}

export default function BookingPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const { showToast } = useToast()
    const [vehicle, setVehicle] = useState(null)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const minimumPickup = useMemo(() => {
        const value = new Date()
        value.setMinutes(0, 0, 0)
        value.setHours(value.getHours() + 1)
        return toLocalInput(value)
    }, [])
    const [values, setValues] = useState({ pickupAt: minimumPickup, returnAt: '', notes: '' })

    useEffect(() => {
        getVehicle(id).then(setVehicle).catch((requestError) => setError(getApiErrorMessage(requestError, 'We could not load this vehicle.')))
    }, [id])

    const duration = values.returnAt && new Date(values.returnAt) > new Date(values.pickupAt)
        ? Math.ceil((new Date(values.returnAt) - new Date(values.pickupAt)) / 36e5)
        : 0

    const updateValue = (field, value) => setValues((current) => ({ ...current, [field]: value }))

    const submit = async (event) => {
        event.preventDefault()
        if (!isAuthenticated) {
            navigate('/auth/login', { state: { from: `/booking/${id}` } })
            return
        }
        if (!duration) {
            showToast({ type: 'error', title: 'Select a valid return time', description: 'Your return must be at least one hour after pickup.' })
            return
        }
        const pricingId = import.meta.env.VITE_DEFAULT_PRICING_ID
        if (!pricingId) {
            showToast({ type: 'error', title: 'Booking is not configured', description: 'A pricing package must be configured before bookings can be created.' })
            return
        }
        setSubmitting(true)
        try {
            const booking = await createBooking({ campusId: vehicle.campusId, pickupAt: new Date(values.pickupAt).toISOString(), returnAt: new Date(values.returnAt).toISOString(), pricingId, notes: values.notes.trim() || undefined })
            navigate(`/booking-success/${booking.id}`, { state: { booking, vehicle } })
        } catch (requestError) {
            showToast({ type: 'error', title: 'Could not create booking', description: getApiErrorMessage(requestError) })
        } finally {
            setSubmitting(false)
        }
    }

    if (error) return <div className="px-4 pt-28"><ErrorState message={error} /></div>
    if (!vehicle) return <div className="mx-auto max-w-6xl px-4 pt-28"><SkeletonCard className="h-[34rem]" /></div>

    return (
        <div className="bg-slate-50/60 pt-24 pb-12 sm:pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Link to={`/vehicles/${id}`} className="inline-flex items-center gap-2 text-sm font-bold text-rideon-blue transition-transform hover:-translate-x-0.5"><ArrowLeft className="size-4" />Back to vehicle</Link>
                <div className="mt-4 grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
                    <div>
                        <div className="max-w-2xl">
                            <p className="text-sm font-bold uppercase tracking-[.16em] text-rideon-green">Reserve your ride</p>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-rideon-dark sm:text-4xl">Book your <span className="text-rideon-blue">ride time,</span><br />move with <span className="text-rideon-green">freedom.</span></h1>
                            <p className="mt-3 text-sm leading-6 text-slate-500">Select the times that work for you. Your reservation remains payment pending until payment is available.</p>
                        </div>

                        <form onSubmit={submit} className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6">
                            <div className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-full bg-rideon-blue text-sm font-extrabold text-white">1</span><h2 className="font-extrabold text-rideon-dark">Select ride time</h2></div>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <label className="text-sm font-bold text-rideon-dark">Pickup time<input required type="datetime-local" min={minimumPickup} value={values.pickupAt} onChange={(event) => updateValue('pickupAt', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none transition focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/10" /></label>
                                <label className="text-sm font-bold text-rideon-dark">Return time<input required type="datetime-local" min={values.pickupAt} value={values.returnAt} onChange={(event) => updateValue('returnAt', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none transition focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/10" /></label>
                            </div>
                            <div className="mt-4 flex gap-2 rounded-xl bg-rideon-blue/5 px-3 py-3 text-xs leading-5 text-slate-600"><Info className="mt-0.5 size-4 shrink-0 text-rideon-blue" />Minimum rental duration is one hour.</div>
                            <label className="mt-5 block text-sm font-bold text-rideon-dark">Notes <span className="font-normal text-slate-400">(optional)</span><textarea value={values.notes} onChange={(event) => updateValue('notes', event.target.value)} rows="3" placeholder="Anything our team should know?" className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/10" /></label>
                            <Button type="submit" disabled={submitting || vehicle.status !== 'AVAILABLE'} className="mt-6 h-12 w-full bg-rideon-blue text-sm font-bold text-white shadow-[0_8px_18px_rgba(29,140,248,0.24)] hover:bg-rideon-blue/90">{submitting ? 'Creating reservation…' : <><CalendarDays className="size-4" />Create reservation</>}</Button>
                        </form>

                        <section className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 sm:flex sm:items-start sm:justify-between sm:gap-5">
                            <div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-700" /><div><h2 className="text-sm font-extrabold text-rideon-dark">Cancellation policy</h2><p className="mt-1 text-xs leading-5 text-slate-600">You can cancel this booking any time while payment is pending.</p></div></div>
                            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 sm:mt-0"><CheckCircle2 className="size-4" />Flexible before payment</span>
                        </section>
                    </div>
                    <BookingSummary vehicle={vehicle} pickupAt={values.pickupAt} returnAt={values.returnAt} duration={duration} status={vehicle.status} />
                </div>
            </div>
        </div>
    )
}
