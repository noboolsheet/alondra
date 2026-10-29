import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { GoogleReviews } from "@/components/GoogleReviews";
import { Pedagogy } from "@/components/Pedagogy";
import { InstrumentsGrid } from "@/components/InstrumentsGrid";
import { Formats } from "@/components/Formats";
import { StepUp } from "@/components/StepUp";
import { TeachersGrid } from "@/components/TeachersGrid";
import { CoverageMap } from "@/components/CoverageMap";
import { FAQ } from "@/components/FAQ";
import { CTABanner } from "@/components/CTABanner";

const Index = () => {
  return (
    <Layout>
      <Hero />

      <Stats />

      <GoogleReviews />
      <Pedagogy />
      <InstrumentsGrid />
      <Formats />
      <StepUp />
      <TeachersGrid />
      <CoverageMap />
      <FAQ />
      <CTABanner />
    </Layout>
  );
};

export default Index;
