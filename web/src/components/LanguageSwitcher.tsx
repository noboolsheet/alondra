import { Globe, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { LANGS, Lang } from "@/i18n/translations";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export const LanguageSwitcher = ({ variant = "header" }: { variant?: "header" | "mobile" }) => {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LANGS.find((l) => l.code === lang)!;

  if (variant === "mobile") {
    return (
      <div className="flex gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code as Lang)}
            className={cn(
              "flex-1 min-h-[44px] rounded-full py-2.5 text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              lang === l.code ? "bg-primary text-primary-foreground" : "bg-secondary text-primary hover:bg-secondary/70",
            )}
          >
            {l.flag} {l.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 min-h-[44px] rounded-full border border-primary/15 bg-background/70 backdrop-blur px-3.5 py-2 text-xs font-semibold tracking-wide text-primary hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[160px] rounded-xl border border-border bg-card shadow-lift overflow-hidden z-50 animate-fade-in">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code as Lang);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between w-full min-h-[44px] px-4 py-2.5 text-sm text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary",
                lang === l.code && "bg-secondary/50",
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-base leading-none">{l.flag}</span>
                <span className="font-medium">{l.label}</span>
              </span>
              {lang === l.code && <Check className="w-4 h-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
