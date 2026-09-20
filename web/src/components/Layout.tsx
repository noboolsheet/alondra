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
        className="sr-only focus:not-sr-only focus:fixed focus:z-[60] focus:top-3 focus:left-3 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lift focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {t.skipToContent}
      </a>
      <Header />
      <motion.main
        id="main"
        className="flex-1 overflow-x-clip"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};
