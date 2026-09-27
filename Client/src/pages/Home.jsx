import HeroSection from '@/components/home/HeroSection'
import HomeTrustBar from '@/components/home/HomeTrustBar'
import HowItWorks from '@/components/home/HowItWorks'
import HomeVehicle from '@/components/home/HomeVehicle'
import HomePricing from '@/components/home/HomePricing'
import HomeWhy from '@/components/home/HomeWhy'
import HomeFaq from '@/components/home/HomeFaq'
import HomeCta from '@/components/home/HomeCta'
import PickupPointSection from '@/components/layout/PickupPointSection'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function Home() {
    useDocumentTitle('Campus bike rentals')

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar spacing — hero keeps its own layout; DO NOT change Hero */}
            <div className="pt-[88px]">
                <HeroSection />
            </div>

            <HomeTrustBar />
            <HowItWorks />
            <HomeVehicle />
            <HomePricing />
            <HomeWhy />
            <HomeFaq />
            <PickupPointSection />
            <HomeCta />
        </div>
    )
}
