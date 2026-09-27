import { GraduationCap, IndianRupee, HardHat, MapPin } from 'lucide-react'

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
    blue: 'bg-rideon-blue/10 text-rideon-blue',
    green: 'bg-rideon-green/15 text-rideon-green',
}

export default function HomeTrustBar() {
    return (
        <section className="relative z-10 -mt-2 px-4 sm:-mt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-rideon-blue/10 bg-gradient-to-br from-white via-[#f4f9ff] to-white p-4 shadow-[0_12px_40px_rgba(22,135,245,0.08)] sm:gap-0 sm:p-3 lg:grid-cols-4">
                    {items.map((item, i) => (
                        <div
                            key={item.title}
                            className={`flex items-center gap-3.5 rounded-xl px-3 py-4 sm:px-5 ${i > 0 ? 'sm:border-l sm:border-slate-100' : ''}`}
                        >
                            <span
                                className={`flex size-12 shrink-0 items-center justify-center rounded-full sm:size-[3.25rem] ${toneClass[item.tone]}`}
                            >
                                <item.icon className="size-5 sm:size-6" strokeWidth={1.85} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[15px] font-bold text-rideon-dark sm:text-base">
                                    {item.title}
                                </p>
                                <p className="mt-0.5 text-xs leading-5 text-slate-600 sm:text-[13px]">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
