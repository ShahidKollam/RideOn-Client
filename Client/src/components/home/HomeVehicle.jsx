import {
    Fuel,
    Gauge,
    MapPin,
    Settings2,
    ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const points = [
    {
        icon: Gauge,
        title: '124cc Engine',
        description: 'Smooth and reliable performance.',
        color: 'blue',
    },
    {
        icon: Fuel,
        title: '55+ kmpl Mileage',
        description: 'Go further for less.',
        color: 'green',
    },
    {
        icon: Settings2,
        title: 'Comfortable Ride',
        description: 'Perfect for daily campus commute.',
        color: 'amber',
    },
    {
        icon: MapPin,
        title: 'Ideal for City Rides',
        description: 'Easy to handle in campus and city traffic.',
        color: 'violet',
    },
]

const colorStyles = {
    blue: {
        icon:
            'bg-rideon-blue/10 text-rideon-blue ring-rideon-blue/10',
        border:
            'border-rideon-blue/10 hover:border-rideon-blue/20',
    },
    green: {
        icon:
            'bg-rideon-green/10 text-rideon-green ring-rideon-green/10',
        border:
            'border-rideon-green/10 hover:border-rideon-green/20',
    },
    amber: {
        icon:
            'bg-amber-50 text-amber-500 ring-amber-100',
        border:
            'border-amber-100/70 hover:border-amber-200',
    },
    violet: {
        icon:
            'bg-violet-50 text-violet-500 ring-violet-100',
        border:
            'border-violet-100/70 hover:border-violet-200',
    },
}

export default function HomeVehicle() {
    return (
        <section
            id="vehicle"
            className="
                relative
                overflow-hidden
                bg-white
                py-14
                sm:py-20
                lg:py-24
            "
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* =====================================================
                    MAIN VEHICLE LAYOUT
                ====================================================== */}
                <div
                    className="
                        grid
                        items-center
                        gap-8
                        lg:grid-cols-[0.92fr_1.08fr]
                        lg:gap-10
                        xl:gap-14
                    "
                >

                    {/* =================================================
                        LEFT CONTENT
                    ================================================== */}
                    <div className="relative z-10">

                        {/* Section label */}
                        <div className="flex items-center gap-4">
                            <p
                                className="
                                    text-[11px]
                                    font-extrabold
                                    uppercase
                                    tracking-[0.25em]
                                    text-rideon-green
                                    sm:text-xs
                                "
                            >
                                Our vehicle
                            </p>

                            <span
                                className="
                                    hidden
                                    h-px
                                    w-14
                                    bg-rideon-green/50
                                    sm:block
                                "
                                aria-hidden="true"
                            />
                        </div>

                        {/* Heading */}
                        <h2
                            className="
                                mt-3
                                text-[2.25rem]
                                font-extrabold
                                leading-[1.04]
                                tracking-[-0.04em]
                                text-rideon-dark
                                sm:text-[2.75rem]
                                lg:text-[3.5rem]
                                xl:text-[3.75rem]
                            "
                        >
                            Honda{' '}
                            <span className="text-rideon-blue">
                                Act
                            </span>
                            <span className="text-rideon-green">
                                iva
                            </span>
                        </h2>

                        {/* Description */}
                        <p
                            className="
                                mt-4
                                max-w-xl
                                text-[15px]
                                leading-7
                                text-slate-500
                                sm:text-lg
                                sm:leading-8
                            "
                        >
                            A trusted, comfortable and fuel-efficient
                            scooter, perfect for your campus rides.
                        </p>

                        {/* =================================================
                            MOBILE VEHICLE PREVIEW
                            Visible only on mobile
                        ================================================== */}
                        <div
                            className="
                                relative
                                -mx-1
                                mt-7
                                flex
                                min-h-[230px]
                                items-center
                                justify-center
                                overflow-hidden
                                sm:hidden
                            "
                        >
                            {/* Soft blue atmosphere */}
                            <div
                                className="
                                    absolute
                                    left-1/2
                                    top-1/2
                                    size-[220px]
                                    -translate-x-1/2
                                    -translate-y-1/2
                                    rounded-full
                                    bg-rideon-blue/[0.065]
                                    blur-[2px]
                                "
                                aria-hidden="true"
                            />

                            {/* Soft green secondary glow */}
                            <div
                                className="
                                    absolute
                                    bottom-5
                                    left-[18%]
                                    size-24
                                    rounded-full
                                    bg-rideon-green/[0.06]
                                    blur-3xl
                                "
                                aria-hidden="true"
                            />

                            {/* Subtle blue ring */}
                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-[9%]
                                    top-[20%]
                                    size-[130px]
                                    rounded-full
                                    border-[7px]
                                    border-rideon-blue/[0.08]
                                "
                                aria-hidden="true"
                            />

                            {/* Scooter glow */}
                            <div
                                className="
                                    absolute
                                    bottom-[18%]
                                    left-1/2
                                    z-[1]
                                    h-10
                                    w-[70%]
                                    -translate-x-1/2
                                    rounded-full
                                    bg-rideon-blue/10
                                    blur-2xl
                                "
                                aria-hidden="true"
                            />

                            {/* Scooter */}
                            <img
                                src="/honda-activa-tp.png"
                                alt="Honda Activa scooter"
                                className="
                                    relative
                                    z-10
                                    w-[82%]
                                    max-w-[350px]
                                    object-contain
                                    drop-shadow-[0_18px_18px_rgba(15,23,42,0.16)]
                                "
                                loading="lazy"
                            />
                        </div>

                        {/* =================================================
                            FEATURE GRID
                        ================================================== */}
                        <div
                            className="
                                mt-7
                                grid
                                grid-cols-2
                                gap-3
                                sm:mt-8
                                sm:gap-4
                            "
                        >
                            {points.map(
                                ({
                                    icon: Icon,
                                    title,
                                    description,
                                    color,
                                }) => {
                                    const styles =
                                        colorStyles[color]

                                    return (
                                        <div
                                            key={title}
                                            className={`
                                                group
                                                flex
                                                min-h-[96px]
                                                items-center
                                                gap-3
                                                rounded-2xl
                                                border
                                                bg-white
                                                px-3
                                                py-4
                                                transition-all
                                                duration-300
                                                hover:-translate-y-0.5
                                                hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]
                                                sm:min-h-[108px]
                                                sm:gap-3.5
                                                sm:px-4
                                                sm:py-4
                                                ${styles.border}
                                            `}
                                        >
                                            {/* Icon */}
                                            <div
                                                className={`
                                                    flex
                                                    size-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    ring-4
                                                    transition-transform
                                                    duration-300
                                                    group-hover:scale-105
                                                    sm:size-11
                                                    ${styles.icon}
                                                `}
                                            >
                                                <Icon
                                                    className="size-[18px] sm:size-5"
                                                    strokeWidth={1.9}
                                                />
                                            </div>

                                            {/* Text */}
                                            <div className="min-w-0">
                                                <h3
                                                    className="
                                                        text-[12px]
                                                        font-extrabold
                                                        leading-4
                                                        text-rideon-dark
                                                        sm:text-[15px]
                                                        sm:leading-5
                                                    "
                                                >
                                                    {title}
                                                </h3>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-[10px]
                                                        leading-4
                                                        text-slate-500
                                                        sm:text-[13px]
                                                        sm:leading-5
                                                    "
                                                >
                                                    {description}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                },
                            )}
                        </div>

                        {/* =================================================
                            CTA
                        ================================================== */}
                        <div className="mt-7 sm:mt-9">
                            <Button
                                className="
                                    h-12
                                    rounded-xl
                                    bg-rideon-blue
                                    px-6
                                    text-[14px]
                                    font-bold
                                    text-white
                                    shadow-[0_8px_22px_rgba(29,140,248,0.24)]
                                    transition-all
                                    hover:bg-rideon-blue/90
                                    hover:shadow-[0_12px_28px_rgba(29,140,248,0.30)]
                                    active:scale-[0.98]
                                    sm:h-[52px]
                                    sm:px-7
                                    sm:text-[15px]
                                "
                                asChild
                            >
                                <Link to="/vehicles">
                                    View Vehicle Details
                                    <ArrowRight
                                        className="ml-1 size-4"
                                        strokeWidth={2.2}
                                    />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* =================================================
                        DESKTOP VEHICLE VISUAL

                        Hidden on mobile because mobile gets its own
                        app-style vehicle presentation above.
                    ================================================== */}
                    <div
                        className="
                            relative
                            hidden
                            min-h-[430px]
                            items-center
                            justify-center
                            sm:flex
                            lg:min-h-[500px]
                        "
                    >
                        {/* Large soft atmospheric glow */}
                        <div
                            className="
                                absolute
                                right-[-2%]
                                top-[5%]
                                size-[420px]
                                rounded-full
                                bg-rideon-blue/[0.055]
                                blur-[2px]
                                lg:size-[500px]
                            "
                            aria-hidden="true"
                        />

                        {/* Secondary green atmosphere */}
                        <div
                            className="
                                absolute
                                bottom-[7%]
                                left-[18%]
                                size-40
                                rounded-full
                                bg-rideon-green/[0.055]
                                blur-3xl
                                lg:size-48
                            "
                            aria-hidden="true"
                        />

                        {/* Soft inner glow */}
                        <div
                            className="
                                absolute
                                right-[13%]
                                top-[18%]
                                size-[300px]
                                rounded-full
                                bg-white/70
                                blur-3xl
                                lg:size-[380px]
                            "
                            aria-hidden="true"
                        />

                        {/* Subtle blue arcs */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                left-[4%]
                                top-[17%]
                                hidden
                                h-[220px]
                                w-[115px]
                                rounded-l-full
                                border-l-[9px]
                                border-t-[9px]
                                border-rideon-blue/10
                                rotate-[-20deg]
                                lg:block
                            "
                            aria-hidden="true"
                        />

                        <div
                            className="
                                pointer-events-none
                                absolute
                                left-[7%]
                                top-[27%]
                                hidden
                                h-[160px]
                                w-[80px]
                                rounded-l-full
                                border-l-[7px]
                                border-t-[7px]
                                border-rideon-blue/16
                                rotate-[-20deg]
                                lg:block
                            "
                            aria-hidden="true"
                        />

                        {/* -------------------------------------------------
                            Realistic scooter presentation
                        -------------------------------------------------- */}
                        <div
                            className="
                                relative
                                z-10
                                w-full
                                max-w-[560px]
                                lg:max-w-[600px]
                                xl:max-w-[625px]
                            "
                        >
                            {/* Bright sticker-like ambient glow */}
                            <div
                                className="
                                    absolute
                                    inset-[12%]
                                    rounded-full
                                    bg-rideon-blue/10
                                    blur-[45px]
                                "
                                aria-hidden="true"
                            />

                            {/* Green edge glow */}
                            <div
                                className="
                                    absolute
                                    bottom-[13%]
                                    left-[18%]
                                    h-16
                                    w-[58%]
                                    rounded-full
                                    bg-rideon-green/10
                                    blur-3xl
                                "
                                aria-hidden="true"
                            />

                            <img
                                src="/honda-activa-tp.png"
                                alt="Honda Activa scooter"
                                className="
                                    relative
                                    z-10
                                    mx-auto
                                    block
                                    h-auto
                                    w-[91%]
                                    object-contain
                                    drop-shadow-[0_22px_20px_rgba(15,23,42,0.16)]
                                    transition-transform
                                    duration-500
                                    hover:scale-[1.012]
                                "
                                loading="lazy"
                            />
                        </div>

                        {/* Realistic ground reflection/shadow */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                bottom-[5%]
                                left-1/2
                                z-[1]
                                h-7
                                w-[62%]
                                -translate-x-1/2
                                rounded-[50%]
                                bg-slate-900/[0.10]
                                blur-2xl
                            "
                            aria-hidden="true"
                        />

                        {/* Small blue light underneath scooter */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                bottom-[8%]
                                left-1/2
                                z-[2]
                                h-3
                                w-[45%]
                                -translate-x-1/2
                                rounded-full
                                bg-rideon-blue/10
                                blur-lg
                            "
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}