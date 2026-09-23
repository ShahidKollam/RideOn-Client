import { useEffect } from 'react'
import { X, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const money = (value) =>
    `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

/**
 * Confirmation modal for customer booking cancellation.
 * Displays ONLY values returned by GET /bookings/:id/cancellation-preview.
 * Does not calculate fees, percentages, hours, or refunds.
 */
export default function CancellationModal({
    open,
    preview,
    loadingPreview,
    previewError,
    confirming,
    onClose,
    onConfirm,
    onRetryPreview,
}) {
    useEffect(() => {
        if (!open) return
        const onKey = (e) => {
            if (e.key === 'Escape' && !confirming) onClose()
        }
        document.addEventListener('keydown', onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = prev
        }
    }, [open, confirming, onClose])

    if (!open) return null

    const canConfirm = preview?.canCancel === true && !loadingPreview && !previewError

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
        >
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
                aria-label="Close"
                disabled={confirming}
                onClick={() => !confirming && onClose()}
            />

            <div className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:mx-4 sm:rounded-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 id="cancel-booking-title" className="text-lg font-extrabold text-rideon-dark">
                        Cancel booking
                    </h2>
                    <button
                        type="button"
                        onClick={() => !confirming && onClose()}
                        disabled={confirming}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                        aria-label="Close dialog"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="overflow-y-auto px-5 py-5">
                    {loadingPreview && (
                        <div className="flex flex-col items-center justify-center gap-3 py-10">
                            <Loader2 className="size-8 animate-spin text-rideon-blue" />
                            <p className="text-sm font-medium text-slate-500">Loading cancellation details…</p>
                        </div>
                    )}

                    {!loadingPreview && previewError && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-5 text-center">
                            <AlertCircle className="mx-auto size-7 text-red-500" />
                            <p className="mt-2 text-sm font-medium text-red-700">{previewError}</p>
                            {onRetryPreview && (
                                <button
                                    type="button"
                                    onClick={onRetryPreview}
                                    className="mt-3 text-sm font-bold text-red-700 hover:underline"
                                >
                                    Try again
                                </button>
                            )}
                        </div>
                    )}

                    {!loadingPreview && !previewError && preview && (
                        <>
                            {preview.canCancel === false ? (
                                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-4">
                                    <p className="text-sm font-semibold text-amber-900">
                                        Cancellation not available
                                    </p>
                                    {preview.reason && (
                                        <p className="mt-1.5 text-sm leading-6 text-amber-800">{preview.reason}</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm leading-6 text-slate-600">
                                        Review the cancellation details below. All amounts are calculated by the
                                        system based on the current policy.
                                    </p>

                                    <div className="mt-5 space-y-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80">
                                        <Row label="Booking amount" value={money(preview.bookingAmount)} />
                                        <Row
                                            label="Cancellation fee"
                                            value={
                                                preview.cancellationPercentage != null
                                                    ? `${preview.cancellationPercentage}% — ${money(preview.cancellationAmount)}`
                                                    : money(preview.cancellationAmount)
                                            }
                                            muted
                                        />
                                        <Row
                                            label="Refund amount"
                                            value={money(preview.refundAmount)}
                                            highlight
                                            last
                                        />
                                    </div>

                                    {preview.hoursRemaining != null && (
                                        <p className="mt-4 text-sm text-slate-500">
                                            <span className="font-semibold text-slate-600">Hours remaining:</span>{' '}
                                            {preview.hoursRemaining}{' '}
                                            {Number(preview.hoursRemaining) === 1 ? 'hour' : 'hours'}
                                        </p>
                                    )}

                                    <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-700">
                                        Refund will be returned to your original payment method.
                                    </p>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={confirming}
                        className="w-full sm:w-auto"
                    >
                        Keep booking
                    </Button>
                    {canConfirm && (
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={confirming}
                            className="w-full border-0 bg-red-600 text-white hover:bg-red-700 sm:w-auto"
                        >
                            {confirming ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Cancelling…
                                </>
                            ) : (
                                'Confirm cancellation'
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

function Row({ label, value, muted, highlight, last }) {
    return (
        <div
            className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                !last ? 'border-b border-slate-200/80' : ''
            } ${highlight ? 'bg-white' : ''}`}
        >
            <span className={`text-sm ${muted ? 'text-slate-500' : 'font-medium text-slate-600'}`}>{label}</span>
            <span
                className={`shrink-0 text-right text-sm font-bold tabular-nums ${
                    highlight ? 'text-rideon-green text-base' : muted ? 'text-slate-600' : 'text-rideon-dark'
                }`}
            >
                {value}
            </span>
        </div>
    )
}
