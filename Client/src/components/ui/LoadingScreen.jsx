export default function LoadingScreen({
    message = 'Getting things ready',
}) {
    return (
        <div
            className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#f5f9ff] via-white to-[#f8fbff] px-4 py-16 sm:min-h-[100vh]"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            {/* Soft background glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#218BFA]/[0.06] blur-3xl sm:h-80 sm:w-80"
            />

            <div className="relative flex w-full max-w-sm flex-col items-center text-center">
   

                {/* Premium animated spinner */}
                <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
                    {/* Outer subtle ring */}
                    <div
                        className="absolute inset-0 rounded-full border border-[#218BFA]/10"
                        aria-hidden="true"
                    />

                    {/* Rotating gradient ring */}
                    <div
                        className="absolute inset-1 animate-spin rounded-full border-[3px] border-transparent border-t-[#218BFA] border-r-[#70BF41]/80 motion-reduce:animate-none"
                        style={{ animationDuration: '1.2s' }}
                        aria-hidden="true"
                    />

                    {/* Inner ring */}
                    <div
                        className="absolute inset-3 rounded-full border border-[#218BFA]/10"
                        aria-hidden="true"
                    />

                    {/* Center icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(33,139,250,0.12)]">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-6 w-6 text-[#218BFA]"
                            aria-hidden="true"
                        >
                            <path
                                d="M3 13h2l2-5h7l3 5h3"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle
                                cx="7"
                                cy="16"
                                r="2"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            />
                            <circle
                                cx="17"
                                cy="16"
                                r="2"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            />
                            <path
                                d="M9 16h6"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Decorative dots */}
                    <span
                        className="absolute right-1 top-4 h-2 w-2 animate-pulse rounded-full bg-[#70BF41] motion-reduce:animate-none"
                        aria-hidden="true"
                    />
                    <span
                        className="absolute bottom-3 left-1 h-1.5 w-1.5 animate-pulse rounded-full bg-[#218BFA]/50 motion-reduce:animate-none"
                        style={{ animationDelay: '300ms' }}
                        aria-hidden="true"
                    />
                </div>

                {/* Loading text */}
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#218BFA]">
                    Your next ride starts here
                </p>

                <h1 className="text-xl font-bold tracking-tight text-[#17395B] sm:text-2xl">
                    {message}
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#53677D]">
                    Loading your RideOn experience...
                </p>

                {/* Indeterminate progress indicator */}
                <div
                    className="mt-8 h-1 w-32 overflow-hidden rounded-full bg-[#218BFA]/10"
                    aria-hidden="true"
                >
                    <div
                        className="h-full w-1/2 animate-[rideon-loading_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#218BFA] to-[#70BF41] motion-reduce:animate-none"
                        style={{
                            transformOrigin: 'left',
                        }}
                    />
                </div>

                <style>{`
                    @keyframes rideon-loading {
                        0% {
                            transform: translateX(-100%);
                        }
                        50% {
                            transform: translateX(100%);
                        }
                        100% {
                            transform: translateX(200%);
                        }
                    }
                `}</style>
            </div>
        </div>
    )
}
