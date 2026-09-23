import { Bike, CalendarDays, HardHat } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: 1,
    icon: Bike,
    color: "blue",
    title: "Choose Bike",
    description: "Select your scooter from our wide range.",
  },
  {
    number: 2,
    icon: CalendarDays,
    color: "green",
    title: "Book & Pay",
    description: "Pick your date, time and complete the payment.",
  },
  {
    number: 3,
    icon: HardHat,
    color: "blue",
    title: "Ride & Enjoy",
    description: "Start your journey and enjoy the freedom!",
  },
]

function StepIcon({ step }) {
  const isBlue = step.color === "blue"

  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center transition-all duration-300 hover:scale-105">
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          isBlue ? "bg-rideon-blue/15" : "bg-rideon-green/22"
        )}
      />

      <div
        className={cn(
          "relative flex size-10 items-center justify-center rounded-full shadow-sm transition-all duration-300",
          isBlue
            ? "bg-rideon-blue text-white hover:shadow-lg"
            : "bg-rideon-green text-white hover:shadow-lg"
        )}
      >
        <step.icon className="size-4.5" strokeWidth={2} />
      </div>

      <span
        className={cn(
          "absolute top-0 right-0 flex size-4.5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow",
          isBlue ? "bg-rideon-blue" : "bg-rideon-green"
        )}
      >
        {step.number}
      </span>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-1 lg:py-2">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rideon-green">
            How It Works
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-rideon-dark sm:text-2xl">
            Rent in 3 Simple Steps
          </h2>
        </div>

        <div className="relative mt-6 sm:mt-8">
          {/* Desktop connector */}
          <div className="pointer-events-none absolute top-7 left-[14%] right-[14%] hidden border-t border-dashed border-slate-300 md:block" />

          <div className="grid grid-cols-3 gap-2 md:flex md:justify-center md:gap-20">
            {steps.map((step) => (
              <div
                key={step.number}
                className="
                  relative
                  flex
                  flex-col
                  items-center
                  text-center
                  gap-4
                  md:flex-row
                  md:items-center
                  md:text-left
                "
              >
                <StepIcon step={step} />

                <div className="max-w-[105px] md:max-w-[160px]">
                  <h3 className="text-xs font-bold text-rideon-dark sm:text-sm">
                    {step.title}
                  </h3>

                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500 sm:text-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}