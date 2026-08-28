import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, Clock, Mail, Phone, MessageCircle, CheckCircle, Sparkles, ArrowRight, Star, ChevronDown, ExternalLink, Calendar, ShieldCheck, Compass } from "lucide-react";
import { Link } from "@tanstack/react-router";

// ─── Shared helpers ──────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as any } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const inputCls =
  "w-full rounded-2xl bg-white/[0.05] px-5 py-3.5 text-sm text-white outline-none border border-white/15 transition-all duration-300 focus:bg-white/[0.09] focus:border-gold focus:ring-2 ring-gold/30 placeholder:text-white/40 hover:border-white/30";

// ─── 1. Cosmic Hero ──────────────────────────────────────────────────────────
function ContactHero() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative pt-36 pb-16 md:pt-44 md:pb-20 overflow-hidden">
      {/* Dynamic Animated Starfield Backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/3 w-[750px] h-[500px] rounded-full bg-[radial-gradient(circle,oklch(0.52_0.24_295/0.25),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,oklch(0.80_0.16_82/0.18),transparent_70%)] blur-3xl" />
        
        {/* Constellation line-art watermark */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] text-gold" viewBox="0 0 1000 1000">
          <circle cx="500" cy="500" r="400" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 8" />
          <circle cx="500" cy="500" r="300" stroke="currentColor" strokeWidth="1" fill="none" />
          <line x1="500" y1="100" x2="500" y2="900" stroke="currentColor" strokeWidth="1" />
          <line x1="100" y1="500" x2="900" y2="500" stroke="currentColor" strokeWidth="1" />
          <polygon points="500,200 650,500 500,800 350,500" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>

        {/* Twinkling Cosmic Dots */}
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.1, 0.95, 0.1], scale: [0.7, 1.4, 0.7] }}
            transition={{ duration: 2.5 + (i % 5), delay: i * 0.3, repeat: Infinity }}
            className="absolute rounded-full bg-gold-soft"
            style={{
              width: i % 4 === 0 ? 3 : 1.5,
              height: i % 4 === 0 ? 3 : 1.5,
              top: `${5 + (i * 17) % 85}%`,
              left: `${2 + (i * 13) % 94}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Live IST Clock Pill */}
        {time && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 glass-strong rounded-full px-4 py-1.5 text-xs text-white/80 border border-gold/20 mb-6 shadow-lg"
          >
            <Clock className="h-3.5 w-3.5 text-gold animate-spin-slow" />
            <span>IST (Kolkata) ·</span>
            <span className="font-mono text-gold font-semibold">{time}</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-gold-soft mb-6 border border-white/10"
        >
          <Sparkles className="h-3.5 w-3.5 text-gold" /> Planetary Communication Channel
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-gradient-cosmic"
        >
          Write to the Cosmos
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-white/75 leading-relaxed font-sans"
        >
          Have questions regarding your Kundali, transit timings, or consultation bookings? Every message is read with deep care by Acharyaa Smita Mishra's core team.
        </motion.p>

        {/* Credibility Trust Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-8 inline-flex flex-wrap items-center justify-center gap-6 glass-strong rounded-2xl px-6 py-3 border border-white/10 text-xs text-white/80 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span>100% Confidential &amp; Private</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span>12,000+ Consultations Guided</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span>Response within 24–48 Hours</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 2. Contact Info Cards ────────────────────────────────────────────────────
const INFO_CARDS = [
  {
    icon: <Mail className="h-6 w-6" />,
    label: "Email Support",
    value: "grahganit2026@gmail.com",
    sub: "Direct inbox for enquiries & reports",
    href: "mailto:grahganit2026@gmail.com",
    color: "from-violet-500/20 to-purple-700/10",
    accent: "group-hover:text-violet-400",
  },
  {
    icon: <Phone className="h-6 w-6" />,
    label: "WhatsApp Assistance",
    value: "+91 98998 18720",
    sub: "Mon–Sat, 10 AM – 7 PM IST",
    href: "https://wa.me/919899818720",
    color: "from-emerald-500/20 to-teal-700/10",
    accent: "group-hover:text-emerald-400",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    label: "Vedic Studio Location",
    value: "167B, Second Floor, Gaur City Center",
    sub: "Greater Noida West, Uttar Pradesh",
    href: "https://maps.google.com/?q=Gaur+City+Center+Greater+Noida+West",
    color: "from-amber-500/20 to-orange-700/10",
    accent: "group-hover:text-amber-400",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    label: "Response Promise",
    value: "Within 24–48 Hours",
    sub: "Faster for booked consultations",
    href: "#booking",
    color: "from-rose-500/20 to-pink-700/10",
    accent: "group-hover:text-rose-400",
  },
];

function InfoCards() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {INFO_CARDS.map((c) => (
          <motion.a
            key={c.label}
            variants={fadeUp}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className={`group glass-strong rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden border border-white/10 hover:border-gold/40 transition-all duration-300 hover:-translate-y-1 shadow-lg`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative">
              <div className={`text-white/60 ${c.accent} transition-colors duration-300`}>{c.icon}</div>
              <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-gold-soft">{c.label}</div>
              <div className={`mt-1 font-display text-base text-white ${c.accent} transition-colors duration-300 leading-snug`}>{c.value}</div>
              <div className="text-xs text-white/50 mt-1">{c.sub}</div>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}

// ─── 3. Main Contact Form Section ─────────────────────────────────────────────
const SUBJECTS = [
  { label: "🔮 Book 1-on-1 Consultation", val: "Book 1-on-1 Consultation (Acharyaa Smita Mishra)" },
  { label: "📜 Kundali & Birth Chart Analysis", val: "Kundali / Birth Chart Enquiry" },
  { label: "✨ Numerology & Life Path Guidance", val: "Numerology & Life Path Guidance" },
  { label: "✋ Palmistry & Line Reading", val: "Palmistry & Line Reading" },
  { label: "🛡️ Technical & Account Support", val: "Technical & Account Support" },
  { label: "💬 General & Media Enquiry", val: "General Enquiry" },
];

function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [openSubject, setOpenSubject] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    tob: "",
    pob: "",
    message: "",
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpenSubject(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact-messages/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: subject || "General Inquiry",
          dob: formData.dob,
          tob: formData.tob,
          pob: formData.pob,
          message: formData.message,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        alert(data.detail || "Submission error. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting contact message:", err);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper to compute live office status
  const getOfficeStatus = () => {
    const now = new Date();
    // Convert to IST
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = istTime.getDay(); // 0 is Sunday
    const hour = istTime.getHours();

    if (day === 0) {
      return { isOpen: false, text: "🔴 CLOSED · Cosmic Rest Day (Sunday)" };
    } else if (day === 6) {
      // Sat: 11 AM - 5 PM
      if (hour >= 11 && hour < 17) {
        return { isOpen: true, text: "🟢 OPEN NOW · Responding fast today" };
      }
      return { isOpen: false, text: "🔴 CLOSED FOR TODAY · Reopens Mon 10 AM" };
    } else {
      // Mon-Fri: 10 AM - 7 PM
      if (hour >= 10 && hour < 19) {
        return { isOpen: true, text: "🟢 OPEN NOW · Active Support Online" };
      }
      return { isOpen: false, text: "🔴 CLOSED FOR TODAY · Reopens Tomorrow 10 AM" };
    }
  };

  const status = getOfficeStatus();

  return (
    <section id="contact-form" className="relative py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left panel: Enhanced Form ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 glass-strong rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden border border-gold/30 shadow-[0_0_50px_rgba(245,158,11,0.12)]"
          >
            {/* Background Constellation Watermark */}
            <div className="absolute top-0 right-0 w-80 h-80 opacity-5 pointer-events-none text-gold">
              <svg viewBox="0 0 200 200" fill="currentColor">
                <path d="M100,20 A80,80 0 1,0 100,180 A80,80 0 1,0 100,20 Z M100,40 A60,60 0 1,1 100,160 A60,60 0 1,1 100,40 Z" />
              </svg>
            </div>

            {/* Subtle inner glow */}
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[radial-gradient(circle,oklch(0.52_0.24_295/0.2),transparent_70%)] pointer-events-none" />

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-16 gap-6 relative z-10"
                >
                  {/* Shooting star confirmation animation */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-royal via-purple to-gold shadow-[0_0_50px_rgba(245,158,11,0.6)] border-2 border-gold"
                  >
                    <CheckCircle className="h-12 w-12 text-white" />
                  </motion.div>

                  <div>
                    <span className="text-xs font-mono text-gold uppercase tracking-widest block mb-1">✦ Message Transmitted ✦</span>
                    <h3 className="font-display text-3xl sm:text-4xl text-gradient-cosmic">Sent to the Stars</h3>
                  </div>

                  <p className="text-sm text-white/80 max-w-sm leading-relaxed">
                    Thank you, <span className="text-gold font-semibold">{formData.name || "Seeker"}</span>! Your inquiry has reached our celestial desk. Acharyaa Smita Mishra's team will respond to <span className="text-gold font-mono">{formData.email}</span> within 24–48 hours.
                  </p>

                  <button
                    onClick={() => { setSent(false); setFormData({ name: "", email: "", phone: "", dob: "", tob: "", pob: "", message: "" }); }}
                    className="mt-4 text-xs font-mono text-gold-soft hover:text-gold underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    ✦ Send Another Cosmic Inquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={submit}
                  className="relative z-10 flex flex-col gap-5"
                >
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gold-soft block mb-1">✦ Direct Communication</span>
                    <h3 className="font-display text-2xl sm:text-3xl text-white">Send a Message</h3>
                    <p className="text-xs text-white/60 mt-1">Every detail helps us calculate and respond with planetary precision.</p>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-white/70 block mb-1.5">
                        Your Full Name <span className="text-gold">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Name (as per birth chart)"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-white/70 block mb-1.5">
                        Email Address <span className="text-gold">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="Email (for confidential response)"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="text-[11px] font-mono text-white/70 block mb-1.5">
                      Phone / WhatsApp <span className="text-white/40">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 1234567890 (For instant updates)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  {/* Subject Dropdown with Icons */}
                  <div ref={dropRef} className="relative">
                    <label className="text-[11px] font-mono text-white/70 block mb-1.5">
                      Inquiry Category <span className="text-gold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenSubject((p) => !p)}
                      className={`${inputCls} flex items-center justify-between text-left cursor-pointer ${subject ? "text-white" : "text-white/40"}`}
                    >
                      <span>{subject || "Select a subject"}</span>
                      <motion.span animate={{ rotate: openSubject ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4 text-gold" />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {openSubject && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border border-gold/30 bg-[#0F1123] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden py-1"
                        >
                          {SUBJECTS.map((s) => (
                            <button
                              key={s.val}
                              type="button"
                              onClick={() => { setSubject(s.val); setOpenSubject(false); }}
                              className="flex w-full items-center gap-3 px-5 py-3 text-xs text-white/80 hover:bg-gold/15 hover:text-gold transition-colors text-left"
                            >
                              <span>{s.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Optional Birth details (Auto-reveals for readings) */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gold-soft flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-gold" /> Birth Details for Kundali Context (Optional)
                      </span>
                      <span className="text-[9px] text-white/40 font-mono">Recommended</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="DOB (DD/MM/YYYY)"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className={`${inputCls} text-xs py-2.5 px-3`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Time (e.g. 08:30 AM)"
                          value={formData.tob}
                          onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                          className={`${inputCls} text-xs py-2.5 px-3`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Place (City, State)"
                          value={formData.pob}
                          onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                          className={`${inputCls} text-xs py-2.5 px-3`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div>
                    <label className="text-[11px] font-mono text-white/70 block mb-1.5">
                      Your Message or Question <span className="text-gold">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe your query, career crossroads, relationship situation, or session requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={inputCls}
                      style={{ resize: "none" }}
                    />
                  </div>

                  {/* Trust Microcopy */}
                  <p className="text-[10px] text-white/50 text-center font-sans">
                    ✦ Your details are sacred &amp; kept 100% confidential. Used solely to illuminate your query.
                  </p>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-royal via-purple to-gold px-8 py-4 font-semibold text-xs uppercase tracking-widest text-white shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.7)] cursor-pointer transition-all duration-300 disabled:opacity-70"
                  >
                    {loading ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full"
                      />
                    ) : (
                      <>Transmit Message to Astrologer <Send className="h-4 w-4 ml-1" /></>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Right panel: Refined Sidebar ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* 1. Book directly CTA Card with Astrologer Photo */}
            <div className="glass-strong rounded-[2.5rem] p-7 relative overflow-hidden border border-gold/40 shadow-xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-royal/30 via-purple/20 to-gold/10 pointer-events-none" />
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-[2.5rem] border border-gold/30 pointer-events-none"
              />
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 border border-emerald-500/30">
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-emerald-400"
                    />
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase tracking-wider">Live Slots Open</span>
                  </div>

                  <span className="text-[10px] text-gold font-mono">August 2026</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-gold/50 overflow-hidden shrink-0 shadow-md">
                    <img src="/images/AcharyaaSmitaMishra.jpg" alt="Acharyaa Smita Mishra" className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-white">Acharyaa Smita Mishra</h4>
                    <p className="text-[10px] text-gold font-mono uppercase tracking-wider">Senior Vedic Astrologer</p>
                  </div>
                </div>

                <p className="text-xs text-white/75 leading-relaxed font-sans">
                  Skip email wait times — secure your 1:1 direct video consultation slot for career, marriage, or health guidance.
                </p>

                <Link
                  to="/booking"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold via-amber-500 to-yellow-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-cosmos hover:scale-[1.02] transition-all duration-300 shadow-lg"
                >
                  Book 1:1 Session Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* 2. Office Hours with Computed Live Open/Closed Status */}
            <div className="glass rounded-[2rem] p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="text-xs uppercase tracking-widest text-gold-soft font-mono">Office Hours</div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
                  IST (GMT+5:30)
                </span>
              </div>

              {/* Dynamic Live Open/Closed Banner */}
              <div className={`p-2.5 rounded-xl text-xs font-mono font-medium mb-4 flex items-center gap-2 border ${
                status.isOpen 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                <span>{status.text}</span>
              </div>

              <ul className="space-y-2.5 text-xs">
                {[
                  { day: "Monday – Friday", hours: "10:00 AM – 7:00 PM IST" },
                  { day: "Saturday", hours: "11:00 AM – 5:00 PM IST" },
                  { day: "Sunday", hours: "Closed (Cosmic Rest Day)" },
                ].map((r) => (
                  <li key={r.day} className="flex items-center justify-between">
                    <span className="text-white/70">{r.day}</span>
                    <span className="text-white font-mono text-[11px]">{r.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Social Cards ("Follow the Stars") */}
            <div className="glass rounded-[2rem] p-6 border border-white/10">
              <div className="text-xs uppercase tracking-widest text-gold-soft mb-4 font-mono">Follow the Stars</div>
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    ),
                    label: "@grahganit",
                    sub: "Official Instagram · Daily Transits & Cosmic Insights",
                    href: "https://www.instagram.com/grahganit/",
                    color: "hover:border-rose-500/40 hover:bg-rose-500/10 text-rose-400"
                  },
                  {
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                      </svg>
                    ),
                    label: "@GrahGanit",
                    sub: "Official YouTube Channel · Kundali & Remedies",
                    href: "http://www.youtube.com/@GrahGanit",
                    color: "hover:border-red-500/40 hover:bg-red-500/10 text-red-400"
                  },
                  {
                    icon: (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    ),
                    label: "GrahGanit Facebook Page",
                    sub: "Official Facebook Community · Planetary Updates",
                    href: "https://www.facebook.com/profile.php?id=61592298186880&sk=about",
                    color: "hover:border-blue-500/40 hover:bg-blue-500/10 text-blue-400"
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 transition-all duration-200 group ${s.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 p-2 rounded-xl bg-white/5 text-gold">{s.icon}</div>
                      <div>
                        <div className="text-xs font-semibold text-white">{s.label}</div>
                        <div className="text-[10px] text-white/50">{s.sub}</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-white/30 group-hover:text-gold transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* 4. Interactive Location & Google Maps Card */}
            <div className="glass rounded-[2rem] p-6 border border-white/10 flex flex-col gap-3">
              <div className="text-xs uppercase tracking-widest text-gold-soft font-mono flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold" /> Physical Address
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-sans">
                167B, Second Floor, Gaur City Center Greater Noida West, Uttar Pradesh
              </p>
              <a
                href="https://maps.google.com/?q=Gaur+City+Center+Greater+Noida+West"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-gold/20 hover:text-gold border border-white/10 text-xs text-white transition-all cursor-pointer"
              >
                <span>Open in Google Maps</span> <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. FAQ strip ────────────────────────────────────────────────────────────
const FAQS = [
  { q: "How quickly will I receive a reply to my query?", a: "We reply within 24–48 hours on business days. Direct consultation booking enquiries are prioritized by Acharyaa Smita Mishra's desk." },
  { q: "Can I get my consultation conducted in Hindi or English?", a: "Yes! Acharyaa Smita Mishra conducts consultations in Hindi, English, and regional languages. Please specify your preference in your message." },
  { q: "Do you offer international video consultations?", a: "Yes. Seekers across 42+ countries schedule online consultations via Google Meet or Zoom." },
  { q: "What details should I prepare before reaching out?", a: "Your exact Date of Birth (DD/MM/YYYY), Time of Birth, and City of Birth help us analyze transits accurately." },
];

function FAQStrip() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-12"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold-soft mb-4">
            <Sparkles className="h-3.5 w-3.5" /> FAQ
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl text-gradient-cosmic">
            Frequently Asked Questions
          </motion.h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`glass rounded-2xl overflow-hidden border transition-colors duration-300 ${open === i ? "border-gold/40" : "border-white/5"}`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left cursor-pointer"
              >
                <span className="font-display text-lg text-white">{f.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.22 }}
                  className={`shrink-0 grid h-7 w-7 place-items-center rounded-full text-lg font-light transition-colors ${open === i ? "bg-gold/20 text-gold" : "bg-white/5 text-white/50"}`}
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
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm text-white/75 leading-relaxed border-t border-white/5 pt-4">
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

// ─── 5. Closing Cosmic CTA ────────────────────────────────────────────────────
function ClosingCTA() {
  return (
    <section className="relative py-20 pb-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,oklch(0.52_0.24_295/0.18),transparent)]" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6 text-white/20 text-sm">
            {["☽", "·", "✦", "·", "☿", "·", "♃", "·", "♄"].map((s, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
              >{s}</motion.span>
            ))}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-gradient-cosmic mb-4">
            The Stars Are Waiting
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Whether it's a simple question or a deep cosmic inquiry — your journey begins with a single message.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-royal via-purple to-gold px-8 py-4 text-xs uppercase tracking-widest font-semibold text-white shadow-[0_0_40px_rgba(245,158,11,0.35)] hover:scale-105 hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] transition-all duration-300"
            >
              Send a Message <Send className="h-4 w-4" />
            </a>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 rounded-full glass-strong px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:border-gold/40 hover:text-gold transition-all duration-300 text-white"
            >
              Book Directly <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function ContactPageContent() {
  return (
    <div className="relative">
      <ContactHero />
      <InfoCards />
      <ContactForm />
      <FAQStrip />
      <ClosingCTA />
    </div>
  );
}

export default ContactPageContent;
