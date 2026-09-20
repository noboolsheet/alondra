import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * An intentional, finished brand panel used as a deliberate stand-in where a real
 * photograph will later go (director portrait, formats shot). Unlike ImagePlaceholder
 * — which renders a gray "image icon" box that reads as unfinished — this is a designed
 * deep-purple brand surface. To swap in the real image later, replace <BrandFrame> with
 * an <img> at the same aspect/rounding.
 *
 * `.on-brand-dark` pins the brand tokens to their light-theme values so the panel and
 * its text stay deep-purple-with-light-ink in BOTH light and dark themes.
 */

const aspects = {
  portrait: "aspect-[3/4]",
  video: "aspect-video",
  square: "aspect-square",
};

interface Props {
  children: ReactNode;
  aspect?: keyof typeof aspects;
  rounded?: string;
  className?: string;
}

export const BrandFrame = ({ children, aspect = "portrait", rounded = "rounded-3xl", className }: Props) => (
  <div
    className={cn(
      "on-brand-dark relative overflow-hidden bg-gradient-hero text-primary-foreground",
      aspects[aspect],
      rounded,
      className,
    )}
  >
    {/* Soft, warm depth — bounded blurred glows, not decoration for its own sake */}
    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/25 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-24 -left-12 w-56 h-56 rounded-full bg-primary-foreground/5 blur-3xl pointer-events-none" />
    <div className="relative h-full w-full flex flex-col items-center justify-center text-center px-8">
      {children}
    </div>
  </div>
);
