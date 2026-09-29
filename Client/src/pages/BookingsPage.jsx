import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Bike, CalendarDays, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BookingCard from '@/components/bookings/BookingCard'
import BookingDetailsModal from '@/components/bookings/BookingDetailsModal'
import { EmptyState, ErrorState, SkeletonCard } from '@/components/ui/PageStates'
import { getApiErrorMessage } from '@/lib/apiClient'
import { getBookings } from '@/services/bookingService'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { cn } from '@/lib/utils'

const UPCOMING_STATUSES = new Set(['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE'])
const PAST_STATUSES = new Set(['COMPLETED', 'CANCELLED', 'EXPIRED', 'NO_SHOW'])

function isUpcoming(booking) {
    const status = String(booking?.status || '').toUpperCase()
    if (PAST_STATUSES.has(status)) return false
    if (UPCOMING_STATUSES.has(status)) {
        // If return already passed, treat as past even if status lagging
        if (booking?.returnAt && new Date(booking.returnAt) < new Date()) return false
        return true
    }
    if (booking?.returnAt) return new Date(booking.returnAt) >= new Date()
    return true
}

export default function BookingsPage() {
    useDocumentTitle('My bookings')
    const navigate = useNavigate()
    const { id: routeBookingId } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [tab, setTab] = useState('upcoming')
    const [query, setQuery] = useState('')
    const [selectedId, setSelectedId] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getBookings({})
            setBookings(data?.bookings || [])
        } catch (err) {
            setError(getApiErrorMessage(err, 'We could not load your bookings.'))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    // Deep link: /bookings/:id or ?id=
    useEffect(() => {
        const fromQuery = searchParams.get('id')
        const id = routeBookingId || fromQuery
        if (id) setSelectedId(id)
    }, [routeBookingId, searchParams])

    const openDetails = (booking) => {
        setSelectedId(booking.id)
        if (routeBookingId) {
            navigate('/bookings', { replace: true })
        }
        setSearchParams({}, { replace: true })
    }

    const closeDetails = () => {
        setSelectedId(null)
        if (routeBookingId) navigate('/bookings', { replace: true })
        if (searchParams.get('id')) setSearchParams({}, { replace: true })
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return bookings.filter((b) => {
            const upcoming = isUpcoming(b)
            if (tab === 'upcoming' && !upcoming) return false
            if (tab === 'past' && upcoming) return false
            if (!q) return true
            const hay = [
                b.bookingNumber,
                b.bike?.name,
                b.bike?.bikeNumber,
                b.bike?.registrationNumber,
                b.status,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
            return hay.includes(q)
        })
    }, [bookings, tab, query])

    const upcomingCount = useMemo(() => bookings.filter(isUpcoming).length, [bookings])
    const pastCount = useMemo(() => bookings.length - upcomingCount, [bookings, upcomingCount])

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50/50 pt-24 pb-14 sm:pt-28 sm:pb-16">
            <div
                className="pointer-events-none absolute -right-16 top-10 size-72 rounded-full bg-rideon-blue/10 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-20 top-40 size-64 rounded-full bg-rideon-green/10 blur-3xl"
                aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Hero — matches Terms / Privacy / Cancellation policy layout */}
                <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-rideon-green">
                            Your account
                        </p>
                        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-rideon-dark sm:text-4xl lg:text-[2.75rem]">
                            My <span className="text-rideon-blue">Bookings</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-[15px]">
                            View and manage all your bike rental bookings in one place.
                        </p>
                    </div>

                    <div
                        className="relative ml-auto hidden h-48 w-48 items-center justify-center lg:flex xl:mr-4"
                        aria-hidden
                    >
                        <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-rideon-blue/15 via-blue-100/70 to-rideon-green/15 blur-sm" />
                        <div className="relative flex size-40 items-center justify-center rounded-2xl border border-white/90 bg-white shadow-[0_20px_48px_rgba(29,140,248,0.18)] ring-1 ring-slate-100/80">
                            <CalendarDays className="size-14 text-rideon-blue" strokeWidth={1.4} />
                            <div className="absolute -bottom-1.5 -right-1.5 flex size-12 items-center justify-center rounded-full bg-rideon-green text-white shadow-lg shadow-green-500/30 ring-4 ring-white">
                                <Bike className="size-5" strokeWidth={2.2} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs + search */}
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex rounded-full bg-white p-1 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
                        <button
                            type="button"
                            onClick={() => setTab('upcoming')}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                                tab === 'upcoming'
                                    ? 'bg-rideon-blue text-white shadow-sm'
                                    : 'text-slate-500 hover:text-rideon-dark',
                            )}
                        >
                            Upcoming
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                                    tab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                                )}
                            >
                                {upcomingCount}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('past')}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                                tab === 'past'
                                    ? 'bg-rideon-blue text-white shadow-sm'
                                    : 'text-slate-500 hover:text-rideon-dark',
                            )}
                        >
                            Past
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                                    tab === 'past' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                                )}
                            >
                                {pastCount}
                            </span>
                        </button>
                    </div>

                    <label className="relative block w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search booking ID..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-rideon-dark outline-none transition placeholder:text-slate-400 focus:border-rideon-blue focus:ring-2 focus:ring-rideon-blue/15"
                        />
                    </label>
                </div>

                <div className="mt-6">
                    {loading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3].map((item) => (
                                <SkeletonCard key={item} className="h-36" />
                            ))}
                        </div>
                    ) : error ? (
                        <ErrorState message={error} onRetry={load} />
                    ) : filtered.length ? (
                        <div className="grid gap-4">
                            {filtered.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} onViewDetails={openDetails} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title={query ? 'No matching bookings' : tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
                            description={
                                query
                                    ? 'Try a different booking ID or clear the search.'
                                    : 'Your campus rides will appear here once you reserve one.'
                            }
                            action={
                                !query ? (
                                    <Button className="bg-rideon-blue text-white" asChild>
                                        <Link to="/booking">Book your ride</Link>
                                    </Button>
                                ) : null
                            }
                        />
                    )}
                </div>
            </div>

            <BookingDetailsModal
                open={Boolean(selectedId)}
                bookingId={selectedId}
                onClose={closeDetails}
                onUpdated={() => load()}
            />
        </div>
    )
}
