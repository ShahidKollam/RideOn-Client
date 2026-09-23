import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Clock3, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import CancellationModal from '@/components/bookings/CancellationModal'
import FullPageLoader from '@/components/ui/FullPageLoader'
import { ErrorState, SkeletonCard } from '@/components/ui/PageStates'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { formatDisplayDateTime } from '@/lib/dateFormat'
import { cancelBooking, getBooking, getCancellationPreview } from '@/services/bookingService'

const money = (value) =>
    `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

function statusBadgeClass(status) {
    const s = String(status || '').toUpperCase()
    if (s === 'CANCELLED') return 'bg-red-50 text-red-700 ring-1 ring-red-100'
    if (s === 'CONFIRMED') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
    if (s === 'ACTIVE') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
    if (s === 'COMPLETED') return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
    if (s === 'PAYMENT_PENDING') return 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
    return 'bg-slate-100 text-slate-600'
}

function refundStatusClass(status) {
    const s = String(status || '').toUpperCase()
    if (s === 'SUCCESS') return 'bg-emerald-50 text-emerald-700'
    if (s === 'PENDING') return 'bg-amber-50 text-amber-800'
    if (s === 'FAILED') return 'bg-red-50 text-red-700'
    return 'bg-slate-100 text-slate-600'
}

export default function BookingDetailsPage() {
    const { id } = useParams()
    const { showToast } = useToast()
    const [booking, setBooking] = useState(null)
    const [error, setError] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [preview, setPreview] = useState(null)
    const [loadingPreview, setLoadingPreview] = useState(false)
    const [previewError, setPreviewError] = useState('')
    const [confirming, setConfirming] = useState(false)
    useDocumentTitle(booking?.bookingNumber ? `Booking ${booking.bookingNumber}` : 'Booking details')

    const load = useCallback(() => {
        setError('')
        return getBooking(id)
            .then(setBooking)
            .catch((err) => setError(getApiErrorMessage(err, 'We could not load this booking.')))
    }, [id])

    useEffect(() => {
        load()
    }, [load])

    const openCancelModal = async () => {
        setModalOpen(true)
        setPreview(null)
        setPreviewError('')
        setLoadingPreview(true)
        try {
            const data = await getCancellationPreview(id)
            setPreview(data)
        } catch (err) {
            setPreviewError(getApiErrorMessage(err, 'Could not load cancellation details.'))
        } finally {
            setLoadingPreview(false)
        }
    }

    const retryPreview = () => {
        openCancelModal()
    }

    const closeModal = () => {
        if (confirming) return
        setModalOpen(false)
        setPreview(null)
        setPreviewError('')
    }

    const confirmCancel = async () => {
        if (confirming || !preview?.canCancel) return
        setConfirming(true)
        try {
            // Empty body — backend recalculates fees and refund
            await cancelBooking(id)
            showToast({
                type: 'success',
                title: 'Booking cancelled',
                description: 'Your reservation has been cancelled.',
            })
            setModalOpen(false)
            setPreview(null)
            await load()
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

    if (error) {
        return (
            <div className="px-4 pt-28">
                <ErrorState message={error} onRetry={load} />
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="mx-auto max-w-4xl px-4 pt-28">
                <SkeletonCard className="h-96" />
            </div>
        )
    }

    // Eligibility comes from backend preview when opening modal.
    // For button visibility we also respect cancellation.canCancel when present on detail.
    const cancellation = booking.cancellation || null
    const showCancelButton =
        cancellation?.canCancel === true ||
        (!cancellation && ['PAYMENT_PENDING', 'CONFIRMED'].includes(booking.status))

    const cannotCancelReason =
        cancellation && cancellation.canCancel === false && cancellation.reason
            ? cancellation.reason
            : null

    const bikeLabel =
        booking.bike?.bikeNumber ||
        booking.bike?.name ||
        booking.bike?.registrationNumber ||
        'Campus ride'

    const isCancelled = String(booking.status || '').toUpperCase() === 'CANCELLED'

    return (
        <div className="bg-slate-50/60 pt-24 pb-12 sm:pt-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
                <Link to="/bookings" className="text-sm font-bold text-rideon-blue hover:underline">
                    ← My bookings
                </Link>
                <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-bold tracking-wider text-slate-400">
                                {booking.bookingNumber}
                            </p>
                            <h1 className="mt-1 text-2xl font-extrabold text-rideon-dark">{bikeLabel}</h1>
                            {booking.bike?.registrationNumber && booking.bike?.bikeNumber && (
                                <p className="mt-1 text-sm text-slate-500">{booking.bike.registrationNumber}</p>
                            )}
                        </div>
                        <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(
                                booking.status
                            )}`}
                        >
                            {String(booking.status || '').replaceAll('_', ' ')}
                        </span>
                    </div>

                    <div className="mt-7 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-2">
                        <div className="flex gap-3">
                            <CalendarDays className="size-5 shrink-0 text-rideon-blue" />
                            <div>
                                <p className="text-xs font-semibold text-slate-400">PICKUP</p>
                                <p className="mt-1 text-sm font-semibold text-slate-600">
                                    {formatDisplayDateTime(booking.pickupAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Clock3 className="size-5 shrink-0 text-rideon-blue" />
                            <div>
                                <p className="text-xs font-semibold text-slate-400">RETURN</p>
                                <p className="mt-1 text-sm font-semibold text-slate-600">
                                    {formatDisplayDateTime(booking.returnAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <MapPin className="size-5 shrink-0 text-rideon-blue" />
                            <div>
                                <p className="text-xs font-semibold text-slate-400">CAMPUS</p>
                                <p className="mt-1 text-sm font-semibold text-slate-600">
                                    {booking.campus?.name || 'Campus pickup'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400">TOTAL</p>
                            <p className="text-xl font-extrabold text-rideon-dark">
                                {money(booking.totalAmount)}
                            </p>
                        </div>
                        {showCancelButton && !isCancelled && (
                            <Button
                                onClick={openCancelModal}
                                disabled={loadingPreview || confirming}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                                Cancel booking
                            </Button>
                        )}
                    </div>

                    {!showCancelButton && !isCancelled && cannotCancelReason && (
                        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                            {cannotCancelReason}
                        </p>
                    )}

                    {booking.status === 'PAYMENT_PENDING' && (
                        <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                            Payment is pending. Complete payment from the booking flow if required.
                        </p>
                    )}

                    {/* Cancelled booking details — display backend cancellation fields only */}
                    {isCancelled && cancellation && (
                        <div className="mt-6 overflow-hidden rounded-xl border border-red-100 bg-red-50/40">
                            <div className="border-b border-red-100 px-4 py-3">
                                <p className="text-sm font-bold text-red-800">Cancellation details</p>
                            </div>
                            <div className="space-y-0 bg-white/60">
                                {cancellation.cancellationAmount != null && (
                                    <div className="flex justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm">
                                        <span className="text-slate-500">Cancellation fee</span>
                                        <span className="font-semibold text-slate-700 tabular-nums">
                                            {cancellation.cancellationPercentage != null
                                                ? `${cancellation.cancellationPercentage}% — ${money(cancellation.cancellationAmount)}`
                                                : money(cancellation.cancellationAmount)}
                                        </span>
                                    </div>
                                )}
                                {cancellation.refundAmount != null && (
                                    <div className="flex justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm">
                                        <span className="text-slate-500">Refund amount</span>
                                        <span className="font-bold text-rideon-green tabular-nums">
                                            {money(cancellation.refundAmount)}
                                        </span>
                                    </div>
                                )}
                                {cancellation.refundStatus != null && (
                                    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                                        <span className="text-slate-500">Refund status</span>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${refundStatusClass(
                                                cancellation.refundStatus
                                            )}`}
                                        >
                                            {String(cancellation.refundStatus).replaceAll('_', ' ')}
                                        </span>
                                    </div>
                                )}
                                {cancellation.cancelledAt && (
                                    <div className="flex justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm">
                                        <span className="text-slate-500">Cancelled at</span>
                                        <span className="font-medium text-slate-700">
                                            {formatDisplayDateTime(cancellation.cancelledAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="border-t border-red-100 px-4 py-3 text-xs leading-5 text-slate-500">
                                Refund will be returned to your original payment method when applicable.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <FullPageLoader
                open={confirming}
                message="Cancelling booking…"
                subMessage="Processing your cancellation. Please don’t close this page."
            />
            <CancellationModal
                open={modalOpen}
                preview={preview}
                loadingPreview={loadingPreview}
                previewError={previewError}
                confirming={confirming}
                onClose={closeModal}
                onConfirm={confirmCancel}
                onRetryPreview={retryPreview}
            />
        </div>
    )
}
