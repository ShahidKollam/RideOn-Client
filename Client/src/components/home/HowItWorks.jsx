import {
    UserPlus,
    CalendarDays,
    CreditCard,
    Bike,
    ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
    {
        number: 1,
        icon: UserPlus,
        title: 'Sign Up',
        description: 'Use your NITC email to create an account.',
        badge: 'bg-rideon-blue',
        iconColor: 'text-rideon-blue',
        iconBg: 'bg-blue-50',
        iconRing: 'ring-blue-100',
        cardBorder: 'border-blue-100/80',
        cardBackground:
            'bg-gradient-to-b from-white via-white to-blue-50/55',
        cardShadow:
            'shadow-[0_12px_32px_rgba(37,99,235,0.10)]',
        hoverShadow:
            'hover:shadow-[0_18px_42px_rgba(37,99,235,0.16)]',
    },
    {
        number: 2,
        icon: CalendarDays,
        title: 'Choose Time',
        description: 'Select your preferred date and time.',
        badge: 'bg-rideon-green',
        iconColor: 'text-rideon-green',
        iconBg: 'bg-green-50',
        iconRing: 'ring-green-100',
        cardBorder: 'border-green-100/80',
        cardBackground:
            'bg-gradient-to-b from-white via-white to-green-50/55',
        cardShadow:
            'shadow-[0_12px_32px_rgba(34,197,94,0.09)]',
        hoverShadow:
            'hover:shadow-[0_18px_42px_rgba(34,197,94,0.15)]',
    },
    {
        number: 3,
        icon: CreditCard,
        title: 'Pay',
        description: 'Complete payment securely online.',
        badge: 'bg-amber-500',
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-50',
        iconRing: 'ring-amber-100',
        cardBorder: 'border-amber-100/80',
        cardBackground:
            'bg-gradient-to-b from-white via-white to-amber-50/55',
        cardShadow:
            'shadow-[0_12px_32px_rgba(245,158,11,0.09)]',
        hoverShadow:
            'hover:shadow-[0_18px_42px_rgba(245,158,11,0.15)]',
    },
    {
        number: 4,
        icon: Bike,
        title: 'Collect Bike',
        description: 'Pick up your bike from the designated location.',
        badge: 'bg-violet-500',
        iconColor: 'text-violet-500',
        iconBg: 'bg-violet-50',
        iconRing: 'ring-violet-100',
        cardBorder: 'border-violet-100/80',
        cardBackground:
            'bg-gradient-to-b from-white via-white to-violet-50/55',
        cardShadow:
            'shadow-[0_12px_32px_rgba(139,92,246,0.09)]',
        hoverShadow:
            'hover:shadow-[0_18px_42px_rgba(139,92,246,0.15)]',
    },
]

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="bg-white py-10 sm:py-12 lg:py-16"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* =====================================================
                    SECTION HEADER
                ====================================================== */}

                <div className="max-w-3xl">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-rideon-green sm:text-xs">
                        How it works
                    </p>

                    <h2
                        className="
                            mt-2
                            text-[2rem]
                            font-extrabold
                            leading-[1.08]
                            tracking-[-0.035em]
                            text-rideon-dark
                            sm:text-[2.75rem]
                            lg:text-[3.5rem]
                        "
                    >
                        Rent in{' '}
                        <span className="text-rideon-blue">
                            4 Simple
                        </span>{' '}
                        <span className="text-rideon-green">
                            Steps
                        </span>
                    </h2>

                    <p className="mt-3 text-base leading-7 text-slate-500 sm:text-lg">
                        Get on the road in minutes. It&apos;s that easy.
                    </p>
                </div>

                {/* =====================================================
                    DESKTOP / TABLET VERSION
                ====================================================== */}

                <div
                    className="
                        mt-10
                        hidden
                        gap-5
                        sm:mt-12
                        sm:grid
                        sm:grid-cols-2
                        lg:mt-14
                        lg:grid-cols-4
                        lg:gap-5
                    "
                >
                    {steps.map((step, index) => {
                        const Icon = step.icon

                        return (
                            <div
                                key={step.number}
                                className="relative flex"
                            >
                                <article
                                    className={cn(
                                        `
                                        group
                                        relative
                                        flex
                                        min-h-[300px]
                                        w-full
                                        flex-col
                                        items-center
                                        overflow-hidden
                                        rounded-[24px]
                                        border
                                        px-6
                                        pb-8
                                        pt-7
                                        text-center
                                        transition-all
                                        duration-300
                                        hover:-translate-y-1
                                        `,
                                        step.cardBorder,
                                        step.cardBackground,
                                        step.cardShadow,
                                        step.hoverShadow,
                                    )}
                                >
                                    {/* Number */}

                                    <div
                                        className={cn(
                                            `
                                            absolute
                                            left-5
                                            top-5
                                            flex
                                            size-11
                                            items-center
                                            justify-center
                                            rounded-full
                                            text-sm
                                            font-extrabold
                                            text-white
                                            shadow-[0_6px_14px_rgba(15,23,42,0.12)]
                                            `,
                                            step.badge,
                                        )}
                                    >
                                        {step.number}
                                    </div>

                                    {/* Icon */}

                                    <div
                                        className={cn(
                                            `
                                            mt-8
                                            flex
                                            size-[96px]
                                            items-center
                                            justify-center
                                            rounded-full
                                            ring-8
                                            transition-transform
                                            duration-300
                                            group-hover:scale-[1.04]
                                            `,
                                            step.iconBg,
                                            step.iconRing,
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'size-11',
                                                step.iconColor,
                                            )}
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    {/* Title */}

                                    <h3
                                        className="
                                            mt-7
                                            text-lg
                                            font-extrabold
                                            tracking-tight
                                            text-rideon-dark
                                            sm:text-xl
                                        "
                                    >
                                        {step.title}
                                    </h3>

                                    {/* Description */}

                                    <p
                                        className="
                                            mt-3
                                            max-w-[230px]
                                            text-sm
                                            leading-6
                                            text-slate-500
                                            sm:text-[15px]
                                        "
                                    >
                                        {step.description}
                                    </p>

                                    {/* Bottom color accent */}

                                    <div
                                        className={cn(
                                            `
                                            pointer-events-none
                                            absolute
                                            bottom-0
                                            left-1/2
                                            h-1
                                            w-16
                                            -translate-x-1/2
                                            rounded-t-full
                                            opacity-40
                                            transition-all
                                            duration-300
                                            group-hover:w-24
                                            `,
                                            step.badge,
                                        )}
                                    />
                                </article>

                                {/* Desktop arrow */}

                                {index < steps.length - 1 && (
                                    <div
                                        className="
                                            pointer-events-none
                                            absolute
                                            -right-3
                                            top-1/2
                                            z-20
                                            hidden
                                            -translate-y-1/2
                                            lg:flex
                                        "
                                        aria-hidden="true"
                                    >
                                        <div
                                            className="
                                                flex
                                                size-10
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-slate-100
                                                bg-white
                                                text-rideon-blue
                                                shadow-[0_8px_22px_rgba(15,23,42,0.08)]
                                            "
                                        >
                                            <ArrowRight
                                                className="size-4"
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* =====================================================
                    MOBILE VERSION
                ====================================================== */}

                <div
                    className="
                        mt-7
                        space-y-3
                        sm:hidden
                    "
                >
                    {steps.map((step, index) => {
                        const Icon = step.icon

                        return (
                            <div
                                key={`mobile-${step.number}`}
                                className="relative"
                            >
                                <article
                                    className={cn(
                                        `
                                        group
                                        relative
                                        flex
                                        min-h-[104px]
                                        items-center
                                        gap-4
                                        overflow-hidden
                                        rounded-[20px]
                                        border
                                        px-4
                                        py-4
                                        transition-all
                                        duration-200
                                        active:scale-[0.99]
                                        `,
                                        step.cardBorder,
                                        step.cardBackground,
                                        step.cardShadow,
                                    )}
                                >
                                    {/* Mobile icon */}

                                    <div
                                        className={cn(
                                            `
                                            flex
                                            size-[68px]
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-[18px]
                                            ring-4
                                            `,
                                            step.iconBg,
                                            step.iconRing,
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'size-8',
                                                step.iconColor,
                                            )}
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    {/* Content */}

                                    <div className="min-w-0 flex-1 pr-6">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    `
                                                    flex
                                                    size-6
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    text-[11px]
                                                    font-extrabold
                                                    text-white
                                                    `,
                                                    step.badge,
                                                )}
                                            >
                                                {step.number}
                                            </span>

                                            <h3
                                                className="
                                                    truncate
                                                    text-[15px]
                                                    font-extrabold
                                                    text-rideon-dark
                                                "
                                            >
                                                {step.title}
                                            </h3>
                                        </div>

                                        <p
                                            className="
                                                mt-1.5
                                                text-[13px]
                                                leading-5
                                                text-slate-500
                                            "
                                        >
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Mobile arrow */}

                                    <ArrowRight
                                        className="
                                            absolute
                                            right-4
                                            top-1/2
                                            size-4
                                            -translate-y-1/2
                                            text-slate-300
                                        "
                                        strokeWidth={2.5}
                                    />

                                    {/* Bottom accent */}

                                    <div
                                        className={cn(
                                            `
                                            absolute
                                            bottom-0
                                            left-6
                                            h-[3px]
                                            w-10
                                            rounded-t-full
                                            opacity-50
                                            `,
                                            step.badge,
                                        )}
                                    />
                                </article>

                                {/* Mobile connector */}

                                {index < steps.length - 1 && (
                                    <div
                                        className="
                                            ml-[50px]
                                            h-3
                                            w-px
                                            bg-slate-200
                                        "
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}