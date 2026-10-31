import { useLocation } from "react-router-dom";
import { PageLink } from "@/components/PageLink";
import type { PageKey } from "@/i18n/routes";
import { Menu, X, Sun, Moon, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, page } = useLang();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Siete entradas, todas de cara al padre que decide. "Trabaja con nosotros"
  // habla a profesores que buscan empleo, no a quien compra, así que se alcanza
  // desde el pie y desde la página de profesores.
  //
  // Inscripción va pegada a Precios a propósito: es el paso siguiente y quien la
  // busca ya sabe lo que quiere, así que tenerla escondida detrás de un botón al
  // final de precios le costaba un scroll que no tiene por qué pagar.
  const links: { page: PageKey; label: string }[] = [
    { page: "home", label: t.nav.home },
    { page: "programs", label: t.nav.programs },
    { page: "teachers", label: t.nav.teachers },
    { page: "about", label: t.nav.about },
    { page: "registration", label: t.nav.registration },
    { page: "enroll", label: t.nav.enroll },
    { page: "contact", label: t.nav.contact },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/85 backdrop-blur-lg shadow-soft" : "bg-background/60 backdrop-blur",
      )}
    >
      <nav className="container-full">
        <div className="flex items-center justify-between h-16 md:h-20">
          <PageLink
            to="home"
            onClick={() => window.scrollTo({ top: 0 })}
            className="flex items-center gap-3 group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Alondra Music Academy"
          >
            <img
              src="/images/logo-minimal.webp"
              alt="Alondra Music Academy logo"
              width={320}
              height={320}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full transition-transform duration-500 group-hover:rotate-6"
            />
            <div className="hidden sm:block leading-none">
              <img
                src="/images/alondra-nombre.webp"
                alt="Alondra"
                width={320}
                height={128}
                className="h-6 md:h-7 w-auto"
              />
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-ink mt-1.5">Music Academy</div>
            </div>
          </PageLink>

          {/* Desktop nav — shown at xl so the longest language (es/fr labels like
              "Professeurs" plus "Inscription") never overflows on narrow laptops.
              El contenedor tope en 1280px, así que el presupuesto de la fila no
              crece con la pantalla: con siete entradas el aire lateral de cada
              enlace baja a px-3 y el francés, que es el idioma más largo, entra
              con holgura. */}
          <div className="hidden xl:flex items-center gap-0.5">
            {links.map((l) => {
              const active = page === l.page;
              return (
                <PageLink
                  key={l.page}
                  to={l.page}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active ? "text-primary" : "text-primary/70 hover:text-primary",
                  )}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute inset-0 -z-10 bg-secondary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </PageLink>
              );
            })}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleTheme}
              className="h-11 w-11 flex items-center justify-center rounded-full border border-primary/15 text-primary hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <LanguageSwitcher />
            {/* La accion de conversion tiene que estar en la cabecera tambien en
                movil. Estaba sólo a partir de md, asi que en el telefono quedaba
                dos toques dentro del menu mientras el interruptor de tema se
                llevaba el sitio bueno para el pulgar. Aqui no cabe el numero
                entero, asi que debajo de md va el glifo solo, con su etiqueta
                accesible. */}
            <a data-track-loc="header"
              href={`https://wa.me/${t.contact.infoPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden h-11 w-11 inline-flex items-center justify-center rounded-full border-2 border-primary/25 text-primary transition-colors hover:border-accent hover:text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`WhatsApp ${t.contact.infoPhone}`}
            >
              <WhatsAppIcon className="w-5 h-5" />
            </a>
            <a data-track-loc="header"
              href={`https://wa.me/${t.contact.infoPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 btn-outline py-2.5 px-5 text-xs"
              aria-label={`WhatsApp ${t.contact.infoPhone}`}
            >
              <WhatsAppIcon className="w-4 h-4" />
              {t.contact.infoPhone}
            </a>
            <button
              className="xl:hidden h-11 w-11 flex items-center justify-center rounded-full hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {/* `initial={false}`: el glifo del menú se pinta ya visible. Con el
                  montaje animado, el HTML prerenderizado llevaba el botón en
                  `opacity:0` y sin JavaScript no se veía (ver `src/lib/motion.ts`).
                  El giro al abrir y cerrar se mantiene. */}
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden overflow-hidden border-t border-border"
            >
              <div className="py-6 space-y-1">
                {links.map((l, i) => {
                  const active = page === l.page;
                  return (
                    <motion.div
                      key={l.page}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <PageLink
                        to={l.page}
                        className={cn(
                          "flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-colors",
                          active ? "bg-secondary text-primary" : "text-primary/80 hover:bg-secondary/60",
                        )}
                      >
                        {l.label}
                      </PageLink>
                    </motion.div>
                  );
                })}
                <div className="pt-4 space-y-3">
                  <LanguageSwitcher variant="mobile" />
                  <a data-track-loc="header_menu"
                    href={`https://wa.me/${t.contact.infoPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cta w-full inline-flex items-center justify-center gap-2"
                    aria-label={`WhatsApp ${t.contact.infoPhone}`}
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    {t.contact.infoPhone}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};
