import {
    GraduationCap,
    IndianRupee,
    HardHat,
    MapPin,
} from 'lucide-react'

const items = [
    {
        icon: GraduationCap,
        title: 'NITC Students',
        description: 'Exclusive for NIT Calicut students',
        tone: 'blue',
    },
    {
        icon: IndianRupee,
        title: 'Clear Pricing',
        description: 'Transparent and affordable rates',
        tone: 'green',
    },
    {
        icon: HardHat,
        title: 'Helmet Available',
        description: 'One free helmet provided',
        tone: 'blue',
    },
    {
        icon: MapPin,
        title: 'Secure Pickup',
        description: 'Designated and safe pickup location',
        tone: 'green',
    },
]

const toneClass = {
    blue: {
        icon:
            'bg-rideon-blue/[0.09] text-rideon-blue ring-rideon-blue/10',
        glow: 'bg-rideon-blue/[0.08]',
    },
    green: {
        icon:
            'bg-rideon-green/[0.10] text-rideon-green ring-rideon-green/10',
        glow: 'bg-rideon-green/[0.08]',
    },
}

export default function HomeTrustBar() {
    return (
        <section
            className="
                relative
                z-30
                -mt-8
                px-4
                sm:-mt-10
                sm:px-6
                lg:-mt-12
                lg:px-8
            "
        >
            <div className="mx-auto max-w-7xl">
                {/* Soft ambient glow behind the card */}
                <div
                    aria-hidden
                    className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-1/2
                        h-20
                        w-[82%]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-rideon-blue/[0.06]
                        blur-3xl
                    "
                />

                {/* Main trust card */}
                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-[22px]
                        border
                        border-slate-200/70
                        bg-white
                        shadow-[0_18px_55px_rgba(15,23,42,0.10)]
                        ring-1
                        ring-white
                        sm:rounded-[24px]
                        lg:rounded-[26px]
                    "
                >
                    {/* Very subtle top highlight */}
                    <div
                        aria-hidden
                        className="
                            pointer-events-none
                            absolute
                            inset-x-0
                            top-0
                            h-px
                            bg-gradient-to-r
                            from-transparent
                            via-rideon-blue/20
                            to-transparent
                        "
                    />

                    <div
                        className="
                            grid
                            grid-cols-2
                            lg:grid-cols-4
                        "
                    >
                        {items.map((item, index) => {
                            const Icon = item.icon
                            const tone = toneClass[item.tone]

                            return (
                                <div
                                    key={item.title}
                                    className="
                                        group
                                        relative
                                        flex
                                        min-h-[94px]
                                        items-center
                                        gap-3.5
                                        px-4
                                        py-4
                                        transition-colors
                                        duration-300
                                        hover:bg-slate-50/60
                                        sm:min-h-[100px]
                                        sm:gap-4
                                        sm:px-5
                                        lg:min-h-[108px]
                                        lg:px-6
                                        xl:px-7
                                    "
                                >
                                    {/* Desktop separator */}
                                    {index > 0 && (
                                        <span
                                            aria-hidden
                                            className="
                                                absolute
                                                left-0
                                                top-1/2
                                                hidden
                                                h-11
                                                w-px
                                                -translate-y-1/2
                                                bg-slate-100
                                                lg:block
                                            "
                                        />
                                    )}

                                    {/* Mobile / tablet separators */}
                                    {index === 1 && (
                                        <span
                                            aria-hidden
                                            className="
                                                absolute
                                                bottom-0
                                                left-4
                                                right-4
                                                h-px
                                                bg-slate-100
                                                lg:hidden
                                            "
                                        />
                                    )}

                                    {index === 2 && (
                                        <span
                                            aria-hidden
                                            className="
                                                absolute
                                                bottom-0
                                                left-4
                                                right-4
                                                h-px
                                                bg-slate-100
                                                lg:hidden
                                            "
                                        />
                                    )}

                                    {/* Icon area */}
                                    <div className="relative shrink-0">
                                        {/* Tiny ambient glow */}
                                        <span
                                            aria-hidden
                                            className={`
                                                pointer-events-none
                                                absolute
                                                inset-0
                                                rounded-[15px]
                                                opacity-0
                                                blur-md
                                                transition-opacity
                                                duration-300
                                                group-hover:opacity-100
                                                ${tone.glow}
                                            `}
                                        />

                                        <span
                                            className={`
                                                relative
                                                flex
                                                size-11
                                                items-center
                                                justify-center
                                                rounded-[14px]
                                                ring-1
                                                transition-all
                                                duration-300
                                                group-hover:-translate-y-0.5
                                                group-hover:shadow-sm
                                                sm:size-12
                                                sm:rounded-[15px]
                                                ${tone.icon}
                                            `}
                                        >
                                            <Icon
                                                className="
                                                    size-[19px]
                                                    sm:size-[21px]
                                                "
                                                strokeWidth={1.85}
                                            />
                                        </span>
                                    </div>

                                    {/* Text */}
                                    <div className="min-w-0">
                                        <p
                                            className="
                                                text-[12px]
                                                font-extrabold
                                                leading-[1.1rem]
                                                tracking-[-0.01em]
                                                text-rideon-dark
                                                sm:text-[13px]
                                                lg:text-[14px]
                                            "
                                        >
                                            {item.title}
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                max-w-[175px]
                                                text-[10px]
                                                leading-[1.05rem]
                                                text-slate-500
                                                sm:text-[11px]
                                                sm:leading-[1.15rem]
                                                lg:text-xs
                                                lg:leading-5
                                            "
                                        >
                                            {item.description}
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