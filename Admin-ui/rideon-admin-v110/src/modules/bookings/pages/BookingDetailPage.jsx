import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  KeyRound,
  Undo2,
  CircleX,
  CreditCard,
  AlertTriangle,
  Clock,
  Copy,
  FileText,
  Bike,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import { cn } from '../../../utils/cn';

const money = (n) =>
  n === undefined || n === null
    ? '—'
    : `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateTime = (v) =>
  v
    ? new Date(v).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

function Row({ label, value, copy }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 text-sm border-b border-token/60 last:border-0">
      <span className="text-muted shrink-0">{label}</span>
      <span className="text-right font-medium text-primary-token flex items-center gap-1.5 min-w-0">
        <span className="truncate">{value}</span>
        {copy && (
          <button
            type="button"
            className="text-muted hover:text-primary-token shrink-0"
            onClick={() => navigator.clipboard?.writeText(String(copy))}
            aria-label="Copy"
          >
            <Copy size={13} />
          </button>
        )}
      </span>
    </div>
  );
}

function Panel({ title, icon: Icon, children, className }) {
  return (
    <section
      className={cn(
        'rounded-xl border border-token bg-surface overflow-hidden',
        className
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-token px-4 sm:px-5 py-3.5">
        {Icon && <Icon size={16} className="text-[var(--color-primary)] shrink-0" />}
        <h3 className="text-sm font-semibold text-primary-token">{title}</h3>
      </div>
      <div className="px-4 sm:px-5 py-1">{children}</div>
    </section>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const [pickupOpen, setPickupOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [odometer, setOdometer] = useState('');
  const [applyLateFee, setApplyLateFee] = useState(false);
  const [applyDisruption, setApplyDisruption] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [applyCancellationFee, setApplyCancellationFee] = useState(true);
  const [adjustedRefund, setAdjustedRefund] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [cashRefundOpen, setCashRefundOpen] = useState(false);
  const [cashRef, setCashRef] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data || res;
    },
    enabled: !!id,
  });

  const booking = data;

  const { data: latePreview, isLoading: lateLoading } = useQuery({
    queryKey: ['booking-late-charges', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}/late-charges`);
      return res.data || res;
    },
    enabled: !!id && booking?.status === 'ACTIVE',
    retry: false,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['booking', id] });
    qc.invalidateQueries({ queryKey: ['bookings'] });
    qc.invalidateQueries({ queryKey: ['booking-late-charges', id] });
    qc.invalidateQueries({ queryKey: ['late-returns'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const pickupMut = useMutation({
    mutationFn: (value) => api.patch(`/bookings/${id}/pickup`, { pickupOdometer: Number(value) }),
    onSuccess: () => {
      toast.success('Pickup recorded');
      setPickupOpen(false);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const returnMut = useMutation({
    mutationFn: ({ value, applyLateFee, applyDisruptionPenalty }) =>
      api.patch(`/bookings/${id}/return`, {
        returnOdometer: Number(value),
        applyLateFee: !!applyLateFee,
        applyDisruptionPenalty: !!applyDisruptionPenalty,
      }),
    onSuccess: () => {
      toast.success('Return recorded');
      setReturnOpen(false);
      setApplyLateFee(false);
      setApplyDisruption(false);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const cancelMut = useMutation({
    mutationFn: (body) => api.patch(`/bookings/${id}/cancel`, body),
    onSuccess: () => {
      toast.success('Booking cancelled');
      setCancelOpen(false);
      setAdjustedRefund('');
      setAdjustmentReason('');
      setApplyCancellationFee(true);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const cashRefundMut = useMutation({
    mutationFn: (body) => api.post(`/bookings/${id}/cash-refund`, body),
    onSuccess: () => {
      toast.success('Cash refund recorded');
      setCashRefundOpen(false);
      setCashRef('');
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const collectMut = useMutation({
    mutationFn: () =>
      api.post(`/bookings/${id}/payments`, {
        paymentMethod,
        reference: reference || undefined,
      }),
    onSuccess: () => {
      toast.success('Payment collected');
      setPayOpen(false);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={28} />
        <p className="text-sm text-muted">Loading booking…</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/bookings')}>
          <ArrowLeft size={16} /> Back
        </Button>
        <div className="rounded-xl border border-token bg-surface p-6 text-center text-sm text-danger">
          {error?.message || 'Booking not found'}
          <div className="mt-3">
            <Button variant="secondary" onClick={refetch}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const outstanding = Number(booking.paymentSummary?.outstandingAmount || 0);
  const paidAmount = Number(
    booking.paymentSummary?.paidAmount ?? booking.paidAmount ?? 0
  );
  const isLate =
    booking.isLate ||
    (booking.status === 'ACTIVE' && booking.returnAt && new Date() > new Date(booking.returnAt));
  const lateMins =
    booking.lateDurationMinutes ??
    latePreview?.lateDurationMinutes ??
    (isLate && booking.returnAt
      ? Math.max(0, Math.ceil((Date.now() - new Date(booking.returnAt).getTime()) / 60000))
      : 0);
  const cancellable = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'NO_SHOW'].includes(booking.status) && booking.cancellation?.canCancel !== false;
  const lastOdometer =
    booking.bike?.currentOdometer ??
    booking.pickupOdometer ??
    booking.bike?.odometer ??
    null;

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-28 sm:pb-8">
      {/* Header — matches control-center layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary-token"
          >
            <ArrowLeft size={16} /> Back to Bookings
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-token truncate">
              Booking #{booking.bookingNumber || id}
            </h1>
            <StatusBadge status={isLate && booking.status === 'ACTIVE' ? 'LATE_RETURN' : booking.status} />
            <StatusBadge status={booking.paymentStatus || 'PENDING'} />
          </div>
          <p className="text-sm text-secondary truncate">
            {booking.user?.name || '—'}
            {booking.bike?.bikeNumber ? ` · ${booking.bike.bikeNumber}` : ''}
            {booking.bike?.registrationNumber
              ? ` · ${booking.bike.registrationNumber}`
              : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasPermission('bookings.update') && booking.status === 'CONFIRMED' && (
            <Button
              onClick={() => {
                setOdometer(lastOdometer != null ? String(lastOdometer) : '');
                setPickupOpen(true);
              }}
            >
              <KeyRound size={14} /> Pickup
            </Button>
          )}
          {hasPermission('bookings.update') && booking.status === 'ACTIVE' && (
            <Button
              onClick={() => {
                setOdometer(booking.pickupOdometer != null ? String(booking.pickupOdometer) : '');
                setApplyLateFee(false);
                setApplyDisruption(false);
                setReturnOpen(true);
              }}
            >
              <Undo2 size={14} /> Return
            </Button>
          )}
          {hasPermission('bookings.update') &&
            outstanding > 0 &&
            booking.status === 'COMPLETED' && (
              <Button
                variant="secondary"
                onClick={() => {
                  setPaymentMethod('UPI');
                  setReference('');
                  setPayOpen(true);
                }}
              >
                <CreditCard size={14} /> Collect {money(outstanding)}
              </Button>
            )}
          {hasPermission('bookings.cancel') && cancellable && (
            <Button
              variant="danger"
              onClick={() => {
                setApplyCancellationFee(true);
                setAdjustedRefund('');
                setAdjustmentReason('');
                setCancelOpen(true);
              }}
            >
              <CircleX size={14} /> Cancel
            </Button>
          )}
          {hasPermission('bookings.cancel') &&
            booking.status === 'CANCELLED' &&
            booking.cancellation?.refundStatus === 'PENDING' && (
              <Button
                variant="secondary"
                onClick={() => {
                  setCashRef('');
                  setCashRefundOpen(true);
                }}
              >
                <CreditCard size={14} /> Record cash refund
              </Button>
            )}
        </div>
      </div>

      {isLate && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-3">
          <Clock className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Late Return</p>
            <p className="text-sm text-secondary">
              {lateMins} minute{lateMins === 1 ? '' : 's'} past scheduled return
            </p>
          </div>
        </div>
      )}

      {latePreview?.affectedBooking && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Booking Affected</p>
            <p className="text-sm text-secondary">
              {latePreview.affectedBooking.bookingNumber}
              {latePreview.affectedBooking.user?.name
                ? ` · ${latePreview.affectedBooking.user.name}`
                : ''}
            </p>
            <p className="text-xs text-muted mt-1">
              Pickup {dateTime(latePreview.affectedBooking.pickupAt)} · Status{' '}
              {latePreview.affectedBooking.status}
            </p>
            {latePreview.affectedBooking.id && (
              <Link
                to={`/bookings/${latePreview.affectedBooking.id}`}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline mt-1 inline-block"
              >
                Open affected booking →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Booking Information" icon={FileText}>
          <Row label="Booking number" value={booking.bookingNumber} copy={booking.bookingNumber} />
          <Row label="Customer" value={booking.user?.name} />
          <Row label="Email" value={booking.user?.email} />
          <Row label="Phone" value={booking.user?.phone} />
          <Row label="Campus" value={booking.campus?.name} />
          <Row
            label="Status"
            value={<StatusBadge status={booking.status} />}
          />
          <Row
            label="Payment"
            value={<StatusBadge status={booking.paymentStatus || 'PENDING'} />}
          />
          <Row label="Created" value={dateTime(booking.createdAt)} />
          <Row label="Notes" value={booking.notes} />
        </Panel>

        <Panel title="Bike" icon={Bike}>
          <Row label="Bike number" value={booking.bike?.bikeNumber} />
          <Row label="Registration" value={booking.bike?.registrationNumber} />
          <Row label="Name" value={booking.bike?.name || [booking.bike?.brand, booking.bike?.model].filter(Boolean).join(' ')} />
          <Row
            label="Bike status"
            value={booking.bike?.status && <StatusBadge status={booking.bike.status} />}
          />
          <Row
            label="Current odometer"
            value={
              lastOdometer != null
                ? `${Number(lastOdometer).toLocaleString()} km`
                : null
            }
          />
        </Panel>

        <Panel title="Scheduled Timeline" icon={Clock}>
          <Row label="Pickup" value={dateTime(booking.pickupAt)} />
          <Row label="Return" value={dateTime(booking.returnAt)} />
          <Row
            label="Duration"
            value={booking.durationHours != null ? `${booking.durationHours} hours` : null}
          />
          <Row
            label="Package"
            value={
              booking.pricing?.packageName ||
              (booking.durationHours != null ? `${booking.durationHours} Hours` : null)
            }
          />
        </Panel>

        <Panel title="Actual Timeline" icon={Clock}>
          <Row label="Picked up at" value={dateTime(booking.pickedUpAt)} />
          <Row label="Returned at" value={dateTime(booking.returnedAt)} />
          <Row
            label="Pickup odometer"
            value={
              booking.pickupOdometer != null
                ? `${Number(booking.pickupOdometer).toLocaleString()} km`
                : null
            }
          />
          <Row
            label="Return odometer"
            value={
              booking.returnOdometer != null
                ? `${Number(booking.returnOdometer).toLocaleString()} km`
                : null
            }
          />
          <Row
            label="Actual km"
            value={booking.actualKm != null ? `${booking.actualKm} km` : null}
          />
          {lateMins > 0 && <Row label="Late duration" value={`${lateMins} min`} />}
        </Panel>
      </div>

      {/* Charges — horizontal strip like screenshot */}
      <Panel title="Charges" icon={FileText} className="!overflow-visible">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-3">
          {[
            ['Base amount', booking.baseAmount],
            ['Helmet', booking.helmetAmount],
            ['Deposit', booking.depositAmount],
            ['Platform fee', booking.platformFee],
            ['GST', booking.gstAmount],
            ['Extra KM', booking.extraKm != null ? booking.extraKm : null],
            ['Extra KM charge', booking.extraKmCharge],
            ['Late fee', booking.lateFee],
            ['Disruption', booking.disruptionPenalty],
            ['Late helmet', booking.lateHelmetFee],
            ['Total', booking.totalAmount],
            ['Paid', paidAmount],
          ]
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([label, val]) => (
              <div key={label} className="rounded-lg border border-token/80 bg-[var(--color-bg)]/40 px-3 py-2.5">
                <p className="text-[11px] text-muted uppercase tracking-wide">{label}</p>
                <p className="mt-1 text-sm font-semibold text-primary-token">
                  {label === 'Extra KM' && typeof val === 'number' && !String(label).includes('charge')
                    ? `${val} km`
                    : money(val)}
                </p>
              </div>
            ))}
          {outstanding > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
              <p className="text-[11px] text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Outstanding
              </p>
              <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                {money(outstanding)}
              </p>
            </div>
          )}
        </div>
      </Panel>

      {/* Cancellation info */}
      {(booking.cancellation || booking.status === 'CANCELLED') && (
        <Panel title="Cancellation" icon={CircleX}>
          {booking.status === 'CANCELLED' || booking.cancellation?.cancelledAt ? (
            <>
              <Row label="Cancelled at" value={dateTime(booking.cancellation?.cancelledAt || booking.cancelledAt)} />
              <Row
                label="Cancelled by"
                value={
                  booking.cancellation?.cancelledBy ||
                  booking.cancelledBy ||
                  null
                }
              />
              <Row
                label="Booking amount"
                value={money(booking.cancellation?.bookingAmount ?? booking.totalAmount)}
              />
              <Row
                label="Fee percent"
                value={
                  booking.cancellation?.cancellationPercentage != null
                    ? `${booking.cancellation.cancellationPercentage}%`
                    : null
                }
              />
              <Row
                label="Cancellation fee"
                value={money(
                  booking.cancellation?.cancellationAmount ??
                    booking.cancellation?.originalCancellationAmount
                )}
              />
              <Row
                label="Original refund"
                value={money(
                  booking.cancellation?.refundAmount ??
                    (booking.cancellation?.bookingAmount != null &&
                    booking.cancellation?.cancellationAmount != null
                      ? Number(booking.cancellation.bookingAmount) -
                        Number(booking.cancellation.cancellationAmount)
                      : null)
                )}
              />
              <Row
                label="Adjusted refund"
                value={
                  booking.cancellation?.adminAdjustedRefundAmount != null
                    ? money(booking.cancellation.adminAdjustedRefundAmount)
                    : '—'
                }
              />
              <Row label="Reason" value={booking.cancellation?.adminAdjustmentReason || '—'} />
              <Row
                label="Refund status"
                value={
                  booking.cancellation?.refundStatus ? (
                    <StatusBadge status={booking.cancellation.refundStatus} />
                  ) : (
                    '—'
                  )
                }
              />
            </>
          ) : (
            <>
              <Row
                label="Eligibility"
                value={
                  booking.cancellation?.canCancel
                    ? 'Can cancel'
                    : booking.cancellation?.reason || 'Not cancellable'
                }
              />
              <Row label="Booking amount" value={money(booking.cancellation?.bookingAmount)} />
              <Row
                label="Cancellation fee"
                value={
                  booking.cancellation?.cancellationPercentage != null
                    ? `${booking.cancellation.cancellationPercentage}% = ${money(booking.cancellation.cancellationAmount)}`
                    : money(booking.cancellation?.cancellationAmount)
                }
              />
              <Row label="Refund amount" value={money(booking.cancellation?.refundAmount)} />
              <Row
                label="Refund status"
                value={
                  booking.cancellation?.refundStatus ? (
                    <StatusBadge status={booking.cancellation.refundStatus} />
                  ) : (
                    '—'
                  )
                }
              />
              {booking.cancellation?.hoursRemaining != null && (
                <Row
                  label="Hours until pickup"
                  value={`${Number(booking.cancellation.hoursRemaining).toFixed(1)} h`}
                />
              )}
            </>
          )}
        </Panel>
      )}

{booking.status === 'ACTIVE' && (
        <Panel title="Late charge preview" icon={AlertTriangle}>
          {lateLoading ? (
            <p className="py-3 text-sm text-muted">Loading preview…</p>
          ) : latePreview ? (
            <>
              <Row label="Late duration" value={`${latePreview.lateDurationMinutes || 0} min`} />
              <Row label="Calculated late rental" value={money(latePreview.calculatedLateRental)} />
              <Row
                label="Package"
                value={
                  latePreview.latePricingInfo
                    ? `${latePreview.latePricingInfo.packageName || ''} (${latePreview.latePricingInfo.durationHours || ''}h)`
                    : null
                }
              />
              <Row
                label="Disruption penalty (settings)"
                value={money(latePreview.disruptionPenaltyAmount)}
              />
              <p className="py-2 text-xs text-muted">
                Charges are not applied until you confirm return and opt in.
              </p>
            </>
          ) : (
            <p className="py-3 text-sm text-muted">No late charges (or preview unavailable).</p>
          )}
        </Panel>
      )}

      {/* Pickup modal */}
      <Modal
        open={pickupOpen}
        onClose={() => setPickupOpen(false)}
        title="Record pickup"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPickupOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={pickupMut.isPending || odometer === ''}
              onClick={() => pickupMut.mutate(odometer)}
            >
              {pickupMut.isPending ? 'Saving…' : 'Confirm pickup'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {lastOdometer != null && (
            <p className="text-sm text-secondary rounded-lg border border-token bg-[var(--color-bg)]/40 px-3 py-2">
              Last recorded odometer:{' '}
              <strong className="text-primary-token">
                {Number(lastOdometer).toLocaleString()} km
              </strong>
            </p>
          )}
          <div>
            <label className="block text-sm text-secondary mb-1.5">Pickup odometer</label>
            <Input
              type="number"
              min="0"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="Current km reading"
            />
          </div>
        </div>
      </Modal>

      {/* Return modal */}
      <Modal
        open={returnOpen}
        onClose={() => !returnMut.isPending && setReturnOpen(false)}
        title="Record return"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={returnMut.isPending}
              onClick={() => setReturnOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={returnMut.isPending || odometer === ''}
              onClick={() =>
                returnMut.mutate({
                  value: odometer,
                  applyLateFee,
                  applyDisruptionPenalty: applyDisruption,
                })
              }
            >
              {returnMut.isPending ? 'Saving…' : 'Confirm return'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {booking.pickupOdometer != null && (
            <p className="text-sm text-secondary rounded-lg border border-token bg-[var(--color-bg)]/40 px-3 py-2">
              Pickup odometer:{' '}
              <strong className="text-primary-token">
                {Number(booking.pickupOdometer).toLocaleString()} km
              </strong>
            </p>
          )}
          <div>
            <label className="block text-sm text-secondary mb-1.5">Return odometer</label>
            <Input
              type="number"
              min="0"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="Current km reading"
            />
          </div>

          {(latePreview?.isLate || isLate) && (
            <div className="rounded-lg border border-token bg-[var(--color-bg)]/50 p-3 space-y-3 text-sm">
              <p className="font-medium text-primary-token">
                Late {latePreview?.lateDurationMinutes ?? lateMins} min
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={applyLateFee}
                  onChange={(e) => setApplyLateFee(e.target.checked)}
                />
                <span>
                  <span className="font-medium text-primary-token">Apply late fee</span>
                  <span className="block text-xs text-muted">
                    {money(latePreview?.calculatedLateRental || 0)}
                    {latePreview?.latePricingInfo?.packageName
                      ? ` · ${latePreview.latePricingInfo.packageName}`
                      : ''}
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={applyDisruption}
                  onChange={(e) => setApplyDisruption(e.target.checked)}
                />
                <span>
                  <span className="font-medium text-primary-token">Apply disruption penalty</span>
                  <span className="block text-xs text-muted">
                    {money(latePreview?.disruptionPenaltyAmount || 0)} — not applied unless checked
                  </span>
                </span>
              </label>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={payOpen}
        onClose={() => !collectMut.isPending && setPayOpen(false)}
        title="Collect outstanding"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={collectMut.isPending}
              onClick={() => setPayOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={collectMut.isPending} onClick={() => collectMut.mutate()}>
              {collectMut.isPending ? 'Processing…' : `Mark paid ${money(outstanding)}`}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-secondary mb-1.5">Amount</label>
            <Input value={money(outstanding)} disabled />
          </div>
          <fieldset>
            <legend className="mb-2 text-sm text-secondary">Payment method</legend>
            <div className="flex gap-4 text-sm">
              {['UPI', 'CASH'].map((m) => (
                <label key={m} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={paymentMethod === m}
                    onChange={() => setPaymentMethod(m)}
                  />
                  {m === 'UPI' ? 'UPI' : 'Cash'}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="block text-sm text-secondary mb-1.5">Reference (optional)</label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal
        open={cancelOpen}
        onClose={() => !cancelMut.isPending && setCancelOpen(false)}
        title="Cancel booking"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={cancelMut.isPending}
              onClick={() => setCancelOpen(false)}
            >
              Keep booking
            </Button>
            <Button
              variant="danger"
              disabled={cancelMut.isPending}
              onClick={() => {
                const body = {
                  applyCancellationFee: !!applyCancellationFee,
                  adjustedRefundAmount:
                    adjustedRefund === '' || adjustedRefund == null
                      ? null
                      : Number(adjustedRefund),
                  adjustmentReason: adjustmentReason.trim() || null,
                };
                cancelMut.mutate(body);
              }}
            >
              {cancelMut.isPending ? 'Cancelling…' : 'Cancel booking'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-token bg-[var(--color-bg)]/40 px-3 py-2 space-y-1">
            <p className="flex justify-between gap-2">
              <span className="text-muted">Booking amount</span>
              <strong>{money(booking.cancellation?.bookingAmount ?? booking.totalAmount)}</strong>
            </p>
            {booking.cancellation?.hoursRemaining != null && (
              <p className="flex justify-between gap-2 text-xs text-muted">
                <span>Hours until pickup</span>
                <span>{Number(booking.cancellation.hoursRemaining).toFixed(1)} h</span>
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={applyCancellationFee}
              onChange={(e) => setApplyCancellationFee(e.target.checked)}
            />
            <span>
              <span className="font-medium text-primary-token">Apply cancellation fee</span>
              <span className="block text-xs text-muted mt-0.5">
                {applyCancellationFee
                  ? `${booking.cancellation?.cancellationPercentage ?? '—'}% fee → refund ${money(
                      booking.cancellation?.refundAmount
                    )}`
                  : `No fee → full refund ${money(booking.cancellation?.bookingAmount ?? booking.totalAmount)}`}
              </span>
            </span>
          </label>

          <div>
            <label className="block text-sm text-secondary mb-1.5">
              Adjust refund (optional)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={adjustedRefund}
              onChange={(e) => setAdjustedRefund(e.target.value)}
              placeholder={
                applyCancellationFee
                  ? String(booking.cancellation?.refundAmount ?? '')
                  : String(booking.cancellation?.bookingAmount ?? booking.totalAmount ?? '')
              }
            />
            <p className="mt-1 text-xs text-muted">Leave empty to use the calculated refund.</p>
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1.5">Reason (optional)</label>
            <Input
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              placeholder="e.g. Customer service exception"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={cashRefundOpen}
        onClose={() => !cashRefundMut.isPending && setCashRefundOpen(false)}
        title="Record cash refund"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={cashRefundMut.isPending}
              onClick={() => setCashRefundOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={cashRefundMut.isPending}
              onClick={() =>
                cashRefundMut.mutate({
                  reference: cashRef.trim() || undefined,
                })
              }
            >
              {cashRefundMut.isPending ? 'Saving…' : 'Record refund'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-secondary">
            Use this only for cash/offline refunds when refund status is PENDING.
          </p>
          <div>
            <label className="block text-sm text-secondary mb-1.5">Reference (optional)</label>
            <Input
              value={cashRef}
              onChange={(e) => setCashRef(e.target.value)}
              placeholder="Receipt / note"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
