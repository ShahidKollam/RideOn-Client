import { useDocumentTitle } from '@/lib/useDocumentTitle'
import teamData from '@/data/team.json'

function LinkedInIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    )
}

function MemberCard({ member, index }) {
    return (
        <article
            className="team-card-in flex w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-rideon-blue/25 hover:shadow-[0_14px_32px_rgba(29,140,248,0.12)]"
            style={{ animationDelay: `${80 + index * 70}ms` }}
        >
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                <img
                    src={member.image}
                    alt={member.name}
                    className="size-full object-cover transition duration-500 hover:scale-[1.04]"
                    loading="lazy"
                />
            </div>
            <div className="mt-4 flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-rideon-dark">{member.name}</h3>
                        <p className="mt-0.5 text-sm font-semibold text-rideon-blue">{member.role}</p>
                    </div>
                    {typeof member.linkedin === 'string' && member.linkedin.trim() && (
                        <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-rideon-blue/10 hover:text-rideon-blue"
                            aria-label={`${member.name} on LinkedIn`}
                        >
                            <LinkedInIcon className="size-3.5" />
                        </a>
                    )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{member.bio}</p>
            </div>
        </article>
    )
}

export default function AboutPage() {
    useDocumentTitle('Team')
    const { page, members } = teamData

    return (
        <div className="relative overflow-hidden bg-slate-50/60 pt-24 pb-14 sm:pt-28 sm:pb-16">
            <div
                className="pointer-events-none absolute -right-20 top-16 size-64 rounded-full bg-rideon-blue/10 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-12 top-32 size-48 rounded-full bg-rideon-green/10 blur-3xl"
                aria-hidden
            />

            {/* Same horizontal rhythm as Home / Pricing / Vehicles: max-w-7xl + px-4 sm:px-6 lg:px-8 */}
            <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl rideon-fade-in">
                    <p className="text-sm font-bold uppercase tracking-[.16em] text-rideon-green">
                        {page.eyebrow || 'Team'}
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-rideon-dark sm:text-4xl md:text-5xl">
                        Meet the Team{' '}
                        <span className="text-rideon-blue">Behind</span>{' '}
                        <span className="text-rideon-green">Your Ride</span>
                    </h1>
                    {page.subtitle && (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            {page.subtitle}
                        </p>
                    )}
                </div>

                {/* Left-aligned grid — same content edge as logo / hero on Home */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {members.map((member, i) => (
                        <MemberCard key={member.id} member={member} index={i} />
                    ))}
                </div>
            </section>
        </div>
    )
}
