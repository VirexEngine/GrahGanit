import { useState, useEffect, useRef } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Navbar } from '@/components/site/Navbar'
import { FloatingActions } from '@/components/site/Sections'
import { OnboardingWizard } from '@/components/authentication/OnboardingWizard'
import { GoogleAuthButton } from '@/components/authentication/GoogleAuthButton'
import { getActiveProfile, clearUserProfile, saveUserProfile, generateCosmicProfile, UserProfile } from '@/utils/profile'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass, Star, Calendar, ArrowRight, Heart, LogOut,
  ShieldCheck, Lock, EyeOff, Eye, Mail, Sparkles, ChevronRight,
  Phone, CheckCircle2, RefreshCw, KeyRound, UserCheck, User
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: 'Sign In | GrahGanit — Precision Vedic Astrology & Planetary Mathematics' },
      { name: 'description', content: 'Access your personalized Kundli, Vedic chart, and cosmic planetary calculations on GrahGanit.' }
    ],
  }),
})

// ─── Vedic Sri Yantra SVG ────────────────────────────────────────────────────
function SriYantra({ size = 320 }: { size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.43;
  const up = [0.88, 0.65, 0.44, 0.27].map(s => {
    const h = r * s;
    return `${cx},${cy - h} ${cx - h * 0.866},${cy + h * 0.5} ${cx + h * 0.866},${cy + h * 0.5}`;
  });
  const dn = [0.80, 0.57, 0.37, 0.20].map(s => {
    const h = r * s;
    return `${cx},${cy + h} ${cx - h * 0.866},${cy - h * 0.5} ${cx + h * 0.866},${cy - h * 0.5}`;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {/* Outer rings */}
      {[1, 0.92, 0.84].map((ratio, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * ratio}
          stroke="#d4af78" strokeWidth={i === 0 ? 1 : 0.5} opacity={0.18 + i * 0.06} />
      ))}
      {/* 16 outer lotus petals */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 16;
        const pr = r * 0.79; const px = cx + Math.cos(a) * pr; const py = cy + Math.sin(a) * pr;
        return <ellipse key={i} cx={px} cy={py} rx={r * 0.09} ry={r * 0.04}
          transform={`rotate(${(i * 360) / 16 + 90} ${px} ${py})`}
          stroke="#d4af78" strokeWidth={0.5} opacity={0.28} fill="rgba(212,175,78,0.04)" />;
      })}
      {/* 8 inner lotus petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
        const pr = r * 0.59; const px = cx + Math.cos(a) * pr; const py = cy + Math.sin(a) * pr;
        return <ellipse key={i} cx={px} cy={py} rx={r * 0.1} ry={r * 0.04}
          transform={`rotate(${(i * 360) / 8 + 90} ${px} ${py})`}
          stroke="#d4af78" strokeWidth={0.6} opacity={0.35} fill="rgba(212,175,78,0.05)" />;
      })}
      {/* Upward triangles */}
      {up.map((pts, i) => <polygon key={`u${i}`} points={pts}
        stroke="#d4af78" strokeWidth={0.9 - i * 0.15} opacity={0.5 - i * 0.06} fill="none" />)}
      {/* Downward triangles */}
      {dn.map((pts, i) => <polygon key={`d${i}`} points={pts}
        stroke="#e8c56a" strokeWidth={0.9 - i * 0.15} opacity={0.42 - i * 0.06} fill="none" />)}
      {/* Central bindu */}
      <circle cx={cx} cy={cy} r={5} fill="#d4af78" opacity={0.9} />
      <circle cx={cx} cy={cy} r={2.5} fill="#fffde7" opacity={1} />
    </svg>
  );
}

