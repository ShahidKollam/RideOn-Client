import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
    CalendarCheck,
    CalendarDays,
    Clock3,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Bike,
    User,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Gauge,
    Lock,
} from 'lucide-react'
import { api } from '../../../lib/api'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Input, Select } from '../../../components/ui/Input'
import { Card } from '../../../components/ui/Card'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../components/ui/Toast'
import { cn } from '../../../utils/cn'

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Deliberately hardcoded from the campus data supplied for this page.
// Keep the campus ID unchanged because it is sent to the existing booking APIs.
const CAMPUSES = [
    {
        id: 'cmr5yu5r70000vhicku98sn2n',
        name: 'NIT Calicut',
        location: 'Kozhikode, Kerala',
    },
]

const toLocalInputValue = (d) => {
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const defaultPickup = () => {
    const d = new Date()
    d.setMinutes(0, 0, 0)
    d.setHours(d.getHours() + 1)
    return toLocalInputValue(d)
}

const defaultReturn = () => {
    const d = new Date()
    d.setMinutes(0, 0, 0)
    d.setHours(d.getHours() + 3)
    return toLocalInputValue(d)
}

const localToISO = (local) => {
    if (!local) return null
    const d = new Date(local)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

const formatSlot = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

function StepPills({ phase }) {
    const items = [
        { key: 'availability', label: 'Availability' },
        { key: 'form', label: 'Guest & Bike' },
        { key: 'confirm', label: 'Confirm' },
    ]
    const order = { availability: 0, form: 1, confirm: 2 }
    const current = order[phase] ?? 0

    return (
        <div className="grid grid-cols-3 items-start gap-2 sm:gap-4">
            {items.map((item, index) => {
                const active = index === current
                const done = index < current

                return (
                    <div key={item.key} className="relative flex min-w-0 flex-col items-center text-center">
                        {index < items.length - 1 && (
                            <div
                                className={cn(
                                    'absolute left-[calc(50%+17px)] top-4 h-0.5 w-[calc(100%-18px)] sm:left-[calc(50%+22px)] sm:w-[calc(100%-24px)]',
                                    done ? 'bg-[var(--color-primary)]' : 'bg-token'
                                )}
                                aria-hidden="true"
                            />
                        )}
                        <div
                            className={cn(
                                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors sm:h-10 sm:w-10 sm:text-sm',
                                active &&
                                    'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md shadow-blue-500/20',
                                done &&
                                    !active &&
                                    'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-primary-token',
                                !active && !done && 'border-token bg-surface text-muted'
                            )}
                        >
                            {done ? <CheckCircle2 size={16} /> : index + 1}
                        </div>
                        <span
                            className={cn(
                                'mt-2 text-[11px] font-medium sm:text-sm',
                                active ? 'text-primary-token' : 'text-muted'
                            )}
                        >
                            {item.label}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

function Field({ label, required, children, hint }) {
    return (
        <div className="min-w-0">
            <label className="mb-1.5 block text-xs font-medium text-secondary">
                {label}
                {required ? <span className="text-danger"> *</span> : null}
            </label>
            {children}
            {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
        </div>
    )
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <span className="text-muted shrink-0">{label}</span>
            <span className="text-right font-medium text-primary-token break-words">{value}</span>
        </div>
    )
}

export default function ReserveRidePage() {
    const navigate = useNavigate()
    const toast = useToast()
    const { hasPermission } = useAuth()
    const canCreate = hasPermission('bookings.create') || hasPermission('*')

    const [campusId, setCampusId] = useState(CAMPUSES[0].id)
    const [pickupLocal, setPickupLocal] = useState(defaultPickup)
    const [returnLocal, setReturnLocal] = useState(defaultReturn)
    const [helmetCount, setHelmetCount] = useState(0)
    const [checking, setChecking] = useState(false)
    const [availability, setAvailability] = useState(null)
    const [selectedSlot, setSelectedSlot] = useState(null)

    const [formOpen, setFormOpen] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [guest, setGuest] = useState({ name: '', email: '', phone: '', notes: '' })
    const [bikes, setBikes] = useState([])
    const [selectedBikeId, setSelectedBikeId] = useState('')
    const [loadingBikes, setLoadingBikes] = useState(false)

    const createMut = useMutation({
        mutationFn: (body) => api.post('/bookings/desk', body),
        onSuccess: (res) => {
            const booking = res?.data || res
            toast.success(`Booking ${booking?.bookingNumber || ''} created`)
            if (booking?.id) navigate(`/bookings/${booking.id}`)
            else navigate('/bookings')
        },
        onError: (e) => toast.error(e.message || 'Failed to create booking'),
    })

    const clearSlotAndForm = () => {
        setAvailability(null)
        setSelectedSlot(null)
        setFormOpen(false)
        setShowConfirm(false)
        setBikes([])
        setSelectedBikeId('')
    }

    const runCheck = async () => {
        if (!campusId) {
            toast.error('Select a campus')
            return
        }
        const pickupAt = localToISO(pickupLocal)
        const returnAt = localToISO(returnLocal)
        if (!pickupAt || !returnAt) {
            toast.error('Invalid pickup or return time')
            return
        }
        if (new Date(returnAt) <= new Date(pickupAt)) {
            toast.error('Return must be after pickup')
            return
        }

        setChecking(true)
        clearSlotAndForm()
        try {
            const res = await api.post('/bookings/check-availability', {
                campusId,
                pickupAt,
                returnAt,
                helmetCount: 0,
            })
            const data = res?.data || res
            setAvailability(data)
            if (data?.available && data?.availableCount > 0) {
                setSelectedSlot({
                    pickupAt,
                    returnAt,
                    availableCount: data.availableCount,
                    isOriginal: true,
                })
            }
        } catch (e) {
            toast.error(e.message || 'Availability check failed')
        } finally {
            setChecking(false)
        }
    }

    // Helmet selection happens after a slot is selected. Recheck the same slot
    // with the chosen helmet count so the displayed price stays in sync.
    const handleHelmetChange = async (nextCount) => {
        if (!selectedSlot) {
            setHelmetCount(nextCount)
            return
        }

        try {
            const res = await api.post('/bookings/check-availability', {
                campusId,
                pickupAt: selectedSlot.pickupAt,
                returnAt: selectedSlot.returnAt,
                helmetCount: nextCount,
            })
            const data = res?.data || res

            if (!data?.available || !(data?.availableCount > 0)) {
                toast.error(data?.reason || 'This slot is not available with that helmet selection')
                return
            }

            setHelmetCount(nextCount)
            setAvailability(data)
            setSelectedSlot((current) =>
                current
                    ? {
                          ...current,
                          availableCount: data.availableCount,
                      }
                    : current
            )
        } catch (e) {
            toast.error(e.message || 'Could not update helmet pricing')
        }
    }

    const loadBikes = async (slot) => {
        setLoadingBikes(true)
        setBikes([])
        setSelectedBikeId('')
        try {
            const res = await api.post('/bookings/available-bikes', {
                campusId,
                pickupAt: slot.pickupAt,
                returnAt: slot.returnAt,
            })
            const data = res?.data || res
            const list = data?.bikes || []
            setBikes(list)
            if (list.length === 1) setSelectedBikeId(list[0].id)
        } catch (e) {
            toast.error(e.message || 'Could not load bikes')
        } finally {
            setLoadingBikes(false)
        }
    }

    const openBookingForm = async () => {
        if (!selectedSlot) {
            toast.error('Select a time slot first')
            return
        }
        setFormOpen(true)
        setShowConfirm(false)
        await loadBikes(selectedSlot)
        requestAnimationFrame(() => {
            document.getElementById('desk-booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    }

    const changeSlot = () => {
        setFormOpen(false)
        setShowConfirm(false)
        setSelectedBikeId('')
        setBikes([])
    }

    const goConfirm = () => {
        if (!guest.name.trim()) {
            toast.error('Guest name is required')
            return
        }
        if (!guest.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) {
            toast.error('Valid guest email is required')
            return
        }
        if (!selectedBikeId) {
            toast.error('Select a bike')
            return
        }
        setShowConfirm(true)
        requestAnimationFrame(() => {
            document.getElementById('desk-booking-confirm')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    }

    const submit = () => {
        if (!canCreate) {
            toast.error('You do not have permission to create bookings')
            return
        }
        const pricingId = availability?.pricing?.id
        if (!pricingId) {
            toast.error('Pricing missing — re-check availability')
            return
        }
        createMut.mutate({
            campusId,
            pricingId,
            pickupAt: selectedSlot.pickupAt,
            returnAt: selectedSlot.returnAt,
            bikeId: selectedBikeId,
            guestName: guest.name.trim(),
            guestEmail: guest.email.trim().toLowerCase(),
            guestPhone: guest.phone.trim() || null,
            helmetCount: Number(helmetCount) || 0,
            notes: guest.notes.trim() || null,
        })
    }

    const selectedBike = bikes.find((b) => b.id === selectedBikeId)
    const phase = showConfirm ? 'confirm' : formOpen ? 'form' : 'availability'

    if (!canCreate) {
        return (
            <div className="mx-auto max-w-lg p-4 sm:p-6">
                <PageHeader title="Reserve a Ride" description="Desk / walk-in booking" />
                <Card className="p-6 text-center">
                    <AlertCircle className="mx-auto mb-3 text-danger" size={28} />
                    <p className="text-sm text-secondary">You need the bookings.create permission.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-5 px-3 pb-24 pt-4 sm:space-y-6 sm:px-6 sm:pb-10 lg:px-8">
            <PageHeader
                title="Reserve a Ride"
                description="Check availability first, then complete the desk booking form"
                actions={
                    <Button variant="secondary" size="sm" onClick={() => navigate('/bookings')}>
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">All Bookings</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                }
            />

            <div className="rounded-2xl border border-token bg-surface/60 p-4 sm:p-5">
                <StepPills phase={phase} />
            </div>

            <Card className="overflow-hidden rounded-2xl border-token shadow-lg shadow-black/10">
                <div className="border-b border-token bg-surface/70 px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                            <CalendarCheck size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-primary-token">Check availability</h2>
                            <p className="text-[11px] text-muted">Campus, pickup and return time</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-4 sm:p-6 lg:p-7">
                    <div className="space-y-5">
                        <Field label="Campus" required>
                            <div className="relative">
                                <MapPin
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
                                    size={18}
                                />
                                <Select
                                    value={campusId}
                                    disabled={formOpen}
                                    onChange={(e) => {
                                        setCampusId(e.target.value)
                                        clearSlotAndForm()
                                    }}
                                    className="h-12 pl-11"
                                >
                                    <option value="">Select campus</option>
                                    {CAMPUSES.map((campus) => (
                                        <option key={campus.id} value={campus.id}>
                                            {campus.name} — {campus.location}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <p className="mt-1.5 text-xs text-muted">Choose the campus where the ride will begin.</p>
                        </Field>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <Field label="Pickup date" required>
                                <div className="relative">
                                    <CalendarDays
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
                                        size={18}
                                    />
                                    <Input
                                        type="date"
                                        value={pickupLocal.slice(0, 10)}
                                        disabled={formOpen}
                                        min={toLocalInputValue(new Date()).slice(0, 10)}
                                        onChange={(e) => {
                                            const date = e.target.value
                                            setPickupLocal((current) => `${date}T${current.slice(11, 16)}`)
                                            clearSlotAndForm()
                                        }}
                                        className="h-12 pl-11"
                                        aria-label="Pickup date"
                                    />
                                </div>
                            </Field>

                            <Field label="Pickup time" required>
                                <div className="relative">
                                    <Clock3
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
                                        size={18}
                                    />
                                    <Input
                                        type="time"
                                        value={pickupLocal.slice(11, 16)}
                                        disabled={formOpen}
                                        onChange={(e) => {
                                            const time = e.target.value
                                            setPickupLocal((current) => `${current.slice(0, 10)}T${time}`)
                                            clearSlotAndForm()
                                        }}
                                        className="h-12 pl-11"
                                        aria-label="Pickup time"
                                    />
                                </div>
                            </Field>

                            <Field label="Return date" required>
                                <div className="relative">
                                    <CalendarDays
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
                                        size={18}
                                    />
                                    <Input
                                        type="date"
                                        value={returnLocal.slice(0, 10)}
                                        disabled={formOpen}
                                        min={pickupLocal.slice(0, 10)}
                                        onChange={(e) => {
                                            const date = e.target.value
                                            setReturnLocal((current) => `${date}T${current.slice(11, 16)}`)
                                            clearSlotAndForm()
                                        }}
                                        className="h-12 pl-11"
                                        aria-label="Return date"
                                    />
                                </div>
                            </Field>

                            <Field label="Return time" required>
                                <div className="relative">
                                    <Clock3
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
                                        size={18}
                                    />
                                    <Input
                                        type="time"
                                        value={returnLocal.slice(11, 16)}
                                        disabled={formOpen}
                                        onChange={(e) => {
                                            const time = e.target.value
                                            setReturnLocal((current) => `${current.slice(0, 10)}T${time}`)
                                            clearSlotAndForm()
                                        }}
                                        className="h-12 pl-11"
                                        aria-label="Return time"
                                    />
                                </div>
                            </Field>
                        </div>
                    </div>

                    {!formOpen && (
                        <Button
                            className="h-12 w-full justify-center text-sm font-semibold shadow-sm sm:text-base"
                            onClick={runCheck}
                            loading={checking}
                            disabled={checking}
                        >
                            {checking ? 'Checking availability…' : 'Check availability'}
                            {!checking && <ChevronRight size={18} />}
                        </Button>
                    )}

                    {formOpen && selectedSlot && (
                        <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 text-sm">
                                <p className="font-medium text-primary-token">
                                    Slot locked · {selectedSlot.availableCount ?? '—'} available
                                </p>
                                <p className="text-xs text-muted">
                                    {formatSlot(selectedSlot.pickupAt)} → {formatSlot(selectedSlot.returnAt)}
                                    {availability?.pricing?.packageName ? ` · ${availability.pricing.packageName}` : ''}
                                </p>
                            </div>
                            <Button type="button" size="sm" variant="secondary" onClick={changeSlot}>
                                Change slot
                            </Button>
                        </div>
                    )}
                </div>

                {!formOpen && availability && (
                    <div className="space-y-3 border-t border-token px-4 py-4 sm:px-5">
                        {availability.available && availability.availableCount > 0 ? (
                            <>
                                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
                                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-primary-token">
                                            {availability.availableCount} bike
                                            {availability.availableCount === 1 ? '' : 's'} available
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {formatSlot(selectedSlot?.pickupAt)} → {formatSlot(selectedSlot?.returnAt)}
                                            {availability.pricing?.packageName
                                                ? ` · ${availability.pricing.packageName}`
                                                : ''}
                                            {availability.totalAmount != null
                                                ? ` · ${money(availability.totalAmount)}`
                                                : ''}
                                        </p>
                                    </div>
                                </div>
                                <Button className="w-full sm:w-auto" onClick={openBookingForm}>
                                    Continue to booking form
                                    <ChevronRight size={16} />
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5">
                                    <AlertCircle className="mt-0.5 shrink-0 text-amber-500" size={18} />
                                    <div>
                                        <p className="text-sm font-semibold text-primary-token">No bikes for this time</p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {availability.reason || 'Choose an alternative slot below.'}
                                        </p>
                                    </div>
                                </div>

                                {(availability.alternatives || []).length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                                            Alternative slots
                                        </p>
                                        {availability.alternatives.map((alt, i) => {
                                            const active =
                                                selectedSlot &&
                                                selectedSlot.pickupAt === alt.pickupAt &&
                                                selectedSlot.returnAt === alt.returnAt
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedSlot({
                                                            pickupAt: alt.pickupAt,
                                                            returnAt: alt.returnAt,
                                                            availableCount: alt.availableCount,
                                                            isOriginal: false,
                                                        })
                                                    }
                                                    className={cn(
                                                        'w-full rounded-xl border p-3.5 text-left transition-colors',
                                                        active
                                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                                                            : 'border-token bg-surface hover:border-[var(--color-primary)]/40'
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-primary-token">
                                                                {formatSlot(alt.pickupAt)} → {formatSlot(alt.returnAt)}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-muted">
                                                                {alt.availableCount} available
                                                            </p>
                                                        </div>
                                                        {active && (
                                                            <CheckCircle2
                                                                size={18}
                                                                className="shrink-0 text-[var(--color-primary)]"
                                                            />
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                        <Button
                                            className="w-full sm:w-auto"
                                            onClick={openBookingForm}
                                            disabled={!selectedSlot}
                                        >
                                            Continue to booking form
                                            <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted">No alternatives found. Try different times.</p>
                                )}
                            </>
                        )}
                    </div>
                )}
            </Card>

            {!formOpen && (
                <Card className="rounded-2xl border-dashed p-4 sm:p-5">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-token bg-surface text-muted">
                            <Lock size={16} />
                        </div>
                        <p className="text-sm font-medium text-primary-token">Booking form locked</p>
                        <p className="max-w-sm text-xs text-muted">
                            Check availability and select a time slot. Guest details and bike selection open only after a
                            slot is available.
                        </p>
                    </div>
                </Card>
            )}

            {formOpen && (
                <div id="desk-booking-form" className="space-y-4">
                    <Card className="overflow-hidden rounded-2xl border-token shadow-lg shadow-black/10">
                        <div className="border-b border-token bg-surface/70 px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                                    <User size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-primary-token">Guest details</h2>
                                    <p className="text-[11px] text-muted">No customer account is created</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
                            <div className="sm:col-span-2">
                                <Field label="Full name" required>
                                    <Input
                                        value={guest.name}
                                        onChange={(e) => setGuest((g) => ({ ...g, name: e.target.value }))}
                                        placeholder="Customer full name"
                                        autoComplete="name"
                                    />
                                </Field>
                            </div>
                            <div className="sm:col-span-2">
                                <Field label="Email" required hint="Confirmation is sent to this address">
                                    <Input
                                        type="email"
                                        value={guest.email}
                                        onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                                        placeholder="guest@email.com"
                                        autoComplete="email"
                                    />
                                </Field>
                            </div>
                            <Field label="Mobile">
                                <Input
                                    type="tel"
                                    value={guest.phone}
                                    onChange={(e) => setGuest((g) => ({ ...g, phone: e.target.value }))}
                                    placeholder="+91 …"
                                    autoComplete="tel"
                                />
                            </Field>
                            <Field label="Helmets">
                                <Select
                                    value={String(helmetCount)}
                                    onChange={(e) => handleHelmetChange(Number(e.target.value))}
                                    disabled={loadingBikes || createMut.isPending}
                                    className="h-11"
                                >
                                    <option value="0">No helmet</option>
                                    <option value="1">1 helmet</option>
                                    <option value="2">2 helmets</option>
                                </Select>
                                <p className="mt-1 text-[11px] text-muted">
                                    Helmet charges are reflected in the booking total.
                                </p>
                            </Field>
                            <div className="sm:col-span-2">
                                <Field label="Notes">
                                    <Input
                                        value={guest.notes}
                                        onChange={(e) => setGuest((g) => ({ ...g, notes: e.target.value }))}
                                        placeholder="Cash collected, ID verified…"
                                    />
                                </Field>
                            </div>
                        </div>
                    </Card>

                    <Card className="overflow-hidden rounded-2xl border-token shadow-lg shadow-black/10">
                        <div className="border-b border-token bg-surface/70 px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                                    <Bike size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-primary-token">Select bike</h2>
                                    <p className="text-[11px] text-muted">Lowest odometer first</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-5">
                            {loadingBikes ? (
                                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                                    <Loader2 className="animate-spin" size={18} />
                                    Loading available bikes…
                                </div>
                            ) : bikes.length === 0 ? (
                                <div className="rounded-xl border border-token bg-surface px-4 py-8 text-center">
                                    <p className="text-sm text-secondary">No bikes free for this slot.</p>
                                    <Button variant="secondary" size="sm" className="mt-3" onClick={changeSlot}>
                                        Change slot
                                    </Button>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {bikes.map((b) => {
                                        const active = selectedBikeId === b.id
                                        return (
                                            <li key={b.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedBikeId(b.id)}
                                                    className={cn(
                                                        'w-full rounded-xl border p-3.5 text-left transition-colors',
                                                        active
                                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                                                            : 'border-token bg-surface hover:border-[var(--color-primary)]/40'
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-primary-token">
                                                                {b.name || 'Bike'}
                                                                {b.bikeNumber ? (
                                                                    <span className="ml-2 font-normal text-muted">
                                                                        #{b.bikeNumber}
                                                                    </span>
                                                                ) : null}
                                                            </p>
                                                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                                                                <Gauge size={12} />
                                                                {Number(b.currentOdometer || 0).toLocaleString('en-IN')} km
                                                                {b.registrationNumber ? ` · ${b.registrationNumber}` : ''}
                                                            </p>
                                                        </div>
                                                        {active && (
                                                            <CheckCircle2
                                                                size={18}
                                                                className="shrink-0 text-[var(--color-primary)]"
                                                            />
                                                        )}
                                                    </div>
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    </Card>

                    {!showConfirm && (
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                            <Button variant="secondary" onClick={changeSlot}>
                                <ChevronLeft size={16} />
                                Change slot
                            </Button>
                            <Button onClick={goConfirm} disabled={loadingBikes || !selectedBikeId}>
                                Review & confirm
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {formOpen && showConfirm && (
                <div id="desk-booking-confirm" className="space-y-4">
                    <Card className="overflow-hidden rounded-2xl border-token shadow-lg shadow-black/10">
                        <div className="border-b border-token bg-surface/70 px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-primary-token">Confirm booking</h2>
                                    <p className="text-[11px] text-muted">Review details before creating</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-token px-4 sm:px-5">
                            <SummaryRow label="Guest" value={guest.name} />
                            <SummaryRow label="Email" value={guest.email} />
                            {guest.phone ? <SummaryRow label="Mobile" value={guest.phone} /> : null}
                            <SummaryRow
                                label="Slot"
                                value={`${formatSlot(selectedSlot?.pickupAt)} → ${formatSlot(selectedSlot?.returnAt)}`}
                            />
                            <SummaryRow
                                label="Bike"
                                value={
                                    selectedBike
                                        ? `${selectedBike.name || 'Bike'}${
                                              selectedBike.bikeNumber ? ` #${selectedBike.bikeNumber}` : ''
                                          }`
                                        : '—'
                                }
                            />
                            <SummaryRow label="Package" value={availability?.pricing?.packageName || '—'} />
                            <SummaryRow label="Helmets" value={String(helmetCount)} />
                            {availability?.baseAmount != null && (
                                <SummaryRow label="Base" value={money(availability.baseAmount)} />
                            )}
                            {availability?.helmetAmount > 0 && (
                                <SummaryRow label="Helmet fee" value={money(availability.helmetAmount)} />
                            )}
                            {availability?.platformFee > 0 && (
                                <SummaryRow label="Platform fee" value={money(availability.platformFee)} />
                            )}
                            {availability?.gstAmount > 0 && (
                                <SummaryRow label="GST" value={money(availability.gstAmount)} />
                            )}
                            {availability?.depositAmount != null && (
                                <SummaryRow label="Deposit" value={money(availability.depositAmount)} />
                            )}
                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm font-semibold text-primary-token">Total</span>
                                <span className="text-base font-bold text-primary-token">
                                    {money(availability?.totalAmount)}
                                </span>
                            </div>
                        </div>
                        <p className="border-t border-token px-4 py-3 text-xs text-muted sm:px-5">
                            Creates a confirmed desk booking (marked paid). Confirmation email goes to the guest.
                            Availability is rechecked on submit.
                        </p>
                    </Card>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                        <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={createMut.isPending}>
                            <ChevronLeft size={16} />
                            Edit form
                        </Button>
                        <Button onClick={submit} loading={createMut.isPending} disabled={createMut.isPending}>
                            {createMut.isPending ? 'Creating…' : 'Confirm booking'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
