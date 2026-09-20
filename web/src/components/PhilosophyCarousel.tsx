import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Student photos shown in the philosophy carousel. With 14 photos (well above
// the 4 in view), each appears once — no duplication needed, the loop rotates
// through all of them. Add more by dropping files in imagen-sources/, running
// `npm run images`, and bumping the count here.
const PHOTOS = Array.from({ length: 14 }, (_, i) => `/images/Estudiante_${i + 1}.webp`);

export const PhilosophyCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const paused = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  // Smoothly advance one slide to the left every 15 seconds; pause on hover.
  // Respect reduced motion: no autoplay for users who ask for less movement.
  useEffect(() => {
    if (!api || prefersReducedMotion) return;
    const id = setInterval(() => {
      if (!paused.current) api.scrollNext();
    }, 15000);
    return () => clearInterval(id);
  }, [api, prefersReducedMotion]);

  return (
    <div
      className="relative px-14 sm:px-12"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
    >
      {/* duration is Embla's glide factor (higher = slower, softer ease-out).
          Kept animated even under reduced motion: the slide only ever plays in
          response to a user-initiated arrow click, never on its own. */}
      <Carousel setApi={setApi} opts={{ loop: true, align: "start", duration: 45 }}>
        <CarouselContent>
          {PHOTOS.map((src, i) => (
            <CarouselItem key={src} className="basis-full sm:basis-1/3 md:basis-1/4">
              <img
                src={src}
                alt={`Estudiantes de Alondra ${i + 1}`}
                className="aspect-[3/4] w-full rounded-2xl object-cover shadow-soft"
                loading="lazy"
                width={1100}
                height={1467}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-12 z-10 h-11 w-11 border-border bg-card/90 text-primary shadow-soft hover:bg-card hover:text-primary sm:-left-12" />
        <CarouselNext className="-right-12 z-10 h-11 w-11 border-border bg-card/90 text-primary shadow-soft hover:bg-card hover:text-primary sm:-right-12" />
      </Carousel>
    </div>
  );
};
