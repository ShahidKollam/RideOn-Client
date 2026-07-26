import { AlertCircle, Inbox } from 'lucide-react'

export function SkeletonCard({ className = '' }) {
    return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
}

export function EmptyState({ title, description, action }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
            <Inbox className="mx-auto size-9 text-rideon-blue" />
            <h2 className="mt-4 text-lg font-bold text-rideon-dark">{title}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    )
}

export function ErrorState({ message, onRetry }) {
    return (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
            <AlertCircle className="mx-auto size-8 text-red-500" />
            <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>
            {onRetry && <button type="button" onClick={onRetry} className="mt-4 text-sm font-bold text-rideon-blue hover:underline">Try again</button>}
        </div>
    )
}
