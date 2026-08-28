import { createFileRoute } from '@tanstack/react-router';
import { Navbar } from '@/components/site/Navbar';
import { Footer, FloatingActions } from '@/components/site/Sections';
import { Shield, Lock, Eye, FileText, CheckCircle2, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicyComponent,
  head: () => ({
    meta: [
      { title: 'Privacy Policy | GrahGanit (ग्रह गणित)' },
      {
        name: 'description',
        content: 'Learn how GrahGanit protects your personal birth details, Kundali records, and cosmic privacy with 256-bit encryption.',
      },
    ],
  }),
});

function PrivacyPolicyComponent() {
  const lastUpdated = "August 6, 2026";

  return (
    <div className="relative min-h-screen bg-cosmos text-foreground overflow-x-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 relative z-10 pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Ambient background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple/10 rounded-full blur-3xl pointer-events-none" />

        {/* Page Header */}
        <div className="text-center mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono mb-4">
            <Shield className="w-3.5 h-3.5" />
            Sacred Data Privacy & Security
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-medium text-gradient-gold mb-3">
            Privacy Policy
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
              <Lock className="w-5 h-5 text-gold-soft shrink-0" />
              1. Information We Collect
            </h2>
            <p>
              At GrahGanit, we respect your privacy and the sanctity of your birth chart data. To calculate precision Vedic Kundalis, planetary ephemerides, and numerology matrices, we collect the following information provided directly by you:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-foreground/70 pl-2">
              <li><strong className="text-white">Birth Details:</strong> Date of birth, exact time of birth, and place of birth (city/country).</li>
              <li><strong className="text-white">Account Information:</strong> Name, email address, phone number, and password when creating an account.</li>
              <li><strong className="text-white">Consultation Requests:</strong> Specific questions or notes submitted when booking personalized astrological guidance.</li>
              <li><strong className="text-white">Payment Processing:</strong> Encrypted transaction reference IDs processed securely via official payment partners (we do not store raw card numbers).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <Eye className="w-5 h-5 text-gold-soft shrink-0" />
              2. How We Use Your Cosmic Data
            </h2>
            <p>
              Your birth coordinates are utilized strictly for astronomical and mathematical computations. Specifically, we use your data to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-foreground/70 pl-2">
              <li>Compute planetary degrees, Moon signs, Ascendants (Lagna), Nakshatras, and Dasha periods using Swiss-Ephemeris algorithms.</li>
              <li>Generate authentic Vedic Kundali reports, compatibility charts, and numerology breakdowns.</li>
              <li>Facilitate 1-on-1 consultations with Acharyaa Smita Mishra and our expert astrological panel.</li>
              <li>Send critical account updates, booking confirmations, and daily forecast notifications (which you may opt out of at any time).</li>
            </ul>
            <div className="p-4 rounded-2xl bg-gold/5 border border-gold/20 text-xs text-gold-soft flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <span>
                <strong>Zero Data Monetization Guarantee:</strong> We do NOT sell, rent, or trade your personal birth details or chart records to third-party advertisers or data brokers.
              </span>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold-soft shrink-0" />
              3. Data Protection & Encryption
            </h2>
            <p>
              We implement industry-standard technical and organizational security measures to protect your personal data against unauthorized access, loss, or alteration:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-foreground/70 pl-2">
              <li>256-bit SSL/TLS encryption for all data transmitted between your browser and GrahGanit servers.</li>
              <li>Secure hashed storage for account passwords and authentication tokens.</li>
              <li>Strict internal access controls ensuring only authorized system engines process your chart calculations.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-soft shrink-0" />
              4. Cookies & Session Storage
            </h2>
            <p>
              GrahGanit uses local session cookies and browser storage strictly to maintain user sessions, remember language/theme preferences, and cache your birth chart for fast reloading across pages. You can control or clear cookies at any time through your browser settings.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-soft shrink-0" />
              5. Your Privacy Rights
            </h2>
            <p>
              You maintain full ownership of your personal data. At any time, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-foreground/70 pl-2">
              <li>Access, update, or edit your saved birth details in your profile settings.</li>
              <li>Request the complete deletion of your account and stored Kundali history.</li>
              <li>Unsubscribe from promotional emails or daily cosmic updates.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-display text-gold flex items-center gap-2">
              <Mail className="w-5 h-5 text-gold-soft shrink-0" />
              6. Contact Us Regarding Privacy
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please write to us at:
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
