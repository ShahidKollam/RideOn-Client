import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PickupPointSection from '@/components/layout/PickupPointSection'

export default function AppLayout() {
    const { pathname } = useLocation()
    const isHome = pathname === '/'

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main>
                <Outlet />
            </main>

            {/* On home, Pickup is rendered inside Home (order: FAQ → Pickup → CTA) */}
            {/* {!isHome && <PickupPointSection />} */}
            <Footer />
        </div>
    )
}
