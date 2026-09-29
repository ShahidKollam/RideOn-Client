import {
    Bike,
    Headphones,
    IndianRupee,
    Play,
    ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const highlights = [
    {
        icon: ShieldCheck,
        ring: 'bg-rideon-blue/10 ring-rideon-blue/10',
        inner: 'bg-rideon-blue',
        title: 'Safe & Secure',
        subtitle: 'Verified vehicles',
    },
    {
        icon: IndianRupee,
        ring: 'bg-rideon-green/10 ring-rideon-green/10',
        inner: 'bg-rideon-green',
        title: 'Affordable Pricing',
        subtitle: 'Best rates in town',
    },
    {
        icon: Headphones,
        ring: 'bg-rideon-blue/10 ring-rideon-blue/10',
        inner: 'bg-rideon-blue',
        title: '24/7 Support',
        subtitle: "We're here to help",
    },
]

function HighlightIcon({ item }) {
    return (
        <div
            className={cn(
                'relative flex size-10 shrink-0 items-center justify-center rounded-full ring-[5px] transition-transform duration-300 group-hover:scale-105 sm:size-11',
                item.ring,
            )}
        >
            <div
                className={cn(
                    'flex size-8 items-center justify-center rounded-full sm:size-9',
                    item.inner,
                )}
            >
                <item.icon
                    className="size-4 text-white sm:size-[17px]"
                    strokeWidth={2.15}
                />
            </div>
        </div>
    )
}

export default function HeroSection() {
    return (
        <section
            className="
                rideon-hero-short
                relative
                overflow-hidden
                bg-white
            "
        >
            {/* =========================================================
                BACKGROUND ATMOSPHERE
            ========================================================== */}

            <div
                aria-hidden
                className="
                    pointer-events-none
                    absolute
                    -right-32
                    top-8
                    size-[420px]
                    rounded-full
                    bg-rideon-blue/[0.035]
                    blur-3xl
                    sm:size-[520px]
                    lg:size-[620px]
                "
            />

            <div
                aria-hidden
                className="
                    pointer-events-none
                    absolute
                    -left-40
                    bottom-0
                    size-[300px]
                    rounded-full
                    bg-rideon-green/[0.025]
                    blur-3xl
                "
            />

            {/* =========================================================
                MOBILE / TABLET VEHICLE IMAGE

                Separate from desktop so mobile remains clean and
                app-like.
            ========================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    right-[-8%]
                    top-[4.5rem]
                    z-0
                    w-[82%]
                    sm:right-[-3%]
                    sm:top-14
                    sm:w-[67%]
                    md:right-[-2%]
                    md:w-[61%]
                    lg:hidden
                "
            >
                {/* Soft blue atmosphere */}
                <div
                    className="
                        absolute
                        left-[20%]
                        top-[18%]
                        size-[230px]
                        rounded-full
                        bg-rideon-blue/[0.055]
                        blur-[2px]
                        sm:size-[340px]
                    "
                    aria-hidden
                />

                {/* Soft green atmosphere */}
                <div
                    className="
                        absolute
                        bottom-[12%]
                        left-[15%]
                        size-28
                        rounded-full
                        bg-rideon-green/[0.045]
                        blur-3xl
                    "
                    aria-hidden
                />

                <img
                    src="/home_bg_img.png"
                    alt=""
                    aria-hidden
                    className="
                        relative
                        z-10
                        h-auto
                        w-full
                        object-contain
                        object-right
                    "
                    style={{
                        filter:
                            'drop-shadow(0 20px 34px rgba(15,23,42,0.09))',
                    }}
                />
            </div>

            {/* =========================================================
                MOBILE IMAGE READABILITY OVERLAY
            ========================================================== */}

            <div
                aria-hidden
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-[1]
                    lg:hidden
                "
                style={{
                    background: `
                        linear-gradient(
                            to right,
                            rgba(255,255,255,1) 0%,
                            rgba(255,255,255,0.96) 27%,
                            rgba(255,255,255,0.76) 43%,
                            rgba(255,255,255,0.22) 68%,
                            rgba(255,255,255,0) 100%
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(255,255,255,0) 55%,
                            rgba(255,255,255,0.92) 82%,
                            rgba(255,255,255,1) 100%
                        )
                    `,
                }}
            />

            {/* =========================================================
                DESKTOP VEHICLE IMAGE
            ========================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    right-0
                    top-0
                    z-0
                    hidden
                    h-full
                    w-[59%]
                    items-center
                    justify-end
                    lg:flex
                    xl:w-[60%]
                "
            >
                {/* Main blue atmosphere */}
                <div
                    className="
                        absolute
                        right-[8%]
                        top-[11%]
                        size-[470px]
                        rounded-full
                        bg-rideon-blue/[0.045]
                        blur-[2px]
                        xl:size-[540px]
                        2xl:size-[600px]
                    "
                    aria-hidden
                />

                {/* Green secondary atmosphere */}
                <div
                    className="
                        absolute
                        bottom-[16%]
                        right-[29%]
                        size-40
                        rounded-full
                        bg-rideon-green/[0.045]
                        blur-3xl
                    "
                    aria-hidden
                />

                <img
                    src="/home_bg_img.png"
                    alt=""
                    aria-hidden
                    className="
                        rideon-hero-image
                        relative
                        z-10
                        h-[105%]
                        w-auto
                        max-w-none
                        object-contain
                        object-right
                        xl:h-[110%]
                        2xl:h-[114%]
                    "
                    style={{
                        filter:
                            'drop-shadow(0 22px 42px rgba(15,23,42,0.09))',
                    }}
                />
            </div>

            {/* =========================================================
                MAIN CONTENT
            ========================================================== */}

            <div
                className="
                    relative
                    z-[2]
                    mx-auto
                    max-w-7xl
                    px-4
                    sm:px-6
                    lg:px-8
                "
            >
                <div
className="
    rideon-hero-inner
    relative
    flex
    min-h-[560px]
    flex-col
    justify-center
    py-8
    sm:min-h-[590px]
    sm:py-10
    lg:min-h-[620px]
    lg:max-h-[700px]
    lg:py-12
    xl:min-h-[640px]
"
                >
                    {/* =================================================
                        HERO COPY
                    ================================================== */}

                    <div
                        className="
                            rideon-hero-content
                            max-w-[18rem]
                            sm:max-w-[31rem]
                            lg:max-w-[35rem]
                            xl:max-w-[37rem]
                        "
                    >
                        {/* Eyebrow */}
                        <div className="flex items-center gap-3">
                            <p
                                className="
                                    text-[11px]
                                    font-extrabold
                                    uppercase
                                    tracking-[0.24em]
                                    text-rideon-green
                                    sm:text-xs
                                "
                            >
                                Campus scooters
                            </p>

                            <span
                                className="
                                    hidden
                                    h-px
                                    w-9
                                    bg-rideon-green/60
                                    sm:block
                                "
                                aria-hidden
                            />
                        </div>

                        {/* Heading */}
                        <h1
                            className="
                                mt-3
                                text-[2.5rem]
                                font-extrabold
                                leading-[1.03]
                                tracking-[-0.045em]
                                text-rideon-dark
                                sm:mt-4
                                sm:text-[3.5rem]
                                lg:text-[3.8rem]
                                xl:text-[4.15rem]
                                xl:leading-[1.02]
                            "
                        >
                            Ride{' '}
                            <span className="text-rideon-blue">
                                More,
                            </span>
                            <br />
                            Pay{' '}
                            <span className="text-rideon-green">
                                Less!
                            </span>
                        </h1>

                        {/* Description */}
                        <p
                            className="
                                mt-4
                                max-w-[17rem]
                                text-[14px]
                                leading-6
                                text-slate-500
                                sm:mt-5
                                sm:max-w-md
                                sm:text-base
                                sm:leading-7
                                lg:text-[17px]
                                lg:leading-7
                            "
                        >
                            Rent scooters easily and explore the campus
                            with freedom and style.
                        </p>

                        {/* =================================================
                            CTA BUTTONS
                        ================================================== */}

                        <div
                            className="
                                mt-6
                                flex
                                flex-col
                                gap-2.5
                                sm:mt-7
                                sm:flex-row
                                sm:flex-wrap
                                sm:gap-3
                                lg:mt-8
                            "
                        >
                            <Button
                                size="lg"
                                className="
                                    h-11
                                    w-full
                                    rounded-xl
                                    bg-rideon-blue
                                    px-6
                                    text-sm
                                    font-bold
                                    text-white
                                    shadow-[0_8px_22px_rgba(29,140,248,0.25)]
                                    transition-all
                                    duration-300
                                    hover:-translate-y-0.5
                                    hover:bg-rideon-blue/90
                                    hover:shadow-[0_12px_30px_rgba(29,140,248,0.34)]
                                    active:scale-[0.98]
                                    sm:h-12
                                    sm:w-auto
                                    sm:px-7
                                    sm:text-[15px]
                                "
                                asChild
                            >
                                <Link to="/booking">
                                    <Bike
                                        className="size-[17px]"
                                        strokeWidth={2.2}
                                    />
                                    Book Your Ride
                                </Link>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="
                                    h-11
                                    w-full
                                    rounded-xl
                                    border
                                    border-rideon-green/70
                                    bg-white/90
                                    px-6
                                    text-sm
                                    font-bold
                                    text-rideon-green
                                    shadow-[0_4px_18px_rgba(76,175,80,0.06)]
                                    backdrop-blur-sm
                                    transition-all
                                    duration-300
                                    hover:-translate-y-0.5
                                    hover:border-rideon-green
                                    hover:bg-rideon-green/[0.04]
                                    hover:shadow-[0_10px_24px_rgba(76,175,80,0.10)]
                                    active:scale-[0.98]
                                    sm:h-12
                                    sm:w-auto
                                    sm:px-7
                                    sm:text-[15px]
                                "
                                asChild
                            >
                                <a href="#how-it-works">
                                    <span
                                        className="
                                            flex
                                            size-5
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            border-rideon-green
                                        "
                                    >
                                        <Play
                                            className="ml-[1px] size-2.5 fill-rideon-green text-rideon-green"
                                            strokeWidth={0}
                                        />
                                    </span>

                                    How It Works
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* =================================================
                        FEATURE HIGHLIGHTS
                    ================================================== */}

                    <div
                        className="
                            rideon-hero-highlights
                            mt-8
                            w-full
                            max-w-[34rem]
                            rounded-2xl
                            border
                            border-slate-100
                            bg-white/95
                            p-3.5
                            shadow-[0_10px_32px_rgba(15,23,42,0.07)]
                            backdrop-blur-sm
                            sm:mt-9
                            sm:p-4
                            lg:mt-12
                            lg:max-w-[700px]
                            lg:border-0
                            lg:bg-transparent
                            lg:p-0
                            lg:shadow-none
                            lg:backdrop-blur-0
                        "
                    >
                        <div
                            className="
                                grid
                                grid-cols-3
                                divide-x
                                divide-slate-100
                                lg:gap-8
                                lg:divide-x-0
                            "
                        >
                            {highlights.map((item) => (
                                <div
                                    key={item.title}
                                    className="
                                        group
                                        flex
                                        flex-col
                                        items-center
                                        gap-2
                                        px-2
                                        text-center
                                        transition-transform
                                        duration-300
                                        hover:-translate-y-0.5
                                        sm:flex-row
                                        sm:items-center
                                        sm:gap-3
                                        sm:px-2
                                        sm:text-left
                                        lg:px-0
                                    "
                                >
                                    <HighlightIcon item={item} />

                                    <div className="min-w-0">
                                        <p
                                            className="
                                                text-[10px]
                                                font-extrabold
                                                leading-4
                                                text-rideon-dark
                                                sm:text-xs
                                                lg:text-[14px]
                                            "
                                        >
                                            {item.title}
                                        </p>

                                        <p
                                            className="
                                                mt-0.5
                                                hidden
                                                text-[11px]
                                                leading-4
                                                text-slate-500
                                                sm:block
                                                lg:text-xs
                                            "
                                        >
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================================
                BOTTOM FADE
            ========================================================== */}

            <div
                aria-hidden
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    bottom-0
                    z-[1]
                    h-16
                    bg-gradient-to-t
                    from-white
                    to-transparent
                "
            />
        </section>
    )
}