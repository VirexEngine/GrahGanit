import React, { useState, useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Video, User, CheckCircle2, ShieldCheck,
  ChevronRight, ArrowRight, Sparkles, AlertCircle, RefreshCw,
  FileText, ExternalLink, HelpCircle, Star, Phone, Building, MapPin
} from 'lucide-react';
import { Navbar } from '@/components/site/Navbar';
import { Footer, FloatingActions } from '@/components/site/Sections';
import { getActiveProfile, UserProfile } from '@/utils/profile';
import { BookingDetailModal, BookingDetail } from '@/components/consultation/BookingDetailModal';
import { trackMyBookingsViewed, trackBookingDetailsViewed } from '@/lib/analytics';

export const Route = createFileRoute('/my-bookings')({
  component: MyBookingsPage,
  head: () => ({
    meta: [
      { title: 'My Consultations & Bookings | GrahGanit Observatory' },
      { name: 'description', content: 'Manage your personal Vedic astrology sessions, view meeting access links, preparation guides, and consultation receipts.' }
    ],
  }),
});

function MyBookingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const navigate = useNavigate();

  // 1. Authenticate user from existing active session
  useEffect(() => {
    const active = getActiveProfile();
    setProfile(active);
    if (!active) {
      setLoading(false);
      return;
    }

    // 2. Query authoritative database records via secure GET /api/payments/my-bookings
    fetchMyBookings(active);
  }, []);

  const fetchMyBookings = async (userProf: UserProfile) => {
    setLoading(true);
    try {
      // Pass secure session header derived from current profile
      const res = await fetch('/api/payments/my-bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userProf.email.trim(),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const serverBookings: BookingDetail[] = data.bookings || [];
        setBookings(serverBookings);

        // Track GA4 event at business boundary
        const hasUpcoming = serverBookings.some((b) => b.status === 'confirmed' || b.status === 'scheduled');
        trackMyBookingsViewed({
          total_bookings: serverBookings.length,
          has_upcoming: hasUpcoming,
        });

        // Non-authoritative UI cache for offline resilience
        try {
          localStorage.setItem('grahganit_cached_bookings', JSON.stringify(serverBookings));
        } catch {
          // Graceful fallback
        }
      } else {
        // Fallback to non-authoritative local cache if network is temporarily unreachable
        const cached = localStorage.getItem('grahganit_cached_bookings');
        if (cached) {
          setBookings(JSON.parse(cached));
        }
      }
    } catch (err) {
      console.warn('Could not retrieve live bookings, checking local cache:', err);
      const cached = localStorage.getItem('grahganit_cached_bookings');
      if (cached) {
        setBookings(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (booking: BookingDetail) => {
    setSelectedBooking(booking);
    trackBookingDetailsViewed({
      plan_id: booking.plan_id,
      status: booking.status,
    });
  };

  // Filter bookings according to active tab
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'upcoming') return b.status === 'confirmed' || b.status === 'scheduled';
    if (filter === 'completed') return b.status === 'completed';
    return true; // 'all'
  });

  // State A: Unauthenticated Guest Gateway
  if (!profile && !loading) {
    return (
      <div className="relative min-h-screen bg-[#090B1A] text-foreground flex flex-col justify-between overflow-x-hidden">
        <Navbar />
        <main className="pt-32 pb-24 px-4 sm:px-6 mx-auto max-w-3xl w-full flex-1 flex items-center justify-center">
          <div className="w-full glass-strong rounded-3xl p-8 sm:p-12 border border-gold/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-display font-medium text-white">
                Seeker Authentication Required
              </h1>
              <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                Consultation appointment records, private video meeting access links, and sacred Vedic guidance notes are encrypted and restricted to your authenticated account.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-gold via-gold-soft to-amber-500 text-cosmos font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <span>Sign In to View Consultations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/booking"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full glass border border-white/10 text-white/80 hover:text-white hover:bg-white/5 text-xs font-mono uppercase tracking-wider transition cursor-pointer"
              >
                <span>Explore Consultation Plans</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <FloatingActions />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#090B1A] text-foreground flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      <main className="pt-32 pb-24 px-4 sm:px-6 mx-auto max-w-5xl w-full flex-1 space-y-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[11px] font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Personal Consultation Sanctuary</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-medium text-gradient-cosmic">
              My Consultations
            </h1>
            <p className="text-sm text-white/60 font-sans">
              Review your scheduled Vedic readings with Acharyaa Smita Mishra, check meeting countdowns, and print verified receipts.
            </p>
          </div>

          <Link
            to="/booking"
            className="self-start md:self-auto inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25 font-mono text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <span>Book New Consultation</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* State B: Authenticated User with Bookings */}
        {bookings.length > 0 ? (
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              {[
                { id: 'upcoming', label: 'Upcoming Sessions' },
                { id: 'completed', label: 'Past Consultations' },
                { id: 'all', label: `All Records (${bookings.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
                    filter === tab.id
                      ? 'bg-gold text-cosmos font-bold shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List of Bookings */}
            {filteredBookings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredBookings.map((b) => {
                  const isUpcoming = b.status === 'confirmed' || b.status === 'scheduled';
                  const isOffline = b.meeting_mode === 'offline';
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl glass-strong border border-white/10 hover:border-gold/30 p-6 sm:p-8 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                            isUpcoming
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}>
                            {b.status === 'confirmed' ? 'Confirmed ✓' : b.status}
                          </span>
                          <span className="text-xs font-mono text-white/40">
                            Ref: <strong className="text-gold">{b.reference_id}</strong>
                          </span>
                          {isOffline ? (
                            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              <span>In-Person Visit</span>
                            </span>
                          ) : (
                            <span className="text-xs font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              <span>Online Video Call (VC)</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl sm:text-2xl font-display font-medium text-white">
                            {b.service_name}
                          </h3>
                          <p className="text-xs text-white/60 mt-0.5 font-sans">
                            Consultant: <span className="text-gold font-medium">{b.consultant_name}</span> (Senior Vedic Astrologer)
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gold" />
                            <span>{b.scheduled_date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gold" />
                            <span>{b.scheduled_time} ({b.timezone})</span>
                          </div>
                          {isOffline && (
                            <div className="flex items-center gap-1.5 text-amber-300/80">
                              <MapPin className="w-3.5 h-3.5 text-amber-400" />
                              <span>Gaur City Center, Greater Noida West</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-center gap-3 shrink-0">
                        <button
                          onClick={() => handleOpenDetails(b)}
                          className="px-6 py-3 rounded-full bg-gradient-to-r from-gold via-gold-soft to-amber-500 text-cosmos font-bold text-xs uppercase tracking-wider hover:scale-105 transition shadow-lg cursor-pointer text-center"
                        >
                          View Booking Details
                        </button>
                        <span className="text-[11px] font-mono text-white/40 text-center md:text-right">
                          Amount Paid: <strong className="text-white">₹{b.amount}</strong>
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl glass p-10 text-center space-y-3 border border-white/5">
                <p className="text-sm text-white/50 font-mono">
                  No {filter} consultations found in your archive.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* State C: Authenticated User with 0 Bookings (Professional Consultation Showcase) */
          <div className="rounded-3xl glass-strong border border-gold/30 p-8 sm:p-12 space-y-8 relative overflow-hidden">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-gold block">
                No Active Bookings Found
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-medium text-white">
                Experience Direct 1-on-1 Vedic Astrology Guidance
              </h2>
              <p className="text-sm text-white/70 leading-relaxed font-sans">
                You haven't scheduled a private consultation yet. A 1-on-1 session connects you directly with Acharyaa Smita Mishra to decode your planetary dasha transits, unlock auspicious career windows, and navigate relationships with precision mathematics.
              </p>
            </div>

            {/* Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-white/5 py-6">
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <h4 className="text-sm font-medium text-white">Verified Vedic Ephemeris</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Charts are pre-computed using high-precision planetary ephemeris data before the call begins.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
                <Video className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-medium text-white">Private 45-Min Video Session</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Dedicated 1-on-1 time for direct questions regarding your career, health, finances, and relationships.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <h4 className="text-sm font-medium text-white">Practical Vedic Remedies</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Clear, authentic gemstone, mantra, and timing remedies customized specifically to your ascendant.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-white/50 font-mono">
                Only 3 private consultation slots released daily to preserve meticulous depth.
              </div>
              <Link
                to="/booking"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-gold via-gold-soft to-amber-500 text-cosmos font-bold text-xs uppercase tracking-widest hover:scale-105 transition shadow-lg cursor-pointer"
              >
                <span>Schedule Your Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <FloatingActions />

      {/* Booking Detail Modal Drawer */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
export default MyBookingsPage;