// ─── Nakshatra constellation ring (27 stars, no repeated zodiac signs) ───────
function NakshatraRing({ size = 320 }: { size?: number }) {
  const names = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
    'Pushya','Ashlesha','Magha','P.Phalguni','U.Phalguni','Hasta','Chitra',
    'Swati','Vishakha','Anuradha','Jyeshtha','Mula','P.Ashadha','U.Ashadha',
    'Shravana','Dhanishtha','Shatabhisha','P.Bhadra','U.Bhadra','Revati',
  ];
  const cx = size / 2, cy = size / 2, r = size * 0.47;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" className="absolute inset-0 pointer-events-none">
      {/* Dashed outer ring */}
      <circle cx={cx} cy={cy} r={r} stroke="#d4af78" strokeWidth={0.4} opacity={0.15} strokeDasharray="2 6" />
      {names.map((name, i) => {
        const angle = (i * Math.PI * 2) / 27 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        // Small star dot at each position
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={1.8} fill="#d4af78" opacity={0.45 + (i % 3) * 0.1} />
            {/* Connect to center with faint line */}
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#d4af78" strokeWidth={0.2} opacity={0.06} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Vedic Planet Table (left-panel decorative element) ──────────────────────
const PLANETS_DATA = [
  { symbol: '☀', name: 'Surya', quality: 'Soul & Vitality', color: '#f59e0b' },
  { symbol: '☽', name: 'Chandra', quality: 'Mind & Emotion', color: '#e2e8f0' },
  { symbol: '♂', name: 'Mangala', quality: 'Courage & Action', color: '#ef4444' },
  { symbol: '☿', name: 'Budha', quality: 'Intellect & Speech', color: '#10b981' },
  { symbol: '♃', name: 'Guru', quality: 'Wisdom & Grace', color: '#f59e0b' },
  { symbol: '♀', name: 'Shukra', quality: 'Beauty & Love', color: '#f0abfc' },
  { symbol: '♄', name: 'Shani', quality: 'Discipline & Karma', color: '#94a3b8' },
];

// ─── Left Panel ──────────────────────────────────────────────────────────────
function AstrologicalPanel() {
  const MANTRAS = [
    { devanagari: 'ॐ नमः शिवाय', roman: 'Om Namah Shivaya', meaning: 'I bow to the auspicious consciousness' },
    { devanagari: 'ॐ ऐं ह्रीं श्रीं', roman: 'Om Aim Hrim Shrim', meaning: 'Sacred seed syllables of the Mahavidyas' },
    { devanagari: 'ॐ भूर्भुवः स्वः', roman: 'Gayatri Mantra', meaning: 'We meditate on the divine light of the sun' },
    { devanagari: 'ॐ गं गणपतये नमः', roman: 'Om Gam Ganapataye Namaha', meaning: 'Salutation to the remover of obstacles' },
  ];
  const [mantraIdx, setMantraIdx] = useState(0);
  const [visiblePlanets, setVisiblePlanets] = useState<number[]>([]);

  useEffect(() => {
    const t = setInterval(() => setMantraIdx(i => (i + 1) % MANTRAS.length), 4500);
    return () => clearInterval(t);
  }, []);

  // Stagger planet row appearance
  useEffect(() => {
    PLANETS_DATA.forEach((_, i) => {
      setTimeout(() => setVisiblePlanets(prev => [...prev, i]), i * 120);
    });
  }, []);

  return (
    <div className="hidden lg:flex relative flex-col items-center justify-center h-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/cosmic-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.75) saturate(1.25)',
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050310]/70 via-transparent to-[#050310]/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050310]/45" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full px-10 max-w-md">
        {/* OM */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-7xl leading-none font-serif"
          style={{ color: '#f59e0b', textShadow: '0 0 50px rgba(245,158,11,0.8), 0 0 100px rgba(245,158,11,0.4)', fontFamily: 'serif' }}
        >
          ॐ
        </motion.div>

        {/* Sri Yantra with Nakshatra Ring */}
        <div className="relative" style={{ width: 280, height: 280 }}>
          {/* Nakshatra dots ring — static, no rotation */}
          <NakshatraRing size={280} />

          {/* Yantra — very slow rotation */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <SriYantra size={280} />
          </motion.div>

          {/* Center pulsing glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.8), transparent 70%)', filter: 'blur(6px)' }}
            />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <div className="font-serif text-2xl tracking-[0.25em] font-light mb-0.5"
            style={{ color: '#f0d080', textShadow: '0 0 18px rgba(212,175,78,0.5)', letterSpacing: '0.25em' }}>
            GRAHGANIT
          </div>
          <div className="text-[9px] font-mono tracking-[0.4em] text-amber-200/40 uppercase">Vedic · Planetary Mathematics · Kundali</div>
        </div>

        {/* Animated Mantra */}
        <div className="text-center min-h-[64px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={mantraIdx}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-1 items-center"
            >
              <div className="text-lg font-serif text-amber-300 leading-snug"
                style={{ textShadow: '0 0 16px rgba(212,175,78,0.5)', fontFamily: 'serif' }}>
                {MANTRAS[mantraIdx].devanagari}
              </div>
              <div className="text-[10px] font-mono tracking-widest text-amber-400/50 uppercase">
                {MANTRAS[mantraIdx].roman}
              </div>
              <div className="text-[11px] text-white/35 italic max-w-xs text-center">
                {MANTRAS[mantraIdx].meaning}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navagraha Planet Row */}
        <div className="w-full">
          <div className="text-[9px] font-mono tracking-[0.3em] text-amber-200/35 uppercase mb-3 text-center">
            Navagraha · Nine Planets
          </div>
          <div className="grid grid-cols-7 gap-1">
            {PLANETS_DATA.map((planet, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={visiblePlanets.includes(i) ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-1 p-2 rounded-xl"
                style={{ background: 'rgba(212,175,78,0.05)', border: '1px solid rgba(212,175,78,0.1)' }}
              >
                <span className="text-lg leading-none" style={{ color: planet.color, textShadow: `0 0 8px ${planet.color}60` }}>
                  {planet.symbol}
                </span>
                <span className="text-[7px] text-amber-200/40 font-mono text-center leading-tight">{planet.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer trust */}
        <div className="text-[9px] font-mono text-amber-200/25 tracking-widest text-center">
          20,000+ SEEKERS · VEDIC ASTROLOGY SINCE 2019
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
function RouteComponent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<{ name: string; email: string; picture?: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Sign In vs Sign Up (Defaults to Sign Up if no user registered)
  const [isSignUp, setIsSignUp] = useState(true);
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP 6-digit State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const trackedAuthEventsRef = useRef<Set<string>>(new Set());

  // UI state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const navigate = useNavigate();

  const syncState = () => setProfile(getActiveProfile());

  useEffect(() => {
    syncState();
    // Warm up backend API immediately on page load
    fetch('/health').catch(() => {});
    window.addEventListener('grahganit_profile_sync', syncState);
    return () => window.removeEventListener('grahganit_profile_sync', syncState);
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Handlers for OTP inputs
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => { newDigits[i] = char; });
      setOtpDigits(newDigits);
      if (pasted.length > 0) {
        const nextIdx = Math.min(pasted.length, 5);
        otpInputRefs.current[nextIdx]?.focus();
      }
      return;
    }
    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Send OTP via Resend API
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !surname.trim() || !email.trim() || !phoneNumber.trim()) {
      setFormError('Please fill in all details (First Name, Surname, Email ID, Phone Number).');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const apiOrigin = typeof window !== 'undefined' && window.location.hostname === 'grahganit.in' ? 'https://www.grahganit.in' : '';
      const res = await fetch(`${apiOrigin}/api/user/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          surname: surname.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Error sending verification code.');
      }
      setFormSuccess(data.message || `Verification code sent to ${email}. Check your inbox.`);
      setOtpDigits(['', '', '', '', '', '']);
      setCooldown(60);
      setRegStep(2);
    } catch (err: any) {
      setFormError(err.message || 'Error sending OTP code.');
    } finally {
      setFormLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setFormError('Please enter the full 6-digit verification code.');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const apiOrigin = typeof window !== 'undefined' && window.location.hostname === 'grahganit.in' ? 'https://www.grahganit.in' : '';
      const res = await fetch(`${apiOrigin}/api/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: fullOtp
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid or expired verification code.');
      setFormSuccess('Code verified! Now set your account password.');
      setRegStep(3);
    } catch (err: any) {
      setFormError(err.message || 'OTP verification error.');
    } finally {
      setFormLoading(false);
    }
  };

  // Step 3: Register Account & Save to DB
  const handleRegisterAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const apiOrigin = typeof window !== 'undefined' && window.location.hostname === 'grahganit.in' ? 'https://www.grahganit.in' : '';
      const res = await fetch(`${apiOrigin}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          surname: surname.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim(),
          password: password,
          otp: otpDigits.join('')
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Account registration failed.');

      // Fire GA4 sign_up event (guarded against duplicate triggers, zero PII)
      const signupEventKey = `signup_email_${email.trim().toLowerCase()}`;
      if (!trackedAuthEventsRef.current.has(signupEventKey)) {
        trackedAuthEventsRef.current.add(signupEventKey);
        trackEvent('sign_up', { method: 'email' });
      }

      const fullName = `${firstName.trim()} ${surname.trim()}`;
      setAuthUser({ name: fullName, email: email.trim() });
    } catch (err: any) {
      setFormError(err.message || 'Registration error.');
    } finally {
      setFormLoading(false);
    }
  };

  // Sign In handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const apiOrigin = typeof window !== 'undefined' && window.location.hostname === 'grahganit.in' ? 'https://www.grahganit.in' : '';
      const res = await fetch(`${apiOrigin}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Sign in failed.');

      // Fire GA4 login event (guarded against duplicate triggers, zero PII)
      const loginEventKey = `login_email_${email.trim().toLowerCase()}_${Date.now()}`;
      if (!trackedAuthEventsRef.current.has(loginEventKey)) {
        trackedAuthEventsRef.current.add(loginEventKey);
        trackEvent('login', { method: 'email' });
      }

      // If user already has a saved birth profile, restore it directly to dashboard
      if (data.user.has_profile && data.user.profile?.dob) {
        const p = data.user.profile;
        const userProfile = generateCosmicProfile({
          name: p.name || data.user.name,
          email: p.email || data.user.email,
          phoneNumber: p.phone_number || data.user.phone_number || '',
          photoUrl: p.photo_url || data.user.picture || undefined,
          gender: p.gender || 'Male',
          country: p.country || 'India',
          language: p.language || 'English',
          dob: p.dob,
          time: p.time || '12:00',
          place: p.place || 'Delhi, India',
          moonSign: p.moon_sign,
          ascendant: p.ascendant,
          nakshatra: p.nakshatra,
          lifePathNumber: p.life_path_number,
        });
        saveUserProfile(userProfile);
        setAuthUser(null);
        syncState();
      } else {
        setAuthUser({ name: data.user.name, email: data.user.email });
      }

      if (data.user.is_admin || email.trim() === 'admin@grahganit.in') {
        navigate({ to: '/admin' });
      }
    } catch (err: any) {
      setFormError(err.message || 'Sign in error.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleAuthSuccess = async (googleUser: { name: string; email: string; picture?: string }) => {
    setFormLoading(true);
    try {
      const apiOrigin = typeof window !== 'undefined' && window.location.hostname === 'grahganit.in' ? 'https://www.grahganit.in' : '';
      const res = await fetch(`${apiOrigin}/api/user/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser),
      });
      const data = await res.json();

      // Only fire sign_up / login if the API response explicitly indicates whether this is a new or existing user
      if (data?.is_new_user === true) {
        const googleSignupKey = `signup_google_${googleUser.email.trim().toLowerCase()}`;
        if (!trackedAuthEventsRef.current.has(googleSignupKey)) {
          trackedAuthEventsRef.current.add(googleSignupKey);
          trackEvent('sign_up', { method: 'google' });
        }
      } else if (data?.is_new_user === false) {
        const googleLoginKey = `login_google_${googleUser.email.trim().toLowerCase()}`;
        if (!trackedAuthEventsRef.current.has(googleLoginKey)) {
          trackedAuthEventsRef.current.add(googleLoginKey);
          trackEvent('login', { method: 'google' });
        }
      }

      // If existing user already has a saved birth profile in DB, restore directly!
      if (data?.user?.has_profile && data?.user?.profile?.dob) {
        const p = data.user.profile;
        const userProfile = generateCosmicProfile({
          name: p.name || googleUser.name,
          email: p.email || googleUser.email,
          phoneNumber: p.phone_number || '',
          photoUrl: googleUser.picture || p.photo_url || data?.user?.picture,
          gender: p.gender || 'Male',
          country: p.country || 'India',
          language: p.language || 'English',
          dob: p.dob,
          time: p.time || '12:00',
          place: p.place || 'Delhi, India',
          moonSign: p.moon_sign,
          ascendant: p.ascendant,
          nakshatra: p.nakshatra,
          lifePathNumber: p.life_path_number,
        });
        saveUserProfile(userProfile);
        setAuthUser(null);
        syncState();
      } else {
        setAuthUser({ name: googleUser.name, email: googleUser.email, picture: googleUser.picture });
      }
    } catch (e) {
      console.warn('Google backend sync notice:', e);
      setAuthUser({ name: googleUser.name, email: googleUser.email, picture: googleUser.picture });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSocialSignIn = (provider: 'google' | 'apple') => {
    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      const userEnteredName = prompt('Enter your name for ' + provider.toUpperCase() + ' sign-in:', '') || 'Seeker';
      const cleanEmail = email || `user@${provider}.com`;
      setAuthUser({ name: userEnteredName, email: cleanEmail });
    }, 400);
  };

  const handleOnboardingComplete = () => {
    setIsEditingProfile(false);
    setAuthUser(null);
    syncState();
  };
  const handleLogout = () => {
    clearUserProfile();
    setIsEditingProfile(false);
    setAuthUser(null);
    syncState();
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (pass.length < 10 || !/\d/.test(pass)) return { score: 2, label: 'Medium', color: '#f59e0b' };
    return { score: 3, label: 'Strong', color: '#10b981' };
  };
  const pwdStrength = getPasswordStrength(password);

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden flex flex-col bg-[#050310]">
      {/* Cosmic background image overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: 'url(/images/cosmic-bg.jpg)', filter: 'brightness(0.65) saturate(1.2)' }}
      />
      {/* Dark gradient vignette */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#050310]/80 via-transparent to-[#050310]/90" />

      {/* Subtle star field */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {[...Array(35)].map((_, i) => (
          <motion.div key={i}
            animate={{ opacity: [0.08, 0.45, 0.08] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.25 }}
            className="absolute rounded-full bg-amber-100"
            style={{
              width: i % 6 === 0 ? '2px' : '1px', height: i % 6 === 0 ? '2px' : '1px',
              left: `${(i * 11 + 5) % 100}%`, top: `${(i * 19 + 7) % 100}%`,
            }}
          />
        ))}
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 flex min-h-screen">
        <AnimatePresence mode="wait">

          {/* ── Logged-in Dashboard ── */}
          {profile && profile.dob && !isEditingProfile ? (
            <motion.div key="dashboard"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full flex items-center justify-center px-4 py-28"
            >
              <div className="w-full max-w-2xl rounded-3xl p-8 md:p-10"
                style={{ background: 'rgba(8,5,20,0.95)', border: '1px solid rgba(212,175,78,0.2)', backdropFilter: 'blur(24px)' }}>
                <div className="flex justify-between items-center border-b pb-5 mb-6" style={{ borderColor: 'rgba(212,175,78,0.1)' }}>
                  <div className="flex items-center gap-4">
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="w-14 h-14 rounded-full border border-gold/40 object-cover shadow-[0_0_20px_rgba(212,175,78,0.3)] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full border border-gold/40 bg-gradient-to-br from-purple to-cosmos flex items-center justify-center text-xl font-bold text-white shadow-inner shrink-0">
                        {profile.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="text-[9px] font-mono tracking-[0.3em] text-amber-400/50 mb-1">ॐ · CHART SYNCHRONISED</div>
                      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.4rem', fontWeight: 400, color: '#f5f0e8' }}>
                        Welcome, <span style={{ color: '#d4af78' }}>{profile.name}</span>
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditingProfile(true);
                        setAuthUser({ name: profile.name, email: profile.email });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-gold-soft hover:text-gold cursor-pointer transition-colors"
                      style={{ background: 'rgba(212,175,78,0.08)', border: '1px solid rgba(212,175,78,0.2)' }}
                      title="Adjust your birth date, time, or location"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold" /> Edit Details
                    </button>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {[
                    { label: 'Moon Sign', val: profile.moonSign },
                    { label: 'Ascendant', val: profile.ascendant },
                    { label: 'Nakshatra', val: profile.nakshatra },
                    { label: 'Life Path', val: profile.lifePathNumber },
                  ].map(c => (
                    <div key={c.label} className="p-4 rounded-2xl"
                      style={{ background: 'rgba(212,175,78,0.04)', border: '1px solid rgba(212,175,78,0.1)' }}>
                      <span className="text-[9px] font-mono tracking-wider block mb-1.5" style={{ color: 'rgba(212,175,78,0.5)' }}>{c.label}</span>
                      <span className="text-sm text-white font-medium">{c.val}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3.5 rounded-2xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    <span>Birth: <strong className="text-white font-medium">{profile.dob}</strong> @ <strong className="text-white font-medium">{profile.time}</strong></span>
                  </div>
                  <div className="text-white/60 truncate max-w-[240px]">
                    📍 <span className="text-white font-medium">{profile.place}</span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Kundli Chart', path: '/free-tools/kundli', icon: Compass },
                    { title: 'Compatibility', path: '/free-tools/compatibility', icon: Heart },
                    { title: 'Daily Horoscope', path: '/horoscopes/daily', icon: Calendar },
                    { title: 'Monthly Planner', path: '/horoscopes/monthly', icon: Star },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} onClick={() => navigate({ to: item.path })}
                        className="p-4 rounded-2xl cursor-pointer flex items-center justify-between group transition-all"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,78,0.2)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)'}
                      >
                        <span className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          <Icon className="w-4 h-4" style={{ color: 'rgba(212,175,78,0.55)' }} />
                          {item.title}
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all" style={{ color: '#d4af78' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

          ) : authUser || isEditingProfile ? (
            /* ── Onboarding / Birth Details ── */
            <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full flex items-center justify-center px-4 py-28">
              <div className="w-full max-w-xl">
                <OnboardingWizard
                  userName={profile?.name || authUser?.name || ''}
                  userEmail={profile?.email || authUser?.email || ''}
                  userPicture={profile?.photoUrl || authUser?.picture}
                  onComplete={handleOnboardingComplete}
                />
              </div>
            </motion.div>

          ) : (
            /* ── Login / Register Split Layout ── */
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

              {/* Left: Astrological Visual */}
              <AstrologicalPanel />

              {/* Right: Auth Card */}
              <div className="flex items-center justify-center px-6 sm:px-10 py-24 lg:py-16 relative">
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,175,78,0.055) 0%, transparent 70%)' }} />

                <motion.div
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="w-full max-w-[440px]"
                >
                  {/* Card */}
                  <div className="rounded-[2rem] overflow-hidden"
                    style={{
                      background: 'linear-gradient(160deg, rgba(12,8,26,0.98) 0%, rgba(7,4,18,0.99) 100%)',
                      border: '1px solid rgba(212,175,78,0.2)',
                      boxShadow: '0 0 0 1px rgba(255,255,255,0.025) inset, 0 40px 100px rgba(0,0,0,0.75), 0 0 70px rgba(212,175,78,0.035)',
                    }}
                  >
                    {/* Gold top bar */}
                    <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

                    <div className="p-8 md:p-9">
                      {/* Header */}
                      <div className="mb-6">
                        <motion.div
                          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}
                          className="text-2xl font-serif mb-2 leading-none text-center"
                          style={{ color: '#f59e0b', textShadow: '0 0 20px rgba(245,158,11,0.6)', fontFamily: 'serif' }}>
                          ॐ
                        </motion.div>
                        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', lineHeight: 1.25, fontWeight: 400, color: '#f5f0e8', marginBottom: '0.3rem' }} className="text-center">
                          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-[12px] text-center" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'system-ui' }}>
                          {isSignUp
                            ? 'Create an ID to access your sacred birth chart'
                            : 'Sign in to access your sacred readings'}
                        </p>

                        {/* Registration Step Indicator */}
                        {isSignUp && (
                          <div className="flex items-center justify-between mt-5 px-3 py-2 rounded-xl"
                            style={{ background: 'rgba(212,175,78,0.04)', border: '1px solid rgba(212,175,78,0.1)' }}>
                            {[
                              { step: 1, label: '1. Details' },
                              { step: 2, label: '2. Verify OTP' },
                              { step: 3, label: '3. Password' }
                            ].map(s => (
                              <div key={s.step} className="flex items-center gap-1.5">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                                  regStep === s.step
                                    ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                    : regStep > s.step
                                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                    : 'bg-white/5 text-white/30'
                                }`}>
                                  {regStep > s.step ? '✓' : s.step}
                                </div>
                                <span className={`text-[10px] font-mono ${
                                  regStep === s.step ? 'text-amber-300 font-medium' : 'text-white/30'
                                }`}>
                                  {s.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Error & Success Alerts */}
                      {formError && (
                        <div className="mb-4 p-3 rounded-xl text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400">
                          {formError}
                        </div>
                      )}
                      {formSuccess && (
                        <div className="mb-4 p-3 rounded-xl text-xs font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{formSuccess}</span>
                        </div>
                      )}

                      {/* ──────────────── SIGN UP FLOW ──────────────── */}
                      {isSignUp ? (
                        <div>
                          {/* STEP 1: Details */}
                          {regStep === 1 && (
                            <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-mono tracking-widest text-amber-300/40 uppercase mb-1">First Name</label>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
                                    <input
                                      type="text"
                                      required
                                      value={firstName}
                                      onChange={e => setFirstName(e.target.value)}
                                      placeholder="First name"
                                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-amber-400/50"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono tracking-widest text-amber-300/40 uppercase mb-1">Surname</label>
                                  <input
                                    type="text"
                                    required
                                    value={surname}
                                    onChange={e => setSurname(e.target.value)}
                                    placeholder="Surname"
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-amber-400/50"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono tracking-widest text-amber-300/40 uppercase mb-1">Email ID</label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
                                  <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-amber-400/50"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono tracking-widest text-amber-300/40 uppercase mb-1">Phone Number</label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
                                  <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    placeholder="+91 1234567890"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-amber-400/50"
                                  />
                                </div>
                              </div>

                              <motion.button
                                type="submit"
                                disabled={formLoading || cooldown > 0}
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
                                style={{
                                  background: formLoading ? 'rgba(212,175,78,0.3)' : 'linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #b8860b 100%)',
                                  color: '#0a0a14',
                                  fontWeight: 600,
                                }}
                              >
                                {formLoading ? (
                                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                  <>Send Sacred OTP <Sparkles className="w-4 h-4" /></>
                                )}
                              </motion.button>
                            </form>
                          )}

                          {/* STEP 2: OTP Verification */}
                          {regStep === 2 && (
                            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                              <p className="text-xs text-amber-200/60 text-center">
                                Check your email inbox for the 6-digit verification code sent to <strong className="text-white">{email}</strong>
                              </p>

                              {/* 6-digit inputs */}
                              <div className="flex justify-between gap-2 my-2">
                                {otpDigits.map((digit, index) => (
                                  <input
                                    key={index}
                                    ref={el => { otpInputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={digit}
                                    onChange={e => handleOtpChange(index, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(index, e)}
                                    className="w-11 h-13 text-center text-xl font-bold font-mono rounded-xl outline-none bg-white/5 border border-white/15 text-amber-300 focus:border-amber-400 focus:bg-white/10"
                                  />
                                ))}
                              </div>

                              <motion.button
                                type="submit"
                                disabled={formLoading || otpDigits.join('').length < 6}
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
                                style={{
                                  background: formLoading ? 'rgba(212,175,78,0.3)' : 'linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #b8860b 100%)',
                                  color: '#0a0a14',
                                  fontWeight: 600,
                                }}
                              >
                                {formLoading ? (
                                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                  'Verify OTP & Continue'
                                )}
                              </motion.button>

                              <div className="flex items-center justify-between text-xs font-mono pt-1">
                                <button
                                  type="button"
                                  onClick={() => setRegStep(1)}
                                  className="text-amber-400/50 hover:text-amber-300"
                                >
                                  ← Edit Details
                                </button>
                                <button
                                  type="button"
                                  disabled={cooldown > 0 || formLoading}
                                  onClick={handleSendOtp}
                                  className="text-amber-400/70 hover:text-amber-300 disabled:opacity-40 flex items-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                                </button>
                              </div>
                            </form>
                          )}

                          {/* STEP 3: Password Setup */}
                          {regStep === 3 && (
                            <form onSubmit={handleRegisterAccount} className="flex flex-col gap-3">
                              <div>
                                <label className="block text-[10px] font-mono tracking-widest text-amber-300/40 uppercase mb-1">Create Password</label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
                                  <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-amber-400/50"
                                  />
                                  <button type="button" onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>

                                {/* Strength meter */}
                                {password && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden flex gap-1">
                                      {[1, 2, 3].map(level => (
                                        <div key={level} className="flex-1 h-full transition-all"
                                          style={{ background: level <= pwdStrength.score ? pwdStrength.color : 'transparent' }} />
                                      ))}
                                    </div>
                                    <span className="text-[10px] font-mono" style={{ color: pwdStrength.color }}>
                                      {pwdStrength.label}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono tracking-widest text-amber-300/40 uppercase mb-1">Confirm Password</label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
                                  <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-amber-400/50"
                                  />
                                </div>
                              </div>

                              <motion.button
                                type="submit"
                                disabled={formLoading}
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
                                style={{
                                  background: formLoading ? 'rgba(212,175,78,0.3)' : 'linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #b8860b 100%)',
                                  color: '#0a0a14',
                                  fontWeight: 600,
                                }}
                              >
                                {formLoading ? (
                                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                  'Create Account'
                                )}
                              </motion.button>
                            </form>
                          )}
                        </div>
                      ) : (
                        /* ──────────────── SIGN IN FLOW ──────────────── */
                        <form onSubmit={handleSignIn} className="flex flex-col gap-3.5 mb-5">
                          <div>
                            <label className="block text-[10px] font-mono tracking-widest text-amber-300/40 uppercase mb-1.5">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(212,175,78,0.4)' }} />
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-amber-400/50"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] font-mono tracking-widest text-amber-300/40 uppercase">Password</label>
                              <button type="button" className="text-[10px] text-amber-400/50 hover:text-amber-300/70 font-mono">
                                Forgot password?
                              </button>
                            </div>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(212,175,78,0.4)' }} />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-amber-400/50"
                              />
                              <button type="button" onClick={() => setShowPassword(s => !s)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <motion.button
                            type="submit"
                            disabled={formLoading}
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 mt-1 cursor-pointer"
                            style={{
                              background: formLoading ? 'rgba(212,175,78,0.3)' : 'linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #b8860b 100%)',
                              color: '#0a0a14',
                              fontWeight: 600,
                            }}
                          >
                            {formLoading ? (
                              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                              'Sign In'
                            )}
                          </motion.button>
                        </form>
                      )}

                      {/* Or divider */}
                      <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-[10px] font-mono tracking-widest text-white/30">OR</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>

                      {/* Social Buttons */}
                      <div className="flex flex-col gap-2.5 mb-6">
                        <GoogleAuthButton onSuccess={handleGoogleAuthSuccess} />
                      </div>

                      {/* Toggle sign in / sign up */}
                      <div className="text-center text-xs text-white/40">
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignUp(s => !s);
                            setRegStep(1);
                            setFormError('');
                            setFormSuccess('');
                          }}
                          className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2 cursor-pointer"
                        >
                          {isSignUp ? 'Sign in' : 'Create one'}
                        </button>
                      </div>

                      {/* Sacred footer mantra */}
                      <div className="mt-4 pt-4 text-center border-t border-white/5">
                        <p className="text-[9px] font-serif italic text-amber-400/40">
                          ॐ सर्वे भवन्तु सुखिनः
                        </p>
                      </div>
                    </div>

                    {/* Bottom gold bar */}
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
                  </div>

                  {/* Social proof below card */}
                  <div className="mt-5 flex items-center justify-center gap-4 flex-wrap text-[11px] text-white/30">
                    <span className="flex items-center gap-1"><span className="text-amber-400">★★★★★</span> <strong>4.9</strong></span>
                    <span>·</span>
                    <span>20,000+ seekers</span>
                    <span>·</span>
                    <span>Vedic · Numerology · Kundli</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FloatingActions />
    </div>
  );
}

