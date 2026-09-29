import {
    Bike,
    Leaf,
    IndianRupee,
    Headphones,
    ArrowUpRight,
} from 'lucide-react'

const items = [
    {
        icon: Bike,
        title: 'Simple Campus Rental',
        description: 'Quick and easy booking process.',
        tone: 'blue',
        number: '01',
    },
    {
        icon: Leaf,
        title: 'No Ownership Hassle',
        description: 'Enjoy the ride without maintenance worries.',
        tone: 'green',
        number: '02',
    },
    {
        icon: IndianRupee,
        title: 'Transparent Fees',
        description: 'Clear pricing with no hidden charges.',
        tone: 'blue',
        number: '03',
    },
    {
        icon: Headphones,
        title: 'Dedicated Support',
        description: "We're here to help whenever you need.",
        tone: 'green',
        number: '04',
    },
]

const toneStyles = {
    blue: {
        icon: 'bg-rideon-blue text-white ring-rideon-blue/10',
        iconHover:
            'group-hover:bg-blue-50 group-hover:text-rideon-blue',
        number: 'text-rideon-blue',
        accent: 'bg-rideon-blue',
        border: 'hover:border-blue-300',
        shadow:
            'hover:shadow-[0_22px_48px_rgba(29,140,248,0.16)]',
        glow: 'bg-rideon-blue/[0.045]',
    },
    green: {
        icon: 'bg-rideon-green text-white ring-rideon-green/10',
        iconHover:
            'group-hover:bg-green-50 group-hover:text-rideon-green',
        number: 'text-rideon-green',
        accent: 'bg-rideon-green',
        border: 'hover:border-green-300',
        shadow:
            'hover:shadow-[0_22px_48px_rgba(76,175,80,0.16)]',
        glow: 'bg-rideon-green/[0.045]',
    },
}

export default function HomeWhy() {
    return (
        <section className="relative overflow-hidden bg-[#f8fafc] py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">

                        <div className="flex items-center gap-3">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-rideon-green sm:text-xs">
                                Why RideOn
                            </p>

                            <span className="h-px w-10 bg-rideon-green/40" />
                        </div>

                        <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.06] tracking-[-0.04em] text-rideon-dark sm:text-[2.75rem] lg:text-[3.5rem]">
                            Designed{' '}
                            <span className="text-rideon-blue">
                                for
                            </span>{' '}
                            <span className="text-rideon-green">
                                Students
                            </span>
                        </h2>

                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                            A simple, reliable and student-friendly bike rental service.
                        </p>
                    </div>

                    {/* Desktop supporting label */}
                    <div className="hidden lg:block">
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                            <span className="size-2 rounded-full bg-rideon-green" />

                            <span className="text-xs font-semibold text-slate-500">
                                Built for campus life
                            </span>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    BENEFIT CARDS
                ====================================================== */}
                <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                    {items.map((item) => {
                        const Icon = item.icon
                        const tone = toneStyles[item.tone]

                        return (
                            <article
                                key={item.title}
                                className={`
                                    group
                                    relative
                                    min-h-[235px]
                                    overflow-hidden
                                    rounded-[24px]
                                    border
                                    p-6
                                    transition-all
                                    duration-300
                                    sm:p-7

                                    ${
                                        item.tone === 'blue'
                                            ? `
                                                border-blue-200/70
                                                bg-gradient-to-br
                                                from-white
                                                via-white
                                                to-blue-50/70
                                                shadow-[0_16px_38px_rgba(29,140,248,0.10)]
                                            `
                                            : `
                                                border-green-200/70
                                                bg-gradient-to-br
                                                from-white
                                                via-white
                                                to-green-50/70
                                                shadow-[0_16px_38px_rgba(76,175,80,0.10)]
                                            `
                                    }

                                    hover:-translate-y-1

                                    ${tone.border}

                                    ${tone.shadow}
                                `}
                            >
                                {/* =================================================
                                    SOFT CORNER GLOW
                                ================================================== */}
                                <div
                                    aria-hidden="true"
                                    className={`
                                        pointer-events-none
                                        absolute
                                        -right-16
                                        -top-16
                                        size-40
                                        rounded-full
                                        blur-3xl
                                        opacity-100
                                        transition-transform
                                        duration-500
                                        group-hover:scale-110
                                        ${tone.glow}
                                    `}
                                />

                                {/* =================================================
                                    TOP ROW
                                ================================================== */}
                                <div className="relative flex items-start justify-between">

                                    {/* Icon */}
                                    <div
                                        className={`
                                            flex
                                            size-[58px]
                                            items-center
                                            justify-center
                                            rounded-[18px]
                                            ring-1
                                            ring-inset
                                            transition-all
                                            duration-300
                                            ${tone.icon}
                                            ${tone.iconHover}
                                            group-hover:scale-105
                                        `}
                                    >
                                        <Icon
                                            className="size-6"
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    {/* Number */}
                                    <span
                                        className={`
                                            text-[11px]
                                            font-extrabold
                                            tracking-[0.18em]
                                            opacity-70
                                            ${tone.number}
                                        `}
                                    >
                                        {item.number}
                                    </span>
                                </div>

                                {/* =================================================
                                    CONTENT
                                ================================================== */}
                                <div className="relative mt-7">
                                    <h3 className="text-[17px] font-extrabold leading-6 tracking-[-0.015em] text-rideon-dark sm:text-lg">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2.5 max-w-[250px] text-sm leading-6 text-slate-500 sm:text-[15px]">
                                        {item.description}
                                    </p>
                                </div>

                                {/* =================================================
                                    ARROW
                                ================================================== */}
                                <div
                                    className={`
                                        absolute
                                        bottom-6
                                        right-6
                                        flex
                                        size-8
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        bg-white
                                        transition-all
                                        duration-300

                                        ${
                                            item.tone === 'blue'
                                                ? `
                                                    border-blue-100
                                                    text-rideon-blue
                                                    group-hover:border-rideon-blue
                                                    group-hover:bg-rideon-blue
                                                `
                                                : `
                                                    border-green-100
                                                    text-rideon-green
                                                    group-hover:border-rideon-green
                                                    group-hover:bg-rideon-green
                                                `
                                        }

                                        group-hover:text-white
                                    `}
                                >
                                    <ArrowUpRight
                                        className="size-4"
                                        strokeWidth={2}
                                    />
                                </div>

                                {/* =================================================
                                    BOTTOM BRAND LINE
                                ================================================== */}
                                <div
                                    aria-hidden="true"
                                    className={`
                                        absolute
                                        bottom-0
                                        left-7
                                        h-[3px]
                                        w-14
                                        rounded-t-full
                                        opacity-80
                                        transition-all
                                        duration-300
                                        group-hover:w-20
                                        group-hover:opacity-100
                                        ${tone.accent}
                                    `}
                                />
                            </article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}