import { createPortal } from 'react-dom'
import { useEffect } from 'react'

import RideOnLoader from '@/components/ui/RideOnLoader'

/**
 * Full-viewport loading overlay for major async actions.
 * Parent owns open + complete lifecycle:
 * 1) open=true, complete=false while request runs
 * 2) on API success: complete=true (keep open=true)
 * 3) onComplete: close (open=false) and run next action
 * 4) on API failure: open=false immediately
 */
export default function FullPageLoader({
    open = false,
    message = '',
    subMessage = '',
    progress = null,
    complete = false,
    onComplete,
}) {
    useEffect(() => {
        if (!open) return

        const previousBody = document.body.style.overflow
        const previousHtml = document.documentElement.style.overflow
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousBody || ''
            document.documentElement.style.overflow = previousHtml || ''
        }
    }, [open])

    if (!open || typeof document === 'undefined') return null

    const status = message || subMessage || undefined

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6"
            role="status"
            aria-live="polite"
            aria-busy={!complete}
        >
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" />

            <div className="relative z-10 w-full max-w-[340px] rounded-2xl border border-white/70 bg-white/95 px-5 py-7 shadow-xl shadow-slate-900/10 sm:max-w-[380px] sm:px-8 sm:py-8">
                <RideOnLoader
                    variant="card"
                    message={status}
                    progress={progress}
                    complete={complete}
                    onComplete={onComplete}
                />
            </div>
        </div>,
        document.body
    )
}
