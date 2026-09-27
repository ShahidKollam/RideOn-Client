import { UserPlus, CalendarDays, CreditCard, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
    {
        number: 1,
        icon: UserPlus,
        title: 'Sign Up',
        description: 'Use your NITC email to create an account.',
        badge: 'bg-rideon-blue',
    },
    {
        number: 2,
        icon: CalendarDays,
        title: 'Choose Time',
        description: 'Select your preferred date and time.',
        badge: 'bg-rideon-green',
    },
    {
        number: 3,
        icon: CreditCard,
        title: 'Pay',
        description: 'Complete payment securely online.',
        badge: 'bg-amber-500',
    },
    {
        number: 4,
        icon: Bike,
        title: 'Collect Bike',
        description: 'Pick up your bike from the designated location.',
        badge: 'bg-violet-500',
    },
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="bg-white py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-rideon-green sm:text-sm">
                        How it works
                    </p>
                    <h2 className="mt-2 text-[2rem] font-extrabold tracking-tight text-rideon-dark sm:text-[2.5rem] lg:text-[2.75rem] lg:leading-tight">
                        Rent in <span className="text-rideon-blue">4 Simple</span> <span className="text-rideon-green">Steps</span>
                    </h2>
                    <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
                        Get on the road in minutes. It&apos;s that easy.
                    </p>
                </div>

                <div className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-5">
                    {steps.map((step, i) => (
                        <div key={step.number} className="relative flex">
                            <article className="flex w-full flex-col items-center rounded-2xl border border-slate-100 bg-white px-5 py-7 text-center shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
                                <span
                                    className={cn(
                                        'mb-4 flex size-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm',
                                        step.badge,
                                    )}
                                >
                                    {step.number}
                                </span>
                                <step.icon
                                    className="size-8 text-rideon-dark"
                                    strokeWidth={1.75}
                                />
                                <h3 className="mt-4 text-base font-bold text-rideon-dark sm:text-lg">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {step.description}
                                </p>
                            </article>
                            {/* Arrow between cards — desktop only */}
                            {i < steps.length - 1 && (
                                <div
                                    className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-rideon-blue/50 lg:block"
                                    aria-hidden
                                >
                                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                                        <path
                                            d="M1 7h16M12 1l6 6-6 6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
