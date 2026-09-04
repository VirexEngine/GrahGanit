import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, ChevronDown, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProfileDropdown } from "./ProfileDropdown";

// ─── Nav Config ────────────────────────────────────────────────────────────────
// Add new top-level or dropdown items here without touching component logic.

type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "dropdown"; label: string; items: DropdownItem[] };

type DropdownItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "coming-soon"; label: string; badge?: string };

const NAV_CONFIG: NavItem[] = [
  {
    type: "dropdown",
    label: "Reports",
    items: [
      { kind: "coming-soon", label: "Yearly Report", badge: "Soon" },
      { kind: "coming-soon", label: "Career Report", badge: "Soon" },
      { kind: "coming-soon", label: "Love Report", badge: "Soon" },
      { kind: "coming-soon", label: "Health Report", badge: "Soon" },
    ],
  },
  {
    type: "dropdown",
    label: "Consultation",
    items: [
      { kind: "link", label: "Book a Consultation", href: "/booking" },
      { kind: "link", label: "My Bookings", href: "/my-bookings" },
    ],
  },
  {
    type: "dropdown",
    label: "Horoscopes",
    items: [
      { kind: "link", label: "Daily Horoscope", href: "/horoscopes/daily" },
      { kind: "link", label: "Monthly Horoscope", href: "/horoscopes/monthly" },
      // Add { kind: "link", label: "Weekly Horoscope", href: "/horoscopes/weekly" } when ready
      // Add { kind: "link", label: "Yearly Horoscope", href: "/horoscopes/yearly" } when ready
    ],
  },
  {
    type: "dropdown",
    label: "Calculators",
    items: [
      { kind: "link", label: "Kundali Calculator", href: "/free-tools/kundli" },
      { kind: "link", label: "Numerology Calculator", href: "/free-tools/numerology" },
      { kind: "link", label: "Compatibility Check", href: "/free-tools/compatibility" },
      { kind: "link", label: "Palmistry", href: "/services/palm-reading" },
    ],
  },
  { type: "link", label: "About", href: "/about" },
  { type: "link", label: "Contact", href: "/contact" },
];

