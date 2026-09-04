import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, Video, CheckCircle2, ShieldCheck,
  Printer, HelpCircle, FileText, ExternalLink, AlertCircle,
  Sparkles, Award, Users, ChevronRight, Phone, Mail,
  MapPin, Building, Navigation
} from 'lucide-react';
import { trackJoinConsultation } from '@/lib/analytics';

export interface BookingDetail {
  id: number;
  reference_id: string;
  order_id: string;
  payment_id?: string;
  service_name: string;
  plan_id: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'scheduled' | string;
  seeker_name: string;
  scheduled_date: string;
  scheduled_time: string;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  timezone: string;
  consultant_name: string;
  consultant_title: string;
  meeting_mode: string;
  meeting_url?: string | null;
  venue_address?: string | null;
  amount: number;
  currency: string;
  include_recording?: boolean;
  created_at: string;
}

interface BookingDetailModalProps {
  booking: BookingDetail | null;
  onClose: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose }) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'prep' | 'policy'>('details');

  useEffect(() => {
    if (!booking) return;

    const calculateTimeLeft = () => {
      // Determine session start timestamp
      let startMs: number | null = null;
      if (booking.scheduled_start) {
        startMs = new Date(booking.scheduled_start).getTime();
      } else if (booking.scheduled_date) {
        // Fallback parse
        const combined = `${booking.scheduled_date} ${booking.scheduled_time || '10:30 AM'}`;
        const parsed = Date.parse(combined);
        if (!isNaN(parsed)) startMs = parsed;
      }

      if (!startMs) {
        setTimeLeftStr('Scheduled');
        setCanJoin(false);
        return;
      }

      const now = Date.now();
      const diffMs = startMs - now;
      const tenMinutesMs = 10 * 60 * 1000;
      const durationMs = 45 * 60 * 1000;

      // Active window: 10 minutes before start up to 30 minutes after duration
      if (diffMs <= tenMinutesMs && diffMs >= -(durationMs + 30 * 60 * 1000)) {
        setCanJoin(true);
        setTimeLeftStr('Session is live or ready to join');
      } else if (diffMs > 0) {
        setCanJoin(false);
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

        if (days > 0) {
          setTimeLeftStr(`Starts in ${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeftStr(`Starts in ${hours}h ${minutes}m`);
        } else {
          setTimeLeftStr(`Starts in ${minutes} minutes`);
        }
      } else {
        setCanJoin(false);
        setTimeLeftStr('Session concluded');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 30000);
    return () => clearInterval(interval);
  }, [booking]);

  if (!booking) return null;

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleJoinClick = () => {
    if (!canJoin || !booking.meeting_url) return;
    trackJoinConsultation({ plan_id: booking.plan_id });
    window.open(booking.meeting_url, '_blank', 'noopener,noreferrer');
  };

  const statusConfig = {
    confirmed: { label: 'Confirmed ✓', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    scheduled: { label: 'Scheduled ✓', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    completed: { label: 'Completed', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  }[booking.status] || { label: booking.status, bg: 'bg-gold/10', text: 'text-gold', border: 'border-gold/30' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-[#0d0f22] border border-gold/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
      >
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple/15 via-[#12142d] to-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-display font-medium text-white">
                  {booking.service_name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Reference ID: <span className="text-gold font-bold">{booking.reference_id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-white/5 bg-[#0a0c1c] text-xs font-mono px-5 sm:px-6 gap-6">
          {[
            { id: 'details', label: 'Session & Receipt' },
            { id: 'prep', label: 'Preparation Guide' },
            { id: 'policy', label: 'Reschedule & Support' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 relative uppercase tracking-wider transition cursor-pointer ${
                activeTab === tab.id ? 'text-gold font-semibold' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="booking-modal-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-amber-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'details' && (
            <>
              {/* Primary Appointment Hero Banner */}
              <div className="rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-white/5 via-white/2 to-transparent space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase block">Scheduled Date</span>
                      <span className="text-white font-medium text-base">{booking.scheduled_date}</span>
                      <span className="text-xs text-white/50 block font-mono">Timezone: {booking.timezone}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase block">Slot Window</span>
                      <span className="text-white font-medium text-base">{booking.scheduled_time}</span>
                      <span className="text-xs text-emerald-400 block font-mono">{timeLeftStr}</span>
                    </div>
                  </div>
                </div>

                {/* Smart Meeting Action Box (Online VC vs Offline Office Visit) */}
                {booking.meeting_mode === 'offline' ? (
                  <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs text-amber-300">
                        <Building className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-semibold">Mode: In-Person Consultation at Observatory Sanctuary</span>
                      </div>
                      <a
                        href="https://maps.google.com/?q=Gaur+City+Center+Greater+Noida+West"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-mono transition"
                      >
                        <Navigation className="w-3.5 h-3.5 text-amber-400" />
                        <span>Open Directions</span>
                        <ExternalLink className="w-3 h-3 text-white/50" />
                      </a>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white font-medium">
                          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Venue Address:</span>
                        </div>
                        <p className="text-white/80 font-mono text-[11px] leading-relaxed pl-6">
                          {booking.venue_address || '167B, Second Floor, Gaur City Center, Greater Noida West, UP - 201318'}
                        </p>
                      </div>

                      <div className="text-[10px] text-amber-200/80 font-mono bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
                        ✦ Reception Pass Ready
                      </div>
                    </div>

                    <p className="text-[11px] text-white/50 font-sans italic">
                      * Please arrive 10 minutes before {booking.scheduled_time}. Bring physical or digital copies of your birth chart / Janam Kundli.
                    </p>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Video className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Mode: Private 1-on-1 Video Consultation (HD)</span>
                    </div>

                    {canJoin ? (
                      <button
                        onClick={handleJoinClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 transition cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Consultation</span>
                      </button>
                    ) : (
                      <div className="text-center sm:text-right">
                        <button
                          disabled
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/30 text-xs font-mono uppercase tracking-wider cursor-not-allowed"
                        >
                          <span>Join Consultation</span>
                        </button>
                        <span className="text-[10px] text-white/40 block mt-1">
                          Link activates 10 mins prior to session
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Verified Consultant Trust Profile */}
              <div className="rounded-2xl p-4 border border-white/10 bg-white/3 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src="/images/AcharyaaSmitaMishra.jpg"
                  alt={booking.consultant_name}
                  className="w-16 h-16 rounded-2xl object-cover border border-gold/40 shadow-md shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gold block">Your Consultant</span>
                  <h4 className="text-base font-display font-medium text-white">{booking.consultant_name}</h4>
                  <p className="text-xs text-white/60 leading-relaxed mt-0.5">
                    Senior Vedic Astrology &amp; Planetary Mathematics Consultant with over 15 years of dedicated practice in Jyotish Vidya, Prashna Kundali, and astrological remedies.
                  </p>
                </div>
              </div>

              {/* Payment & Receipt Summary */}
              <div className="rounded-2xl p-5 border border-white/10 bg-[#090b1c] space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-mono text-white/50 uppercase">Payment Breakdown</span>
                  <button
                    onClick={handlePrintReceipt}
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-amber-400 font-mono uppercase tracking-wider transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-white/70">
                    <span>{booking.service_name}</span>
                    <span>₹{booking.amount - (booking.include_recording ? 200 : 0)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Consultation Mode</span>
                    <span className={booking.meeting_mode === 'offline' ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {booking.meeting_mode === 'offline' ? 'In-Person Office Visit' : 'Private Video Meet (HD)'}
                    </span>
                  </div>
                  {booking.include_recording && (
                    <div className="flex justify-between text-white/70">
                      <span>Audio Recording &amp; Sacred Remedies Pass</span>
                      <span>₹200</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold text-white pt-2 border-t border-white/5">
                    <span>Total Paid</span>
                    <span className="text-gradient-gold">₹{booking.amount} {booking.currency}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-white/40">
                  <div>Payment Status: <span className="text-emerald-400 font-semibold">Verified ✓ Paid</span></div>
                  <div>Razorpay Ref: <span className="text-white/70">{booking.payment_id || 'pay_verified'}</span></div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'prep' && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5 border border-gold/20 bg-gold/5 space-y-2">
                <div className="flex items-center gap-2 text-gold font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>5 Steps to Make the Most of Your Session</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Your birth chart calculations are pre-computed using Swiss-Ephemeris planetary algorithms so all 45 minutes can be dedicated to your direct questions and remedies.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    title: '1. List Your Priority Questions',
                    desc: 'Write down 2-3 specific life areas (career crossroads, relationship timing, relocation, or business expansion) to explore first.',
                  },
                  {
                    title: '2. Check Your Birth Coordinates',
                    desc: 'Ensure your date, time of birth (within 10-15 mins accuracy), and place are confirmed. Mention if birth time is approximate.',
                  },
                  {
                    title: '3. Quiet & Private Space',
                    desc: 'Join from a tranquil room where you can reflect, converse freely, and take sacred notes.',
                  },
                  {
                    title: '4. Keep a Notebook Ready',
                    desc: 'We recommend jotting down key planetary Mahadasha timelines, gemstone advice, and spiritual remedies provided by Acharyaa.',
                  },
                  {
                    title: '5. Stable Internet & Earphones',
                    desc: 'Use wired or Bluetooth earphones with a microphone for pristine HD audio clarity throughout the discussion.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="text-white font-medium text-xs">{item.title}</h5>
                      <p className="text-[11px] text-white/60 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5 border border-white/10 bg-white/2 space-y-3">
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <span>Cancellation &amp; Rescheduling Policy</span>
                </div>
                <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-gold">•</span>
                    <span><strong>Free Rescheduling:</strong> You can reschedule your appointment date/time up to 12 hours prior to the session by reaching out to our concierge support team.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">•</span>
                    <span><strong>Cancellation Timeline:</strong> Cancellations made at least 24 hours in advance receive a 100% refund credited back to your original payment method within 5-7 banking days.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">•</span>
                    <span><strong>Slot Reservation:</strong> Because Acharyaa Smita Mishra limits sessions to only 3 seekers daily to maintain exhaustive depth, late cancellations within 12 hours are subject to slot-holding fees.</span>
                  </li>
                </ul>
              </div>

              {/* Direct Concierge Support Channels */}
              <div className="rounded-2xl p-5 border border-gold/30 bg-gradient-to-br from-gold/10 via-purple/10 to-transparent space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-white">Need Support or Rescheduling?</h5>
                    <p className="text-xs text-white/60 mt-0.5">
                      Our Observatory Concierge is available daily to assist with booking adjustments. Quote your reference ID: <strong className="text-gold">{booking.reference_id}</strong>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={`https://wa.me/919899818720?text=${encodeURIComponent(`Namaste GrahGanit Support, I need assistance regarding my consultation booking Ref: ${booking.reference_id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition text-xs font-mono font-semibold cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Concierge (+91 9899818720)</span>
                  </a>

                  <a
                    href={`mailto:grahganit2026@gmail.com?subject=${encodeURIComponent(`Consultation Booking Inquiry - ${booking.reference_id}`)}`}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition text-xs font-mono cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-gold" />
                    <span>Email Support</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0c1a] border-t border-white/5 flex items-center justify-between text-xs text-white/40">
          <span>Booked on: {new Date(booking.created_at).toLocaleDateString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
