import { createFileRoute } from '@tanstack/react-router';
import { Navbar } from '@/components/site/Navbar';
import { Footer, FloatingActions } from '@/components/site/Sections';
import { Scale, BookOpen, AlertCircle, Calendar, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/terms-of-service')({
  component: TermsOfServiceComponent,
  head: () => ({
    meta: [
      { title: 'Terms of Service | GrahGanit (ग्रह गणित)' },
      {
        name: 'description',
        content: 'Read the terms of service governing the use of GrahGanit Vedic Kundali engines, consultations, and planetary calculation tools.',
      },
    ],
  }),
});

function TermsOfServiceComponent() {
  const lastUpdated = "August 6, 2026";

  return (
    <div className="relative min-h-screen bg-cosmos text-foreground overflow-x-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 relative z-10 pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Ambient background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Page Header */}
        <div className="text-center mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono mb-4">
            <Scale className="w-3.5 h-3.5" />
            Terms & Conditions of Service
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-medium text-gradient-gold mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-foreground/60 font-mono">
            GrahGanit (ग्रह गणित) · Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-strong rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 text-sm leading-relaxed text-foreground/80"
        >
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gold-soft shrink-0" />
              1. Acceptance of Terms
            </h2>
            <p>
              Welcome to <strong>GrahGanit (ग्रह गणित)</strong>. By accessing or using our website, free Kundali tools, numerology calculators, palmistry guides, or booking consultations with our team, you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gold-soft shrink-0" />
              2. Nature of Astrological Guidance & Disclaimer
            </h2>
            <p>
              GrahGanit provides authentic Vedic astrology calculations based on planetary astronomical ephemerides (Swiss Ephemeris), traditional Sidereal Lahiri Ayanamsha, and centuries-old mathematical formulas.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-foreground/70 pl-2">
              <li>Astrological readings, Kundali interpretations, and daily horoscopes are provided for personal insight, spiritual reflection, and educational self-awareness.</li>
              <li>Astrological guidance should never replace professional medical, legal, financial, or psychological advice. Always consult certified professionals for critical legal or medical decisions.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-soft shrink-0" />
              3. User Accounts & Accuracy of Birth Data
            </h2>
            <p>
              When creating an account or calculating a Kundali on GrahGanit:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-foreground/70 pl-2">
              <li>You are responsible for providing accurate birth details (Date, Exact Time, and City/Coordinates). Mathematical planetary positions are highly sensitive to time precision.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-soft shrink-0" />
              4. Consultations, Bookings & Cancellation Policy
            </h2>
            <p>
              For 1-on-1 consultations with Acharyaa Smita Mishra / GrahGanit expert astrologers:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-foreground/70 pl-2">
              <li><strong className="text-white">Rescheduling:</strong> Sessions may be rescheduled up to 24 hours prior to the scheduled time slot without penalty.</li>
              <li><strong className="text-white">Cancellations:</strong> Full refunds are available if requested at least 48 hours prior to the session. Cancellations within 24 hours may incur a partial processing fee due to reserved schedule slots.</li>
              <li><strong className="text-white">Session Conduct:</strong> Both seekers and astrologers are expected to maintain respect and dignity during consultations.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <Scale className="w-5 h-5 text-gold-soft shrink-0" />
              5. Intellectual Property
            </h2>
            <p>
              All content on GrahGanit — including report calculation algorithms, website UI design, Vedic artwork, logos, and written articles — is the exclusive intellectual property of GrahGanit (ग्रह गणित). Unattributed copying, scraping, or commercial redistribution is strictly prohibited.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <Mail className="w-5 h-5 text-gold-soft shrink-0" />
              6. Contact Information
            </h2>
            <p>
              If you have any questions or feedback regarding these Terms of Service, please reach out to our team:
            </p>
            <div className="pt-2 text-xs font-mono space-y-1 text-gold-soft bg-white/3 p-4 rounded-2xl border border-white/10">
              <p className="flex items-center gap-2">📞 <span>+91 98998 18720</span></p>
              <p className="flex items-center gap-2">✉️ <span>grahganit2026@gmail.com</span></p>
              <p className="flex items-center gap-2">📍 <span>167B, Second Floor, Gaur City Center, Greater Noida West, Uttar Pradesh, India</span></p>
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  );
}
