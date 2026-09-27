import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CalendarCheck, Eye, KeyRound, Undo2, CircleX, CreditCard } from 'lucide-react'
import { api } from '../../../lib/api'
import { PageHeader } from '../../../components/ui/PageHeader'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { Button } from '../../../components/ui/Button'
import { Input, Select } from '../../../components/ui/Input'
import { Card } from '../../../components/ui/Card'
import { ActionMenu } from '../../../components/ui/ActionMenu'
import { Drawer } from '../../../components/ui/Drawer'
import { Modal } from '../../../components/ui/Modal'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../components/ui/Toast'
import { MobileList, MobileCard } from '../../../components/ui/MobileList'
import { AlertTriangle } from 'lucide-react'

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const dateTime = (v) => (v ? new Date(v).toLocaleString() : '—')
const Detail = ({ label, value }) =>
    value === undefined || value === null || value === '' || value === false ? null : (
        <div className="flex items-start justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0">
            <span className="text-muted">{label}</span>
            <span className="text-right font-medium text-primary-token">{value}</span>
        </div>
    )
const Section = ({ title, children, className = '', action }) => (
    <section className={`overflow-hidden rounded-xl border border-token bg-[var(--color-bg)]/35 ${className}`}>
        <div className="flex items-center justify-between gap-3 border-b border-token px-5 py-4">
            <h3 className="text-lg font-semibold text-primary-token">{title}</h3>
            {action}
        </div>
        <div className="divide-y divide-token/70 px-5 py-2">{children}</div>
    </section>
)
function parseList(res) {
    const d = res?.data || res || {}
    const rows = d.items || d.bookings || (Array.isArray(d) ? d : [])
    const p = d.pagination || {}
    return {
        rows,
        total: p.total ?? d.total ?? rows.length,
        totalPages: p.totalPages ?? Math.max(1, Math.ceil((p.total ?? rows.length) / (p.limit || 10))),
    }
}

