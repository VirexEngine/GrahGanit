import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { X, Sparkles, Star, Award, BookOpen, Heart, ArrowRight } from "lucide-react";

export function AboutAcharyaaSnippet() {
  const [showStory, setShowStory] = useState(false);

  return (
    <section className="relative py-28 z-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden glass-strong p-2 shadow-2xl border border-gold/30">
              <div className="w-full h-full rounded-[1.5rem] bg-black/40 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <img
                  src="/images/AcharyaaSmitaMishra.jpg"
                  alt="Acharyaa Smita Mishra"
                  className="object-cover object-top w-full h-full z-0 hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            
            {/* Experience Badge */}
            <div className="absolute -bottom-8 -right-8 glass-strong rounded-2xl p-6 border border-gold/30 shadow-2xl hidden md:block">
              <div className="text-4xl font-display text-gradient-gold mb-1">15+</div>
              <div className="text-xs font-mono tracking-wider text-white/80 uppercase">Years of<br/>Vedic Wisdom</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-start"
          >
            <span className="text-gold tracking-[0.25em] text-xs font-mono font-semibold uppercase mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Meet Acharyaa Smita Mishra
            </span>
            <h2 className="text-4xl md:text-5xl font-display mb-6 leading-tight text-white">
              Transforming lives through <span className="text-gradient-gold">Vedic Wisdom</span>
            </h2>
            <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-6 font-sans">
              With over 15+ years of dedicated practice in Vedic Astrology, Kundli Analysis, Numerology, and Vastu Shastra, Acharyaa Smita Mishra has guided thousands of souls towards clarity, prosperity, and peace.
            </p>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10 font-sans">
              Her approach combines ancient spiritual sciences with profound psychological understanding, offering practical remedies that create tangible shifts in your life's trajectory.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => setShowStory(true)}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-royal via-purple to-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all hover:scale-105 cursor-pointer"
              >
                Read Her Full Story ✦
              </button>
              <Link
                to="/booking"
                className="inline-flex items-center justify-center rounded-full glass-strong border border-white/20 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:border-gold/50 hover:text-gold cursor-pointer"
              >
                Book Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── ACHARYAA SMITA MISHRA FULL STORY MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {showStory && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl glass-strong rounded-3xl p-6 sm:p-10 border border-gold/40 shadow-[0_0_80px_rgba(245,158,11,0.25)] relative my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowStory(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-gold/20 text-white hover:text-gold flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-white/10 pb-6 mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-gold/50 overflow-hidden shrink-0 shadow-xl">
                  <img
                    src="/images/AcharyaaSmitaMishra.jpg"
                    alt="Acharyaa Smita Mishra"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gold-soft uppercase tracking-widest block mb-1">
                    ✦ Vedic Master &amp; Astrological Scholar
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-medium text-gradient-gold">
                    Acharyaa Smita Mishra
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/70 font-mono">
                    <span className="flex items-center gap-1 text-gold"><Award className="w-3.5 h-3.5" /> 20+ Years Practice</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gold"><Star className="w-3.5 h-3.5 fill-gold" /> 12,000+ Consultations</span>
                    <span>•</span>
                    <span>Greater Noida West, India</span>
                  </div>
                </div>
              </div>

              {/* Full Story Content */}
              <div className="space-y-6 text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
                <div>
                  <h4 className="text-base font-display font-medium text-white mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gold" /> Roots in Sacred Tradition &amp; Vedic Science
                  </h4>
                  <p>
                    Acharyaa Smita Mishra's journey into Vedic Astrology began over two decades ago. Raised with a deep reverence for classical scriptures, she immersed herself in authentic texts—including <em>Brihat Parashara Hora Shastra</em>, <em>Jaimini Sutras</em>, and <em>Saravali</em>—learning under revered traditional masters in Varanasi.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-display font-medium text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" /> Planetary Mathematics (ग्रह गणित)
                  </h4>
                  <p>
                    Acharyaa Smita Mishra firmly believes that astrology is not fatalism or guesswork; it is <strong>GrahGanit (ग्रह गणित)</strong>—the precise mathematical science of planetary motion applied to human consciousness. By examining exact degrees, dasha timings, and planetary transits, she illuminates a seeker's path with scientific clarity.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-display font-medium text-white mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gold" /> Empathetic Guidance &amp; Practical Remedies
                  </h4>
                  <p>
                    Over her 20+ years of practice, Acharyaa Smita Mishra has counseled seekers across 42+ countries through life crossroads—ranging from executive career decisions and business timing to matrimonial compatibility and karmic remedies. Her consultations combine deep spiritual insight with empathetic, actionable advice.
                  </p>
                </div>

                {/* Quote Box */}
                <div className="p-4 rounded-2xl bg-gold/10 border border-gold/30 italic text-gold-soft text-xs leading-relaxed">
                  "Your natal Kundali is not a script of rigid fate, but a celestial map of divine potential — a sacred mirror guiding your soul's highest purpose."
                  <span className="block font-mono text-[10px] uppercase text-white/50 not-italic mt-2">
                    — Acharyaa Smita Mishra · Founder of GrahGanit
                  </span>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => setShowStory(false)}
                  className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  Close Story Window
                </button>

                <Link
                  to="/booking"
                  onClick={() => setShowStory(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gold text-cosmos font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg cursor-pointer"
                >
                  <span>Book Consultation With Acharyaa Smita Mishra</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
