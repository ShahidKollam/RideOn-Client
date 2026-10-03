import { useDocumentTitle } from '@/lib/useDocumentTitle'
import teamData from '@/data/team.json'

function LinkedInIcon({ className }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    )
}

function MemberCard({ member, index }) {
    const hasLinkedIn =
        typeof member.linkedin === 'string' &&
        member.linkedin.trim().length > 0

    return (
        <article
            className="team-card-in group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_6px_22px_rgba(28,55,113,0.045)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-rideon-blue/25 hover:shadow-[0_18px_38px_rgba(29,140,248,0.10)] sm:p-4"
            style={{
                animationDelay: `${80 + index * 70}ms`,
            }}
        >
            {/* =====================================================
                IMAGE
            ====================================================== */}

            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {/* Soft brand glow */}
                <div
                    className="pointer-events-none absolute -left-8 -top-8 z-10 size-24 rounded-full bg-rideon-blue/10 blur-2xl"
                    aria-hidden="true"
                />

                <div
                    className="pointer-events-none absolute -bottom-8 -right-8 z-10 size-24 rounded-full bg-rideon-green/10 blur-2xl"
                    aria-hidden="true"
                />

                <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 size-full object-cover object-[center_18%] transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                    loading="lazy"
                />

                {/* Bottom image fade */}
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/10 to-transparent"
                    aria-hidden="true"
                />
            </div>

            {/* =====================================================
                CONTENT
            ====================================================== */}

            <div className="mt-4 flex min-h-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-extrabold tracking-tight text-rideon-dark sm:text-[17px]">
                            {member.name}
                        </h2>

                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-rideon-blue">
                            {member.role}
                        </p>
                    </div>

                    {hasLinkedIn && (
                        <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-rideon-blue transition-all duration-200 hover:scale-105 hover:bg-rideon-blue hover:text-white"
                            aria-label={`${member.name} on LinkedIn`}
                        >
                            <LinkedInIcon className="size-3.5" />
                        </a>
                    )}
                </div>

                {member.bio && (
                    <p className="mt-2.5 line-clamp-3 whitespace-pre-line text-xs leading-5 text-[#64748b] sm:text-sm sm:leading-6">
                        {member.bio}
                    </p>
                )}
            </div>

            {/* =====================================================
                BOTTOM ACCENT
            ====================================================== */}

            <div className="mt-4 flex items-center gap-2">
                <span className="h-1 w-8 rounded-full bg-rideon-blue/70 transition-all duration-300 group-hover:w-12" />

                <span className="h-1 w-3 rounded-full bg-rideon-green/70 transition-all duration-300 group-hover:w-5" />
            </div>
        </article>
    )
}

export default function AboutPage() {
    useDocumentTitle('Team')

    const { page, members } = teamData

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f8fafc] pt-20 pb-14 sm:pt-24 sm:pb-16 lg:pt-28">
            {/* =====================================================
                BACKGROUND ATMOSPHERE
            ====================================================== */}

            <div
                className="pointer-events-none absolute -right-24 top-12 size-72 rounded-full bg-rideon-blue/[0.045] blur-3xl"
                aria-hidden="true"
            />

            <div
                className="pointer-events-none absolute -left-24 top-40 size-64 rounded-full bg-rideon-green/[0.04] blur-3xl"
                aria-hidden="true"
            />

            <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* =================================================
                    HERO
                ================================================== */}

                <section className="rideon-fade-in">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3">
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rideon-green">
                                {page.eyebrow || 'Team'}
                            </p>

                            <span className="h-px w-8 bg-rideon-green/60" />
                        </div>

                        <h1 className="mt-3 text-3xl font-extrabold leading-[1.08] tracking-tight text-rideon-dark sm:text-5xl lg:text-[50px]">
                            Meet the Team{' '}
                            <span className="text-rideon-blue">
                                Behind
                            </span>{' '}
                            <span className="text-rideon-green">
                                Your Ride
                            </span>
                        </h1>

                        {page.subtitle && (
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#40537e] sm:text-base sm:leading-7">
                                {page.subtitle}
                            </p>
                        )}
                    </div>
                </section>

                {/* =================================================
                    TEAM GRID
                ================================================== */}

                <section className="mt-8 sm:mt-10">
                    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {members.map((member, index) => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                index={index}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}