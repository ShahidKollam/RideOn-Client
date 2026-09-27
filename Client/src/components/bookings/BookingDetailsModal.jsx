import { useEffect, useState } from 'react'
import {
    CalendarDays,
    Clock3,
    CreditCard,
    MapPin,
    X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CancellationModal from '@/components/bookings/CancellationModal'
import { bookingDurationLabel, formatBookingStamp } from '@/components/bookings/BookingCard'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { formatDisplayDateTime } from '@/lib/dateFormat'
import { cancelBooking, getBooking, getCancellationPreview } from '@/services/bookingService'
import { cn } from '@/lib/utils'

const money = (value) =>
    `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

/** Fallback product image when API has no bike photo */
const FALLBACK_BIKE_IMAGE = '/honda-activa.png'

function statusStyles(status) {
    const s = String(status || '').toUpperCase()
    if (s === 'CANCELLED') return 'bg-red-50 text-red-600'
    if (s === 'CONFIRMED') return 'bg-emerald-50 text-emerald-700'
    if (s === 'ACTIVE') return 'bg-blue-50 text-blue-700'
    if (s === 'COMPLETED') return 'bg-emerald-50 text-emerald-700'
    if (s === 'PAYMENT_PENDING') return 'bg-amber-50 text-amber-800'
    return 'bg-slate-100 text-slate-600'
}

function refundBadge(status) {
    const s = String(status || '').toUpperCase()
    if (s === 'SUCCESS' || s === 'REFUNDED') return 'bg-emerald-50 text-emerald-700'
    if (s === 'PENDING') return 'bg-amber-50 text-amber-800'
    if (s === 'FAILED') return 'bg-red-50 text-red-700'
    if (s === 'NOT_APPLICABLE' || s === 'NA' || !s) return 'bg-slate-100 text-slate-500'
    return 'bg-slate-100 text-slate-600'
}

function Row({ label, value, strong }) {
    return (
        <div className="flex items-start justify-between gap-3 py-2 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className={cn('text-right font-medium text-rideon-dark', strong && 'font-bold')}>
                {value}
            </span>
        </div>
    )
}

/**
 * Side drawer for booking details. Cancellation block only when status is CANCELLED.
 * Cancel action kept for eligible bookings (same rules as before).
 */
export default function BookingDetailsModal({ open, bookingId, onClose, onUpdated }) {
    const { showToast } = useToast()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [cancelOpen, setCancelOpen] = useState(false)
    const [preview, setPreview] = useState(null)
    const [loadingPreview, setLoadingPreview] = useState(false)
    const [previewError, setPreviewError] = useState('')
    const [confirming, setConfirming] = useState(false)

    useEffect(() => {
        if (!open || !bookingId) {
            setBooking(null)
            setError('')
            // Always clear cancel stack when drawer is closed so it does not
            // re-open on the next visit to details.
            setCancelOpen(false)
            setPreview(null)
            setPreviewError('')
            setLoadingPreview(false)
            setConfirming(false)
            return
        }
        let active = true
        setLoading(true)
        setError('')
        getBooking(bookingId)
            .then((data) => {
                if (active) setBooking(data)
            })
            .catch((err) => {
                if (active) setError(getApiErrorMessage(err, 'Could not load booking details.'))
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => {
            active = false
        }
    }, [open, bookingId])

    useEffect(() => {
        if (!open) return undefined
        const onKey = (e) => {
            if (e.key === 'Escape' && !confirming && !cancelOpen) onClose?.()
        }
        document.addEventListener('keydown', onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = prev || ''
        }
    }, [open, confirming, cancelOpen, onClose])

    const openCancelModal = async () => {
        if (!bookingId) return
        setCancelOpen(true)
        setPreview(null)
        setPreviewError('')
        setLoadingPreview(true)
        try {
            const data = await getCancellationPreview(bookingId)
            setPreview(data)
        } catch (err) {
            setPreviewError(getApiErrorMessage(err, 'Could not load cancellation details.'))
        } finally {
            setLoadingPreview(false)
        }
    }

    const confirmCancel = async () => {
        if (confirming || !preview?.canCancel || !bookingId) return
        setConfirming(true)
        try {
            await cancelBooking(bookingId)
            showToast({
                type: 'success',
                title: 'Booking cancelled',
                description: 'Your reservation has been cancelled.',
            })
            setCancelOpen(false)
            setPreview(null)
            const refreshed = await getBooking(bookingId)
            setBooking(refreshed)
            onUpdated?.(refreshed)
        } catch (err) {
            showToast({
                type: 'error',
                title: 'Could not cancel booking',
                description: getApiErrorMessage(err),
            })
        } finally {
            setConfirming(false)
        }
    }

    if (!open) return null

    const cancellation = booking?.cancellation || null
    const isCancelled = String(booking?.status || '').toUpperCase() === 'CANCELLED'
    const showCancelButton =
        !isCancelled &&
        (cancellation?.canCancel === true ||
            (!cancellation && ['PAYMENT_PENDING', 'CONFIRMED'].includes(String(booking?.status || '').toUpperCase())))

    const bikeName = booking?.bike?.name || 'Campus bike'
    const bikeNo = booking?.bike?.bikeNumber || ''
    const reg = booking?.bike?.registrationNumber || ''
    const campus = booking?.campus?.name || 'NIT Calicut'
    const duration = bookingDurationLabel(booking?.pickupAt, booking?.returnAt)
    const imageUrl =
        booking?.bike?.imageUrl ||
        booking?.bike?.image ||
        booking?.bike?.photoUrl ||
        FALLBACK_BIKE_IMAGE

    const payment = booking?.payment || booking?.payments?.[0] || null
    const baseAmount = booking?.baseAmount ?? booking?.rentalAmount ?? booking?.pricing?.baseAmount
    const helmetAmount = booking?.helmetAmount ?? booking?.helmetCharge ?? 0
    const discount = booking?.discountAmount ?? booking?.discount ?? 0
    const helmetCount = booking?.helmetCount ?? booking?.helmets ?? 0
    const total = booking?.totalAmount

    const feePercent = cancellation?.feePercent ?? cancellation?.cancellationFeePercent
    const feeAmount = cancellation?.feeAmount ?? cancellation?.cancellationFee
    const refundAmount = cancellation?.refundAmount
    const refundStatus = cancellation?.refundStatus || cancellation?.refund?.status
    const cancelledAt = cancellation?.cancelledAt || booking?.cancelledAt
    const cancelledBy = cancellation?.cancelledBy || cancellation?.cancelledByType || 'Customer'

    return (
        <>
            <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Booking details">
                <button
                    type="button"
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                    aria-label="Close details"
                    onClick={onClose}
                    disabled={cancelOpen}
                />

                <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl sm:max-w-[420px]">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <h2 className="text-lg font-extrabold text-rideon-dark">Booking Details</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        {loading && (
                            <div className="space-y-4">
                                <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                                <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
                                <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
                            </div>
                        )}

                        {!loading && error && (
                            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        {!loading && booking && (
                            <div className="space-y-5">
                                {/* Header card with product image */}
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                    <div className="flex gap-3">
                                        <div className="flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/80 shadow-sm">
                                            <img
                                                src={imageUrl}
                                                alt={bikeName}
                                                className="size-full object-contain object-center p-1"
                                                onError={(e) => {
                                                    if (e.currentTarget.src !== FALLBACK_BIKE_IMAGE) {
                                                        e.currentTarget.src = FALLBACK_BIKE_IMAGE
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                                    statusStyles(booking.status),
                                                )}
                                            >
                                                {String(booking.status || '').replaceAll('_', ' ')}
                                            </span>
                                            <p className="mt-1.5 text-base font-extrabold text-rideon-dark">
                                                {booking.bookingNumber}
                                            </p>
                                            <p className="truncate text-sm text-slate-500">
                                                {bikeName}
                                                {bikeNo ? ` · ${bikeNo}` : ''}
                                            </p>
                                            {reg && <p className="truncate text-xs text-slate-400">{reg}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Trip details */}
                                <section className="rounded-2xl border border-slate-100 p-4">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-rideon-dark">
                                        <CalendarDays className="size-4 text-rideon-blue" />
                                        Trip Details
                                    </h3>
                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                <CalendarDays className="size-3" /> Pickup
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-rideon-dark">
                                                {formatBookingStamp(booking.pickupAt).split(' · ')[0]}
                                            </p>
                                            <p className="text-sm font-semibold text-slate-600">
                                                {formatBookingStamp(booking.pickupAt).split(' · ')[1]}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                <Clock3 className="size-3" /> Return
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-rideon-dark">
                                                {formatBookingStamp(booking.returnAt).split(' · ')[0]}
                                            </p>
                                            <p className="text-sm font-semibold text-slate-600">
                                                {formatBookingStamp(booking.returnAt).split(' · ')[1]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-50 pt-3 text-sm text-slate-600">
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="size-3.5 text-rideon-blue" />
                                            {campus}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock3 className="size-3.5 text-slate-400" />
                                            {duration}
                                        </span>
                                    </div>
                                </section>

                                {/* Payment */}
                                <section className="rounded-2xl border border-slate-100 p-4">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-rideon-dark">
                                        <CreditCard className="size-4 text-rideon-blue" />
                                        Payment Summary
                                    </h3>
                                    <div className="mt-2 divide-y divide-slate-50">
                                        {baseAmount != null && <Row label="Base amount" value={money(baseAmount)} />}
                                        <Row label={`Helmet (${helmetCount})`} value={money(helmetAmount)} />
                                        <Row label="Discount" value={money(discount)} />
                                        <Row label="Total amount" value={money(total)} strong />
                                    </div>
                                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                Payment Status
                                            </p>
                                            <p className="mt-0.5 text-sm font-bold text-emerald-600">
                                                {payment?.status === 'PAID' ||
                                                String(booking.status).toUpperCase() !== 'PAYMENT_PENDING'
                                                    ? 'Paid'
                                                    : String(payment?.status || booking.status || '—').replaceAll('_', ' ')}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {payment?.method || payment?.provider
                                                    ? `Paid via ${payment.method || payment.provider}`
                                                    : 'Paid via Razorpay'}
                                                {payment?.paidAt || payment?.createdAt
                                                    ? ` · ${formatDisplayDateTime(payment.paidAt || payment.createdAt)}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Cancellation — only when cancelled */}
                                {isCancelled && (
                                    <section className="rounded-2xl border border-red-100 bg-red-50/40 p-4">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-red-800">
                                            Cancellation Details
                                        </h3>
                                        <div className="mt-2 space-y-1">
                                            <Row
                                                label="Cancellation fee"
                                                value={
                                                    feePercent != null
                                                        ? `${feePercent}% — ${money(feeAmount)}`
                                                        : money(feeAmount)
                                                }
                                            />
                                            <Row label="Refund amount" value={money(refundAmount)} />
                                            <div className="flex items-center justify-between gap-3 py-2 text-sm">
                                                <span className="text-slate-500">Refund status</span>
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                                        refundBadge(refundStatus),
                                                    )}
                                                >
                                                    {refundStatus
                                                        ? String(refundStatus).replaceAll('_', ' ')
                                                        : 'Not applicable'}
                                                </span>
                                            </div>
                                            <Row
                                                label="Cancelled at"
                                                value={cancelledAt ? formatBookingStamp(cancelledAt) : '—'}
                                            />
                                            <Row label="Cancelled by" value={String(cancelledBy).replaceAll('_', ' ')} />
                                        </div>
                                        <p className="mt-2 text-xs leading-5 text-red-700/80">
                                            Refund will be returned to your original payment method when applicable.
                                        </p>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer: Close + Cancel on one row (static) */}
                    <div className="border-t border-slate-100 p-4">
                        <div className={cn('flex gap-3', showCancelButton ? '' : '')}>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 flex-1 rounded-xl border-slate-200"
                                onClick={onClose}
                            >
                                Close
                            </Button>
                            {showCancelButton && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={openCancelModal}
                                >
                                    Cancel booking
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CancellationModal
                open={cancelOpen}
                preview={preview}
                loadingPreview={loadingPreview}
                previewError={previewError}
                confirming={confirming}
                onClose={() => {
                    if (confirming) return
                    setCancelOpen(false)
                    setPreview(null)
                    setPreviewError('')
                }}
                onRetryPreview={openCancelModal}
                onConfirm={confirmCancel}
            />
        </>
    )
}