export default function BookingsPage() {
    const { hasPermission } = useAuth()
    const toast = useToast()
    const qc = useQueryClient()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    // deep-link from dashboard late returns
    const [page, setPage] = useState(1),
        [limit, setLimit] = useState(10),
        [search, setSearch] = useState(''),
        [searchInput, setSearchInput] = useState(''),
        [statusFilter, setStatusFilter] = useState(''),
        [lateOnly, setLateOnly] = useState(() => searchParams.get('late') === '1')
    const [selected, setSelected] = useState(null),
        [pickupTarget, setPickupTarget] = useState(null),
        [returnTarget, setReturnTarget] = useState(null),
        [cancelTarget, setCancelTarget] = useState(null),
        [paymentTarget, setPaymentTarget] = useState(null),
        [odometer, setOdometer] = useState(''),
        [paymentMethod, setPaymentMethod] = useState('UPI'),
        [reference, setReference] = useState('')
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['bookings', { page, limit, search, status: statusFilter, lateOnly }],
        queryFn: () => {
            const qs = new URLSearchParams({ page, limit })
            if (search) qs.set('search', search)
            if (statusFilter) qs.set('status', statusFilter)
            if (lateOnly) qs.set('lateOnly', 'true')
            return api.get(`/bookings?${qs}`)
        },
    })
    const { rows, total, totalPages } = parseList(data)
    const {
        data: detailRes,
        isLoading: detailLoading,
        error: detailError,
    } = useQuery({
        queryKey: ['booking', selected?.id],
        queryFn: () => api.get(`/bookings/${selected.id}`),
        enabled: !!selected?.id,
    })
    const booking = detailRes?.data || selected
    const refresh = (id) => {
        qc.invalidateQueries({ queryKey: ['bookings'] })
        qc.invalidateQueries({ queryKey: ['booking', id] })
    }
    const pickupMut = useMutation({
        mutationFn: ({ id, value }) => api.patch(`/bookings/${id}/pickup`, { pickupOdometer: Number(value) }),
        onSuccess: (_, v) => {
            toast.success('Pickup recorded')
            setPickupTarget(null)
            refresh(v.id)
        },
        onError: (e) => toast.error(e.message),
    })
    const returnMut = useMutation({
        mutationFn: ({ id, value }) => api.patch(`/bookings/${id}/return`, { returnOdometer: Number(value) }),
        onSuccess: (_, v) => {
            toast.success('Return recorded')
            setReturnTarget(null)
            refresh(v.id)
        },
        onError: (e) => toast.error(e.message),
    })
    const cancelMut = useMutation({
        mutationFn: (id) => api.patch(`/bookings/${id}/cancel`, {}),
        onSuccess: (_, id) => {
            toast.success('Booking cancelled')
            setCancelTarget(null)
            refresh(id)
        },
        onError: (e) => toast.error(e.message),
    })
    const collectMut = useMutation({
        mutationFn: ({ id, paymentMethod, reference }) =>
            api.post(`/bookings/${id}/payments`, { paymentMethod, reference: reference || undefined }),
        onSuccess: (_, v) => {
            toast.success('Additional payment collected')
            setPaymentTarget(null)
            refresh(v.id)
        },
        onError: (e) => toast.error(e.message),
    })
    const pickup = (v) => {
            setPickupTarget(v)
            setOdometer('')
        },
        returning = (v) => {
            setReturnTarget(v)
            setOdometer('')
        },
        cancellable = (s) => ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE'].includes(s)
    const columns = [
        {
            key: 'bookingNumber',
            header: 'Booking',
            render: (r) => (
                <div>
                    <p className="font-medium text-primary-token">{r.bookingNumber || '—'}</p>
                    <p className="text-xs text-muted">{r.user?.name || '—'}</p>
                </div>
            ),
        },
        { key: 'bike', header: 'Bike', render: (r) => (
            <div>
                <p className="text-secondary text-sm">{r.bike?.bikeNumber || r.bike?.name || '—'}</p>
                <p className="text-xs text-muted">{r.bike?.registrationNumber || ''}</p>
            </div>
        ) },
        {
            key: 'late',
            header: 'Late',
            render: (r) => {
                const late = r.isLate || (r.status === 'ACTIVE' && r.returnAt && new Date() > new Date(r.returnAt))
                if (!late && !(r.lateDurationMinutes > 0)) return <span className="text-muted">—</span>
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                        🔴 {r.lateDurationMinutes != null ? `${r.lateDurationMinutes}m` : 'Late'}
                    </span>
                )
            },
        },
        {
            key: 'pickupAt',
            header: 'Pickup',
            render: (r) => <span className="text-secondary text-xs">{dateTime(r.pickupAt)}</span>,
        },
        {
            key: 'returnAt',
            header: 'Return',
            render: (r) => <span className="text-secondary text-xs">{dateTime(r.returnAt)}</span>,
        },
        {
            key: 'paymentStatus',
            header: 'Payment',
            render: (r) => (
                <div className="space-y-1">
                    <StatusBadge status={r.paymentStatus || 'PENDING'} />
                    {Number(r.paymentSummary?.outstandingAmount || 0) > 0 && (
                        <p className="text-xs font-medium text-amber-600">Outstanding {money(r.paymentSummary.outstandingAmount)}</p>
                    )}
                </div>
            ),
        },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status || 'PENDING'} /> },
        {
            key: 'actions',
            header: '',
            cellClassName: 'w-12',
            render: (r) => (
                <ActionMenu
                    items={[
                        { label: 'View', icon: Eye, onClick: () => navigate(`/bookings/${r.id}`) },
                        hasPermission('bookings.update') &&
                            r.status === 'CONFIRMED' && {
                                label: 'Record Pickup',
                                icon: KeyRound,
                                onClick: () => pickup(r),
                            },
                        hasPermission('bookings.update') &&
                            r.status === 'ACTIVE' && { label: 'Record Return', icon: Undo2, onClick: () => returning(r) },
                        hasPermission('bookings.cancel') &&
                            cancellable(r.status) && {
                                label: 'Cancel',
                                icon: CircleX,
                                danger: true,
                                onClick: () => setCancelTarget(r),
                            },
                    ].filter(Boolean)}
                />
            ),
        },
    ]
    const payments = booking?.payments || [],
        summary = booking?.paymentSummary || {},
        outstanding = Number(summary.outstandingAmount || 0)
    return (
        <div>
            <PageHeader title="Bookings" description="Manage and monitor RideOn bookings" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Total', value: total },
                    { label: 'On Page', value: rows.length },
                    { label: 'Page', value: `${page}/${totalPages}` },
                    { label: 'Per Page', value: limit },
                ].map((s) => (
                    <Card key={s.label} className="p-4">
                        <p className="text-xs text-muted">{s.label}</p>
                        <p className="text-lg font-bold text-primary-token">{s.value}</p>
                    </Card>
                ))}
            </div>
            <Card className="overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-token">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            setSearch(searchInput.trim())
                            setPage(1)
                        }}
                        className="flex-1 flex gap-2"
                    >
                        <div className="relative flex-1 max-w-sm">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <Input
                                className="pl-9"
                                placeholder="Search booking #…"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    <Select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="">All statuses</option>
                        {/* {['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PARTIALLY_PAID'].map((s) => ( */}
                        {['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((s) => (
                            <option key={s} value={s}>
                                {s.replace('_', ' ')}
                            </option>
                        ))}
                    </Select>
                    <label className="inline-flex items-center gap-2 text-sm text-secondary whitespace-nowrap cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={lateOnly}
                            onChange={(e) => {
                                setLateOnly(e.target.checked)
                                setPage(1)
                            }}
                        />
                        Late returns only
                    </label>
                </div>
                {/* Mobile cards */}
                <MobileList>
                    {rows.map((r) => {
                        const late = r.isLate || (r.status === 'ACTIVE' && r.returnAt && new Date() > new Date(r.returnAt))
                        return (
                            <MobileCard key={r.id} onClick={() => navigate(`/bookings/${r.id}`)}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-primary-token text-sm">{r.bookingNumber || '—'}</span>
                                    <StatusBadge status={late ? 'LATE_RETURN' : r.status} />
                                </div>
                                <p className="text-sm text-secondary truncate">{r.user?.name || '—'}</p>
                                <p className="text-xs text-muted">
                                    {[r.bike?.bikeNumber, r.bike?.registrationNumber].filter(Boolean).join(' · ') || 'No bike'}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted pt-1">
                                    <span>{r.pickupAt ? new Date(r.pickupAt).toLocaleString() : '—'}</span>
                                    <span className="font-medium text-primary-token">{money(r.totalAmount)}</span>
                                </div>
                                {late && (
                                    <p className="text-xs font-medium text-red-600">🔴 Late{r.lateDurationMinutes != null ? ` · ${r.lateDurationMinutes}m` : ''}</p>
                                )}
                            </MobileCard>
                        )
                    })}
                    {!isLoading && rows.length === 0 && (
                        <p className="text-sm text-muted text-center py-8">No bookings found</p>
                    )}
                </MobileList>
                <div className="hidden md:block">
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={isLoading}
                    error={error?.message}
                    onRetry={refetch}
                    emptyTitle="No bookings found"
                    emptyIcon={CalendarCheck}
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    total={total}
                    onPageChange={setPage}
                    onLimitChange={(l) => {
                        setLimit(l)
                        setPage(1)
                    }}
                    onRowClick={(r) => navigate(`/bookings/${r.id}`)}
                />
                </div>
            </Card>
            {/* Booking details moved to /bookings/:id page — drawer removed */}
            <Drawer
                open={false}
                onClose={() => setSelected(null)}
                header={
                    booking && (
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl font-bold tracking-tight text-primary-token">{booking.bookingNumber}</h2>
                                <StatusBadge status={booking.status} />
                            </div>
                            <p className="mt-1 text-sm text-secondary">{booking.user?.name || 'Booking details'}</p>
                        </div>
                    )
                }
                footer={
                    booking && (
                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                            {hasPermission('bookings.update') && booking.status === 'CONFIRMED' && (
                                <Button className="flex-1" onClick={() => pickup(booking)}>
                                    <KeyRound size={14} /> Record Pickup
                                </Button>
                            )}
                            {hasPermission('bookings.update') && booking.status === 'ACTIVE' && (
                                <Button className="flex-1" onClick={() => returning(booking)}>
                                    <Undo2 size={14} /> Record Return
                                </Button>
                            )}
                            {hasPermission('bookings.update') && booking.status === 'COMPLETED' && outstanding > 0 && (
                                <Button
                                    className="flex-1"
                                    onClick={() => {
                                        setPaymentTarget(booking)
                                        setPaymentMethod('UPI')
                                        setReference('')
                                    }}
                                >
                                    <CreditCard size={14} /> Collect {money(outstanding)}
                                </Button>
                            )}
                            {hasPermission('bookings.cancel') && cancellable(booking.status) && (
                                <Button className="flex-1" variant="danger" onClick={() => setCancelTarget(booking)}>
                                    <CircleX size={14} /> Cancel Booking
                                </Button>
                            )}
                        </div>
                    )
                }
            >
                {detailLoading ? (
                    <p className="text-sm text-muted">Loading booking details…</p>
                ) : detailError ? (
                    <p className="text-sm text-red-600">{detailError.message}</p>
                ) : (
                    booking && (
                        <div className="flex flex-col gap-4">
                            {/* <Section title="Customer" className="order-3">
                                <Detail label="Name" value={booking.user?.name} />
                                <Detail label="Email" value={booking.user?.email} />
                                <Detail label="Phone" value={booking.user?.phone} />
                            </Section> */}
                            <Section title="Bike" className="order-4">
                                {/* <Detail label="Bike" value={booking.bike?.name} /> */}
                                <Detail label="Registration" value={booking.bike?.registrationNumber} />
                                {/* <Detail label="Campus" value={booking.campus?.name} /> */}
                                <Detail
                                    label="Status"
                                    value={booking.bike?.status && <StatusBadge status={booking.bike.status} />}
                                />
                            </Section>
                            <Section title="Rental" className="order-5">
                                <Detail label="Package" value={booking.pricing?.packageName} />
                                <Detail label="Pickup" value={dateTime(booking.pickupAt)} />
                                <Detail label="Scheduled return" value={dateTime(booking.returnAt)} />
                                <Detail
                                    label="Duration"
                                    value={booking.durationHours != null && `${booking.durationHours} hours`}
                                />
                            </Section>
                            {booking.pickupOdometer != null && (
                                <Section title="Ride details" className="order-6">
                                    <Detail label="Pickup odometer" value={`${booking.pickupOdometer} km`} />
                                    <Detail
                                        label="Return odometer"
                                        value={booking.returnOdometer != null && `${booking.returnOdometer} km`}
                                    />
                                      <Detail
                                        label="Included KM"
                                        value={booking.includedKm != null && `${booking.includedKm} km`}
                                    />
                                    <Detail
                                        label="Actual distance"
                                        value={booking.actualKm != null && `${booking.actualKm} km`}
                                    />
                                    <Detail
                                        label="Extra distance"
                                        value={booking.extraKm != null && `${booking.extraKm} km`}
                                    />
                                </Section>
                            )}
                            <Section
                                title="Charges"
                                className="order-1 border-blue-500/40 bg-blue-500/[0.06] dark:bg-blue-500/[0.10]"
                                action={<div className="text-right"><p className="text-xs text-muted">Total</p><p className="text-xl font-bold text-blue-600 dark:text-blue-400">{money(booking.totalAmount)}</p></div>}
                            >
                                <Detail label="Base rental" value={money(booking.baseAmount)} />
                                <Detail label="Helmet amount" value={money(booking.helmetAmount)} />
                                <Detail label="Platform fee" value={money(booking.platformAmount)} />
                                <Detail label="Discount" value={money(booking.discountAmount)} />
                                <Detail label="Deposit" value={money(booking.depositAmount)} />
                                {booking.extraKmCharge != null && (
                                    <Detail label="Extra KM charge" value={money(booking.extraKmCharge)} />
                                )}
                                {booking.lateFee != null && <Detail label="Late fee" value={money(booking.lateFee)} />}
                                {booking.lateHelmetFee != null && (
                                    <Detail label="Late helmet fee" value={money(booking.lateHelmetFee)} />
                                )}
                                {/* GST breakdown */}
                                {booking.originalGstAmount != null && Number(booking.originalGstAmount) > 0 && (
                                    <Detail label="GST (original)" value={money(booking.originalGstAmount)} />
                                )}
                                {booking.additionalGstAmount != null && Number(booking.additionalGstAmount) > 0 && (
                                    <Detail label="GST (additional)" value={money(booking.additionalGstAmount)} />
                                )}
                                {(booking.gstAmount != null || booking.originalGstAmount != null) && (
                                    <Detail label="GST total" value={money(booking.gstAmount ?? booking.originalGstAmount)} />
                                )}
                            </Section>
                            <Section
                                title="Payment"
                                className={`order-2 ${outstanding > 0 ? 'border-amber-500/40 bg-amber-500/[0.06] dark:bg-amber-500/[0.10]' : 'border-emerald-500/40 bg-emerald-500/[0.06] dark:bg-emerald-500/[0.10]'}`}
                                action={<StatusBadge status={booking.paymentStatus} />}
                            >
                                <Detail label="Payment status" value={<StatusBadge status={booking.paymentStatus} />} />
                                {payments.map((p, i) => (
                                    <Detail
                                        key={p.id}
                                        label={i === 0 ? 'Original payment' : `Additional payment ${i}`}
                                        value={`${money(p.amount)} · ${p.status}`}
                                    />
                                ))}
                                {!payments.length && <p className="text-sm text-muted">No payment records found.</p>}
                                <div className="border-t border-token pt-2">
                                    <Detail label="Paid" value={money(summary.paidAmount)} />
                                    <Detail label="Outstanding" value={money(outstanding)} />
                                </div>
                            </Section>
                        </div>
                    )
                )}
            </Drawer>
            <Modal
                open={!!pickupTarget}
                onClose={() => setPickupTarget(null)}
                title="Record Pickup"
                description={pickupTarget?.bookingNumber}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setPickupTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            loading={pickupMut.isPending}
                            disabled={!odometer}
                            onClick={() => pickupMut.mutate({ id: pickupTarget.id, value: odometer })}
                        >
                            Confirm Pickup
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Detail label="Bike" value={pickupTarget?.bike?.name} />
                    <Detail label="Registration number" value={pickupTarget?.bike?.registrationNumber} />
                    <Detail
                        label="Last recorded odometer"
                        value={
                            pickupTarget?.bike?.currentOdometer != null
                                ? `${pickupTarget.bike.currentOdometer} km`
                                : 'Not available'
                        }
                    />
                    <div>
                        <label className="block text-sm text-secondary mb-1.5">Pickup odometer</label>
                        <Input
                            type="number"
                            min="0"
                            value={odometer}
                            onChange={(e) => setOdometer(e.target.value)}
                            placeholder="e.g. 1250"
                        />
                    </div>
                    <p className="text-xs text-muted">Confirm the reading from the bike dashboard.</p>
                </div>
            </Modal>
            <Modal
                open={!!returnTarget}
                onClose={() => setReturnTarget(null)}
                title="Record Return"
                description={returnTarget?.bookingNumber}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setReturnTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            loading={returnMut.isPending}
                            disabled={!odometer}
                            onClick={() => returnMut.mutate({ id: returnTarget.id, value: odometer })}
                        >
                            Confirm Return
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Detail label="Bike" value={returnTarget?.bike?.name} />
                    <Detail
                        label="Pickup odometer"
                        value={returnTarget?.pickupOdometer != null ? `${returnTarget.pickupOdometer} km` : 'Not available'}
                    />
                    <div>
                        <label className="block text-sm text-secondary mb-1.5">Return odometer</label>
                        <Input
                            type="number"
                            min="0"
                            value={odometer}
                            onChange={(e) => setOdometer(e.target.value)}
                            placeholder="e.g. 1310"
                        />
                    </div>
                    <p className="text-xs text-muted">
                        Distance and return charges are calculated and saved by the server after confirmation.
                    </p>
                </div>
            </Modal>
            <Modal
                open={!!paymentTarget}
                onClose={() => setPaymentTarget(null)}
                title="Collect Payment"
                description={`Outstanding: ${money(paymentTarget?.paymentSummary?.outstandingAmount)}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setPaymentTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            loading={collectMut.isPending}
                            onClick={() => collectMut.mutate({ id: paymentTarget.id, paymentMethod, reference })}
                        >
                            Mark as Paid
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-secondary mb-1.5">Amount</label>
                        <Input value={money(paymentTarget?.paymentSummary?.outstandingAmount)} disabled />
                    </div>
                    <fieldset>
                        <legend className="mb-2 text-sm text-secondary">Payment method</legend>
                        <div className="flex gap-4 text-sm text-primary-token">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={paymentMethod === 'UPI'}
                                    onChange={() => setPaymentMethod('UPI')}
                                />{' '}
                                UPI
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={paymentMethod === 'CASH'}
                                    onChange={() => setPaymentMethod('CASH')}
                                />{' '}
                                Cash
                            </label>
                        </div>
                    </fieldset>
                    <div>
                        <label className="block text-sm text-secondary mb-1.5">
                            Transaction / Reference <span className="text-muted">(optional)</span>
                        </label>
                        <Input value={reference} onChange={(e) => setReference(e.target.value)} />
                    </div>
                </div>
            </Modal>
            <ConfirmDialog
                open={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                onConfirm={() => cancelMut.mutate(cancelTarget.id)}
                title="Cancel booking?"
                description={`Cancel booking ${cancelTarget?.bookingNumber || ''}?`}
                confirmLabel="Cancel Booking"
                loading={cancelMut.isPending}
            />
        </div>
    )
}