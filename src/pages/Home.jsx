import HeroSection from "@/components/home/HeroSection"
import HowItWorks from "@/components/home/HowItWorks"
import PromoBanner from "@/components/home/PromoBanner"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-[88px] ">
        <HeroSection />
        <HowItWorks />
        <PromoBanner />
      </main>
    </div>
  )
}
