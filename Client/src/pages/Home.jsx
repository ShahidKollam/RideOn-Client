import HeroSection from "@/components/home/HeroSection"
import HowItWorks from "@/components/home/HowItWorks"
import PromoBanner from "@/components/home/PromoBanner"
import { Link } from 'react-router-dom'
import { ArrowRight, Bike } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-[88px] ">
        <HeroSection />
        <HowItWorks />
        <PromoBanner />
        <section id="vehicles" className="bg-slate-50/60 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <div><p className="text-sm font-bold uppercase tracking-[.16em] text-rideon-green">Ready when you are</p><h2 className="mt-2 text-2xl font-extrabold text-rideon-dark">Find the right ride for today.</h2><p className="mt-2 text-sm text-slate-500">Browse available campus vehicles in a few taps.</p></div>
            <Button className="bg-rideon-blue text-white hover:bg-rideon-blue/90" asChild><Link to="/vehicles"><Bike className="size-4" />Explore vehicles <ArrowRight className="size-4" /></Link></Button>
          </div>
        </section>
      </main>
    </div>
  )
}
