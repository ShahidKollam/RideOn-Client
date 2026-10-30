import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const SAFETY_MESSAGES = [
    {
        title: 'Helmet on.',
        subtitle: 'Ride safe, always.',
    },
    {
        title: 'Avoid overspeeding.',
        subtitle: 'Your safety comes first.',
    },
]

/**
 * RideOn loading indicator.
 *
 * @param {'full' | 'card' | 'inline'} variant
 * @param {string} [message] - Current operation status
 * @param {number|null} [progress] - Optional real progress (0–100)
 * @param {boolean} [complete] - Set true only after API success
 * @param {Function} [onComplete] - Called after 100% is displayed
 */
export default function RideOnLoader({
    variant = 'card',
    message = '',
    progress = null,
    complete = false,
    onComplete,
    className,
}) {
    const id = useId().replace(/:/g, '')
    const isInline = variant === 'inline'

    const [simulatedProgress, setSimulatedProgress] = useState(0)
    const [safetyIndex, setSafetyIndex] = useState(0)
    const completionCalled = useRef(false)

    const hasRealProgress =
        typeof progress === 'number' &&
        Number.isFinite(progress) &&
        progress >= 0 &&
        progress <= 100

    const displayedProgress = complete
        ? 100
        : hasRealProgress
            ? progress
            : simulatedProgress

    const statusText = message || 'Checking availability…'
    const safetyMessage = SAFETY_MESSAGES[safetyIndex]

    // Simulate progress toward 95%, then wait for the API result.
    useEffect(() => {
        if (complete || hasRealProgress) return undefined

        const timer = window.setInterval(() => {
            setSimulatedProgress((current) => {
                if (current >= 95) return 95

                let increment

                if (current < 45) {
                    increment = 2.2
                } else if (current < 65) {
                    increment = 1.2
                } else if (current < 80) {
                    increment = 0.55
                } else if (current < 90) {
                    increment = 0.25
                } else {
                    increment = 0.1
                }

                return Math.min(current + increment, 95)
            })
        }, 120)

        return () => window.clearInterval(timer)
    }, [complete, hasRealProgress])

    // Slide the two-line safety messages from right to left.
    useEffect(() => {
        if (isInline || complete) return undefined

        const timer = window.setInterval(() => {
            setSafetyIndex((current) => (
                current + 1
            ) % SAFETY_MESSAGES.length)
        }, 4200)

        return () => window.clearInterval(timer)
    }, [isInline, complete])

    // On success, reach 100%, display it briefly, then notify the parent.
    useEffect(() => {
        if (!complete || completionCalled.current) return undefined

        setSimulatedProgress(100)

        const timer = window.setTimeout(() => {
            if (completionCalled.current) return

            completionCalled.current = true
            onComplete?.()
        }, 500)

        return () => window.clearTimeout(timer)
    }, [complete, onComplete])

    // Reset the completion guard for the next loading cycle.
    useEffect(() => {
        if (!complete) {
            completionCalled.current = false
        }
    }, [complete])

    // Keep both progress colors visible after the 65% threshold.
    const blueProgress = Math.min(displayedProgress, 65)
    const greenProgress = Math.max(displayedProgress - 65, 0)

    return (
        <div
            className={cn(
                'flex w-full items-center text-center',
                isInline ? 'flex-row gap-3 text-left' : 'flex-col',
                className
            )}
            aria-busy={!complete}
        >
            <style>{`
                @keyframes rideon-needle-${id} {
                    0% {
                        transform: rotate(-76deg);
                    }
                    50% {
                        transform: rotate(8deg);
                    }
                    100% {
                        transform: rotate(-76deg);
                    }
                }

                @keyframes rideon-needle-shine-${id} {
                    from {
                        stroke-dashoffset: 75;
                    }
                    to {
                        stroke-dashoffset: -75;
                    }
                }

                @keyframes rideon-loading-${id} {
                    0% {
                        transform: translateX(-120%);
                    }
                    100% {
                        transform: translateX(340%);
                    }
                }

                @keyframes rideon-safety-slide-${id} {
                    0% {
                        opacity: 0;
                        transform: translateX(24px);
                    }
                    12% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    78% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-24px);
                    }
                }

                .rideon-needle-${id} {
                    transform-box: view-box;
                    transform-origin: 160px 145px;
                    animation: rideon-needle-${id} 6s
                        cubic-bezier(.45, 0, .35, 1) infinite;
                }

                .rideon-needle-shine-${id} {
                    stroke-dasharray: 18 57;
                    animation: rideon-needle-shine-${id} 2.2s
                        linear infinite;
                }

                .rideon-loading-${id} {
                    animation: rideon-loading-${id} 1.7s
                        cubic-bezier(.4, 0, .6, 1) infinite;
                }

                .rideon-safety-slide-${id} {
                    animation: rideon-safety-slide-${id} 4.2s
                        ease-in-out both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .rideon-needle-${id},
                    .rideon-needle-shine-${id},
                    .rideon-loading-${id},
                    .rideon-safety-slide-${id} {
                        animation: none !important;
                    }
                }
            `}</style>

            {!isInline && (
                <div className="mb-1 flex items-center justify-center">
                    <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        <span className="text-rideon-blue">Ride</span>
                        <span className="text-rideon-green">On</span>
                    </span>
                </div>
            )}

            {/* Speedometer */}
            <div
                className={cn(
                    'flex items-center justify-center',
                    isInline
                        ? 'h-12 w-12 shrink-0'
                        : 'mt-1 w-full max-w-[330px] sm:max-w-[350px]'
                )}
                aria-hidden="true"
            >
                <svg
                    viewBox="0 0 320 185"
                    className="h-auto w-full overflow-visible"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Base arc */}
                    <path
                        d="M 37 145 A 123 123 0 0 1 283 145"
                        fill="none"
                        stroke="#E8EDF4"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Green zone: 0–20 */}
                    <path
                        d="M 37 145 A 123 123 0 0 1 75.6 58"
                        fill="none"
                        stroke="#70BF41"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Blue zone: 20–60 */}
                    <path
                        d="M 75.6 58 A 123 123 0 0 1 245 58"
                        fill="none"
                        stroke="#218BFA"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Red zone: above 60 */}
                    <path
                        d="M 245 58 A 123 123 0 0 1 283 145"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Gauge ticks and labels */}
                    {Array.from({ length: 11 }, (_, index) => {
                        const value = index * 10
                        const angle =
                            Math.PI - (value / 100) * Math.PI

                        const major = value % 20 === 0
                        const inner = major ? 102 : 106
                        const outer = 113

                        const x1 = 160 + Math.cos(angle) * inner
                        const y1 = 145 - Math.sin(angle) * inner
                        const x2 = 160 + Math.cos(angle) * outer
                        const y2 = 145 - Math.sin(angle) * outer
                        const labelRadius = 83

                        return (
                            <g key={value}>
                                <line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke={
                                        value > 60
                                            ? '#EF4444'
                                            : value < 20
                                                ? '#70BF41'
                                                : '#218BFA'
                                    }
                                    strokeWidth={major ? 2 : 1.4}
                                    strokeLinecap="round"
                                />

                                {major && (
                                    <text
                                        x={
                                            160 +
                                            Math.cos(angle) * labelRadius
                                        }
                                        y={
                                            145 -
                                            Math.sin(angle) * labelRadius +
                                            4
                                        }
                                        fontSize="12"
                                        fontWeight="600"
                                        fill={
                                            value > 60
                                                ? '#DC2626'
                                                : value < 20
                                                    ? '#4B9631'
                                                    : '#53677D'
                                        }
                                        textAnchor="middle"
                                    >
                                        {value}
                                    </text>
                                )}
                            </g>
                        )
                    })}

                    {/* Navy needle with a continuous, subtle moving shine */}
                    <g className={`rideon-needle-${id}`}>
                        <line
                            x1="160"
                            y1="145"
                            x2="160"
                            y2="62"
                            stroke="#17395B"
                            strokeWidth="7"
                            strokeLinecap="round"
                        />

                        <line
                            x1="160"
                            y1="145"
                            x2="160"
                            y2="62"
                            stroke="#218BFA"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        <line
                            className={`rideon-needle-shine-${id}`}
                            x1="160"
                            y1="137"
                            x2="160"
                            y2="65"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </g>

                    {/* Centre pivot */}
                    <circle
                        cx="160"
                        cy="145"
                        r="10"
                        fill="#17395B"
                    />
                    <circle
                        cx="160"
                        cy="145"
                        r="4"
                        fill="#70BF41"
                    />

                    {/* Loading percentage, not vehicle speed */}
                    <text
                        x="170"
                        y="180"
                        fontSize="20"
                        fontWeight="700"
                        fill="#17395B"
                        textAnchor="middle"
                    >
                        <tspan>{Math.round(displayedProgress)}</tspan>
                        <tspan fill="#218BFA">%</tspan>
                    </text>
                </svg>
            </div>

            {/* Two-line, centered safety message */}
            {!isInline && (
                <div className="mt-1 flex h-[48px] w-full items-center justify-center overflow-hidden">
                    <div
                        key={safetyIndex}
                        className={`rideon-safety-slide-${id} flex w-full flex-col items-center justify-center gap-1 px-2`}
                    >
                        <p className="text-sm font-bold leading-5 text-[#17395B] sm:text-base">
                            {safetyMessage.title}
                        </p>
                        <p className="text-xs font-medium leading-4 text-[#53677D] sm:text-sm">
                            {safetyMessage.subtitle}
                        </p>
                    </div>
                </div>
            )}

            {/* Progress: blue through 65%, green from 65% to 100% */}
            <div
                className={cn(
                    'w-full',
                    isInline
                        ? 'flex flex-1 items-center gap-3'
                        : 'mt-5 max-w-[280px] sm:mt-6'
                )}
            >
                <div
                    className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(displayedProgress)}
                    aria-label="Loading progress"
                >
                    {/* Blue section */}
                    <div
                        className="absolute inset-y-0 left-0 rounded-l-full bg-rideon-blue transition-[width] duration-300 ease-out"
                        style={{
                            width: `${blueProgress}%`,
                        }}
                    />

                    {/* Green section */}
                    {greenProgress > 0 && (
                        <div
                            className="absolute inset-y-0 rounded-r-full bg-rideon-green transition-[width] duration-300 ease-out"
                            style={{
                                left: '65%',
                                width: `${greenProgress}%`,
                            }}
                        />
                    )}

                    {/* Subtle progress sheen */}
                    {!complete && !hasRealProgress && (
                        <div
                            className={`rideon-loading-${id} absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent`}
                        />
                    )}
                </div>
            </div>

            {/* Highlighted request status */}
            <p
                className={cn(
                    'font-semibold text-slate-700',
                    isInline
                        ? 'text-xs'
                        : 'mt-3 text-xs sm:text-sm'
                )}
            >
                {statusText}
            </p>
        </div>
    )
}
