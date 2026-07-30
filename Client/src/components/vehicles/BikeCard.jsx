import { Bike, CalendarDays, Gauge, IndianRupee, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const statusStyles = {
    AVAILABLE: 'bg-rideon-green/10 text-rideon-green',
    MAINTENANCE: 'bg-amber-100 text-amber-700',
    DISABLED: 'bg-slate-100 text-slate-500',
}

export default function BikeCard({ vehicle }) {
    const image = vehicle.imageUrls?.[0]
    const isAvailable = vehicle.status === 'AVAILABLE'
    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-rideon-blue/25 hover:shadow-[0_18px_38px_rgba(15,23,42,0.12)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/50">
                {image ? (
                    <img
                        src={image}
                        alt={vehicle.name}
                        className="size-full object-contain p-3 transition-transform duration-500 group-hover:scale-105 sm:p-4"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 text-sm font-semibold text-slate-400">
                        <Bike className="size-9 text-rideon-blue/35" />
                        RideOn vehicle
                    </div>
                )}
                <span
                    className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-extrabold shadow-sm ${statusStyles[vehicle.status] || statusStyles.DISABLED}`}
                >
                    {vehicle.status === 'AVAILABLE' ? 'Available' : vehicle.status?.replace('_', ' ')}
                </span>
            </div>
            <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-rideon-blue">{vehicle.brand}</p>
                        <h2 className="mt-1 truncate text-lg font-extrabold tracking-tight text-rideon-dark">
                            {vehicle.name || `${vehicle.brand} ${vehicle.model}`}
                        </h2>
                    </div>
                    {vehicle.year && <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-400">{vehicle.year}</span>}
                </div>
                <div className="mt-4 flex min-h-9 flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-slate-400" />
                        {vehicle.campus?.name || 'Campus ride'}
                    </span>
                    {vehicle.currentOdometer != null && (
                        <span className="inline-flex items-center gap-1.5">
                            <Gauge className="size-3.5 text-slate-400" />
                            {vehicle.currentOdometer.toLocaleString()} km
                        </span>
                    )}
                </div>
                <div className="mt-4 flex items-end gap-1 border-t border-slate-100 pt-4">
                    {typeof vehicle.hourlyRate === 'number' ? (
                        <><span className="text-xl font-extrabold text-rideon-blue">₹{vehicle.hourlyRate}</span><span className="pb-0.5 text-xs font-medium text-slate-400">/ hour</span></>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-rideon-blue"><IndianRupee className="size-4" />Pricing at booking</span>
                    )}
                </div>
                {isAvailable ? (
                    <Link
                        to={`/booking/${vehicle.id}`}
                        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-rideon-blue px-4 text-sm font-bold text-white shadow-[0_6px_16px_rgba(29,140,248,0.24)] transition-all hover:bg-rideon-blue/90 hover:shadow-[0_10px_22px_rgba(29,140,248,0.3)] active:scale-[0.98]"
                    >
                        <CalendarDays className="size-4" />Book this bike
                    </Link>
                ) : (
                    <span className="mt-5 flex h-11 w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-100 px-4 text-sm font-bold text-slate-400">Currently unavailable</span>
                )}
            </div>
        </article>
    )
}
