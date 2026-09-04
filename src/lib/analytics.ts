/**
 * Google Analytics 4 (GA4) Analytics Engine for GrahGanit
 * 
 * Features:
 * - Native gtag script loader (zero external runtime dependencies)
 * - Safe SSR / Server-side rendering guard
 * - Automatic no-op when VITE_GA_MEASUREMENT_ID is absent
 * - Client-side SPA route transition & query string pageview tracking
 * - Standardized GA4 Ecommerce purchase funnel:
 *     begin_checkout -> payment_initiated -> checkout_abandoned | payment_failed | purchase
 * - Transaction ID deduplication to prevent inflated revenue metrics
 * - Strict PII protection (names, emails, phone numbers, exact birth details are stripped)
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Configured measurement ID (e.g. "G-XXXXXXXXXX")
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || '';

// Internal state tracking
let isInitialized = false;
const trackedTransactions = new Set<string>();

// Seed deduplication set from localStorage if available (guards across page reloads/refreshes)
if (typeof window !== 'undefined') {
  try {
    const storedTxns = JSON.parse(localStorage.getItem('grahganit_ga_purchases') || '[]');
    if (Array.isArray(storedTxns)) {
      storedTxns.forEach((tx) => trackedTransactions.add(tx));
    }
  } catch {
    // Graceful fallback if localStorage is restricted
  }
}

/**
 * Initialize Google Analytics 4 script tag dynamically on client mount.
 * Safe to call multiple times (idempotent). Completely dormant if no measurement ID is configured.
 */
