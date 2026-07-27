import { useCallback, useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import BikeCard from '@/components/vehicles/BikeCard'
import { EmptyState, ErrorState, SkeletonCard } from '@/components/ui/PageStates'
import { getApiErrorMessage } from '@/lib/apiClient'
import { getCampuses, getVehicles } from '@/services/vehicleService'

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([])
    const [campuses, setCampuses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({ search: '', campusId: '', isActive: true, status: 'AVAILABLE', page: 1, limit: 9 })
    const [pagination, setPagination] = useState(null)
    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getVehicles(filters)
            setVehicles(data?.bikes || [])
            setPagination(data?.pagination)
        } catch (err) {
            setError(getApiErrorMessage(err, 'We could not load vehicles right now.'))
        } finally {
            setLoading(false)
        }
    }, [filters])
    useEffect(() => {
        load()
    }, [load])
    useEffect(() => {
        getCampuses()
            .then(setCampuses)
            .catch(() => {})
    }, [])
    const update = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }))
    return (
        <div className="bg-slate-50/60 pt-24 pb-12 sm:pt-28">
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-rideon-green">Ride your way</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-rideon-dark sm:text-4xl">
                        Find your campus ride
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                        Choose an available vehicle and make every campus trip simple.
                    </p>
                </div>
                <div className="mt-7 grid gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm md:grid-cols-[1fr_190px_160px]">
                    <label className="flex h-11 items-center gap-2 rounded-xl bg-slate-50 px-3">
                        <Search className="size-4 text-slate-400" />
                        <input
                            value={filters.search}
                            onChange={(e) => update('search', e.target.value)}
                            placeholder="Search by brand or model"
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                    </label>
                    <select
                        value={filters.campusId}
                        onChange={(e) => update('campusId', e.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-rideon-blue"
                    >
                        <option value="">All campuses</option>
                        {campuses.map((campus) => (
                            <option key={campus.id} value={campus.id}>
                                {campus.name}
                            </option>
                        ))}
                    </select>
                    <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-600">
                        <SlidersHorizontal className="size-4" />
                        <select
                            value={filters.status}
                            onChange={(e) => update('status', e.target.value)}
                            className="min-w-0 flex-1 bg-transparent outline-none"
                        >
                            <option value="AVAILABLE">Available now</option>
                            <option value="">Any status</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                    </label>
                </div>
                <div className="mt-8">
                    {loading ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }, (_, i) => (
                                <SkeletonCard key={i} className="h-80" />
                            ))}
                        </div>
                    ) : error ? (
                        <ErrorState message={error} onRetry={load} />
                    ) : vehicles.length ? (
                        <>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {vehicles.map((vehicle) => (
                                    <BikeCard key={vehicle.id} vehicle={vehicle} />
                                ))}
                            </div>
                            {pagination?.totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-3">
                                    <button
                                        disabled={filters.page <= 1}
                                        onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-slate-500">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <button
                                        disabled={filters.page >= pagination.totalPages}
                                        onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                                        className="rounded-lg bg-rideon-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            title="No vehicles found"
                            description="Try changing your search or filters to see more campus rides."
                        />
                    )}
                </div>
            </section>
        </div>
    )
}
