import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CalendarCheck, Calendar, Eye, KeyRound, Undo2, CircleX, CreditCard, X, Plus, SlidersHorizontal } from 'lucide-react'
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
const dateTime = (v) => {
    if (!v) return '—'
    return new Date(v).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

const todayYmd = () => {
    const n = new Date()
    const y = n.getFullYear()
    const m = String(n.getMonth() + 1).padStart(2, '0')
    const d = String(n.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}
/** Local calendar day → ISO start (for API `from`) */
const toStartISO = (ymd) => {
    if (!ymd) return null
    const d = new Date(`${ymd}T00:00:00`)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
}
/** Local calendar day → ISO end (for API `to`) */
const toEndISO = (ymd) => {
    if (!ymd) return null
    const d = new Date(`${ymd}T23:59:59.999`)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

const addDaysYmd = (ymd, days) => {
    const d = new Date(`${ymd}T12:00:00`)
    d.setDate(d.getDate() + days)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}
const startOfMonthYmd = () => {
    const n = new Date()
    const y = n.getFullYear()
    const m = String(n.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}-01`
}
const formatDisplayDate = (ymd) => {
    if (!ymd) return ''
    const d = new Date(`${ymd}T12:00:00`)
    if (Number.isNaN(d.getTime())) return ymd
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
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
        [dateFrom, setDateFrom] = useState(''),
        [dateTo, setDateTo] = useState(''),
        [dateMode, setDateMode] = useState('single'), // 'single' | 'range'
        [lateOnly, setLateOnly] = useState(() => searchParams.get('late') === '1'),
        [campusId, setCampusId] = useState('')
    // Advanced filter drawer (draft vs applied — close without Apply does not change results)
    const [filterOpen, setFilterOpen] = useState(false)
    const [draftStatus, setDraftStatus] = useState('')
    const [draftLateOnly, setDraftLateOnly] = useState(false)
    const [draftCampusId, setDraftCampusId] = useState('')
    const [selected, setSelected] = useState(null),
        [pickupTarget, setPickupTarget] = useState(null),
        [returnTarget, setReturnTarget] = useState(null),
        [cancelTarget, setCancelTarget] = useState(null),
        [paymentTarget, setPaymentTarget] = useState(null),
        [odometer, setOdometer] = useState(''),
        [paymentMethod, setPaymentMethod] = useState('UPI'),
        [reference, setReference] = useState('')
    const { data: campusBikesRes } = useQuery({
        queryKey: ['bikes-for-campus-filter'],
        queryFn: () => api.get('/bikes?limit=200&isActive=true'),
        staleTime: 60_000,
    })
    const campusOptions = (() => {
        const rows = campusBikesRes?.data?.bikes || campusBikesRes?.bikes || campusBikesRes?.data || []
        const map = new Map()
        for (const b of Array.isArray(rows) ? rows : []) {
            const id = b.campusId || b.campus?.id
            const name = b.campus?.name || b.campusName
            if (id && !map.has(id)) map.set(id, { id, name: name || id })
        }
        return Array.from(map.values())
    })()

    const advancedFilterCount =
        (statusFilter ? 1 : 0) + (lateOnly ? 1 : 0) + (campusId ? 1 : 0)

    const openFilters = () => {
        setDraftStatus(statusFilter)
        setDraftLateOnly(lateOnly)
        setDraftCampusId(campusId)
        setFilterOpen(true)
    }
    const applyFilters = () => {
        setStatusFilter(draftStatus)
        setLateOnly(draftLateOnly)
        setCampusId(draftCampusId)
        setPage(1)
        setFilterOpen(false)
    }
    const resetAdvancedFilters = () => {
        // Clear advanced only — keep toolbar search + date range
        setDraftStatus('')
        setDraftLateOnly(false)
        setDraftCampusId('')
        setStatusFilter('')
        setLateOnly(false)
        setCampusId('')
        setPage(1)
    }

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['bookings', { page, limit, search, status: statusFilter, lateOnly, dateFrom, dateTo, campusId }],
        queryFn: () => {
            const qs = new URLSearchParams({ page: String(page), limit: String(limit) })
            if (search) qs.set('search', search)
            if (statusFilter) qs.set('status', statusFilter)
            if (lateOnly) qs.set('lateOnly', 'true')
            if (campusId) qs.set('campusId', campusId)
            // Filter by scheduled pickup: single day or inclusive range
            if (dateFrom && dateTo) {
                const start = toStartISO(dateFrom)
                const end = toEndISO(dateTo)
                if (start) qs.set('from', start)
                if (end) qs.set('to', end)
            } else if (dateFrom) {
                const start = toStartISO(dateFrom)
                const end = toEndISO(dateFrom)
                if (start) qs.set('from', start)
                if (end) qs.set('to', end)
            } else if (dateTo) {
                const start = toStartISO(dateTo)
                const end = toEndISO(dateTo)
                if (start) qs.set('from', start)
                if (end) qs.set('to', end)
            }
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
                <div className="min-w-[8rem]">
                    <p className="font-semibold text-primary-token tracking-tight">{r.bookingNumber || '—'}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                        {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                              })
                            : '—'}
                    </p>
                </div>
            ),
        },
        {
            key: 'customer',
            header: 'Customer',
            render: (r) => {
                const name = r.guestName || r.user?.name || '—'
                const phone = r.guestPhone || r.user?.phone
                const contact = phone
                    ? String(phone).startsWith('+')
                        ? phone
                        : `+${phone}`
                    : r.guestEmail || r.user?.email || '—'
                const isDesk = Boolean(r.guestEmail || r.guestName)
                return (
                    <div className="min-w-[9rem] max-w-[14rem]">
                        <p className="text-sm font-medium text-primary-token truncate">{name}</p>
                        <p className="text-[11px] text-muted mt-0.5 truncate">
                            {contact}
                            {isDesk ? ' · Desk' : ''}
                        </p>
                    </div>
                )
            },
        },
        {
            key: 'pickupAt',
            header: 'Pickup',
            render: (r) => (
                <span className="text-sm text-secondary whitespace-nowrap">{dateTime(r.pickupAt)}</span>
            ),
        },
        {
            key: 'returnAt',
            header: 'Return',
            render: (r) => (
                <span className="text-sm text-secondary whitespace-nowrap">{dateTime(r.returnAt)}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (r) => {
                const late =
                    r.isLate ||
                    (r.status === 'ACTIVE' && r.returnAt && new Date() > new Date(r.returnAt)) ||
                    (r.lateDurationMinutes != null && r.lateDurationMinutes > 0)
                return (
                    <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={late && r.status === 'ACTIVE' ? 'LATE_RETURN' : r.status || 'PENDING'} />
                        {late && r.lateDurationMinutes != null && r.lateDurationMinutes > 0 && (
                            <span className="text-[10px] font-medium text-red-500">{r.lateDurationMinutes}m late</span>
                        )}
                    </div>
                )
            },
        },
        {
            key: 'actions',
            header: '',
            cellClassName: 'w-12',
            render: (r) => (
                <div onClick={(e) => e.stopPropagation()}>
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
                                r.status === 'ACTIVE' && {
                                    label: 'Record Return',
                                    icon: Undo2,
                                    onClick: () => returning(r),
                                },
                            hasPermission('bookings.cancel') &&
                                cancellable(r.status) && {
                                    label: 'Cancel',
                                    icon: CircleX,
                                    danger: true,
                                    onClick: () => setCancelTarget(r),
                                },
                        ].filter(Boolean)}
                    />
                </div>
            ),
        },
    ]
    const payments = booking?.payments || [],
        summary = booking?.paymentSummary || {},
        outstanding = Number(summary.outstandingAmount || 0)
    return (
        <div>
            <PageHeader
                title="Bookings"
                description="Manage rentals, pickups and returns"
                actions={
                    hasPermission('bookings.create') || hasPermission('*') ? (
                        <Button onClick={() => navigate('/bookings/reserve')}>
                            <Plus size={16} />
                            Reserve a Ride
                        </Button>
                    ) : null
                }
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                    { label: "Today's list", value: total, hint: 'Filtered total' },
                    { label: 'On page', value: rows.length, hint: 'Current page' },
                    { label: 'Page', value: `${page}/${totalPages}`, hint: 'Pagination' },
                    { label: 'Per page', value: limit, hint: 'Page size' },
                ].map((s) => (
                    <Card key={s.label} className="p-4">
                        <p className="text-xs text-muted">{s.label}</p>
                        <p className="text-lg font-bold text-primary-token">{s.value}</p>
                        {s.hint && <p className="text-[10px] text-muted mt-0.5">{s.hint}</p>}
                    </Card>
                ))}
            </div>
            <Card className="overflow-hidden">
                {/* Main toolbar — compact, one row on desktop */}
                <div className="border-b border-token px-3 py-3 sm:px-4">
                    <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:gap-2">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                setSearch(searchInput.trim())
                                setPage(1)
                            }}
                            className="flex min-w-0 flex-1 gap-2"
                        >
                            <div className="relative min-w-0 flex-1">
                                <Search
                                    size={15}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                                />
                                <Input
                                    className="h-9 pl-9"
                                    placeholder="Search booking ID, customer name, phone, email…"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="h-9 shrink-0">
                                Search
                            </Button>
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex h-9 items-center gap-1 rounded-lg border border-token bg-surface px-2">
                                <Calendar size={14} className="shrink-0 text-[var(--color-primary)]" />
                                <Input
                                    type="date"
                                    className="h-8 w-[8.25rem] border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                                    value={dateFrom}
                                    max={dateTo || undefined}
                                    onChange={(e) => {
                                        setDateFrom(e.target.value)
                                        if (!dateTo) setDateTo(e.target.value)
                                        setDateMode(
                                            e.target.value && dateTo && e.target.value !== dateTo
                                                ? 'range'
                                                : 'single'
                                        )
                                        setPage(1)
                                    }}
                                    title="From date"
                                />
                                <span className="text-xs text-muted">–</span>
                                <Input
                                    type="date"
                                    className="h-8 w-[8.25rem] border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                                    value={dateTo}
                                    min={dateFrom || undefined}
                                    onChange={(e) => {
                                        setDateTo(e.target.value)
                                        if (!dateFrom) setDateFrom(e.target.value)
                                        setDateMode(
                                            dateFrom && e.target.value && dateFrom !== e.target.value
                                                ? 'range'
                                                : 'single'
                                        )
                                        setPage(1)
                                    }}
                                    title="To date"
                                />
                                {(dateFrom || dateTo) && (
                                    <button
                                        type="button"
                                        className="rounded p-1 text-muted hover:bg-[var(--color-primary-soft)] hover:text-primary-token"
                                        title="Clear dates"
                                        onClick={() => {
                                            setDateFrom('')
                                            setDateTo('')
                                            setPage(1)
                                        }}
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="h-9"
                                onClick={() => {
                                    const t = todayYmd()
                                    setDateFrom(t)
                                    setDateTo(t)
                                    setDateMode('single')
                                    setPage(1)
                                }}
                            >
                                Today
                            </Button>

                            <Select
                                value={statusFilter}
                                className="h-9 w-full min-w-[9.5rem] sm:w-40"
                                onChange={(e) => {
                                    setStatusFilter(e.target.value)
                                    setPage(1)
                                }}
                            >
                                <option value="">All statuses</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="ACTIVE">Active (Ongoing)</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="PAYMENT_PENDING">Payment pending</option>
                                <option value="NO_SHOW">No show</option>
                                <option value="FAILED">Failed</option>
                            </Select>

                            <Button
                                type="button"
                                variant="secondary"
                                className="h-9 shrink-0"
                                onClick={openFilters}
                            >
                                <SlidersHorizontal size={15} />
                                Filters
                                {advancedFilterCount > 0 && (
                                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-bold text-white">
                                        {advancedFilterCount}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {(search || statusFilter || lateOnly || campusId || dateFrom || dateTo) && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('')
                                        setSearchInput('')
                                        setPage(1)
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full border border-token bg-surface px-2.5 py-1 text-[11px] text-secondary hover:border-[var(--color-primary)]/40"
                                >
                                    Search: {search}
                                    <X size={12} />
                                </button>
                            )}
                            {(dateFrom || dateTo) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDateFrom('')
                                        setDateTo('')
                                        setPage(1)
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full border border-token bg-surface px-2.5 py-1 text-[11px] text-secondary hover:border-[var(--color-primary)]/40"
                                >
                                    {dateFrom && dateTo && dateFrom === dateTo
                                        ? formatDisplayDate(dateFrom)
                                        : `${formatDisplayDate(dateFrom) || '…'} – ${formatDisplayDate(dateTo) || '…'}`}
                                    <X size={12} />
                                </button>
                            )}
                            {statusFilter && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter('')
                                        setPage(1)
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full border border-token bg-surface px-2.5 py-1 text-[11px] text-secondary hover:border-[var(--color-primary)]/40"
                                >
                                    {statusFilter.replaceAll('_', ' ')}
                                    <X size={12} />
                                </button>
                            )}
                            {lateOnly && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLateOnly(false)
                                        setPage(1)
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full border border-token bg-surface px-2.5 py-1 text-[11px] text-secondary hover:border-[var(--color-primary)]/40"
                                >
                                    Late returns
                                    <X size={12} />
                                </button>
                            )}
                            {campusId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCampusId('')
                                        setPage(1)
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full border border-token bg-surface px-2.5 py-1 text-[11px] text-secondary hover:border-[var(--color-primary)]/40"
                                >
                                    {campusOptions.find((c) => c.id === campusId)?.name || 'Campus'}
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <Drawer
                    open={filterOpen}
                    onClose={() => setFilterOpen(false)}
                    title="Filters"
                    description="Refine your booking results"
                >
                    <div className="space-y-6 p-1">
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                                Booking status
                            </p>
                            <div className="space-y-0.5">
                                {[
                                    { value: '', label: 'All statuses' },
                                    { value: 'CONFIRMED', label: 'Confirmed' },
                                    { value: 'ACTIVE', label: 'Active (Ongoing)' },
                                    { value: 'COMPLETED', label: 'Completed' },
                                    { value: 'CANCELLED', label: 'Cancelled' },
                                    { value: 'PAYMENT_PENDING', label: 'Payment pending' },
                                    { value: 'NO_SHOW', label: 'No show' },
                                    { value: 'FAILED', label: 'Failed' },
                                ].map((opt) => (
                                    <label
                                        key={opt.value || 'all'}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--color-primary-soft)]"
                                    >
                                        <input
                                            type="radio"
                                            name="draftStatus"
                                            className="accent-[var(--color-primary)]"
                                            checked={draftStatus === opt.value}
                                            onChange={() => setDraftStatus(opt.value)}
                                        />
                                        <span className="text-sm text-primary-token">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-token pt-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-primary-token">Late returns only</p>
                                    <p className="mt-0.5 text-xs text-muted">
                                        Show bookings past their return time
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={draftLateOnly}
                                    onClick={() => setDraftLateOnly((v) => !v)}
                                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                                        draftLateOnly ? 'bg-[var(--color-primary)]' : 'bg-token'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                            draftLateOnly ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-token pt-5">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                                Campus / Location
                            </p>
                            <Select value={draftCampusId} onChange={(e) => setDraftCampusId(e.target.value)}>
                                <option value="">All locations</option>
                                {campusOptions.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex gap-2 border-t border-token pt-4">
                            <Button type="button" variant="secondary" className="flex-1" onClick={resetAdvancedFilters}>
                                Reset
                            </Button>
                            <Button type="button" className="flex-1" onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </Drawer>

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
                                <p className="text-sm text-secondary truncate">{r.guestName || r.user?.name || '—'}</p>
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
                            <Section title="Bike" className="order-4">
                                <Detail label="Registration" value={booking.bike?.registrationNumber} />
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