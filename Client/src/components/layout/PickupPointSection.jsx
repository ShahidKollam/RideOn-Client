import { Bike, ExternalLink, MapPin, Maximize2, ShieldCheck } from 'lucide-react'

import pickupData from '@/data/pickupPoint.json'
import { cn } from '@/lib/utils'

const toneStyles = {
    blue: {
        iconWrap: 'bg-blue-50 text-rideon-blue',
    },
    green: {
        iconWrap: 'bg-green-50 text-rideon-green',
    },
}

const featureIcons = {
    secure: ShieldCheck,
    easy: MapPin,
    quick: Bike,
}

function GoogleMapsPin({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
            <path
                fill="#4285F4"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            />
            <circle cx="12" cy="9" r="2.5" fill="#fff" />
        </svg>
    )
}

export default function PickupPointSection() {
    const {
        eyebrow,
        titleBefore,
        titleHighlight,
        subtitle,
        cardLabel,
        cardTitle,
        cardDescription,
        mapLabel,
        mapsUrl,
        mapsEmbedUrl,
        features,
    } = pickupData

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-[#f4f8ff]/50 to-white py-10 sm:py-12">
            <div
                className="pointer-events-none absolute -right-20 top-8 size-64 rounded-full bg-rideon-blue/10 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-16 bottom-4 size-56 rounded-full bg-rideon-green/10 blur-3xl"
                aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6">
                    {/* Header + map grid */}
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-rideon-green">
                                {eyebrow}
                            </p>
                            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-rideon-dark sm:text-4xl">
                                {titleBefore}{' '}
                                <span className="text-rideon-blue">{titleHighlight}</span>
                            </h2>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-[15px]">
                                {subtitle}
                            </p>

                            {/* Info card */}
                            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                                <div
                                    className="relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-sky-100 sm:h-32 sm:w-36"
                                    aria-hidden
                                >
                                    <div className="absolute inset-0 opacity-40">
                                        <div className="absolute left-3 top-4 h-2 w-10 rounded bg-white/80" />
                                        <div className="absolute right-4 top-8 h-2 w-8 rounded bg-white/70" />
                                        <div className="absolute bottom-6 left-5 h-2 w-12 rounded bg-white/75" />
                                    </div>
                                    <MapPin
                                        className="relative z-10 size-14 text-rideon-blue drop-shadow-md"
                                        strokeWidth={1.5}
                                        fill="currentColor"
                                        fillOpacity={0.15}
                                    />
                                    <span className="absolute right-4 top-5 size-2 rounded-full bg-rideon-green/80" />
                                    <span className="absolute right-6 top-8 size-1.5 rounded-full bg-rideon-green/60" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rideon-blue">
                                        <MapPin className="size-3.5" strokeWidth={2.5} />
                                        {cardLabel}
                                    </p>
                                    <h3 className="mt-1 text-lg font-extrabold text-rideon-dark">
                                        {cardTitle}
                                    </h3>
                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        {cardDescription}
                                    </p>
                                    <a
                                        href={mapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl border border-rideon-blue/30 bg-white px-3.5 text-sm font-semibold text-rideon-dark transition hover:border-rideon-blue hover:bg-rideon-blue/5 hover:text-rideon-blue"
                                    >
                                        <GoogleMapsPin className="size-5 shrink-0" />
                                        View on Google Maps
                                        <ExternalLink className="size-3.5 text-slate-400" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Map embed */}
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
                            <div className="aspect-[4/3] w-full sm:aspect-[5/4] lg:aspect-auto lg:min-h-[280px] lg:h-full">
                                <iframe
                                    title={mapLabel}
                                    src={mapsEmbedUrl}
                                    className="size-full min-h-[220px] border-0 lg:min-h-[280px]"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                />
                            </div>
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-rideon-blue/40 hover:text-rideon-blue"
                                aria-label="Open map full screen on Google Maps"
                            >
                                <Maximize2 className="size-4" strokeWidth={2} />
                            </a>
                        </div>
                    </div>

                    {/* Feature row */}
                    <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3 sm:gap-0">
                        {(features || []).map((feature, index) => {
                            const Icon = featureIcons[feature.id] || MapPin
                            const tone = toneStyles[feature.tone] || toneStyles.blue
                            return (
                                <div
                                    key={feature.id}
                                    className={cn(
                                        'flex gap-3 sm:px-5',
                                        index > 0 && 'sm:border-l sm:border-slate-100',
                                        index === 0 && 'sm:pl-0',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex size-11 shrink-0 items-center justify-center rounded-full',
                                            tone.iconWrap,
                                        )}
                                    >
                                        <Icon className="size-5" strokeWidth={1.9} />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-rideon-dark">{feature.title}</h3>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
