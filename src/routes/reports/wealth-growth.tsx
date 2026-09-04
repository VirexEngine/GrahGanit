import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer, FloatingActions } from "@/components/site/Sections";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Coins, Gem, ShieldCheck } from "lucide-react";
import { trackReportViewed } from "@/lib/analytics";

export const Route = createFileRoute("/reports/wealth-growth")({
  component: WealthGrowthReport,
  head: () => ({
    meta: [
      { title: "Wealth & Prosperity Report | GrahGanit" },
      { name: "description", content: "Discover Dhana Yogas, 2nd & 11th house wealth transits, business launching windows, and financial remedies." }
    ],
  }),
});

function WealthGrowthReport() {
  useEffect(() => {
    trackReportViewed({
      report_type: "wealth_growth",
      report_id: "report_wealth_growth",
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-cosmos text-foreground overflow-x-hidden flex flex-col justify-between">
      <Navbar />

      <main className="pt-32 pb-24 px-4 sm:px-6 mx-auto max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold-soft border border-gold/30 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" /> Manifesting Financial Abundance
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-medium text-gradient-cosmic leading-tight mb-6">
            Prosperity &amp; Wealth Yogas
          </h1>
          <p className="text-foreground/70 text-lg leading-relaxed">
            Uncover the celestial indicators of accumulated wealth, asset growth, investment risk windows, and business launches governed by Jupiter and the 2nd/11th Houses.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="rounded-3xl glass-strong p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-display text-white mb-3">Dhana &amp; Lakshmi Yogas</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Examine key wealth-generating combinations in your chart (such as Gaja Kesari or Lakshmi Yogas) to tap into innate prosperity potential.
            </p>
          </div>

          <div className="rounded-3xl glass-strong p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6">
              <Gem className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-display text-white mb-3">Business &amp; Asset Launches</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Identify auspicious Muhurat windows for major investments, property acquisition, business expansion, and financial risk mitigation.
            </p>
          </div>
        </div>

        {/* Deliverables List */}
        <div className="glass-strong p-8 sm:p-12 rounded-3xl border border-gold/30 shadow-2xl mb-16 space-y-6">
          <h3 className="text-2xl font-display text-gradient-gold">What Your Wealth Report Covers:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-foreground/80 font-sans">
            <li className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-gold shrink-0" /> 2nd House Accumulated Assets &amp; Savings</li>
            <li className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-gold shrink-0" /> 11th House Gains, Incomes &amp; Cashflow Yogas</li>
            <li className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-gold shrink-0" /> Jupiter (Guru) Financial Strength Evaluation</li>
            <li className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-gold shrink-0" /> Investment Risk &amp; Speculation Timing Windows</li>
            <li className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-gold shrink-0" /> Business Partnership &amp; Expansion Opportunities</li>
            <li className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-gold shrink-0" /> Kuber &amp; Lakshmi Yantra Spiritual Remedies</li>
          </ul>
        </div>

        {/* CTA Box */}
        <div className="glass-strong p-10 rounded-3xl border border-white/10 text-center space-y-6 bg-gradient-to-b from-purple/10 to-transparent">
          <h3 className="text-3xl font-display text-white">Ready to Activate Your Financial Growth?</h3>
          <p className="text-foreground/70 text-sm max-w-xl mx-auto">
            Book a 1-on-1 Business &amp; Wealth Consultation with Acharyaa Smita Mishra to receive personalized timing for investments and abundance.
          </p>
          <div className="pt-2">
            <Link
              to="/booking"
              search={{ plan: "finance", focus: "Wealth" }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-soft to-amber-500 text-cosmos font-bold text-xs uppercase tracking-widest px-8 py-4 shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all hover:scale-105 cursor-pointer"
            >
              <span>Book Wealth &amp; Business Guidance</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  );
}
