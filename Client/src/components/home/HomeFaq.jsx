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
            const isGreen = index % 2 !== 0

            return (
                <div
                    key={`${item.q}-${index}`}
                    className={cn(
                        'group relative overflow-hidden rounded-[22px] border bg-white transition-all duration-300',
                        open
                            ? isGreen
                                ? 'border-rideon-green/25 shadow-[0_16px_38px_rgba(76,175,80,0.12)]'
                                : 'border-rideon-blue/25 shadow-[0_16px_38px_rgba(29,140,248,0.12)]'
                            : isGreen
                              ? 'border-green-100/80 shadow-[0_8px_24px_rgba(76,175,80,0.06)] hover:-translate-y-0.5 hover:border-green-200 hover:shadow-[0_14px_30px_rgba(76,175,80,0.10)]'
                              : 'border-blue-100/80 shadow-[0_8px_24px_rgba(29,140,248,0.06)] hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_30px_rgba(29,140,248,0.10)]',
                    )}
                >
                    <div
                        aria-hidden="true"
                        className={cn(
                            'pointer-events-none absolute -right-12 -top-12 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300',
                            open && 'opacity-100',
                            isGreen
                                ? 'bg-rideon-green/10'
                                : 'bg-rideon-blue/10',
                        )}
                    />

                    <button
                        type="button"
                        className="relative flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5 sm:py-5"
                        onClick={() =>
                            setOpenIndex(open ? -1 : index)
                        }
                        aria-expanded={open}
                    >
                        <span
                            className={cn(
                                'flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold transition-all duration-300',
                                open
                                    ? isGreen
                                        ? 'bg-rideon-green text-white shadow-[0_6px_14px_rgba(76,175,80,0.22)]'
                                        : 'bg-rideon-blue text-white shadow-[0_6px_14px_rgba(29,140,248,0.22)]'
                                    : isGreen
                                      ? 'bg-green-50 text-rideon-green group-hover:bg-rideon-green group-hover:text-white'
                                      : 'bg-blue-50 text-rideon-blue group-hover:bg-rideon-blue group-hover:text-white',
                            )}
                        >
                            {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="min-w-0 flex-1 pr-2 text-[15px] font-extrabold leading-6 tracking-[-0.01em] text-rideon-dark sm:text-base">
                            {item.q}
                        </span>

                        <span
                            className={cn(
                                'flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                                open
                                    ? isGreen
                                        ? 'border-rideon-green bg-rideon-green text-white'
                                        : 'border-rideon-blue bg-rideon-blue text-white'
                                    : 'border-slate-200 bg-white text-slate-400 group-hover:border-slate-300',
                            )}
                        >
                            <ChevronDown
                                className={cn(
                                    'size-4 transition-transform duration-300',
                                    open && 'rotate-180',
                                )}
                                strokeWidth={2.2}
                            />
                        </span>
                    </button>

                    {open && (
                        <div className="relative px-4 pb-5 sm:px-5 sm:pb-6">
                            <div
                                className={cn(
                                    'ml-[52px] border-l-2 pl-4 sm:pl-5',
                                    isGreen
                                        ? 'border-rideon-green/20'
                                        : 'border-rideon-blue/20',
                                )}
                            >
                                <p className="text-[14px] leading-7 text-slate-500 sm:text-[15px]">
                                    {item.a}
                                </p>
                            </div>
                        </div>
                    )}

                    <div
                        className={cn(
                            'absolute bottom-0 left-6 h-[3px] w-10 rounded-t-full opacity-0 transition-all duration-300',
                            open && 'w-16 opacity-100',
                            isGreen
                                ? 'bg-rideon-green'
                                : 'bg-rideon-blue',
                        )}
                    />
                </div>
            )
        })

    return (
        <section className="relative overflow-hidden bg-[#f8fafc] py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-rideon-green sm:text-xs">
                                FAQ
                            </p>

                            <span className="h-px w-10 bg-rideon-green/40" />
                        </div>

                        <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.06] tracking-[-0.04em] text-rideon-dark sm:text-[2.75rem] lg:text-[3.5rem]">
                            Frequently{' '}
                            <span className="text-rideon-blue">
                                Asked
                            </span>{' '}
                            <span className="text-rideon-green">
                                Questions
                            </span>
                        </h2>

                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                            Everything you need to know about renting a
                            bike with RideOn.
                        </p>
                    </div>

                    <ButtonLink />
                </div>

                <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-2 lg:gap-5">
                    <div className="space-y-4">
                        {renderList(left, 0)}
                    </div>

                    <div className="space-y-4">
                        {renderList(right, mid)}
                    </div>
                </div>
            </div>
        </section>
    )
}

function ButtonLink() {
    return (
        <Link
            to="/faq"
            className="group inline-flex h-11 items-center gap-2 self-start rounded-xl bg-rideon-blue px-5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(29,140,248,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_26px_rgba(29,140,248,0.30)] lg:self-auto"
        >
            View All FAQs

            <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
            />
        </Link>
    )
}