import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useLang } from "@/i18n/LanguageContext";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { t } = useLang();
  return (
    <div className="min-h-screen flex flex-col">
      {/* Keyboard skip link — visually hidden until focused (WCAG 2.4.1). */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[60] focus:top-3 focus:left-3 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {t.skipToContent}
      </a>
      <Header />
      {/* Sin `opacity` en el estado inicial, y aquí es lo más importante de todo:
          el prerenderizado escribe ese estado en el HTML, así que este `<main>`
          salía como `style="opacity:0"` con la página entera dentro. Quien no
          ejecuta JavaScript tenía el contenido completo y declarado invisible.
          El desplazamiento de 8 px hace el mismo trabajo y no esconde nada (ver
          la cabecera de `src/lib/motion.ts`). */}
      <motion.main
        id="main"
        className="flex-1 overflow-x-clip"
        initial={{ y: 8 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};
