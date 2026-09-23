import { ArrowRight, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PromoBanner() {
    return (
        <section className="bg-white px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8 lg:pb-10 mt-6">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col items-start justify-between gap-4 rounded-lg bg-rideon-blue px-4 py-4 shadow-[0_6px_18px_rgba(29,140,248,0.18)] sm:flex-row sm:items-center sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white">
                            <Tag className="size-4 text-rideon-blue" />
                        </div>

                        <div className="text-white">
                            <p className="text-sm font-bold sm:text-base">Special Offer!</p>
                            <p className="text-xs text-white/90 sm:text-sm">
                                Get <span className="font-semibold">20% OFF</span> on your first ride. Use code:{" "}
                                <span className="font-bold">RIDEON20</span>
                            </p>
                        </div>
                    </div>

                    <Button
                        className="
              h-9
              w-full
              shrink-0
              rounded-lg
              bg-white
              px-5
              text-sm
              font-semibold
              text-rideon-blue
              hover:bg-white/95
              sm:w-auto
            "
                        asChild
                    >
                        <Link to="/booking">Book Now <ArrowRight className="size-4" /></Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
