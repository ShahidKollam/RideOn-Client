import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

const icons = {
    success: CheckCircle2,
    error: TriangleAlert,
    info: Info,
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback(
        ({ title, description, type = 'info', duration = 4200 }) => {
            const id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`

            setToasts((current) => [...current, { id, title, description, type }])

            window.setTimeout(() => removeToast(id), duration)
        },
        [removeToast]
    )

    const value = useMemo(() => ({ showToast }), [showToast])

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="fixed right-4 bottom-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:bottom-6">
                {toasts.map((toast) => {
                    const Icon = icons[toast.type] || Info

                    return (
                        <div
                            key={toast.id}
                            className={cn(
                                'flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.14)]',
                                toast.type === 'success' && 'border-rideon-green/30',
                                toast.type === 'error' && 'border-red-200',
                                toast.type === 'info' && 'border-rideon-blue/25'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'mt-0.5 size-5 shrink-0',
                                    toast.type === 'success' && 'text-rideon-green',
                                    toast.type === 'error' && 'text-red-500',
                                    toast.type === 'info' && 'text-rideon-blue'
                                )}
                                strokeWidth={2.25}
                            />

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-rideon-dark">{toast.title}</p>
                                {toast.description && (
                                    <p className="mt-1 text-sm leading-5 text-slate-500">{toast.description}</p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                className="flex size-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-rideon-dark"
                                aria-label="Dismiss notification"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)

    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }

    return context
}
