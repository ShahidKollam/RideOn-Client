export default function LoadingScreen({ message = 'Loading...' }) {
    return (
        <div className="flex min-h-dvh items-center justify-center bg-white px-6">
            <div className="text-center">
                <div className="mx-auto size-12 animate-spin rounded-full border-4 border-rideon-blue/20 border-t-rideon-blue" />
                <p className="mt-4 text-sm font-semibold text-rideon-dark">{message}</p>
            </div>
        </div>
    )
}