// ─── Dropdown Panel ─────────────────────────────────────────────────────────────
function DesktopDropdown({ items }: { items: DropdownItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute left-1/2 top-full -translate-x-1/2 mt-3 min-w-[220px] z-[80]"
    >
      {/* Arrow pip */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#1A1A2E] border-l border-t border-[#D4A94F]/40" />
      <div className="rounded-xl overflow-hidden border border-[#D4A94F]/40 bg-[#1A1A2E] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.7)]">
        {items.map((item, i) =>
          item.kind === "link" ? (
            <Link
              key={i}
              to={item.href}
              className="flex items-center gap-2 px-5 py-3 text-sm text-foreground/80 hover:text-[#F59E0B] hover:bg-[#D4A94F]/10 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
            >
              {item.label}
            </Link>
          ) : (
            <div
              key={i}
              className="flex items-center justify-between gap-2 px-5 py-3 text-sm text-foreground/40 cursor-default select-none first:rounded-t-xl last:rounded-b-xl border-b border-white/5 last:border-0"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#D4A94F]/50" />
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-full bg-[#D4A94F]/15 border border-[#D4A94F]/30 text-[#D4A94F] text-[10px] px-2 py-0.5 font-medium tracking-wide">
                  {item.badge}
                </span>
              )}
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}

// ─── Desktop Nav Item ───────────────────────────────────────────────────────────
function DesktopNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  if (item.type === "link") {
    return (
      <Link
        to={item.href}
        className="group relative px-3 py-2 text-sm text-foreground/80 hover:text-foreground transition [&.active]:text-[#D4A94F] [&.active]:font-medium"
      >
        {item.label}
        <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-[#D4A94F] via-royal-soft to-transparent transition-transform duration-300 group-hover:scale-x-100" />
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <button
        className={`group relative flex items-center gap-1 px-3 py-2 text-sm transition ${open ? "text-[#D4A94F]" : "text-foreground/80 hover:text-foreground"}`}
      >
        {item.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180 text-[#D4A94F]" : ""}`}
        />
        <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-[#D4A94F] via-royal-soft to-transparent transition-transform duration-300 group-hover:scale-x-100" />
      </button>
      <AnimatePresence>
        {open && <DesktopDropdown items={item.items} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile Accordion Item ──────────────────────────────────────────────────────
function MobileAccordionItem({
  item,
  index,
  closeMenu,
}: {
  item: NavItem;
  index: number;
  closeMenu: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (item.type === "link") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link
          to={item.href}
          onClick={closeMenu}
          className="flex items-center justify-center py-3 font-display text-2xl hover:text-[#D4A94F] transition-colors"
        >
          {item.label}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="w-full"
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-center gap-2 py-3 font-display text-2xl transition-colors ${open ? "text-[#D4A94F]" : "hover:text-[#D4A94F]"}`}
      >
        {item.label}
        <ChevronDown
          className={`h-5 w-5 mt-1 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mx-auto max-w-xs mb-2 rounded-xl border border-[#D4A94F]/30 bg-[#1A1A2E] divide-y divide-white/5">
              {item.items.map((sub, si) =>
                sub.kind === "link" ? (
                  <Link
                    key={si}
                    to={sub.href}
                    onClick={closeMenu}
                    className="flex items-center px-5 py-3 text-sm text-foreground/75 hover:text-[#F59E0B] hover:bg-[#D4A94F]/10 transition-colors"
                  >
                    {sub.label}
                  </Link>
                ) : (
                  <div
                    key={si}
                    className="flex items-center justify-between px-5 py-3 text-sm text-foreground/35 cursor-default"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#D4A94F]/40" />
                      {sub.label}
                    </span>
                    {sub.badge && (
                      <span className="rounded-full bg-[#D4A94F]/15 border border-[#D4A94F]/30 text-[#D4A94F] text-[10px] px-2 py-0.5">
                        {sub.badge}
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Navbar ────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<{ badge_text: string; message: string; link_url?: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/articles/announcements/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.active && data.announcement) {
          setAnnouncement(data.announcement);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-3"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${
            scrolled ? "glass-strong shadow-[0_10px_40px_-10px_rgba(109,40,217,0.5)]" : ""
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 rounded-full bg-black/40 border border-[#D4A94F]/40 flex items-center justify-center overflow-hidden p-0.5 shadow-[0_0_20px_rgba(212,175,78,0.3)] group-hover:border-[#D4A94F] group-hover:shadow-[0_0_25px_rgba(212,175,78,0.5)] transition-all duration-300">
              <img
                src="/logo.jpg"
                alt="GrahGanit Logo"
                className="h-full w-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="font-display text-xl tracking-wide">
              Grah<span className="text-gradient-gold">Ganit</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_CONFIG.map((item, i) => (
              <DesktopNavItem key={i} item={item} />
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <ProfileDropdown />
            <Link
              to="/booking"
              className="hidden md:inline-flex items-center rounded-full bg-gradient-to-r from-royal to-royal-soft px-5 py-2 text-sm font-medium text-white shadow-lg shadow-royal/30 transition hover:glow-royal hover:scale-[1.03]"
            >
              Book Now
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-full glass"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-cosmos/95 backdrop-blur-xl lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 rounded-full bg-black/40 border border-[#D4A94F]/40 flex items-center justify-center overflow-hidden p-0.5 shadow-[0_0_15px_rgba(212,175,78,0.3)]">
                  <img src="/logo.jpg" alt="GrahGanit Logo" className="h-full w-full object-cover rounded-full" />
                </div>
                <span className="font-display text-xl">
                  Grah<span className="text-gradient-gold">Ganit</span>
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full glass"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col items-stretch px-4 pt-4 pb-16 gap-1">
              {NAV_CONFIG.map((item, i) => (
                <MobileAccordionItem
                  key={i}
                  item={item}
                  index={i}
                  closeMenu={() => setOpen(false)}
                />
              ))}
              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_CONFIG.length * 0.05 + 0.05 }}
                className="mt-6 px-4"
              >
                <Link
                  to="/booking"
                  onClick={() => setOpen(false)}
                  className="block text-center rounded-full bg-gradient-to-r from-royal to-royal-soft px-8 py-3 text-lg font-medium text-white shadow-lg shadow-royal/30 transition hover:glow-royal"
                >
                  Book Now
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