export function initGA(): void {
  if (typeof window === 'undefined') return;
  if (!GA_MEASUREMENT_ID) {
    return; // Silent no-op for local development when unconfigured
  }
  if (isInitialized) return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  // Configure gtag
  window.gtag('js', new Date());
  // Disable automatic pageviews so TanStack Router SPA listener has 100% control over route tracking
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  });

  // Inject gtag.js script if not already present in DOM
  const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`);
  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  isInitialized = true;
}

/**
 * Track SPA page views with full pathname and search parameters.
 */
export function trackPageView(pathWithSearch: string, title?: string): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: pathWithSearch,
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    send_to: GA_MEASUREMENT_ID,
  });
}

/**
 * Generic custom event dispatcher.
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', eventName, params);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Astrology Domain Events (Privacy-conscious, strictly no PII)
 * ───────────────────────────────────────────────────────────────────────────── */

export function trackKundliCalculated(params?: {
  ayanamsa?: string;
  chart_style?: string;
  has_doshas?: boolean;
  moon_sign?: string;
  ascendant?: string;
}): void {
  trackEvent('kundli_calculated', {
    calculation_type: 'kundli',
    ayanamsa: params?.ayanamsa || 'Lahiri',
    chart_style: params?.chart_style || 'north_indian',
    has_doshas: params?.has_doshas ?? false,
    moon_sign: params?.moon_sign,
    ascendant: params?.ascendant,
  });
}

export function trackNumerologyCalculated(params?: {
  calculation_type?: string;
  system?: string;
}): void {
  trackEvent('numerology_calculated', {
    calculation_type: params?.calculation_type || 'full_profile',
    system: params?.system || 'chaldean',
  });
}

export function trackPalmistryUsed(params?: {
  scan_type?: string;
}): void {
  trackEvent('palmistry_used', {
    feature: 'palmistry',
    scan_type: params?.scan_type || 'photo_analysis',
  });
}

export function trackReportViewed(params: {
  report_type: string;
  report_id?: string;
  view_mode?: string;
}): void {
  trackEvent('report_viewed', {
    report_type: params.report_type,
    report_id: params.report_id || params.report_type,
    view_mode: params.view_mode || 'standard',
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
 * GA4 Standard Ecommerce & Razorpay Funnel Events
 * ───────────────────────────────────────────────────────────────────────────── */

export interface CartItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
}

/**
 * 1. Fired when a user enters the consultation/report checkout review step.
 */
export function trackBeginCheckout(params: {
  value: number;
  currency?: string;
  items: CartItem[];
}): void {
  trackEvent('begin_checkout', {
    currency: params.currency || 'INR',
    value: params.value,
    items: params.items.map((it) => ({
      item_id: it.item_id,
      item_name: it.item_name,
      price: it.price,
      quantity: it.quantity || 1,
      item_category: it.item_category || 'consultation',
    })),
  });
}

/**
 * 2. Fired when the Razorpay payment modal is opened.
 */
export function trackPaymentInitiated(params: {
  order_id: string;
  plan_id: string;
  value: number;
  currency?: string;
}): void {
  trackEvent('payment_initiated', {
    order_id: params.order_id,
    plan_id: params.plan_id,
    currency: params.currency || 'INR',
    value: params.value,
  });
}

/**
 * 3a. Fired when the user voluntarily closes or dismisses the Razorpay checkout modal.
 */
export function trackCheckoutAbandoned(params: {
  order_id: string;
  plan_id: string;
}): void {
  trackEvent('checkout_abandoned', {
    order_id: params.order_id,
    plan_id: params.plan_id,
  });
}

/**
 * 3b. Fired when payment is rejected by the bank, gateway error, or signature tampering detected.
 */
export function trackPaymentFailed(params: {
  order_id: string;
  plan_id: string;
  error_code?: string;
  error_description?: string;
}): void {
  trackEvent('payment_failed', {
    order_id: params.order_id,
    plan_id: params.plan_id,
    error_code: params.error_code || 'unknown_error',
    error_description: params.error_description || 'Payment failed or signature invalid',
  });
}

/**
 * 4. Fired ONLY AFTER server-side HMAC SHA256 verification confirms the payment.
 * Guarded with transaction_id deduplication so re-renders or retries don't inflate revenue metrics.
 */
export function trackPurchase(params: {
  transaction_id: string;
  order_id: string;
  value: number;
  currency?: string;
  items: CartItem[];
}): void {
  if (!params.transaction_id) return;

  // Deduplication check (memory + localStorage)
  if (trackedTransactions.has(params.transaction_id)) {
    return;
  }
  trackedTransactions.add(params.transaction_id);
  if (typeof window !== 'undefined') {
    try {
      const storedTxns = JSON.parse(localStorage.getItem('grahganit_ga_purchases') || '[]');
      const updated = Array.isArray(storedTxns) ? [...storedTxns, params.transaction_id] : [params.transaction_id];
      localStorage.setItem('grahganit_ga_purchases', JSON.stringify(updated.slice(-100))); // Keep last 100
    } catch {
      // Graceful fallback
    }
  }

  trackEvent('purchase', {
    transaction_id: params.transaction_id,
    order_id: params.order_id,
    currency: params.currency || 'INR',
    value: params.value,
    items: params.items.map((it) => ({
      item_id: it.item_id,
      item_name: it.item_name,
      price: it.price,
      quantity: it.quantity || 1,
      item_category: it.item_category || 'consultation',
    })),
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Consultation Lifecycle Events (Privacy-conscious, strictly no PII or raw payment IDs)
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Fired when a user successfully completes a booking and reaches confirmation state.
 */
export function trackBookingConfirmed(params: {
  plan_id: string;
  value: number;
  currency?: string;
}): void {
  trackEvent('booking_confirmed', {
    plan_id: params.plan_id,
    value: params.value,
    currency: params.currency || 'INR',
  });
}

/**
 * Fired when the authenticated My Bookings dashboard is loaded with the user's booking count.
 */
export function trackMyBookingsViewed(params: {
  total_bookings: number;
  has_upcoming: boolean;
}): void {
  trackEvent('my_bookings_viewed', {
    total_bookings: params.total_bookings,
    has_upcoming: params.has_upcoming,
  });
}

/**
 * Fired when the user opens the comprehensive Booking Details modal/drawer.
 */
export function trackBookingDetailsViewed(params: {
  plan_id: string;
  status: string;
}): void {
  trackEvent('booking_details_viewed', {
    plan_id: params.plan_id,
    status: params.status,
  });
}

/**
 * Fired when the user clicks the active [Join Consultation] button.
 */
export function trackJoinConsultation(params: {
  plan_id: string;
}): void {
  trackEvent('join_consultation', {
    plan_id: params.plan_id,
  });
}
