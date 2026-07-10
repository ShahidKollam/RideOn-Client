import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
    return (
        <div className="flex min-h-dvh items-center justify-center bg-white px-6 pt-24">
            <div className="max-w-md text-center">
                <p className="text-sm font-bold text-rideon-blue">404</p>
                <h1 className="mt-3 text-3xl font-extrabold text-rideon-dark">Page not found</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                    The page you are looking for does not exist or has moved.
                </p>
                <Button
                    className="mt-7 h-11 rounded-lg bg-rideon-blue px-6 font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90"
                    asChild
                >
                    <Link to="/">Go Home</Link>
                </Button>
            </div>
        </div>
    )
}
