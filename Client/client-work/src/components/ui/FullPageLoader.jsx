import { createPortal } from 'react-dom'
import { useEffect } from 'react'

/**
 * Full-viewport loading overlay for major async actions
 * (availability check, payment, verification, cancellation).
 * Uses a light backdrop + blur so the page remains visible but blocked.
 */
export default function FullPageLoader({
    open = false,
    message = 'Please wait…',
    subMessage = '',
}) {
    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    if (!open || typeof document === 'undefined') return null

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[3px]" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/60 bg-white/95 px-6 py-8 text-center shadow-xl shadow-slate-900/10">
                <div
                    className="mx-auto size-12 animate-spin rounded-full border-[3px] border-rideon-blue/20 border-t-rideon-blue"
                    aria-hidden
                />
                <p className="mt-5 text-base font-bold text-rideon-dark">{message}</p>
                {subMessage ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">{subMessage}</p>
                ) : (
                    <p className="mt-2 text-sm leading-6 text-slate-500">This may take a moment. Please don’t close this page.</p>
                )}
            </div>
        </div>,
        document.body
    )
}
