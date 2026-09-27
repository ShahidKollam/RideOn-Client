import { Bike, Leaf, IndianRupee, Headphones } from 'lucide-react'

const items = [
    {
        icon: Bike,
        title: 'Simple Campus Rental',
        description: 'Quick and easy booking process.',
        tone: 'blue',
    },
    {
        icon: Leaf,
        title: 'No Ownership Hassle',
        description: 'Enjoy the ride without maintenance worries.',
        tone: 'green',
    },
    {
        icon: IndianRupee,
        title: 'Transparent Fees',
        description: 'Clear pricing with no hidden charges.',
        tone: 'blue',
    },
    {
        icon: Headphones,
        title: 'Dedicated Support',
        description: "We're here to help whenever you need.",
        tone: 'green',
    },
]

const toneClass = {
    blue: 'bg-rideon-blue/10 text-rideon-blue',
    green: 'bg-rideon-green/15 text-rideon-green',
}

export default function HomeWhy() {
    return (
        <section className="bg-slate-50/80 py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-rideon-green sm:text-sm">
                        Why RideOn
                    </p>
                    <h2 className="mt-2 text-[2rem] font-extrabold tracking-tight text-rideon-dark sm:text-[2.5rem] lg:text-[2.75rem] lg:leading-tight">
                        Designed for <span className="text-rideon-green">Students</span>
                    </h2>
                    <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
                        A simple, reliable and student-friendly bike rental service.
                    </p>
                </div>

                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) => (
                        <article
                            key={item.title}
                            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)] sm:p-7"
                        >
                            <span
                                className={`flex size-12 items-center justify-center rounded-2xl ${toneClass[item.tone]}`}
                            >
                                <item.icon className="size-5" strokeWidth={1.9} />
                            </span>
                            <h3 className="mt-5 text-lg font-bold text-rideon-dark">{item.title}</h3>
                            <p className="mt-2 text-[15px] leading-6 text-slate-600">{item.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
