import { useEffect, useState } from 'react'
import { Lock, Shield } from 'lucide-react'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { cn } from '@/lib/utils'
import privacyData from '@/data/privacy.json'

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

function SectionBody({ section }) {
    return (
        <div className="space-y-3 text-sm leading-6 text-slate-600">
            {(section.paragraphs || []).map((p, i) => (
                <p key={`p-${i}`}>{p}</p>
            ))}
            {section.list?.length > 0 && (
                <ul className="list-disc space-y-1.5 pl-5">
                    {section.list.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}
            {(section.paragraphsAfter || []).map((p, i) => (
                <p key={`pa-${i}`}>{p}</p>
            ))}
            {section.contact && (
                <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                    <p className="font-bold text-rideon-dark">{section.contact.company}</p>
                    <p className="mt-1">{section.contact.address}</p>
                    <p className="mt-2">
                        <span className="font-medium text-slate-700">Email:</span>{' '}
                        <a href={`mailto:${section.contact.email}`} className="text-rideon-blue hover:underline">
                            {section.contact.email}
                        </a>
                    </p>
                    <p>
                        <span className="font-medium text-slate-700">Phone:</span>{' '}
                        <a href={`tel:${section.contact.phone.replace(/\s/g, '')}`} className="text-rideon-blue hover:underline">
                            {section.contact.phone}
                        </a>
                    </p>
                </div>
            )}
        </div>
    )
}

export default function PrivacyPage() {
    useDocumentTitle('Privacy Policy')
    const { page, intro, sections } = privacyData
    const [activeId, setActiveId] = useState(sections[0]?.id)

    useEffect(() => {
        const observers = []
        const opts = { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
        sections.forEach((s) => {
            const el = document.getElementById(s.id)
            if (!el) return
            const obs = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) setActiveId(s.id)
            }, opts)
            obs.observe(el)
            observers.push(obs)
        })
        return () => observers.forEach((o) => o.disconnect())
    }, [sections])

    const scrollTo = (id) => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="relative overflow-hidden bg-slate-50/50 pt-24 pb-14 sm:pt-28 sm:pb-16">
            <div
                className="pointer-events-none absolute -right-16 top-10 size-72 rounded-full bg-rideon-blue/10 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-20 top-48 size-56 rounded-full bg-rideon-green/10 blur-3xl"
                aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                        {page.lastUpdated && (
                            <p className="mt-3 text-xs font-medium text-slate-400">
                                Last updated: {page.lastUpdated}
                            </p>
                        )}
                    </div>

                    <div className="relative mx-auto hidden h-44 w-44 items-center justify-center lg:flex" aria-hidden>
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100/80 to-green-100/50 blur-sm" />
                        <div className="relative flex size-36 items-center justify-center rounded-2xl border border-white bg-white shadow-[0_16px_40px_rgba(29,140,248,0.15)]">
                            <Lock className="size-12 text-rideon-blue" strokeWidth={1.4} />
                            <div className="absolute -bottom-1 -right-1 flex size-11 items-center justify-center rounded-full bg-rideon-blue text-white shadow-lg shadow-blue-500/25">
                                <Shield className="size-5" strokeWidth={2.2} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="lg:sticky lg:top-28 lg:self-start">
                        <nav
                            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                            aria-label="On this page"
                        >
                            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                On this page
                            </p>
                            <ul className="mt-1 space-y-0.5">
                                {sections.map((s, i) => (
                                    <li key={s.id}>
                                        <button
                                            type="button"
                                            onClick={() => scrollTo(s.id)}
                                            className={cn(
                                                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition',
                                                activeId === s.id
                                                    ? 'bg-rideon-blue/10 font-semibold text-rideon-blue'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-rideon-dark',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                                    activeId === s.id
                                                        ? 'bg-rideon-blue text-white'
                                                        : 'bg-slate-100 text-slate-500',
                                                )}
                                            >
                                                {i + 1}
                                            </span>
                                            <span className="leading-snug">{s.title}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    <div className="space-y-4">
                        {intro && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                                <p className="text-sm leading-6 text-slate-600">{intro}</p>
                            </div>
                        )}
                        {sections.map((section, i) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rideon-blue/10 text-sm font-bold text-rideon-blue">
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-lg font-extrabold text-rideon-dark">{section.title}</h2>
                                        <div className="mt-3">
                                            <SectionBody section={section} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
