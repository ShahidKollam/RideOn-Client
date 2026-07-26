import { ArrowRight, Gauge, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const statusStyles = { AVAILABLE: 'bg-rideon-green/10 text-rideon-green', MAINTENANCE: 'bg-amber-100 text-amber-700', DISABLED: 'bg-slate-100 text-slate-500' }

export default function BikeCard({ vehicle }) {
    const image = vehicle.imageUrls?.[0]
    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.11)]">
            <div className="relative aspect-[16/10] bg-slate-50">
                {image ? <img src={image} alt={vehicle.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /> : <div className="flex size-full items-center justify-center text-sm font-semibold text-slate-400">RideOn vehicle</div>}
                <span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[vehicle.status] || statusStyles.DISABLED}`}>{vehicle.status === 'AVAILABLE' ? 'Available' : vehicle.status?.replace('_', ' ')}</span>
            </div>
            <div className="p-4 sm:p-5">
                <p className="text-xs font-semibold text-rideon-blue">{vehicle.brand}</p>
                <h2 className="mt-1 text-lg font-extrabold text-rideon-dark">{vehicle.name || `${vehicle.brand} ${vehicle.model}`}</h2>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{vehicle.campus?.name || 'Campus ride'}</span>
                    {vehicle.currentOdometer != null && <span className="inline-flex items-center gap-1"><Gauge className="size-3.5" />{vehicle.currentOdometer.toLocaleString()} km</span>}
                </div>
                <Link to={`/vehicles/${vehicle.id}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-rideon-blue transition-transform hover:translate-x-1">View details <ArrowRight className="size-4" /></Link>
            </div>
        </article>
    )
}
