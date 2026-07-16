import { Check, FileText, User } from 'lucide-react'

import { cn } from '@/lib/utils'

export default function SignupProgress({ step, title, description, active, complete, locked }) {
    const Icon = step === 1 ? User : FileText

    return (
        <div className="relative flex gap-4 sm:block">
            <div className="flex flex-col items-center sm:absolute sm:top-0 sm:left-0">
                <div
                    className={cn(
                        'flex size-14 shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:size-16',
                        complete
                            ? 'bg-rideon-green/15 text-rideon-green'
                            : active
                                ? 'bg-rideon-blue/15 text-rideon-blue'
                                : 'bg-slate-100 text-slate-400',
                    )}
                >
                    {complete ? (
                        <Check className="size-6" strokeWidth={2.5} />
                    ) : (
                        <Icon className="size-6" strokeWidth={2.25} />
                    )}
                </div>

                <div
                    className={cn(
                        'mt-3 hidden h-32 w-px sm:block',
                        complete || active ? 'bg-rideon-blue/25' : 'bg-slate-200',
                    )}
                />
            </div>

            <div className="min-w-0 sm:pl-24">
                <p
                    className={cn(
                        'text-sm font-bold',
                        complete
                            ? 'text-rideon-green'
                            : active
                                ? 'text-rideon-blue'
                                : 'text-slate-400',
                    )}
                >
                    Step {step}
                </p>

                <h2
                    className={cn(
                        'mt-2 text-lg font-extrabold text-rideon-dark sm:text-xl',
                        locked && 'text-slate-400',
                    )}
                >
                    {title}
                </h2>

                <p
                    className={cn(
                        'mt-4 max-w-[13rem] text-sm leading-7 text-slate-500',
                        locked && 'text-slate-400',
                    )}
                >
                    {description}
                </p>
            </div>
        </div>
    )
}
