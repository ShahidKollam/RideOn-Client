import { Bike, Headphones, IndianRupee, Play, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const highlights = [
    {
        icon: ShieldCheck,
        ring: 'bg-rideon-blue/20 ring-rideon-blue/15',
        inner: 'bg-rideon-blue',
        title: 'Safe & Secure',
        subtitle: 'Verified vehicles',
    },
    {
        icon: IndianRupee,
        ring: 'bg-rideon-green/20 ring-rideon-green/15',
        inner: 'bg-rideon-green',
        title: 'Affordable Pricing',
        subtitle: 'Best rates in town',
    },
    {
        icon: Headphones,
        ring: 'bg-rideon-blue/20 ring-rideon-blue/15',
        inner: 'bg-rideon-blue',
        title: '24/7 Support',
        subtitle: "We're here to help",
    },
]

function HighlightIcon({ item }) {
    return (
        <div
            className={cn(
                'relative flex size-11 shrink-0 items-center justify-center rounded-full ring-[6px] transition-all duration-300 group-hover:scale-105 sm:size-12',
                item.ring,
            )}
        >
            <div className={cn('flex size-8 items-center justify-center rounded-full sm:size-9', item.inner)}>
                <item.icon className="size-4 text-white sm:size-[18px]" strokeWidth={2.25} />
            </div>
        </div>
    )
}

export default function HeroSection() {
    return (
        <section className="relative min-h-[26rem] overflow-hidden bg-white sm:min-h-[28rem] lg:min-h-0">
            {/* Mobile-only fade overlay */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
                style={{
                    background: `
            linear-gradient(
              to right,
              rgba(255,255,255,1) 0%,
              rgba(255,255,255,0.92) 28%,
              rgba(255,255,255,0.45) 52%,
              rgba(255,255,255,0) 70%
            ),
            linear-gradient(
              to left,
              rgba(255,255,255,0.95) 0%,
              rgba(255,255,255,0.55) 8%,
              rgba(255,255,255,0) 18%
            )
          `,
                }}
            />

            {/* Mobile & Tablet Image */}
            <img
                src="/home_bg_img.png"
                alt=""
                aria-hidden
                className={cn(
                    'pointer-events-none absolute z-0 object-contain object-right lg:hidden',
                    'top-14 -right-0 w-[88%] max-w-none',
                    'sm:top-12 sm:-right-4 sm:w-[72%]',
                    'md:top-8 md:w-[65%]',
                )}
                style={{
                    filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.08))',
                }}
            />

            {/* Desktop Image */}
            <div className="absolute -inset-y-45 top-10 right-10 z-0 hidden items-end justify-end lg:flex lg:w-[60%]">
                <img
                    src="/home_bg_img.png"
                    alt=""
                    aria-hidden
                    className={cn(
                        'pointer-events-none object-contain object-right',
                        'lg:h-[108%] lg:w-auto lg:max-w-none',
                        'xl:h-[112%]',
                        '2xl:h-[115%]',
                    )}
                    style={{
                        filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.08))',
                    }}
                />
            </div>

            <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-0 flex-col justify-center py-6 sm:py-8 lg:max-h-[calc(100vh-4.5rem)] lg:py-10 xl:py-12">
                    <div className="max-w-[58%] sm:max-w-[52%] lg:max-w-[32rem] xl:max-w-[36rem]">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rideon-green sm:text-sm">
                            Campus Scooters
                        </p>

                        <h1 className="mt-2 text-[1.85rem] leading-[1.12] font-extrabold tracking-tight text-rideon-dark sm:text-4xl lg:text-[3.5rem] lg:leading-[1.08] xl:text-[3.85rem]">
                            Ride <span className="text-rideon-blue">More,</span>
                            <br />
                            Pay <span className="text-rideon-green">Less!</span>
                        </h1>

                        <p className="mt-3 max-w-[16rem] text-[14px] leading-relaxed text-slate-600 sm:mt-4 sm:max-w-md sm:text-base lg:mt-5 lg:text-[17px]">
                            Rent scooters easily and explore the campus with freedom and style.
                        </p>

                        <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3 lg:mt-7 lg:gap-4">
                            <Button
                                size="lg"
                                className={cn(
                                    'h-10 w-3/4 rounded-lg bg-rideon-blue px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.35)]',
                                    'sm:h-11 sm:w-auto sm:px-6 sm:text-[15px]',
                                    'lg:h-12 lg:px-8',
                                )}
                                asChild
                            >
                                <Link to="/booking">
                                    <Bike className="size-4 sm:size-[18px]" strokeWidth={2.25} />
                                    Book Your Ride
                                </Link>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className={cn(
                                    'h-10 w-3/4 rounded-lg border-2 border-rideon-green bg-white px-5 text-sm font-semibold text-rideon-green transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-green/5 hover:shadow-[0_10px_22px_rgba(0,0,0,0.08)]',
                                    'sm:h-11 sm:w-auto sm:px-6 sm:text-[15px]',
                                    'lg:h-12 lg:px-8',
                                )}
                                asChild
                            >
                                <a href="#how-it-works">
                                    <span className="flex size-[18px] items-center justify-center rounded-full border-2 border-rideon-green sm:size-5">
                                        <Play className="size-2 fill-rideon-green text-rideon-green" strokeWidth={0} />
                                    </span>
                                    How It Works
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div
                        className={cn(
                            'mt-7 rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:mt-8 sm:p-5',
                            'lg:mt-12 lg:max-w-3xl lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none',
                        )}
                    >
                        <div className="grid grid-cols-3 gap-3 sm:gap-5 lg:gap-8">
                            {highlights.map((item) => (
                                <div
                                    key={item.title}
                                    className="group flex flex-col items-center gap-2 text-center transition-all duration-300 hover:-translate-y-1 sm:flex-row sm:items-center sm:gap-3.5 sm:text-left"
                                >
                                    <HighlightIcon item={item} />

                                    <div className="min-w-0">
                                        <p className="text-xs leading-tight font-bold text-rideon-dark sm:text-sm lg:text-[15px]">
                                            {item.title}
                                        </p>
                                        <p className="mt-0.5 text-[10px] leading-tight text-slate-500 sm:text-xs lg:text-[13px]">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
