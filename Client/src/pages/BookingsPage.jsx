import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import BookingCard from '@/components/bookings/BookingCard'
import { EmptyState, ErrorState, SkeletonCard } from '@/components/ui/PageStates'
import { getApiErrorMessage } from '@/lib/apiClient'
import { getBookings } from '@/services/bookingService'

export default function BookingsPage() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [status, setStatus] = useState('')
    const load = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getBookings({ status: status || undefined })
            setBookings(data?.bookings || [])
        } catch (err) {
            setError(getApiErrorMessage(err, 'We could not load your bookings.'))
        } finally {
            setLoading(false)
        }
    }, [status])
    useEffect(() => {
        load()
    }, [load])
    return (
        <div className="bg-slate-50/60 pt-24 pb-12 sm:pt-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[.16em] text-rideon-green">Your account</p>
                        <h1 className="mt-2 text-3xl font-extrabold text-rideon-dark">My bookings</h1>
                    </div>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-rideon-blue"
                    >
                        <option value="">All bookings</option>
                        <option value="PAYMENT_PENDING">Payment pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div className="mt-7">
                    {loading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3].map((item) => (
                                <SkeletonCard key={item} className="h-40" />
                            ))}
                        </div>
                    ) : error ? (
                        <ErrorState message={error} onRetry={load} />
                    ) : bookings.length ? (
                        <div className="grid gap-4">
                            {bookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No bookings yet"
                            description="Your campus rides will appear here once you reserve one."
                            action={
                                <Button className="bg-rideon-blue text-white" asChild>
                                    <Link to="/booking">Book your ride</Link>
                                </Button>
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
