import { Link } from 'react-router-dom'
import { ArrowRight, Bike } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomeCta() {
    return (
        <section className="bg-white px-4 pb-16 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(13,71,161,0.28)]">
                {/* Background image — rider on road */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/bg-croped-bike-2.png')" }}
                    aria-hidden
                />
                {/* Dark overlay: strong on left for text, softer on right for image */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(90deg, rgba(6,18,40,0.96) 0%, rgba(8,28,58,0.9) 38%, rgba(10,35,70,0.55) 62%, rgba(12,40,80,0.35) 100%)',
                    }}
                    aria-hidden
                />

                <div className="relative flex flex-col items-start justify-between gap-8 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:px-12">
                    <div className="max-w-xl">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rideon-green sm:text-sm">
                            Ready to ride?
                        </p>
                        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-[2.25rem] lg:leading-tight">
                            Your next adventure is just a{' '}
                            <span className="text-rideon-blue">click</span> away.
                        </h2>
                        <p className="mt-2.5 text-sm leading-6 text-white/80 sm:text-base">
                            Book a bike and hit the road in minutes.
                        </p>
                    </div>

                    <Button
                        className="h-12 shrink-0 rounded-xl bg-rideon-blue px-7 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(29,140,248,0.4)] hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.5)]"
                        asChild
                    >
                        <Link to="/booking">
                            <Bike className="size-4" strokeWidth={2.25} />
                            Book Your Ride
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
