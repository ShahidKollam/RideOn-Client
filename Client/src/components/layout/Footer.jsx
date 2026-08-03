import { ArrowUpRight, Bike, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

const navigation = [
    { label: 'Home', to: '/' },
    { label: 'Vehicles', to: '/vehicles' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
]

const legal = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Refund Policy', to: '/refund' },
]

const socials = [
    { icon: Instagram, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Facebook, href: '#' },
    { icon: Linkedin, href: '#' },
]

export default function Footer() {
    return (
        <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-950 text-slate-300">
            {/* Top Accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rideon-blue to-transparent" />
            <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-rideon-blue/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
                    {/* Brand */}
                    <div>
                        <img src="/logo.png" alt="RideOn" className="h-12 w-auto" />

                        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                            Safe, affordable and hassle-free bike rentals designed for students. Book your ride in seconds
                            and move around campus with ease.
                        </p>

                        <div className="mt-6 flex gap-3">
                            {socials.map(({ icon: Icon, href }, index) => (
                                <a
                                    key={index}
                                    href={href}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-rideon-blue hover:bg-rideon-blue hover:text-white"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Explore</h3>

                        <div className="mt-5 space-y-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="block text-sm text-slate-400 transition hover:translate-x-1 hover:text-rideon-blue"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Legal</h3>

                        <div className="mt-5 space-y-3">
                            {legal.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="block text-sm text-slate-400 transition hover:translate-x-1 hover:text-rideon-blue"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h3>

                        <div className="mt-5 space-y-4 text-sm">
                            <a
                                href="mailto:support@rideon.in"
                                className="flex items-center gap-3 text-slate-400 transition hover:text-white"
                            >
                                <Mail size={16} className="text-rideon-blue" />
                                support@rideon.in
                            </a>

                            <a
                                href="tel:+919876543210"
                                className="flex items-center gap-3 text-slate-400 transition hover:text-white"
                            >
                                <Phone size={16} className="text-rideon-blue" />
                                +91 98765 43210
                            </a>

                            <div className="flex items-center gap-3 text-slate-400">
                                <MapPin size={16} className="text-rideon-green" />
                                NIT Calicut Campus
                            </div>
                        </div>

                        <Link
                            to="/booking"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rideon-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rideon-blue/90"
                        >
                            <Bike size={16} />
                            Book a Ride
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 border-t border-slate-800 pt-6">
                    <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>© {new Date().getFullYear()} RideOn. All rights reserved.</p>

                        <p className="flex items-center gap-2">
                            <span>Built with</span>
                            <span className="text-red-500">♥</span>
                            <span>for smarter campus mobility.</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
