import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronDown, Clock3, FileText, Info, MapPin, Search, Settings2, ShieldCheck, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import BookingSummary from '@/components/bookings/BookingSummary'
import { Button } from '@/components/ui/button'
import { ErrorState, SkeletonCard } from '@/components/ui/PageStates'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { checkAvailability, createBooking } from '@/services/bookingService'
import { getVehicle } from '@/services/vehicleService'

const toDateInput = (date) => {
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date - offset).toISOString().slice(0, 10)
}

const toTimeInput = (date) => date.toTimeString().slice(0, 5)
const combineDateAndTime = (date, time) => date && time ? new Date(`${date}T${time}`) : null
const money = (value) => value === undefined || value === null ? '\u2014' : `\u20B9${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

function TimeField({ label, date, time, minDate, minTime, onDateChange, onTimeChange }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <label className="flex h-[53px] overflow-hidden rounded-lg border border-slate-200 bg-white text-sm text-rideon-dark">
                <span className="flex w-[84px] shrink-0 items-center border-r border-slate-200 px-4 font-semibold">{label}</span>
                <span className="relative flex min-w-0 flex-1 items-center">
                    <CalendarDays className="pointer-events-none absolute left-4 size-[18px] text-rideon-blue" />
                    <input aria-label={`${label} date`} required type="date" min={minDate} value={date} onChange={(event) => onDateChange(event.target.value)} className="h-full w-full appearance-none bg-transparent pr-3 pl-11 text-sm font-medium outline-none" />
                </span>
            </label>
            <label className="relative flex h-[53px] overflow-hidden rounded-lg border border-slate-200 bg-white text-sm text-rideon-dark">
                <Clock3 className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-rideon-blue" />
                <input aria-label={`${label} time`} required type="time" min={minTime} value={time} onChange={(event) => onTimeChange(event.target.value)} className="h-full w-full appearance-none bg-transparent px-11 text-sm font-medium outline-none" />
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-rideon-dark" />
            </label>
        </div>
    )
}

export default function BookingPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const { showToast } = useToast()
    const [vehicle, setVehicle] = useState(null)
    const [error, setError] = useState('')
    const [dateError, setDateError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [availability, setAvailability] = useState(null)
    const initialPickup = useMemo(() => {
        const value = new Date()
        value.setMinutes(0, 0, 0)
        value.setHours(value.getHours() + 1)
        return { date: toDateInput(value), time: toTimeInput(value) }
    }, [])
    const [values, setValues] = useState({ pickupDate: initialPickup.date, pickupTime: initialPickup.time, returnDate: toDateInput(new Date()), returnTime: '' })
    const [summaryOpen, setSummaryOpen] = useState(false)

    useEffect(() => {
        getVehicle(id).then(setVehicle).catch((requestError) => setError(getApiErrorMessage(requestError, 'We could not load this vehicle.')))
    }, [id])

    const pickupAt = combineDateAndTime(values.pickupDate, values.pickupTime)
    const returnAt = combineDateAndTime(values.returnDate, values.returnTime)
    const updateValue = (field, value) => {
        setAvailability(null)
        setDateError('')
        setValues((current) => ({ ...current, [field]: value }))
    }

    const checkBookingAvailability = async (event) => {
        event.preventDefault()
        if (!pickupAt || !returnAt || returnAt <= pickupAt) {
            setDateError('Return date and time must be after the pickup date and time.')
            return
        }
        if (!isAuthenticated) {
            navigate('/auth/login', { state: { from: `/booking/${id}` } })
            return
        }

        setSubmitting(true)
        try {
            const summary = await checkAvailability({ bikeId: vehicle.id, campusId: vehicle.campusId, pickupAt: pickupAt.toISOString(), returnAt: returnAt.toISOString() })
            setAvailability(summary)
            if (!summary.available) showToast({ type: 'error', title: 'Bike unavailable', description: summary.reason || 'Choose another time.' })
        } catch (requestError) {
            showToast({ type: 'error', title: 'Could not check availability', description: getApiErrorMessage(requestError) })
        } finally {
            setSubmitting(false)
        }
    }

    const submitBooking = async () => {
        if (!availability?.available) return
        setSubmitting(true)
        try {
            const booking = await createBooking({ bikeId: vehicle.id, campusId: vehicle.campusId, pickupAt: pickupAt.toISOString(), returnAt: returnAt.toISOString() })
            navigate(`/booking-success/${booking.id}`, { state: { booking, vehicle } })
        } catch (requestError) {
            showToast({ type: 'error', title: 'Could not create booking', description: getApiErrorMessage(requestError) })
        } finally {
            setSubmitting(false)
        }
    }

    if (error) return <div className="px-4 pt-28"><ErrorState message={error} /></div>
    if (!vehicle) return <div className="mx-auto max-w-7xl px-4 pt-28"><SkeletonCard className="h-[43rem]" /></div>

    const image = vehicle.imageUrls?.[0]
    const vehicleName = vehicle.name || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim()

    return (
        <div className="min-h-screen bg-[#fcfdff] pb-28 pt-24 text-[#081440] md:pb-12 sm:pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_495px] xl:items-start">
                    <main>
                        <Link to="/vehicles" className="inline-flex items-center gap-2 text-[15px] font-semibold text-rideon-blue"><ArrowLeft className="size-[18px]" />Back to vehicles</Link>
                        <h1 className="mt-4 text-[31px] font-extrabold leading-none tracking-[-0.04em] sm:text-[34px]">Book your ride</h1>
                        <p className="mt-2 text-[15px] text-[#344879]">Select your ride time and we&apos;ll check availability for you.</p>

                        <form onSubmit={checkBookingAvailability} className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(28,55,113,0.035)] sm:p-6">
                            <div className="flex items-center gap-4"><span className="flex size-[29px] items-center justify-center rounded-full bg-rideon-blue text-sm font-bold text-white">1</span><h2 className="text-[16px] font-bold">Select ride time</h2></div>
                            <div className="mt-6 space-y-4">
                                <TimeField label="Pickup" date={values.pickupDate} time={values.pickupTime} minDate={initialPickup.date} onDateChange={(value) => updateValue('pickupDate', value)} onTimeChange={(value) => updateValue('pickupTime', value)} />
                                <TimeField label="Return" date={values.returnDate} time={values.returnTime} minDate={values.pickupDate} minTime={values.returnDate === values.pickupDate ? values.pickupTime : undefined} onDateChange={(value) => updateValue('returnDate', value)} onTimeChange={(value) => updateValue('returnTime', value)} />
                            </div>
                            {dateError && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{dateError}</p>}
                            <div className="mt-5 flex min-h-11 items-center gap-4 rounded-lg border border-[#e5edf9] bg-[#f7faff] px-5 text-[13px] text-[#344879]"><Info className="size-5 shrink-0 text-rideon-blue" />Minimum rental duration is 1 hour.</div>
                            <Button type="submit" disabled={submitting || vehicle.status !== 'AVAILABLE'} className="mt-5 h-[43px] w-full rounded-md bg-[#0764f5] text-[15px] font-semibold text-white shadow-none hover:bg-[#075be0]">{submitting ? 'Checking availability…' : <><Search className="size-[18px]" />Check availability</>}</Button>
                        </form>

                        {availability && <section className="mt-4 hidden rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(28,55,113,0.035)] md:block sm:p-6">
                            <div className="flex items-center gap-4"><span className="flex size-[29px] items-center justify-center rounded-full bg-[#20a64b] text-sm font-bold text-white">2</span><h2 className="text-[16px] font-bold">Availability result</h2></div>
                            {availability.available ? <>
                                <div className="mt-5 overflow-hidden rounded-lg border border-[#a9dfb9]">
                                    <div className="flex items-center gap-4 border-b border-[#a9dfb9] bg-[#f2fff5] px-6 py-4 text-[15px] font-semibold text-[#138a34]"><CheckCircle2 className="size-6 fill-[#20a64b] text-white" />Great! Your selected bike is available for the chosen time.</div>
                                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                                        <div className="flex min-w-0 flex-1 items-center gap-5"><div className="flex size-32 shrink-0 items-center justify-center overflow-hidden">{image ? <img src={image} alt={vehicleName} className="h-full w-full object-contain" /> : <Settings2 className="size-9 text-rideon-blue/40" />}</div><div className="min-w-0"><span className="inline-flex rounded-md bg-[#e7f9e9] px-2 py-1 text-xs font-medium text-[#138a34]">Available</span><h3 className="mt-2 truncate text-[18px] font-bold">{vehicleName}</h3><div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#344879]"><span className="inline-flex items-center gap-2"><MapPin className="size-4 text-rideon-blue" />{vehicle.campus?.name || 'Campus pickup'}</span><span className="inline-flex items-center gap-2"><Settings2 className="size-4 text-[#344879]" />{vehicle.model || 'Automatic'}</span></div></div></div>
                                        <span className="inline-flex shrink-0 items-center gap-3 rounded-md bg-[#f2fff5] px-4 py-3 text-[13px] font-medium text-[#138a34]"><CheckCircle2 className="size-5" />Confirmed for selected time</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end"><Button type="button" onClick={submitBooking} disabled={submitting} variant="outline" className="h-10 rounded-lg border-[#a9c9ff] px-5 text-[14px] font-semibold text-rideon-blue hover:bg-blue-50">Continue to payment <ArrowRight className="size-[18px]" /></Button></div>
                            </> : <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">{availability.reason || 'This bike is not available for the selected time.'}{availability.availableFrom && ` Next available: ${new Date(availability.availableFrom).toLocaleString()}.`}</div>}
                            <div className="mt-4 flex items-center gap-4 rounded-lg border border-[#e5edf9] bg-[#f7faff] px-5 py-3 text-[13px] text-[#344879]"><Info className="size-5 shrink-0 text-rideon-blue" />Price is calculated automatically based on the nearest eligible rental package.</div>
                        </section>}

                        {availability && <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(28,55,113,0.035)] md:hidden">
                            <div className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-full bg-[#20a64b] text-sm font-bold text-white">2</span><h2 className="text-[15px] font-bold">Availability result</h2></div>
                            {availability.available ? <>
                                <div className="mt-4 rounded-lg border border-[#a9dfb9] bg-[#f2fff5] p-3 text-sm font-semibold text-[#138a34]"><span className="flex items-center gap-2"><CheckCircle2 className="size-5" />Great! Your selected bike is available.</span></div>
                                <div className="mt-4 flex items-center gap-4"><div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100">{image ? <img src={image} alt={vehicleName} className="size-full object-contain" /> : <Settings2 className="size-7 text-rideon-blue/40" />}</div><div className="min-w-0"><span className="rounded bg-[#e7f9e9] px-2 py-1 text-xs font-medium text-[#138a34]">Available</span><h3 className="mt-2 truncate text-[16px] font-bold">{vehicleName}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-[#40537e]"><MapPin className="size-3.5 text-rideon-blue" />{vehicle.campus?.name || 'Campus pickup'}</p></div></div>
                                <div className="mt-4 rounded-lg border border-[#dbe6fa] bg-[#f7faff] px-4 py-3"><div className="flex items-center justify-between text-xs text-[#40537e]"><span>Subtotal + GST</span><span>{money(availability.subtotal)} + {money(availability.gstAmount)}</span></div><div className="mt-2 flex items-center justify-between"><span className="text-sm font-semibold">Total amount</span><strong className="text-xl text-rideon-blue">{money(availability.totalAmount)}</strong></div></div>
                                <button type="button" onClick={() => setSummaryOpen(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#a9c9ff] py-3 text-sm font-semibold text-rideon-blue">View booking details <ChevronDown className="size-4" /></button>
                            </> : <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{availability.reason || 'This bike is not available for the selected time.'}</div>}
                        </section>}

                        <section className="mt-4 flex flex-col gap-4 rounded-lg border border-[#f3cf85] bg-[#fffaf0] p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-4"><ShieldCheck className="mt-0.5 size-8 shrink-0 text-[#cf8200]" /><div><h2 className="text-[15px] font-bold">Cancellation policy</h2><p className="mt-1 text-[13px] text-[#46577f]">You can cancel your booking anytime before payment. Once confirmed, cancellations are subject to policy.</p></div></div>
                            <Button type="button" variant="outline" className="h-11 shrink-0 rounded-lg border-[#f3d9a8] bg-white px-5 text-[14px] text-[#1d294b]"><FileText className="size-[18px]" />View policy</Button>
                        </section>
                    </main>
                    <BookingSummary className="hidden md:block" vehicle={vehicle} pickupAt={pickupAt?.toISOString()} returnAt={returnAt?.toISOString()} availability={availability} status={vehicle.status} />
                </div>
            </div>
            {availability?.available && <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"><Button type="button" onClick={submitBooking} disabled={submitting} className="h-12 w-full rounded-lg bg-[#0764f5] text-[15px] font-semibold text-white hover:bg-[#075be0]">{submitting ? 'Continuing…' : <>Continue to payment <ArrowRight className="size-[18px]" /></>}</Button></div>}
            {summaryOpen && <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/30 p-0 md:hidden" role="dialog" aria-modal="true" aria-label="Booking details" onMouseDown={() => setSummaryOpen(false)}><div className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" /><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Booking details</h2><button type="button" aria-label="Close booking details" onClick={() => setSummaryOpen(false)} className="rounded-md p-1 text-[#081440]"><X className="size-5" /></button></div><BookingSummary className="border-0 p-0 shadow-none" vehicle={vehicle} pickupAt={pickupAt?.toISOString()} returnAt={returnAt?.toISOString()} availability={availability} status={vehicle.status} /></div></div>}
        </div>
    )
}
