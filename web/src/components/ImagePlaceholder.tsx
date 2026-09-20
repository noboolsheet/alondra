import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  className?: string;
  aspect?: "square" | "video" | "portrait" | "cinema";
  rounded?: string;
  /** Fill the parent container (absolute inset-0) instead of using an aspect ratio. */
  fill?: boolean;
}

const aspects = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  cinema: "aspect-[21/9]",
};

export const ImagePlaceholder = ({ label, className, aspect = "video", rounded = "rounded-2xl", fill = false }: Props) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-accent-soft flex items-center justify-center",
        fill ? "absolute inset-0 h-full w-full" : aspects[aspect],
        rounded,
        className,
      )}
    >
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, hsl(var(--accent) / 0.3), transparent 50%), radial-gradient(circle at 70% 80%, hsl(var(--primary) / 0.15), transparent 50%)" }} />
      <div className="relative flex flex-col items-center gap-2 text-primary/60">
        <ImageIcon className="w-8 h-8" strokeWidth={1.4} />
        {label && <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">{label}</span>}
      </div>
    </div>
  );
};
