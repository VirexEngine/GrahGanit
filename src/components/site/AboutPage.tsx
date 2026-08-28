import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Star, ChevronDown, ArrowRight, Sparkles, Zap,
  Globe, Users, Award, Clock, CheckCircle, Quote
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Testimonials } from "./Sections";

// ─── Stagger container variants ─────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as any } },
};

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="text-center"
    >
      <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold-soft mb-4">
        <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
      </motion.div>
      <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight text-gradient-cosmic">
        {title}
      </motion.h2>
      {sub && (
        <motion.p variants={fadeUp} className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70 leading-relaxed">
          {sub}
        </motion.p>
      )}
    </motion.div>
  );
}

// ─── 1. Hero Section ─────────────────────────────────────────────────────────
function AboutHero() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date())
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const AVATARS = [
    { initials: "AS", color: "from-violet-500 to-purple-700" },
    { initials: "KO", color: "from-amber-400 to-orange-600" },
    { initials: "IV", color: "from-rose-500 to-pink-700" },
    { initials: "MR", color: "from-blue-400 to-indigo-600" },
    { initials: "PL", color: "from-emerald-400 to-teal-600" },
  ];

  return (
    <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 overflow-hidden">
      {/* Cosmic background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,oklch(0.52_0.24_295/0.25),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,oklch(0.80_0.16_82/0.18),transparent_70%)] blur-3xl" />
        {/* Floating constellation dots */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2 + (i % 4), delay: i * 0.3, repeat: Infinity }}
            className="absolute rounded-full bg-white"
            style={{
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              top: `${10 + (i * 17) % 80}%`,
              left: `${5 + (i * 13) % 90}%`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Live local time badge */}
        {time && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-foreground/60 mb-6"
          >
            <Clock className="h-3 w-3 text-gold" />
            <span>India Standard Time · </span>
            <span className="font-mono text-gold">{time}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold-soft mb-6"
        >
          <Sparkles className="h-3.5 w-3.5" /> Our Story
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-gradient-cosmic"
        >
          Where Stars Meet{" "}
          <br className="hidden sm:block" />
          Sacred Numbers
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-foreground/70 leading-relaxed"
        >
          GrahGanit (ग्रह गणित) was born from a quiet reverence — a belief that the ancient languages of the cosmos, when rendered with modern precision, can illuminate the path within.
        </motion.p>

        {/* Avatar cluster + rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex">
              {AVATARS.map((av, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
                  className={`relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${av.color} text-white text-xs font-bold ring-2 ring-cosmos`}
                  style={{ marginLeft: i === 0 ? 0 : -12, zIndex: AVATARS.length - i }}
                >
                  {av.initials}
                </motion.div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-sm font-semibold text-foreground/90">5.0</span>
              </div>
              <div className="text-xs text-gold-soft font-mono">Authentic Sidereal Vedic Ephemeris</div>
            </div>
          </div>

          <div className="h-px sm:h-10 w-full sm:w-px bg-white/10" />

          <Link
            to="/booking"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-royal via-royal-soft to-gold px-7 py-3 text-sm font-medium text-white shadow-lg shadow-royal/30 hover:scale-105 transition-transform duration-300"
          >
            Book a Reading <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 2. Client Logo Marquee ───────────────────────────────────────────────────
const CLIENTS = [
  { name: "VedicStar", symbol: "☽" },
  { name: "NakshatraLab", symbol: "✦" },
  { name: "AstroMatrix", symbol: "♄" },
  { name: "CosmicMind", symbol: "☿" },
  { name: "ZenithFocus", symbol: "♃" },
  { name: "SolsticeAI", symbol: "☀" },
  { name: "LunarPath", symbol: "🌙" },
  { name: "KarmaWorks", symbol: "♆" },
  { name: "RasiTech", symbol: "⊕" },
  { name: "PlanetSync", symbol: "♀" },
];

function ClientMarquee() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cosmos via-transparent to-cosmos z-10 pointer-events-none" />
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">Trusted across the cosmos</p>
      </div>
      <div className="relative overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          className="flex gap-0 w-max group"
          style={{ willChange: "transform" }}
          whileHover={{ animationPlayState: "paused" } as never}
        >
          {[...CLIENTS, ...CLIENTS].map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 mx-6 glass rounded-2xl px-6 py-3 whitespace-nowrap cursor-default hover:border-gold/40 transition-colors duration-300"
            >
              <span className="text-gold text-xl">{c.symbol}</span>
              <span className="text-sm font-medium text-foreground/70">{c.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── 3. Mission Stats (Odometer counter) ─────────────────────────────────────
function CounterNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 15 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionVal.set(target);
    }
  }, [isInView, target, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <span ref={ref} className="font-display text-5xl md:text-6xl text-gradient-gold tabular-nums">
      {display}{suffix}
    </span>
  );
}

const STATS = [
  { val: "100%", label: "Sidereal Vedic Precision", icon: <Globe className="h-5 w-5" />, n: "01" },
  { val: "27", label: "Nakshatras Mapped", icon: <Zap className="h-5 w-5" />, n: "02" },
  { val: "15+", label: "Years of Vedic Wisdom", icon: <Award className="h-5 w-5" />, n: "03" },
  { val: "100%", label: "Private & Confidential", icon: <Users className="h-5 w-5" />, n: "04" },
];

function MissionStats() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Astronomical Pillars"
          title="Our Cosmic Foundations"
          sub="Every chart cast, every transit rendered — grounded in true sidereal astronomical precision."
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STATS.map((s) => (
            <motion.div
              key={s.n}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-strong rounded-3xl p-8 text-center group relative overflow-hidden cursor-default border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-royal/5 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 left-4 text-xs font-mono text-foreground/20">{s.n}</div>
              <div className="relative flex flex-col items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-royal/30 to-gold/30 text-gold">
                  {s.icon}
                </div>
                <span className="font-display text-4xl md:text-5xl text-gradient-gold font-bold">
                  {s.val}
                </span>
                <div className="text-xs uppercase tracking-widest text-foreground/70 font-mono mt-1">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── 4. Process Steps (Accordion) ────────────────────────────────────────────
const PROCESS = [
  {
    n: "01", title: "Celestial Mapping",
    desc: "We begin by precisely calculating your natal chart using Vedic or Western sidereal coordinates — placing every planet in its exact position at the moment of your birth.",
    icon: "☽",
  },
  {
    n: "02", title: "Symbolic Structure",
    desc: "Raw positions are interpreted through the lens of traditional symbolic systems — houses, aspects, doshas, and numerological cores are layered into a coherent reading.",
    icon: "✦",
  },
  {
    n: "03", title: "Holistic Design",
    desc: "We craft each report as a beautiful artifact — not a wall of text, but an experience. Diagrams, insight cards, and poetic language bridge tradition and clarity.",
    icon: "⊕",
  },
  {
    n: "04", title: "Living Dialogue",
    desc: "Your cosmic blueprint isn't static. Seasonal transits, monthly updates, and personalized guidance ensure the reading evolves as you do.",
    icon: "♃",
  },
];

function ProcessAccordion() {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="How we work"
          title="The GrahGanit Process"
          sub="Four steps from your birth moment to cosmic clarity."
        />
        <div className="mt-16 space-y-3">
          {PROCESS.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass rounded-3xl overflow-hidden border transition-colors duration-300 ${active === i ? "border-gold/40" : "border-white/5"}`}
            >
              <button
                onClick={() => setActive(active === i ? null : i)}
                className="flex w-full items-center gap-5 p-6 text-left group"
              >
                <span className="text-2xl shrink-0">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-gold/60 mb-1">{p.n}</div>
                  <div className="font-display text-xl group-hover:text-gradient-gold transition-all">{p.title}</div>
                </div>
                <motion.div
                  animate={{ rotate: active === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className={`shrink-0 grid h-8 w-8 place-items-center rounded-full transition-colors ${active === i ? "bg-gold/20 text-gold" : "bg-white/5 text-foreground/50"}`}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {active === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pl-[calc(2.5rem+1.25rem+1.25rem)] text-sm text-foreground/70 leading-relaxed border-t border-white/5 pt-4">
                      {p.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 5. Testimonials Marquee (vertical waterfall) ─────────────────────────────
const TESTIMONIALS = [
  { name: "Aarav S.", role: "Verified Seeker · New Delhi", text: "The Kundali reading felt deeply considered and beautifully rendered. Rare to see this much mathematical care in a modern astrology application.", stars: 5 },
  { name: "Meera Patel", role: "Verified Seeker · Mumbai", text: "Numerology finally clicked for me. The planetary charts and Dasha breakdowns are exceptionally clear and precise.", stars: 5 },
  { name: "Vikram Malhotra", role: "Verified Seeker · Bengaluru", text: "Reads like a tribute to authentic Vedic traditions — built with exact sidereal degree calculations. Absolutely remarkable.", stars: 5 },
  { name: "Sarah Jenkins", role: "Verified Seeker · London, UK", text: "I was blown away by the precision of the birth chart explorer. It's both an authentic tool for reflection and a work of art.", stars: 5 },
  { name: "Rajesh Kumar", role: "Verified Seeker · Greater Noida", text: "The consultation and daily horoscopes have become a vital part of my morning routine. Accurate planetary math and thoughtful guidance.", stars: 5 },
  { name: "Priya Nair", role: "Verified Seeker · Chennai", text: "The palmistry analysis revealed hand mounts and planetary lines I'd never consciously noticed. Beautifully synchronized with my Kundali.", stars: 5 },
];

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="glass-strong rounded-3xl p-6 w-72 shrink-0 flex flex-col gap-4 hover:border-gold/30 transition-colors duration-300">
      <div className="flex items-center gap-1">
        {[...Array(t.stars)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <Quote className="h-6 w-6 text-gold/40" />
      <p className="text-sm text-foreground/75 leading-relaxed flex-1">"{t.text}"</p>
      <div>
        <div className="text-sm font-display">{t.name}</div>
        <div className="text-xs text-foreground/50">{t.role}</div>
      </div>
    </div>
  );
}

function TestimonialsMarquee() {
  const col1 = TESTIMONIALS.slice(0, 3);
  const col2 = TESTIMONIALS.slice(3, 6);

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-cosmos to-transparent z-10" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-cosmos to-transparent z-10" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-16">
        <SectionHeader
          eyebrow="Testimonials"
          title="What Seekers Say"
          sub="Words from those who've let the stars guide them."
        />
      </div>

      <div className="flex gap-5 justify-center overflow-hidden h-[520px]">
        {/* Column 1 — scrolls up */}
        <motion.div
          animate={{ y: ["0%", "-50%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          className="flex flex-col gap-5"
        >
          {[...col1, ...col1].map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </motion.div>

        {/* Column 2 — scrolls down */}
        <motion.div
          animate={{ y: ["-50%", "0%"] }}
          transition={{ duration: 24, ease: "linear", repeat: Infinity }}
          className="flex flex-col gap-5 hidden sm:flex"
        >
          {[...col2, ...col2].map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── 6. Team Section ──────────────────────────────────────────────────────────
const TEAM = [
  {
    name: "Acharyaa Smita Mishra",
    role: "Founder & Chief Vedic Scholar",
    bio: "Two decades of Vedic practice, trained under masters in Varanasi. Acharyaa Smita Mishra bridges ancient astrological texts with precision planetary mathematics.",
    gradient: "from-violet-500 to-purple-800",
    symbol: "☽",
  },
  {
    name: "Arjun Mehta",
    role: "Numerology Researcher",
    bio: "Pythagorean and Chaldean systems expert. Arjun's research has been cited in three international journals on sacred geometry.",
    gradient: "from-amber-400 to-orange-700",
    symbol: "✦",
  },
  {
    name: "Ilaria Santos",
    role: "Design & Experience",
    bio: "Award-winning product designer. Ilaria transforms esoteric complexity into breathtaking, intuitive digital experiences.",
    gradient: "from-rose-400 to-pink-800",
    symbol: "⊕",
  },
];

function TeamSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="The team"
          title="Cosmic Architects"
          sub="Astrologers, researchers, and designers united by a single purpose."
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TEAM.map((m) => (
            <motion.div
              key={m.name}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className="glass-strong rounded-3xl p-8 text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-royal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className={`mx-auto h-24 w-24 rounded-full bg-gradient-to-br ${m.gradient} grid place-items-center mb-5 text-4xl shadow-lg`}>
                  {m.symbol}
                </div>
                <div className="font-display text-2xl">{m.name}</div>
                <div className="text-xs uppercase tracking-widest text-gold-soft mt-1 mb-4">{m.role}</div>
                <p className="text-sm text-foreground/65 leading-relaxed">{m.bio}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── 7. Big Quote / Vision ───────────────────────────────────────────────────
function VisionQuote() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,oklch(0.52_0.24_295/0.15),transparent)]" />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 6 + i, delay: i * 0.7, repeat: Infinity }}
            className="absolute text-3xl text-gold/20"
            style={{ left: `${10 + i * 11}%`, top: `${20 + (i * 13) % 60}%` }}
          >
            {["✦", "☽", "♃", "☿", "♄", "⊕", "♆", "♀"][i]}
          </motion.div>
        ))}
      </div>
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <Quote className="h-12 w-12 text-gold/30 mx-auto mb-8" />
          <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl text-gradient-cosmic leading-relaxed italic font-light">
            "Your natal Kundali is not a script of rigid fate, but a celestial map of divine potential — a sacred mirror guiding your soul's highest purpose."
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <span className="text-sm font-display text-gold-soft font-medium">Acharyaa Smita Mishra · GrahGanit</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 8. Pricing Cards ────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Career Guidance",
    price: "₹999",
    period: " / session",
    features: ["10th House Karma Analysis", "Job Switch & Promotion Timing", "Office Politics Remediation", "Gemstone & Mantra Guide"],
    cta: "Book Career Reading",
    popular: false,
    gradient: "from-white/5 to-white/2",
  },
  {
    name: "Complete Life Reading",
    price: "₹2,499",
    period: " / session",
    features: ["360° Life Kundali Assessment", "Vimshottari Dasha 5-Year Preview", "Career, Marriage & Wealth Window", "Direct Video Consultation"],
    cta: "Book Complete Session",
    popular: true,
    gradient: "from-royal/20 to-gold/10",
  },
  {
    name: "Marriage & Relationship",
    price: "₹1,499",
    period: " / session",
    features: ["7th House Synastry Matching", "Marriage Timing & Partner Traits", "Mangal & Venus Dosha Analysis", "Relationship Dispute Remedies"],
    cta: "Book Marriage Reading",
    popular: false,
    gradient: "from-white/5 to-white/2",
  },
];

function PricingCards() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Pricing"
          title="Choose Your Path"
          sub="Every soul's journey is unique. Pick the plan that aligns with yours."
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
        >
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              whileHover={{ y: plan.popular ? 0 : -6 }}
              className={`relative rounded-3xl p-8 overflow-hidden ${
                plan.popular
                  ? "bg-gradient-to-br from-royal/25 to-gold/15 border-2 border-gold/50 scale-105 shadow-[0_0_60px_-10px_rgba(245,158,11,0.4)]"
                  : "glass border border-white/8"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-royal to-gold px-4 py-1 text-xs font-bold text-white shadow-lg whitespace-nowrap">
                  ✦ Most Popular
                </div>
              )}
              <div className="text-xs uppercase tracking-widest text-foreground/50 mb-3">{plan.name}</div>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-display text-5xl text-gradient-gold">{plan.price}</span>
                <span className="text-foreground/50 pb-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/75">
                    <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/booking"
                className={`block text-center rounded-full py-3 text-sm font-medium transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-r from-royal to-gold text-white hover:scale-105 shadow-lg"
                    : "glass-strong hover:border-gold/40 hover:text-gold text-foreground/80"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── 9. FAQ Accordion ────────────────────────────────────────────────────────
const FAQS = [
  { q: "Is astrology scientifically proven?", a: "Astrology, numerology and palmistry are traditional interpretive systems with thousands of years of practice. We present them with respect for the tradition and clarity about their nature as symbolic systems." },
  { q: "How accurate is the Kundali?", a: "Your chart is generated using precise astronomical calculations for your exact birth time and place. The symbolic interpretation is a starting point for reflection — a map, not a destination." },
  { q: "Do you store my birth details?", a: "Your privacy is sacred to us. The preview calculator runs client-side. Stored data is encrypted and never sold or shared with third parties." },
  { q: "Which tradition do you follow?", a: "The Kundali uses Vedic (Jyotish) sidereal astrology; numerology follows the Pythagorean method; palmistry draws from both classical Western and Vedic chirognomy." },
  { q: "Can I get a consultation in Hindi?", a: "Yes — our Vedic scholars conduct consultations in Hindi, English, and Sanskrit. Please note your preferred language when booking." },
  { q: "How long does a consultation take?", a: "Standard readings are 30 minutes; Deep Cosmic readings are 60 minutes. All sessions are conducted via secure video call." },
];

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeader eyebrow="FAQ" title="Common Questions" />
        <div className="mt-16 space-y-3">
          {FAQS.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`glass rounded-2xl overflow-hidden border transition-colors duration-300 ${open === i ? "border-gold/40" : "border-white/5"}`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-display text-lg">{f.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className={`shrink-0 grid h-7 w-7 place-items-center rounded-full text-lg transition-colors ${open === i ? "bg-gold/20 text-gold" : "bg-white/5 text-foreground/50"}`}
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm text-foreground/70 leading-relaxed border-t border-white/5 pt-4">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 10. Contact / Slots Available Widget ────────────────────────────────────
function ContactSlots() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,oklch(0.52_0.24_295/0.20),transparent)]" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-strong rounded-[2rem] p-12 relative overflow-hidden"
        >
          {/* Pulsing border effect */}
          <div className="absolute inset-0 rounded-[2rem] border border-gold/20 pointer-events-none" />
          <motion.div
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-[2rem] border border-gold/40 pointer-events-none"
          />

          {/* Slots available badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
            <motion.span
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            />
            <span className="text-xs font-mono text-emerald-400 font-medium">2 Slots Available</span>
            <span className="text-xs text-foreground/40">·</span>
            <span className="text-xs text-foreground/60">August 2026</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl text-gradient-cosmic mb-4">
            Ready to Read Your Stars?
          </h2>
          <p className="text-foreground/70 max-w-lg mx-auto mb-10 leading-relaxed">
            Our Vedic scholars accept a limited number of deep consultations each month to ensure every seeker receives full presence, authentic planetary mathematics, and attention.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-royal via-royal-soft to-gold px-8 py-4 text-base font-medium text-white shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] transition-all duration-300"
            >
              Book Your Reading <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full glass-strong px-8 py-4 text-base font-medium hover:border-gold/40 hover:text-gold transition-all duration-300"
            >
              Ask a Question
            </Link>
          </div>

          {/* Decorative constellation */}
          <div className="mt-10 flex items-center justify-center gap-2 text-foreground/25 text-xs">
            <span>☽</span><span>·</span><span>✦</span><span>·</span>
            <span>☿</span><span>·</span><span>♃</span><span>·</span>
            <span>♄</span><span>·</span><span>♀</span><span>·</span>
            <span>♆</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Root Export ─────────────────────────────────────────────────────────────
export function AboutPageContent() {
  return (
    <div className="relative">
      <AboutHero />
      <ClientMarquee />
      <MissionStats />
      <ProcessAccordion />
      <VisionQuote />
      <Testimonials />
      <PricingCards />
      <FAQAccordion />
      <ContactSlots />
    </div>
  );
}
