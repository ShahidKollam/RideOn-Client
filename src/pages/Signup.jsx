import SignupForm from '@/components/signup/SignupForm'

export default function Signup() {
    return (
        <div className="min-h-screen overflow-hidden bg-white">
            <section className="relative px-4 pt-32 pb-8 sm:px-6 sm:pt-36 lg:px-8 lg:pt-40">
                <div className="pointer-events-none absolute top-32 -right-24 hidden size-64 rounded-full border-[42px] border-rideon-blue/10 lg:block" />
                <div className="pointer-events-none absolute bottom-28 -left-24 hidden size-52 rounded-full border-[36px] border-rideon-green/12 lg:block" />

                <div className="relative mx-auto max-w-7xl">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-3xl leading-tight font-extrabold text-rideon-dark sm:text-4xl lg:text-[2.65rem]">
                            Create Your Ride<span className="text-rideon-blue">On</span> Account
                        </h1>

                        <p className="mt-5 text-base leading-relaxed text-slate-500 sm:text-lg">
                            Join NIT Calicut&apos;s trusted bike rental platform.
                        </p>
                    </div>

                    <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
                        <SignupForm />
                    </div>
                </div>
            </section>

            <footer className="border-t border-slate-200 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
                    <img
                        src="/logo.png"
                        alt="RideOn"
                        className="h-12 w-auto sm:h-10"
                    />

                    <p>© 2025 RideOn. All rights reserved.</p>

                    <div className="flex items-center gap-6">
                        <a href="/privacy" className="transition-colors hover:text-rideon-blue">
                            Privacy Policy
                        </a>
                        <span className="h-5 w-px bg-slate-300" />
                        <a href="/terms" className="transition-colors hover:text-rideon-blue">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
