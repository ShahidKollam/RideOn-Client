import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Horizontal 3-step onboarding indicator.
 * current: 1 = Create Account | 2 = Verify Email | 3 = Complete Profile
 * Informational only — not clickable.
 */
const STEPS = [
    { id: 1, short: 'Account', full: 'Create Account' },
    { id: 2, short: 'Verify', full: 'Verify Email' },
    { id: 3, short: 'Profile', full: 'Complete Profile' },
]

export default function SignupProgress({ current = 1 }) {
    return (
        <nav aria-label="Signup progress" className="w-full">
            <ol className="flex items-start justify-between gap-1 sm:gap-2">
                {STEPS.map((step, index) => {
                    const done = current > step.id
                    const active = current === step.id
                    const isLast = index === STEPS.length - 1

                    return (
                        <li
                            key={step.id}
                            className={cn('relative flex min-w-0 flex-1 flex-col items-center', !isLast && 'pr-1 sm:pr-2')}
                        >
                            {/* Connector line to next step */}
                            {!isLast && (
                                <div
                                    className={cn(
                                        'absolute left-[calc(50%+14px)] right-[-50%] top-[15px] h-0.5 sm:left-[calc(50%+18px)] sm:top-[17px]',
                                        done || active ? 'bg-rideon-blue/40' : 'bg-slate-200',
                                        done && 'bg-rideon-green/50',
                                    )}
                                    aria-hidden
                                />
                            )}

                            <div
                                className={cn(
                                    'relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors sm:size-9 sm:text-sm',
                                    done && 'border-rideon-green bg-rideon-green text-white',
                                    active && !done && 'border-rideon-blue bg-rideon-blue text-white shadow-md shadow-rideon-blue/25',
                                    !active && !done && 'border-slate-200 bg-white text-slate-400',
                                )}
                                aria-current={active ? 'step' : undefined}
                            >
                                {done ? <Check className="size-4" strokeWidth={2.5} /> : step.id}
                            </div>

                            <span
                                className={cn(
                                    'mt-2 max-w-full truncate text-center text-[10px] font-semibold leading-tight sm:text-xs',
                                    active && 'text-rideon-blue',
                                    done && 'text-rideon-green',
                                    !active && !done && 'text-slate-400',
                                )}
                            >
                                <span className="sm:hidden">{step.short}</span>
                                <span className="hidden sm:inline">{step.full}</span>
                            </span>
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
