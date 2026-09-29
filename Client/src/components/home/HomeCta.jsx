import { Link } from 'react-router-dom'
import { ArrowRight, Bike } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomeCta() {
    return (
        <section className="bg-white px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[24px] shadow-[0_18px_44px_rgba(13,71,161,0.20)]">
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/cta-bg-image.png')",
                    }}
                    aria-hidden
                />

                {/* Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(90deg, rgba(5,18,38,0.94) 0%, rgba(7,27,55,0.86) 42%, rgba(9,36,70,0.48) 72%, rgba(9,36,70,0.28) 100%)',
                    }}
                    aria-hidden
                />

                {/* Content */}
                <div className="relative flex min-h-[230px] flex-col items-start justify-center gap-7 px-6 py-9 sm:min-h-[250px] sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-rideon-green" />

                            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-rideon-green sm:text-xs">
                                Ready to ride?
                            </p>
                        </div>

                        <h2 className="mt-3 text-[1.8rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.25rem] lg:text-[2.6rem]">
                            Your ride is just a{' '}
                            <span className="text-rideon-blue">
                                click
                            </span>{' '}<span className="text-rideon-green">
                                away.
                            </span>
                            
                        </h2>

                        <p className="mt-2.5 text-sm leading-6 text-white/75 sm:text-base">
                            Book a bike and hit the road in minutes.
                        </p>
                    </div>

                    <Button
                        className="
                            group
                            h-11
                            shrink-0
                            rounded-xl
                            bg-rideon-blue
                            px-5
                            text-sm
                            font-bold
                            text-white
                            shadow-[0_8px_22px_rgba(29,140,248,0.38)]
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:bg-rideon-blue/90
                            hover:shadow-[0_12px_28px_rgba(29,140,248,0.48)]
                            sm:h-12
                            sm:px-6
                            sm:text-[15px]
                        "
                        asChild
                    >
                        <Link to="/booking">
                            <Bike
                                className="size-4"
                                strokeWidth={2.25}
                            />

                            Book Your Ride

                            <ArrowRight
                                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                                strokeWidth={2.2}
                            />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}