import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ArrowRight } from 'lucide-react'
import faqData from '@/data/faq.json'
import { cn } from '@/lib/utils'

function flattenFaq(data, limit = 8) {
    const categories = data?.categories || []
    const items = []
    for (const cat of categories) {
        for (const item of cat.items || []) {
            items.push(item)
            if (items.length >= limit) return items
        }
    }
    return items
}

export default function HomeFaq() {
    const items = useMemo(() => flattenFaq(faqData, 8), [])
    const [openIndex, setOpenIndex] = useState(0)

    const mid = Math.ceil(items.length / 2)
    const left = items.slice(0, mid)
    const right = items.slice(mid)

    const renderList = (list, offset) =>
        list.map((item, i) => {
            const index = offset + i
            const open = openIndex === index
            return (
                <div
                    key={`${item.q}-${index}`}
                    className="rounded-xl border border-slate-100 bg-white shadow-sm"
                >
                    <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5 sm:py-[1.15rem]"
                        onClick={() => setOpenIndex(open ? -1 : index)}
                        aria-expanded={open}
                    >
                        <span className="text-[15px] font-semibold text-rideon-dark sm:text-base">
                            <span className="mr-2 text-slate-400">{index + 1}.</span>
                            {item.q}
                        </span>
                        <ChevronDown
                            className={cn(
                                'size-5 shrink-0 text-slate-400 transition-transform',
                                open && 'rotate-180 text-rideon-blue',
                            )}
                        />
                    </button>
                    {open && (
                        <div className="border-t border-slate-50 px-4 pb-4 pt-2 sm:px-5">
                            <p className="text-[15px] leading-7 text-slate-600">{item.a}</p>
                        </div>
                    )}
                </div>
            )
        })

    return (
        <section className="bg-white py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-rideon-green sm:text-sm">
                            FAQ
                        </p>
                        <h2 className="mt-2 text-[2rem] font-extrabold tracking-tight text-rideon-dark sm:text-[2.5rem] lg:text-[2.75rem] lg:leading-tight">
                            Frequently <span className="text-rideon-blue">Asked</span> <span className="text-rideon-green">Questions</span>
                        </h2>
                        <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
                            Everything you need to know about renting a bike with RideOn.
                        </p>
                    </div>
                    <ButtonLink />
                </div>

                <div className="mt-12 grid gap-3 lg:grid-cols-2 lg:gap-4">
                    <div className="space-y-3">{renderList(left, 0)}</div>
                    <div className="space-y-3">{renderList(right, mid)}</div>
                </div>
            </div>
        </section>
    )
}

function ButtonLink() {
    return (
        <Link
            to="/faq"
            className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-rideon-blue px-5 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition hover:bg-rideon-blue/90 hover:shadow-[0_8px_20px_rgba(29,140,248,0.35)]"
        >
            View All FAQs
            <ArrowRight className="size-4" />
        </Link>
    )
}
