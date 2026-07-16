import { Bike, Headphones, IndianRupee, Play, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
    {
        icon: ShieldCheck,
        ring: "bg-rideon-blue/25 ring-rideon-blue/20",
        inner: "bg-rideon-blue",
        title: "Safe & Secure",
        subtitle: "Verified vehicles",
    },
    {
        icon: IndianRupee,
        ring: "bg-rideon-green/25 ring-rideon-green/20",
        inner: "bg-rideon-green",
        title: "Affordable Pricing",
        subtitle: "Best rates in town",
    },
    {
        icon: Headphones,
        ring: "bg-rideon-blue/25 ring-rideon-blue/20",
        inner: "bg-rideon-blue",
        title: "24/7 Support",
        subtitle: "We're here to help",
    },
];

function HighlightIcon({ item }) {
    return (
        <div
            className={cn(
                "relative flex size-10 shrink-0 items-center justify-center rounded-full ring-[6px] transition-all duration-300 group-hover:scale-105 sm:size-11",
                item.ring,
            )}
        >
            <div className={cn("flex size-7 items-center justify-center rounded-full sm:size-8", item.inner)}>
                <item.icon className="size-3.5 text-white sm:size-4" strokeWidth={2.25} />
            </div>
        </div>
    );
}

export default function HeroSection() {
    return (
        <section className="relative min-h-[26rem] overflow-hidden bg-white sm:min-h-[28rem] lg:min-h-0">
            {/* Mobile-only fade overlay */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
                style={{
                    background: `
            linear-gradient(
              to right,
              rgba(255,255,255,1) 0%,
              rgba(255,255,255,0.92) 28%,
              rgba(255,255,255,0.45) 52%,
              rgba(255,255,255,0) 70%
            ),
            linear-gradient(
              to left,
              rgba(255,255,255,0.95) 0%,
              rgba(255,255,255,0.55) 8%,
              rgba(255,255,255,0) 18%
            )
          `,
                }}
            />

            {/* Hero Image */}
            {/* Mobile & Tablet Image */}
            <img
                src="/home_bg_img.png"
                alt=""
                aria-hidden
                className={cn(
                    "pointer-events-none absolute z-0 object-contain object-right lg:hidden",
                    "top-14 -right-0 w-[88%] max-w-none",
                    "sm:top-12 sm:-right-4 sm:w-[72%]",
                    "md:top-8 md:w-[65%]",
                )}
                style={{
                    filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.08))",
                }}
            />

            {/* Desktop Image */}
            <div className="absolute -inset-y-45 top-10 right-10 z-0 hidden items-end justify-end lg:flex lg:w-[60%]">
                <img
                    src="/home_bg_img.png"
                    alt=""
                    aria-hidden
                    className={cn(
                        "pointer-events-none object-contain object-right",
                        "lg:h-[108%] lg:w-auto lg:max-w-none",
                        "xl:h-[112%]",
                        "2xl:h-[115%]",
                    )}
                    style={{
                        filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.08))",
                    }}
                />
            </div>

            <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-0 flex-col justify-center py-6 sm:py-8 lg:max-h-[calc(100vh-4.5rem)] lg:py-10 xl:py-12">
                    <div className="max-w-[58%] sm:max-w-[52%] lg:max-w-[30rem] xl:max-w-[32rem]">
                        <h1 className="text-[1.65rem] leading-[1.15] font-extrabold tracking-tight text-rideon-dark sm:text-4xl lg:text-[3.35rem] lg:leading-[1.08] xl:text-[3.65rem]">
                            Ride <span className="text-rideon-blue">More,</span>
                            <br />
                            Pay <span className="text-rideon-green">Less!</span>
                        </h1>

                        <p className="mt-3 max-w-[14rem] text-[13px] leading-relaxed text-slate-500 sm:mt-4 sm:max-w-md sm:text-[15px] lg:mt-5 lg:text-base xl:text-[17px]">
                            Rent scooters easily and explore the city with freedom and style.
                        </p>

                        <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3 lg:mt-7 lg:gap-4">
                            <Button
                                size="lg"
                                className={cn(
                                    "h-9 w-3/4 rounded-md bg-rideon-blue px-4 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.35)]",
                                    "sm:h-10 sm:w-auto sm:px-6 sm:text-[15px]",
                                    "lg:h-11 lg:px-7",
                                )}
                                asChild
                            >
                                <Link to="/auth/login">
                                    <Bike className="size-4 sm:size-[18px]" strokeWidth={2.25} />
                                    Book Your Ride
                                </Link>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className={cn(
                                    `h-9 w-3/4 rounded-md border-2 border-rideon-green bg-white px-4 text-[13px] font-semibold text-rideon-green transition-all 
                                    duration-300 hover:-translate-y-0.5 hover:bg-rideon-green/5 hover:shadow-[0_10px_22px_rgba(0,0,0,0.08)]` ,
                                    "sm:h-10 sm:w-auto sm:px-6 sm:text-[15px]",
                                    "lg:h-11 lg:px-7 ",
                                )}
                                asChild
                            >
                                <a href="#how-it-works">
                                    <span className="flex size-[18px] items-center justify-center rounded-full border-2 border-rideon-green sm:size-5">
                                        <Play className="size-2 fill-rideon-green text-rideon-green" strokeWidth={0} />
                                    </span>
                                    How It Works
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div
                        className={cn(
                            "mt-6 rounded-2xl bg-white p-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:mt-8 sm:p-4",
                            "lg:mt-10 lg:max-w-3xl lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none",
                        )}
                    >
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                            {highlights.map((item) => (
                                <div
                                    key={item.title}
                                    className="group flex flex-col items-center gap-2 text-center transition-all duration-300 hover:-translate-y-1 sm:flex-row sm:items-center sm:gap-3 sm:text-left lg:flex-row"
                                >
                                    <HighlightIcon item={item} />

                                    <div className="min-w-0">
                                        <p className="text-[11px] leading-tight font-semibold text-rideon-dark sm:text-[13px] lg:text-sm">
                                            {item.title}
                                        </p>

                                        <p className="mt-0.5 text-[9px] leading-tight text-slate-500 sm:text-[11px] lg:text-xs">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        
    );
}
