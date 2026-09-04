import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLANS, Plan } from './ConsultationTypes';
import { PreConsultationInsight } from './PreConsultationInsight';
import { CalendarDays, Clock, User, CheckCircle2, CreditCard, ChevronRight, ChevronLeft, Calendar, HelpCircle, Check, BadgeCheck, ShieldCheck, Printer, FileText } from 'lucide-react';
import { getActiveProfile } from '../../utils/profile';
import { searchCities, CitySearchResult } from '../../utils/locationService';
import { DobInput } from '../common/DobInput';
import {
  trackBeginCheckout,
  trackPaymentInitiated,
  trackCheckoutAbandoned,
  trackPaymentFailed,
  trackPurchase,
} from '@/lib/analytics';

const STEPS = [
  { id: 1, name: 'Choose Service', icon: HelpCircle },
  { id: 2, name: 'Schedule Date', icon: CalendarDays },
  { id: 3, name: 'Select Time', icon: Clock },
  { id: 4, name: 'Birth Details', icon: User },
  { id: 5, name: 'Review & Pay', icon: CreditCard },
];

const QUICK_TAGS = ['Career', 'Marriage', 'Education', 'Health', 'Business', 'Family', 'Finance'];

export const BookingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [plansList, setPlansList] = useState<Plan[]>(PLANS);
  const [selectedService, setSelectedService] = useState<Plan>(PLANS[4]); // Default to Complete Life Reading
  const [bookedSlotsMap, setBookedSlotsMap] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Dynamic Real-Time Calendar Calculations
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();
  const currentDay = today.getDate();

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = MONTH_NAMES[currentMonthIdx];
  const shortMonthName = monthName.slice(0, 3);

  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonthIdx, 1).getDay();

  const formattedSelectedDate = selectedDate
    ? `${shortMonthName} ${selectedDate}, ${currentYear}`
    : `${shortMonthName} ${Math.min(currentDay + 1, daysInMonth)}, ${currentYear}`;

  // Automatically fetch live pricing and booked slots on mount
  useEffect(() => {
    // 1. Fetch dynamic consultation tiers pricing
    fetch('/api/admin/consultation-tiers')
      .then((res) => res.json())
      .then((tiers) => {
        if (Array.isArray(tiers) && tiers.length > 0) {
          setPlansList((prev) =>
            prev.map((p) => {
              const matched = tiers.find((t: any) => t.tier_key === p.id);
              if (matched) {
                return {
                  ...p,
                  price: matched.price_inr ?? p.price,
                  duration: matched.duration ?? p.duration,
                  name: matched.title ?? p.name,
                };
              }
              return p;
            })
          );
        }
      })
      .catch((err) => console.warn('Tiers pricing fetch notice:', err));

    // 2. Fetch live booked slots for calendar capacity
    fetch('/api/payments/availability')
      .then((res) => res.json())
      .then((data) => {
        if (data?.booked_slots) {
          setBookedSlotsMap(data.booked_slots);
        }
      })
      .catch((err) => console.warn('Availability fetch notice:', err));
  }, []);

  // Sync selectedService when plansList updates
  useEffect(() => {
    setSelectedService((prev) => {
      const matched = plansList.find((p) => p.id === prev.id);
      return matched || prev;
    });
  }, [plansList]);

  // Automatically lock out past dates and default to next available future day
  useEffect(() => {
    if (!selectedDate || selectedDate <= currentDay) {
      const nextAvailableDay = Math.min(currentDay + 1, daysInMonth);
      setSelectedDate(nextAvailableDay);
    }
  }, [currentDay, daysInMonth]);

  // Birth & Personal Info state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    time: '',
    place: '',
    notes: '',
    includeRecording: false,
  });

  const [autocompleteInput, setAutocompleteInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<CitySearchResult[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState<{
    order_id?: string;
    payment_id?: string;
    amount?: number;
  } | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [activeInvoiceBooking, setActiveInvoiceBooking] = useState<any | null>(null);

  // Sync user's purchased bookings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('grahganit_user_bookings');
      if (stored) {
        setUserBookings(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error reading stored bookings:', err);
    }
  }, [bookingConfirmed]);

  // Track begin_checkout when reaching Step 5 (Review & Pay)
  useEffect(() => {
    if (step === 5 && selectedService) {
      const totalAmount = selectedService.price + (formData.includeRecording ? 499 : 0);
      trackBeginCheckout({
        value: totalAmount,
        currency: 'INR',
        items: [
          {
            item_id: selectedService.id,
            item_name: selectedService.name,
            price: totalAmount,
            item_category: 'consultation',
          },
        ],
      });
    }
  }, [step, selectedService, formData.includeRecording]);

  // Helper to load Razorpay Checkout script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay payment gateway failed to load. Please check your internet connection.');
        setIsProcessingPayment(false);
        return;
      }

      const totalAmount = selectedService.price + (formData.includeRecording ? 200 : 0);

      // 1. Create order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: selectedService.id,
          plan_name: selectedService.name,
          amount: totalAmount,
          currency: 'INR',
          seeker_name: formData.name || 'Seeker',
          seeker_email: formData.email || 'seeker@grahganit.in',
          seeker_phone: formData.phone || '',
          dob: formData.dob || '',
          tob: formData.time || '',
          pob: formData.place || '',
          scheduled_date: formattedSelectedDate,
          scheduled_time: selectedTime || '10:30 AM',
          notes: formData.notes || '',
          include_recording: formData.includeRecording,
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to initiate payment order.');
      }

      const orderData = await orderRes.json();

      // 2. Open Razorpay Checkout modal
      trackPaymentInitiated({
        order_id: orderData.order_id,
        plan_id: selectedService.id,
        value: totalAmount,
        currency: orderData.currency || 'INR',
      });

      const options = {
        key: orderData.key_id || '',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'GrahGanit Observatory',
        description: `${selectedService.name} with Acharyaa Smita Mishra`,
        image: '/favicon.png',
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            // 3. Verify signature on backend
            const verifyRes = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              trackPaymentFailed({
                order_id: response.razorpay_order_id,
                plan_id: selectedService.id,
                error_code: 'signature_verification_failed',
                error_description: 'Backend signature verification failed',
              });
              throw new Error('Payment verification failed on server.');
            }

            // Server-verified purchase tracking
            trackPurchase({
              transaction_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              value: totalAmount,
              currency: orderData.currency || 'INR',
              items: [
                {
                  item_id: selectedService.id,
                  item_name: selectedService.name,
                  price: totalAmount,
                  item_category: 'consultation',
                },
              ],
            });

            const confirmedBooking = {
              id: response.razorpay_payment_id || `pay_${Date.now()}`,
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              plan_id: selectedService.id,
              plan_name: selectedService.name,
              amount: totalAmount,
              date: formattedSelectedDate,
              time: selectedTime || '10:30 AM',
              seeker_name: formData.name || 'Seeker',
              seeker_email: formData.email || '',
              paid_at: new Date().toISOString(),
            };

            try {
              const existing = JSON.parse(localStorage.getItem('grahganit_user_bookings') || '[]');
              const updated = [confirmedBooking, ...existing.filter((b: any) => b.plan_id !== selectedService.id)];
              localStorage.setItem('grahganit_user_bookings', JSON.stringify(updated));
              setUserBookings(updated);
            } catch (saveErr) {
              console.error('Error saving local booking pass:', saveErr);
            }

            setConfirmedBookingDetails({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              amount: totalAmount,
            });
            setBookingConfirmed(true);
          } catch (err) {
            console.error('Payment verification error:', err);
            trackPaymentFailed({
              order_id: response.razorpay_order_id,
              plan_id: selectedService.id,
              error_code: 'verification_exception',
              error_description: String(err),
            });
            setBookingConfirmed(true);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: formData.name || 'Seeker',
          email: formData.email || '',
          contact: formData.phone || '',
        },
        notes: {
          booking_for: selectedService.name,
        },
        theme: {
          color: '#f59e0b',
        },
        modal: {
          ondismiss: () => {
            trackCheckoutAbandoned({
              order_id: orderData.order_id,
              plan_id: selectedService.id,
            });
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        trackPaymentFailed({
          order_id: orderData.order_id,
          plan_id: selectedService.id,
          error_code: resp.error?.code || 'declined',
          error_description: resp.error?.description || 'Transaction declined',
        });
        alert(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment trigger failed:', err);
      alert('Unable to connect to payment gateway. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await searchCities(searchQuery);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const profile = getActiveProfile();
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name,
        email: profile.email,
        dob: profile.dob,
        time: profile.time,
        place: profile.place,
      }));
      setAutocompleteInput(profile.place);
    }

    // Parse URL query params (e.g., ?plan=career&focus=Career)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get('plan') || params.get('service');
      const focusParam = params.get('focus') || params.get('category');

      if (planParam) {
        const matchedPlan = PLANS.find(
          (p) => p.id === planParam.toLowerCase() || p.name.toLowerCase().includes(planParam.toLowerCase())
        );
        if (matchedPlan) {
          setSelectedService(matchedPlan);
        }
      }

      if (focusParam) {
        setFormData((prev) => ({
          ...prev,
          notes: `Focusing on ${focusParam} analysis and planetary transits support.`,
        }));
      }

      if (planParam || focusParam) {
        setTimeout(() => {
          const el = document.getElementById('booking-wizard-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }, []);

  // Mock geocomplete locations
  const LOCATIONS = ['Delhi, India', 'Mumbai, India', 'Bangalore, India', 'New York, USA', 'London, UK', 'Dubai, UAE'];

  // Handle tags pre-fill
  const handleTagClick = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      notes: `${prev.notes ? prev.notes + ', ' : ''}Focusing on ${tag} analysis and planetary transits support.`,
    }));
  };

  const handleNext = () => {
    if (step < 5) setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const triggerPayment = () => {
    setBookingConfirmed(true);
  };

  // Real-time slot capacity calculations from database
  const getDayAvailability = (day: number) => {
    const dateKey = `${shortMonthName} ${day}, ${currentYear}`;
    const bookedCount = bookedSlotsMap[dateKey] || 0;
    const maxSlots = 3;
    const remaining = Math.max(0, maxSlots - bookedCount);

    if (remaining === 0) {
      return { status: 'booked', remaining: 0, label: 'Fully Booked', color: 'text-red-400 bg-red-400/10' };
    }
    if (remaining === 1) {
      return { status: 'limited', remaining: 1, label: '1 Slot Left', color: 'text-amber-400 bg-amber-400/10' };
    }
    if (remaining === 2) {
      return { status: 'limited', remaining: 2, label: '2 Slots Left', color: 'text-amber-400 bg-amber-400/10' };
    }
    return { status: 'available', remaining: 3, label: '3 Slots Left', color: 'text-emerald-400 bg-emerald-400/10' };
  };

  return (
    <div id="booking-wizard-section" className="w-full max-w-4xl mx-auto flex flex-col gap-6 relative z-10 scroll-mt-24">
      
      {/* Progress Stepper bar */}
      {!bookingConfirmed && (
        <div className="bg-glass-dark border border-white/10 rounded-2xl p-4 flex justify-between items-center overflow-x-auto gap-4">
          {STEPS.map((s, idx) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            const Icon = s.icon;

            return (
              <div key={s.id} className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : isActive
                      ? 'bg-gold/15 border-gold text-gold shadow-md'
                      : 'bg-white/3 border-white/5 text-white/40'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-[10px] uppercase font-mono tracking-widest ${
                  isActive ? 'text-white font-semibold' : 'text-white/40'
                }`}>
                  {s.name}
                </span>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/10 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main wizard active cards panel */}
      <div className="min-h-[400px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {bookingConfirmed ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6"
            >
              {/* Celebrate Header */}
              <div className="bg-glass-dark border border-emerald-500/20 rounded-3xl p-6 text-center backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col items-center gap-3">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-3xl shadow-lg shadow-emerald-500/10"
                >
                  <CheckCircle2 className="w-9 h-9" />
                </motion.div>

                <div>
                  <h3 className="text-xl font-display font-medium text-white">Your Appointment is Confirmed!</h3>
                  <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                    A confirmation email along with your secure Google Meet link has been dispatched to {formData.email || 'your email'}.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mt-2 text-[10px] font-mono text-white/70">
                  <span className="bg-white/3 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1">
                    📅 Date: {formattedSelectedDate}
                  </span>
                  <span className="bg-white/3 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1">
                    ⏰ Time: {selectedTime || '10:30 AM'}
                  </span>
                  <span className="bg-white/3 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1 text-emerald-400">
                    🟢 Meeting Link Active
                  </span>
                  {confirmedBookingDetails?.payment_id && (
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full px-3 py-1 flex items-center gap-1">
                      💳 Txn: {confirmedBookingDetails.payment_id}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Insight Card */}
              <PreConsultationInsight
                name={formData.name || 'Seeker'}
                dob={formData.dob}
                time={formData.time}
                place={formData.place || 'Delhi, India'}
                category={selectedService.id}
              />
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="bg-glass-dark border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative"
            >
              {/* Step 1: Choose Service */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-gold-soft uppercase tracking-widest block">✦ Step 1 of 5</span>
                      <h4 className="text-xl font-display font-medium text-white">Select Consultation Package</h4>
                    </div>
                    <p className="text-xs text-white/50 max-w-sm">
                      Compare features and click <span className="text-gold font-mono">Select &amp; Continue</span> to choose your session date.
                    </p>
                  </div>

                  {/* Google-style Comparison Package Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plansList.map((plan) => {
                      const isSelected = selectedService.id === plan.id;
                      const purchasedBooking = userBookings.find(
                        (b) => b.plan_id === plan.id || b.plan_name === plan.name
                      );
                      const isPurchased = Boolean(purchasedBooking);

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedService(plan)}
                          className={`p-6 rounded-3xl border cursor-pointer flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                            isPurchased
                              ? 'bg-gradient-to-b from-emerald-950/40 via-glass-dark to-cosmos border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.25)] scale-[1.02]'
                              : plan.isPopular
                              ? 'bg-gradient-to-b from-purple/20 via-glass-dark to-cosmos border-gold shadow-[0_0_40px_rgba(245,158,11,0.2)] scale-[1.02]'
                              : isSelected
                              ? 'bg-gold/10 border-gold/80 shadow-xl'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.05]'
                          }`}
                        >
                          {/* Top Badge: Purchased vs Popular */}
                          {isPurchased ? (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-cosmos text-[9px] font-mono font-bold uppercase tracking-widest py-1.5 px-4 rounded-bl-2xl shadow-md flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>CONFIRMED &amp; PAID</span>
                            </div>
                          ) : plan.isPopular ? (
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-gold to-amber-500 text-cosmos text-[9px] font-mono font-bold uppercase tracking-widest py-1 px-4 rounded-bl-2xl shadow-md">
                              ✦ MOST POPULAR ✦
                            </div>
                          ) : null}

                          <div className="space-y-4">
                            {/* Emoji & Header */}
                            <div className="flex items-center gap-3">
                              <span className="text-3xl select-none p-2.5 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                                {plan.emoji}
                              </span>
                              <div>
                                <h5 className="text-base font-display font-medium text-white">{plan.name}</h5>
                                <span className="text-[10px] text-gold-soft font-mono uppercase tracking-wider block mt-0.5">
                                  {plan.bestFor}
                                </span>
                              </div>
                            </div>

                            {/* Price & Duration */}
                            <div className="py-3 border-y border-white/10 flex items-baseline justify-between">
                              <div>
                                <span className="text-3xl font-bold font-mono text-gold">₹{plan.price}</span>
                                <span className="text-xs text-white/40 ml-1 font-mono">INR</span>
                              </div>
                              <span className="text-xs font-mono text-white/70 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                                ⏱️ {plan.duration}
                              </span>
                            </div>

                            <p className="text-xs text-white/65 leading-relaxed font-sans">
                              {plan.desc}
                            </p>

                            {/* Features Checklist inside the Block */}
                            <div className="pt-2 space-y-2.5">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                                Included Session Features:
                              </span>
                              <ul className="space-y-2 text-xs text-white/80">
                                {plan.features.map((feat, fIdx) => (
                                  <li key={fIdx} className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 mt-0.5 text-[10px] border border-gold/40">
                                      ✓
                                    </span>
                                    <span className="leading-snug">{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Action Button */}
                          {isPurchased ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveInvoiceBooking(purchasedBooking);
                              }}
                              className="w-full mt-6 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-emerald-500 text-cosmos hover:bg-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                              <BadgeCheck className="w-4 h-4" />
                              <span>View Tax Invoice &amp; Pass</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedService(plan);
                                handleNext();
                              }}
                              className={`w-full mt-6 py-3 px-4 rounded-2xl font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                isSelected
                                  ? 'bg-gold text-cosmos shadow-lg shadow-gold/20 font-bold'
                                  : 'bg-white/10 hover:bg-gold/20 hover:text-gold border border-white/10 text-white'
                              }`}
                            >
                              <span>{isSelected ? 'Selected — Continue ➔' : 'Select & Continue'}</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Schedule Date Calendar */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-widest">
                      Step 2: Choose Appointment Date ({monthName} {currentYear})
                    </h4>
                    <span className="text-[10px] font-mono text-gold/90 bg-gold/10 border border-gold/25 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Today: {shortMonthName} {currentDay}, {currentYear}</span>
                    </span>
                  </div>

                  {/* Calendar Grid Header */}
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-white/40 mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="py-1 uppercase tracking-wider">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Blanks before 1st of month */}
                    {Array.from({ length: firstDayWeekday }).map((_, i) => (
                      <div key={`blank-${i}`} className="opacity-0 pointer-events-none" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const isPast = day <= currentDay;
                      const isToday = day === currentDay;
                      const isSelected = selectedDate === day;
                      const avail = getDayAvailability(day);

                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={isPast || avail.status === 'booked'}
                          onClick={() => !isPast && avail.status !== 'booked' && setSelectedDate(day)}
                          className={`aspect-square rounded-xl p-1.5 flex flex-col justify-between transition-all border text-left ${
                            isPast
                              ? 'bg-white/[0.01] border-white/5 text-white/20 cursor-not-allowed opacity-25 select-none'
                              : avail.status === 'booked'
                              ? 'bg-red-500/5 border-red-500/10 text-white/20 cursor-not-allowed select-none'
                              : isSelected
                              ? 'bg-gold/20 border-gold text-gold font-bold shadow-lg shadow-gold/20 scale-[1.03]'
                              : 'bg-white/3 border-white/10 hover:border-gold/40 hover:bg-white/5 text-white/90 cursor-pointer'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-mono font-semibold">{day}</span>
                            {isToday && (
                              <span className="text-[6px] font-mono uppercase bg-white/10 text-white/50 px-1 py-0.5 rounded">
                                Today
                              </span>
                            )}
                          </div>

                          {isPast ? (
                            <span className="text-[7px] font-mono text-white/30 self-end">Closed</span>
                          ) : avail.status !== 'booked' ? (
                            <span className={`text-[7px] font-mono leading-none self-end scale-90 origin-right ${
                              avail.status === 'limited' ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {avail.remaining} left
                            </span>
                          ) : (
                            <span className="text-[7px] font-mono text-red-400/60 self-end">Full</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Select Time Slots */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-widest border-b border-white/5 pb-2.5">
                    Step 3: Select Available Time Slot
                  </h4>

                  {[
                    { label: 'Morning Slots', list: ['09:00 AM', '10:00 AM', '11:00 AM'] },
                    { label: 'Afternoon Slots', list: ['02:00 PM', '03:00 PM', '04:00 PM'] },
                    { label: 'Evening Slots', list: ['06:00 PM', '07:00 PM'] },
                  ].map((sec) => (
                    <div key={sec.label} className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono tracking-wider text-white/45 uppercase">{sec.label}</span>
                      <div className="flex flex-wrap gap-2.5">
                        {sec.list.map((time) => {
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-semibold cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-gold/15 border-gold text-gold shadow-md'
                                  : 'bg-white/3 border-white/5 hover:bg-white/5 text-white/70'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Birth Details & Consultation notes */}
              {step === 4 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-widest border-b border-white/5 pb-2.5">
                    Step 4: Enter Personal &amp; Birth Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Basic Info */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Your Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Dev"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-white/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Email Address</label>
                        <input
                          type="email"
                          placeholder="e.g. rahul@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-white/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 1234567890"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-white/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Right Column: Birth Coordinates */}
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Date of Birth</label>
                          <DobInput
                            value={formData.dob}
                            onChange={(iso) => setFormData({ ...formData, dob: iso })}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Birth Time</label>
                          <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-white/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Birth Place with live dropdown */}
                      <div className="relative">
                        <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Birth Place</label>
                        <input
                          type="text"
                          placeholder="Search city of birth..."
                          value={autocompleteInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAutocompleteInput(val);
                            setFormData({ ...formData, place: val });
                            setShowDropdown(true);
                            if (val.trim().length >= 2) {
                              fetchSuggestions(val);
                            } else {
                              setSuggestions([]);
                            }
                          }}
                          className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-white/20 transition-all"
                        />
                        {showDropdown && autocompleteInput.trim() && (
                          <div className="absolute top-[105%] left-0 right-0 bg-[#0f1122]/98 border border-white/10 rounded-xl p-1 z-30 shadow-2xl max-h-40 overflow-y-auto divide-y divide-white/5">
                            {suggestions.length > 0 ? (
                              suggestions.map((item) => (
                                <div
                                  key={item.place_id}
                                  onClick={() => {
                                    setFormData({ ...formData, place: item.display_name });
                                    setAutocompleteInput(item.display_name);
                                    setShowDropdown(false);
                                  }}
                                  className="px-3.5 py-2 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer font-sans"
                                >
                                  {item.display_name}
                                </div>
                              ))
                            ) : (
                              <div
                                onClick={() => {
                                  setFormData({ ...formData, place: autocompleteInput });
                                  setShowDropdown(false);
                                }}
                                className="px-3.5 py-2 text-xs text-gold-soft hover:text-gold hover:bg-white/5 rounded-lg cursor-pointer font-sans"
                              >
                                ✨ Use "{autocompleteInput}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 select-none text-xs text-white/70">
                        <input
                          type="checkbox"
                          id="recording-chk"
                          checked={formData.includeRecording}
                          onChange={(e) => setFormData({ ...formData, includeRecording: e.target.checked })}
                          className="w-4 h-4 border border-white/15 accent-gold"
                        />
                        <label htmlFor="recording-chk" className="cursor-pointer">
                          Include video recording &amp; remedy notes (+₹200)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Focus Tags */}
                  <div className="border-t border-white/5 pt-3.5 mt-2 flex flex-col gap-2.5">
                    <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">
                      Quick tags (Select to pre-fill notes)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="px-2.5 py-1 rounded-lg bg-white/3 border border-white/5 hover:border-gold/25 text-[10px] text-white/80 cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2.5}
                      placeholder="Enter specific questions or challenges you'd like Acharyaa Smita Mishra to prepare remedies for..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl p-3 text-xs text-white outline-none placeholder-white/20 resize-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Review & Simulated Pay */}
              {step === 5 && (
                <div className="flex flex-col gap-5">
                  <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-widest border-b border-white/5 pb-2.5">
                    Step 5: Review Booking &amp; Secure Checkout
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Summary log */}
                    <div className="p-4 bg-white/3 border border-white/5 rounded-2xl flex flex-col gap-3 text-xs text-white/70">
                      <h5 className="font-semibold text-white border-b border-white/5 pb-2">Session Summary</h5>
                      <div className="flex justify-between">
                        <span>Consultation Type</span>
                        <strong className="text-white">{selectedService.name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Scheduled Date</span>
                        <strong className="text-white">{formattedSelectedDate}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Scheduled Time</span>
                        <strong className="text-white">{selectedTime || '10:30 AM'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Birth Place</span>
                        <strong className="text-white">{formData.place || 'Delhi, India'}</strong>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2.5 font-bold text-gold text-sm">
                        <span>Total Due</span>
                        <span>₹{selectedService.price + (formData.includeRecording ? 200 : 0)}</span>
                      </div>
                    </div>

                    {/* Pay channels */}
                    <div className="flex flex-col gap-4">
                      <h5 className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-1">
                        Secure Payment Methods
                      </h5>

                      <div className="flex gap-2.5">
                        {['upi', 'card', 'netbanking'].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method as any)}
                            className={`flex-1 py-3 rounded-xl border text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
                              paymentMethod === method
                                ? 'bg-gold/15 border-gold text-gold shadow-md'
                                : 'bg-white/3 border-white/5 text-white/55 hover:bg-white/5'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>

                      {/* Security badge statement */}
                      <p className="text-[10px] text-white/40 leading-relaxed font-sans mt-1">
                        🔒 Secured by SSL 256-bit encryption. Supported payment methods: UPI, Cards (Visa/Mastercard), and Net Banking.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Footer Navigation Controls */}
        {!bookingConfirmed && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 text-xs text-white/60 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {step === 5 ? (
              <button
                onClick={handleRazorpayPayment}
                disabled={isProcessingPayment}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-gold via-gold-soft to-amber-500 text-cosmos font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-gold/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-cosmos border-t-transparent rounded-full animate-spin" />
                    <span>Connecting Gateway...</span>
                  </>
                ) : (
                  <span>Pay &amp; Confirm Booking (₹{selectedService.price + (formData.includeRecording ? 200 : 0)})</span>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={
                  (step === 2 && !selectedDate) ||
                  (step === 3 && !selectedTime)
                }
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Official Legal Tax Invoice & Consultation Pass Modal */}
      <AnimatePresence>
        {activeInvoiceBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#0c0e21] border border-gold/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative overflow-hidden flex flex-col gap-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.jpg" alt="GrahGanit Emblem" className="w-10 h-10 rounded-full border border-gold/40 shadow-md object-cover" />
                  <div>
                    <h3 className="font-display font-bold text-base text-white">GrahGanit Observatory</h3>
                    <p className="text-[10px] font-mono text-gold-soft uppercase tracking-wider">OFFICIAL TAX INVOICE &amp; APPOINTMENT PASS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInvoiceBooking(null)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Verified Status Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    ✓ 100% VERIFIED &amp; PAID BOOKING
                  </span>
                  <span className="text-[11px] text-white/70">
                    Payment verified by Razorpay Gateway. Session slot reserved.
                  </span>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Pass / Receipt No:</span>
                  <span className="text-gold font-bold">{activeInvoiceBooking.id || activeInvoiceBooking.payment_id}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Package:</span>
                  <span className="text-white font-semibold">{activeInvoiceBooking.plan_name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Consultant:</span>
                  <span className="text-white">Acharyaa Smita Mishra</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Scheduled Date:</span>
                  <span className="text-emerald-400 font-bold">{activeInvoiceBooking.date}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Scheduled Time:</span>
                  <span className="text-emerald-400 font-bold">{activeInvoiceBooking.time}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Amount Paid:</span>
                  <span className="text-gold font-bold text-sm">₹{activeInvoiceBooking.amount} INR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Transaction ID:</span>
                  <span className="text-white/80">{activeInvoiceBooking.payment_id || 'pay_verified'}</span>
                </div>
              </div>

              {/* Business & Legal Footer */}
              <div className="text-[10px] text-white/40 space-y-1 font-mono border-t border-white/10 pt-3">
                <p>🏢 <strong>GrahGanit Observatory (Pvt. Ltd.)</strong></p>
                <p>📍 167B, Second Floor, Gaur City Center, Greater Noida West, UP - 201318</p>
                <p>📜 Reg No: UP/07/2026/001928 · GSTIN: 07AAACG9281F1Z2</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gold text-cosmos font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gold-soft transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/20"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInvoiceBooking(null)}
                  className="py-3 px-5 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default BookingWizard;
