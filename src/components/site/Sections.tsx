import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Send, MessageCircle, Music2, Volume2, VolumeX, Sparkles, MessageSquarePlus, CheckCircle, Star } from "lucide-react";
import { SectionHeader } from "./AstrologySection";

export function AboutSection() {
  const timeline = [
    { y: "3000 BCE", t: "Vedic astronomy", d: "Rishis map planetary motion & their symbolic meanings." },
    { y: "500 BCE", t: "Pythagorean numerology", d: "Number-mysticism finds a rigorous structure." },
    { y: "1st C. CE", t: "Classical astrology", d: "Ptolemy's Tetrabiblos codifies chart interpretation." },
    { y: "Today", t: "GrahGanit", d: "Traditional systems rendered with modern precision." },
  ];
  const founders = [
    { name: "Aisha Rao", role: "Founder & Astro-tech" },
    { name: "Kenji Okafor", role: "Numerology researcher" },
    { name: "Ilaria Vasquez", role: "Design & product" },
  ];
  return (
    <section id="about" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader eyebrow="About us" title="Ancient traditions, modern calculations" sub="We treat numerology and astrology as structured symbolic systems — presented with clarity, care and craft." />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[
            { k: "120k+", v: "Charts generated" },
            { k: "42", v: "Countries served" },
            { k: "9", v: "Wisdom traditions" },
            { k: "4.9★", v: "Seeker rating" },
          ].map((s) => (
            <motion.div key={s.v} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6 text-center">
              <div className="font-display text-4xl text-gradient-gold">{s.k}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-foreground/60">{s.v}</div>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-14 relative">
          <div className="absolute left-4 md:left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
          <div className="space-y-8">
            {timeline.map((t, i) => (
              <motion.div
                key={t.y}
                initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                className={`relative grid grid-cols-[auto_1fr] md:grid-cols-2 gap-6 items-center ${i % 2 ? "md:[direction:rtl]" : ""}`}
              >
                <div className="md:[direction:ltr] flex items-center gap-4">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold to-royal glow-gold text-xs font-bold text-cosmos">{i + 1}</div>
                </div>
                <div className="md:[direction:ltr] glass rounded-2xl p-5">
                  <div className="text-xs uppercase tracking-widest text-gold-soft">{t.y}</div>
                  <div className="mt-1 font-display text-xl">{t.t}</div>
                  <p className="mt-1 text-sm text-foreground/70">{t.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mission / Vision */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { t: "Our mission", d: "To render ancient interpretive systems in a form that respects tradition and rewards curiosity." },
            { t: "Our vision", d: "A world where symbolic thinking sits comfortably alongside modern calculation." },
          ].map((c) => (
            <motion.div key={c.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-strong rounded-3xl p-8">
              <div className="text-xs uppercase tracking-widest text-gold-soft">{c.t}</div>
              <p className="mt-3 text-lg text-foreground/85">{c.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SpiritualSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "-20%", opacity: [0, 1, 0] }}
            transition={{ duration: 14 + (i % 5) * 2, delay: i * 0.8, repeat: Infinity, ease: "linear" }}
            className="absolute text-2xl"
            style={{ color: "#F0ABFC", filter: "drop-shadow(0 0 8px #F0ABFC)" }}
          >
            ✿
          </motion.div>
        ))}
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative mx-auto mb-8 h-40 w-40"
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.80_0.16_82/0.45),transparent_70%)] blur-2xl" />
          <img 
            src="/images/GaneshJi.jpeg" 
            alt="Lord Ganesha" 
            className="relative h-full w-full object-cover rounded-full drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -right-2 top-2 h-3 w-3 rounded-full bg-gold"
            style={{ boxShadow: "0 0 20px var(--gold)" }}
          />
        </motion.div>
        <h2 className="font-display text-4xl sm:text-5xl text-gradient-cosmic">Begin every journey with wisdom</h2>
        <p className="mt-4 text-foreground/70 max-w-2xl mx-auto">A quiet moment of reverence before we begin — to remove obstacles from the road ahead, and to steady the mind for the path within.</p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-soft">🔔 <span>Om Ganeshaya Namah</span> 🔔</div>
      </div>
    </section>
  );
}

const DEFAULT_TESTIMONIALS = [
  { id: 1, name: "Aarav Sharma", zodiac_sign: "Cancer Moon", rating: 5, category: "Kundali Reading", comment: "The Kundali reading felt deeply considered and beautifully rendered. It's rare to see this much care and precision in a modern astrology application." },
  { id: 2, name: "Meera Patel", zodiac_sign: "Libra Ascendant", rating: 5, category: "Numerology", comment: "Numerology finally clicked for me. The charts, calculators, and detailed breakdowns are a stroke of genius. Highly recommended!" },
  { id: 3, name: "Vikram Malhotra", zodiac_sign: "Scorpio Sun", rating: 5, category: "Astrology Consultation", comment: "GrahGanit reads like a love letter to ancient Vedic traditions — built with the clean polish and responsiveness of a top-tier modern product." },
  { id: 4, name: "Sarah Jenkins", zodiac_sign: "Taurus Moon", rating: 5, category: "Kundali Reading", comment: "I was blown away by the accuracy and the aesthetics of the birth chart explorer. It's both a tool for reflection and a work of art." },
  { id: 5, name: "Rajesh Kumar", zodiac_sign: "Leo Lagna", rating: 5, category: "Daily Horoscope", comment: "The consultation and daily horoscopes have become a vital part of my morning routine. Accurate calculations and thoughtful guidance." }
];

export function Testimonials() {
  const [items, setItems] = useState<any[]>(DEFAULT_TESTIMONIALS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [zodiac, setZodiac] = useState('Cancer Moon');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Kundali Reading');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/articles/testimonials/list')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/articles/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          zodiac_sign: zodiac,
          rating,
          category,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newReview = data.testimonial || {
          id: Date.now(),
          name: name.trim(),
          zodiac_sign: zodiac,
          rating,
          category,
          comment: comment.trim(),
          is_new: true
        };

        setItems((prev) => [newReview, ...prev]);
        setActiveIdx(0);
        setSubmittedSuccess(true);
        setName('');
        setComment('');

        setTimeout(() => {
          setSubmittedSuccess(false);
          setShowForm(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Submit testimonial error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentItem = items[activeIdx] || DEFAULT_TESTIMONIALS[0];

  return (
    <section id="testimonials" className="relative py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[radial-gradient(circle,oklch(0.52_0.24_295/0.1),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-gold-soft uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span>What Seekers Say</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-gradient-cosmic">Sacred Experiences &amp; Reviews</h2>
            <p className="mt-2 text-foreground/70 max-w-xl text-sm">
              Real stories of clarity, cosmic direction, and spiritual transformation from seekers around the globe.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gold/15 border border-gold/40 hover:bg-gold/25 text-gold font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)] shrink-0 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-gold" />
            <span>{showForm ? 'Close Form' : 'Share Your Experience'}</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="mb-14 overflow-hidden"
            >
              <div className="glass-strong rounded-3xl p-8 sm:p-10 border border-gold/30 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div>
                    <h3 className="font-display text-xl text-white">Post Your Seeker Testimonial</h3>
                    <p className="text-xs text-white/60">Your review will be highlighted live on GrahGanit</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gold/10 text-gold font-mono text-[10px] uppercase border border-gold/30">
                    Verified Seeker Submission
                  </span>
                </div>

                {submittedSuccess ? (
                  <div className="py-12 text-center space-y-3">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="font-display text-2xl text-white">Thank You for Sharing!</h4>
                    <p className="text-xs sm:text-sm text-emerald-300 font-mono max-w-lg mx-auto leading-relaxed">
                      Your review has been submitted for moderation. It will be verified by Acharyaa Smita Mishra and published live on GrahGanit once approved!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-gold-soft mb-2">Your Name</label>
                        <input
                          required
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Elena Rostova"
                          className="w-full rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-foreground outline-none border border-white/15 focus:border-gold/60 focus:ring-1 ring-gold/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-gold-soft mb-2">Zodiac Sign / Lagna</label>
                        <select
                          value={zodiac}
                          onChange={(e) => setZodiac(e.target.value)}
                          className="w-full rounded-2xl bg-[#101126] px-4 py-3 text-sm text-foreground outline-none border border-white/15 focus:border-gold/60 cursor-pointer"
                        >
                          {["Cancer Moon", "Libra Ascendant", "Scorpio Sun", "Aries Lagna", "Taurus Moon", "Gemini Ascendant", "Leo Sun", "Virgo Moon", "Sagittarius Sun", "Capricorn Moon", "Aquarius Ascendant", "Pisces Moon"].map((z) => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-gold-soft mb-2">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-2xl bg-[#101126] px-4 py-3 text-sm text-foreground outline-none border border-white/15 focus:border-gold/60 cursor-pointer"
                        >
                          {["Kundali Reading", "Numerology", "Daily Horoscope", "Palmistry Analysis", "Astrology Consultation"].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-gold-soft mb-2">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-125"
                          >
                            <Star className={`w-6 h-6 ${star <= rating ? "text-gold fill-gold drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" : "text-white/20"}`} />
                          </button>
                        ))}
                        <span className="text-xs font-mono text-gold ml-2">{rating} / 5 Stars</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-gold-soft mb-2">Your Experience Comment</label>
                      <textarea
                        required
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Describe how GrahGanit's calculations or consultation illuminated your path..."
                        className="w-full rounded-2xl bg-white/[0.05] p-4 text-sm text-foreground outline-none border border-white/15 focus:border-gold/60 resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3.5 rounded-full bg-gradient-to-r from-gold via-gold-soft to-amber-500 text-cosmos font-semibold text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit for Moderation ✦'}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-strong mx-auto max-w-4xl rounded-3xl p-8 sm:p-12 text-center border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold font-mono text-[10px] uppercase tracking-widest mb-6">
                <span>✦ {currentItem.category || 'Vedic Experience'}</span>
              </div>

              <div className="flex justify-center gap-1.5 mb-6">
                {[...Array(currentItem.rating || 5)].map((_, sIdx) => (
                  <Star key={sIdx} className="w-5 h-5 text-gold fill-gold drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                ))}
              </div>

              <blockquote className="font-display text-2xl sm:text-3xl text-foreground/95 leading-relaxed font-light italic">
                "{currentItem.comment}"
              </blockquote>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <span className="font-display text-base text-white font-medium">{currentItem.name}</span>
                <span className="hidden sm:inline text-white/30">•</span>
                <span className="text-xs font-mono text-gold-soft uppercase tracking-wider">{currentItem.zodiac_sign}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-center items-center gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === activeIdx ? "w-8 bg-gold shadow-[0_0_12px_var(--gold)]" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return null;
}

// ─── Social Media SVG Icons ───────────────────────────────────────────────────
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 pt-16 pb-10 overflow-hidden">
      <div className="absolute inset-0 starfield opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="GrahGanit Logo" className="h-10 w-10 object-cover rounded-full border border-gold/40 shadow-md" />
              <div className="font-display text-2xl">Grah<span className="text-gradient-gold">Ganit</span></div>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">
              A premium home for astrology, numerology, palmistry &amp; Vedic Kundali — calculated with planetary mathematical precision (ग्रह गणित).
            </p>
            <div className="pt-2 text-xs text-gold-soft font-mono space-y-1">
              <p>📍 167B, Second Floor, Gaur City Center Greater Noida West</p>
              <p>📞 <a href="tel:+919899818720" className="hover:underline">+91 98998 18720</a></p>
              <p>✉️ <a href="mailto:grahganit2026@gmail.com" className="hover:underline">grahganit2026@gmail.com</a></p>
            </div>
          </div>
          {[
            { t: "Explore", l: [{ name: "Astrology", href: "/free-tools/kundli" }, { name: "Numerology", href: "/free-tools/numerology" }, { name: "Palmistry", href: "/free-tools/palmistry" }, { name: "Daily Horoscope", href: "/horoscopes/daily" }] },
            { t: "Company", l: [{ name: "About GrahGanit", href: "/about" }, { name: "Consultations", href: "/booking" }, { name: "Cosmic Journal", href: "/blog" }] },
            { t: "Support", l: [{ name: "Contact Us", href: "/contact" }, { name: "Privacy Policy", href: "/privacy-policy" }, { name: "Terms of Service", href: "/terms-of-service" }] },
          ].map((col) => (
            <div key={col.t}>
              <div className="text-xs uppercase tracking-widest text-gold-soft">{col.t}</div>
              <ul className="mt-3 space-y-2">
                {col.l.map((x) => (
                  <li key={x.name}>
                    <a href={x.href} className="text-sm text-foreground/70 hover:text-gold transition">{x.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links Row */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/40 font-mono uppercase tracking-wider mr-1">Follow GrahGanit:</span>
            <a
              href="https://www.instagram.com/grahganit/"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow GrahGanit on Instagram"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-white/70 hover:text-white border border-white/10 hover:border-transparent transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 group"
            >
              <InstagramIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
            </a>
            <a
              href="http://www.youtube.com/@GrahGanit"
              target="_blank"
              rel="noopener noreferrer"
              title="Subscribe to GrahGanit on YouTube"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-red-600 text-white/70 hover:text-white border border-white/10 hover:border-transparent transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 group"
            >
              <YoutubeIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61592298186880&sk=about"
              target="_blank"
              rel="noopener noreferrer"
              title="Connect with GrahGanit on Facebook"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-blue-600 text-white/70 hover:text-white border border-white/10 hover:border-transparent transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 group"
            >
              <FacebookIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-foreground/50">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span>Reading tonight's sky…</span>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-foreground/40 font-mono">
          © {new Date().getFullYear()} GrahGanit (ग्रह गणित). Written in the stars.
        </div>
      </div>
    </footer>
  );
}

export function FloatingActions() {
  return null;
}
