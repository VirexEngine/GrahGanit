import { createFileRoute } from "@tanstack/react-router";
import { StarField } from "@/components/site/StarField";
import { CursorGlow, ScrollProgress } from "@/components/site/Interactive";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { AboutAcharyaaSnippet } from "@/components/site/AboutAcharyaaSnippet";
import { ReportsExplorerSection } from "@/components/site/ReportsExplorerSection";
import { SpiritualSection as WhyChooseUsSection, Testimonials, ContactSection, Footer, FloatingActions } from "@/components/site/Sections";
import { LatestArticles } from "@/components/site/LatestArticles";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: 'GrahGanit — Precision Vedic Planetary Mathematics, Kundali & Astrology' },
      { name: 'description', content: 'Discover your cosmic blueprint with GrahGanit (ग्रह गणित). Swiss-ephemeris Vedic Kundali, Planetary Mathematics, Numerology & Palmistry — calculated with precision.' },
    ],
  }),
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Global celestial backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 starfield opacity-60" />
        <StarField density={120} />
      </div>

      <ScrollProgress />
      <CursorGlow />
      <Navbar />

      <main className="relative">
        <Hero />
        <ReportsExplorerSection />
        <WhyChooseUsSection />
        <AboutAcharyaaSnippet />
        <LatestArticles />
        <Testimonials />
      </main>

      <Footer />
      <FloatingActions />
    </div>
  );
}

