import {
    Bike,
    ExternalLink,
    MapPin,
    Maximize2,
    ShieldCheck,
} from 'lucide-react'

import pickupData from '@/data/pickupPoint.json'
import { cn } from '@/lib/utils'

const toneStyles = {
    blue: {
        iconWrap: 'bg-rideon-blue text-white',
    },
    green: {
        iconWrap: 'bg-rideon-green text-white',
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
        <section className="bg-[#f8fafc] py-10 sm:py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-rideon-green">
                            {eyebrow}
                        </p>

                        <span className="h-px w-8 bg-rideon-green/40" />
                    </div>

                    <h2 className="mt-2 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-rideon-dark sm:text-[2.5rem] lg:text-[3rem]">
                        {titleBefore}{' '}
                        <span className="text-rideon-blue">
                            Pickup
                        </span>{' '}
                        <span className="text-rideon-green">
                            Point
                        </span>
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        {subtitle}
                    </p>
                </div>

                {/* Main area */}
                <div className="mt-7 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                    {/* Location card */}
                    <div
                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-[20px]
                            border
                            border-blue-100
                            bg-gradient-to-br
                            from-white
                            to-blue-50/60
                            p-4
                            shadow-[0_10px_28px_rgba(29,140,248,0.07)]
                            sm:p-5
                        "
                    >
                        {/* Compact location visual */}
                        <div className="relative flex h-[125px] items-center justify-center overflow-hidden rounded-[16px] border border-blue-100/70 bg-gradient-to-br from-blue-50 via-sky-50 to-white sm:h-[140px]">
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 opacity-60"
                            >
                                <div className="absolute left-[12%] top-[22%] h-1.5 w-12 rounded-full bg-white" />
                                <div className="absolute right-[14%] top-[35%] h-1.5 w-16 rounded-full bg-white" />
                                <div className="absolute left-[25%] bottom-[24%] h-1.5 w-20 rounded-full bg-white" />
                                <div className="absolute right-[22%] bottom-[18%] h-1.5 w-10 rounded-full bg-white" />
                            </div>

                            <div className="relative z-10 flex size-12 items-center justify-center rounded-[15px] bg-rideon-blue text-white shadow-[0_8px_20px_rgba(29,140,248,0.25)]">
                                <MapPin
                                    className="size-6"
                                    strokeWidth={2}
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="mt-4">
                            <div className="flex items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-rideon-blue">
                                    <MapPin
                                        className="size-3.5"
                                        strokeWidth={2.5}
                                    />
                                </span>

                                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-rideon-blue">
                                    {cardLabel}
                                </p>
                            </div>

                            <h3 className="mt-2 text-lg font-extrabold tracking-tight text-rideon-dark">
                                {cardTitle}
                            </h3>

                            <p className="mt-1 text-sm leading-5 text-slate-500">
                                {cardDescription}
                            </p>

                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    mt-3
                                    inline-flex
                                    h-9
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-blue-100
                                    bg-white
                                    px-3
                                    text-xs
                                    font-bold
                                    text-rideon-dark
                                    shadow-sm
                                    transition
                                    hover:border-rideon-blue/30
                                    hover:bg-blue-50/40
                                    hover:text-rideon-blue
                                "
                            >
                                <GoogleMapsPin className="size-4" />
                                View on Google Maps
                                <ExternalLink className="size-3 text-slate-400" />
                            </a>
                        </div>
                    </div>

                    {/* Map */}
                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-[20px]
                            border
                            border-slate-200
                            bg-slate-100
                            shadow-[0_10px_28px_rgba(15,23,42,0.07)]
                        "
                    >
                        <div className="h-[260px] w-full sm:h-[300px] lg:h-full lg:min-h-[340px]">
                            <iframe
                                title={mapLabel}
                                src={mapsEmbedUrl}
                                className="size-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>

                        <div className="absolute left-3 top-3 z-20 hidden items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-rideon-dark shadow-md backdrop-blur-sm sm:flex">
                            <span className="size-1.5 rounded-full bg-rideon-green" />
                            Pickup Location
                        </div>

                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                absolute
                                right-3
                                top-3
                                z-20
                                flex
                                size-8
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-white/80
                                bg-white/95
                                text-slate-600
                                shadow-md
                                transition
                                hover:text-rideon-blue
                            "
                            aria-label="Open map full screen on Google Maps"
                        >
                            <Maximize2
                                className="size-3.5"
                                strokeWidth={2}
                            />
                        </a>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-4 overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <div className="grid sm:grid-cols-3">
                        {(features || []).map((feature, index) => {
                            const Icon =
                                featureIcons[feature.id] || MapPin

                            const tone =
                                toneStyles[feature.tone] ||
                                toneStyles.blue

                            return (
                                <div
                                    key={feature.id}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-4',
                                        index > 0 &&
                                            'border-t border-slate-100 sm:border-l sm:border-t-0',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex size-9 shrink-0 items-center justify-center rounded-[11px] shadow-sm',
                                            tone.iconWrap,
                                        )}
                                    >
                                        <Icon
                                            className="size-4"
                                            strokeWidth={2}
                                        />
                                    </span>

                                    <div className="min-w-0">
                                        <h3 className="text-xs font-extrabold text-rideon-dark sm:text-sm">
                                            {feature.title}
                                        </h3>

                                        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
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