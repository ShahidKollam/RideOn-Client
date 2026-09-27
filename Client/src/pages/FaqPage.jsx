import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import faqData from '@/data/faq.json'

function TitleParts({ parts }) {
    return (
        <>
            {parts.map((part, i) => (
                <span
                    key={i}
                    className={cn(
                        part.tone === 'blue' && 'text-rideon-blue',
                        part.tone === 'green' && 'text-rideon-green',
                        part.tone === 'dark' && 'text-rideon-dark',
                    )}
                >
                    {part.text}
                </span>
            ))}
        </>
    )
}

function FaqItem({ item, open, onToggle }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open}
            >
                <span className="text-sm font-semibold text-rideon-dark sm:text-[15px]">{item.q}</span>
                <ChevronDown
                    className={cn(
                        'size-5 shrink-0 text-slate-400 transition-transform duration-200',
                        open && 'rotate-180 text-rideon-blue',
                    )}
                />
            </button>
            <div
                className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
            >
                <div className="overflow-hidden">
                    <p className="border-t border-slate-100 px-5 pb-4 pt-3 text-sm leading-6 text-slate-500">
                        {item.a}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function FaqPage() {
    useDocumentTitle('FAQ')
    const { page, categories, cta } = faqData
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id)
    const [openKey, setOpenKey] = useState(null)

    const current = categories.find((c) => c.id === activeCategory) || categories[0]

    return (
        <div className="relative overflow-hidden bg-slate-50/50 pt-24 pb-14 sm:pt-28 sm:pb-16">
            <div
                className="pointer-events-none absolute -right-16 top-10 size-72 rounded-full bg-rideon-blue/10 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-20 top-40 size-64 rounded-full bg-rideon-green/10 blur-3xl"
                aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-rideon-green">
                            {page.eyebrow}
                        </p>
                        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
                            <TitleParts parts={page.titleParts} />
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-[15px]">
                            {page.subtitle}
                        </p>
                    </div>

                    <div className="relative mx-auto hidden h-44 w-44 items-center justify-center lg:flex" aria-hidden>
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100/80 to-green-100/50 blur-sm" />
                        <div className="relative flex size-36 items-center justify-center rounded-2xl border border-white bg-white shadow-[0_16px_40px_rgba(29,140,248,0.15)]">
                            <HelpCircle className="size-14 text-rideon-blue" strokeWidth={1.4} />
                            <div className="absolute -bottom-1 -right-1 flex size-11 items-center justify-center rounded-full bg-rideon-green text-white shadow-lg shadow-green-500/25">
                                <MessageCircle className="size-5" strokeWidth={2.2} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category chips + accordion */}
                <div className="mt-10">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    setActiveCategory(cat.id)
                                    setOpenKey(null)
                                }}
                                className={cn(
                                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                                    activeCategory === cat.id
                                        ? 'bg-rideon-blue text-white shadow-sm shadow-rideon-blue/25'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-rideon-blue/30 hover:text-rideon-blue',
                                )}
                            >
                                {cat.title}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 space-y-3">
                        <h2 className="text-lg font-extrabold text-rideon-dark">{current.title}</h2>
                        {current.items.map((item, i) => {
                            const key = `${current.id}-${i}`
                            return (
                                <FaqItem
                                    key={key}
                                    item={item}
                                    open={openKey === key}
                                    onToggle={() => setOpenKey(openKey === key ? null : key)}
                                />
                            )
                        })}
                    </div>
                </div>

                {/* CTA */}
                {cta && (
                    <div className="mt-12 rounded-2xl border border-blue-100 bg-gradient-to-br from-[#f4f8ff] to-white p-6 text-center sm:p-8">
                        <h2 className="text-xl font-extrabold text-rideon-dark sm:text-2xl">{cta.title}</h2>
                        <p className="mt-2 text-sm text-slate-500">{cta.subtitle}</p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <Button variant="outline" className="border-rideon-blue text-rideon-blue" asChild>
                                <Link to={cta.contactTo}>{cta.contactLabel}</Link>
                            </Button>
                            <Button className="bg-rideon-blue text-white" asChild>
                                <Link to={cta.bookTo}>{cta.bookLabel}</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
