import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { lazy, Suspense, ComponentType } from "react";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/theme/ThemeContext";
import { PageKey, pathFor } from "@/i18n/routes";
import type { Lang } from "@/i18n/translations";
import { ScrollToTop } from "./components/ScrollToTop";
import { usePageviews } from "@/lib/analytics";
import { usePageMeta } from "@/lib/pageMeta";
import Index from "./pages/Index";

// Internal pages are code-split so the landing (home) ships a lean initial bundle.
const Programs = lazy(() => import("./pages/Programs"));
const About = lazy(() => import("./pages/About"));
const Registration = lazy(() => import("./pages/Registration"));
const Careers = lazy(() => import("./pages/Careers"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Cookies = lazy(() => import("./pages/Cookies"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PAGES: Record<PageKey, ComponentType> = {
  home: Index,
  programs: Programs,
  about: About,
  registration: Registration,
  careers: Careers,
  contact: Contact,
  privacy: Privacy,
  cookies: Cookies,
  legal: LegalNotice,
};

const LANGS: Lang[] = ["en", "es", "fr"];

const RouteFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin motion-reduce:animate-none" />
  </div>
);

const queryClient = new QueryClient();

// Per-route side effects. Must live inside <BrowserRouter> and <LanguageProvider>.
const RouteEffects = () => {
  usePageviews();
  usePageMeta();
  return null;
};

const App = () => (
  <MotionConfig reducedMotion="user">
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LanguageProvider>
              <ScrollToTop />
              <RouteEffects />
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* One route per page and language, generated from the map in
                      i18n/routes.ts. Add a page there, not here. */}
                  {LANGS.flatMap((lang) =>
                    (Object.keys(PAGES) as PageKey[]).map((key) => {
                      const Page = PAGES[key];
                      return <Route key={`${lang}-${key}`} path={pathFor(key, lang)} element={<Page />} />;
                    }),
                  )}
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </LanguageProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </MotionConfig>
);

export default App;
