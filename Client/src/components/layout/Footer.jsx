import { ArrowUpRight, Bike, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

import footerData from '@/data/footer.json'

const navigation = [
    { label: 'Home', to: '/' },
    { label: 'Vehicles', to: '/vehicles' },
    { label: 'Team', to: '/about' },
    { label: 'Contact', to: '/contact' },
]

const legal = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Cancellation Policy', to: '/cancellation-policy' },
    { label: 'FAQ', to: '/faq' },
]

const socialIconMap = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
}

export default function Footer() {
    const socials = (footerData.socials || [])
        .map((item) => ({
            ...item,
            Icon: socialIconMap[item.id],
        }))
        .filter((item) => item.Icon && item.href)

    return (
        <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-950 text-slate-300">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rideon-blue to-transparent" />
            <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-rideon-blue/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-[4.25rem] lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
                    <div>
                        <img src="/logo.png" alt="RideOn" className="h-10 w-auto max-w-[160px] object-contain object-left sm:h-11 sm:max-w-[180px]" />

                        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                            Safe, affordable and hassle-free bike rentals designed for students. Book your ride in seconds
                            and move around campus with ease.
                        </p>

                        <div className="mt-6 flex gap-3">
                            {socials.map(({ id, Icon, href, label }) => (
                                <a
                                    key={id}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-rideon-blue hover:bg-rideon-blue hover:text-white"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

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
                                href="tel:+918078042682"
                                className="flex items-center gap-3 text-slate-400 transition hover:text-white"
                            >
                                <Phone size={16} className="text-rideon-blue" />
                                +91 80780 42682
                            </a>
                            <a
                                href="tel:+918138853500"
                                className="flex items-center gap-3 text-slate-400 transition hover:text-white"
                            >
                                <Phone size={16} className="text-rideon-blue" />
                                +91 81388 53500
                            </a>
                            <a
                                href="tel:+919895170317"
                                className="flex items-center gap-3 text-slate-400 transition hover:text-white"
                            >
                                <Phone size={16} className="text-rideon-blue" />
                                +91 98951 70317
                            </a>
                            <a
                                href={footerData.mapsUrl || 'https://maps.app.goo.gl/zTgfhvZ2WgUUoqjs6?g_st=ac'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-slate-400 transition hover:text-white"
                            >
                                <MapPin size={16} className="text-rideon-green" />
                                {footerData.mapsLabel || 'NIT Calicut Campus'}
                            </a>
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
