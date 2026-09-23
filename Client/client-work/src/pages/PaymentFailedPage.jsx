import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function PaymentFailedPage() {
    const { state } = useLocation()
    const message = state?.message || 'Your payment could not be completed. No booking has been created.'

    return <div className="flex min-h-[75vh] items-center bg-slate-50/60 px-4 pt-20"><div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-10"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50"><AlertCircle className="size-9 text-red-600" /></div><p className="mt-5 text-sm font-bold uppercase tracking-[.16em] text-red-600">Payment failed</p><h1 className="mt-2 text-3xl font-extrabold text-rideon-dark">We couldn’t complete your payment</h1><p className="mt-3 text-sm leading-6 text-slate-500">{message}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><Button className="bg-rideon-blue text-white" asChild><Link to="/booking"><RefreshCw className="size-4" />Retry payment</Link></Button><Button variant="outline" className="border-rideon-blue text-rideon-blue" asChild><Link to="/booking"><ArrowLeft className="size-4" />Back to booking</Link></Button></div></div></div>
}
