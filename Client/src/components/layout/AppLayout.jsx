import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PickupPointSection from '@/components/layout/PickupPointSection'

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main>
                <Outlet />
            </main>

            <PickupPointSection />
            <Footer />
        </div>
    )
}
