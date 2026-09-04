export interface UserProfile {
  name: string;
  email: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  photoUrl?: string;
  gender: string;
  country: string;
  language: string;
  dob: string;
  time: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  moonSign: string;
  ascendant: string;
  nakshatra: string;
  lifePathNumber: number;
  soulNumber: number;
  expressionNumber: number;
  dominantPlanet: string;
  primaryZodiac: string;
  preferences: {
    theme: 'dark' | 'light';
    astrologySystem: 'vedic' | 'western';
    numerologySystem: 'pythagorean' | 'chaldean';
    notifications: boolean;
  };
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Svati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

export function normalizeDateToISO(dob: string): string {
  if (!dob) return '1995-05-15';
  const clean = dob.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

  const parts = clean.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    const p3 = parseInt(parts[2], 10);
    if (p1 > 1000) {
      return `${p1}-${String(p2).padStart(2, '0')}-${String(p3).padStart(2, '0')}`;
    } else if (p3 > 1000) {
      return `${p3}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
    }
  }
  return '1995-05-15';
}

export function normalizeTime24(time: string): string {
  if (!time) return '12:00';
  const clean = time.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const numbersOnly = clean.replace(/[^0-9:]/g, '');
  const parts = numbersOnly.split(':');
  let hour = parseInt(parts[0], 10) || 12;
  const minute = parseInt(parts[1], 10) || 0;

  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Helper to sum all digits in a date string
const calculateLifePath = (dob: string): number => {
  if (!dob) return 1;
  const digits = dob.replace(/[^0-9]/g, '');
  if (!digits) return 1;
  let sum = digits.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return sum;
};

// Vowels calculator for soul number
const calculateSoulNumber = (name: string): number => {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const nameLower = name.toLowerCase();
  let sum = 0;
  for (let i = 0; i < nameLower.length; i++) {
    const char = nameLower[i];
    if (vowels.includes(char)) {
      sum += (char.charCodeAt(0) - 96) % 9 || 9;
    }
  }
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return sum || 3;
};

export const fetchBackendChart = async (details: {
  name: string;
  dob: string;
  time: string;
  place: string;
}) => {
  try {
    const isoDate = normalizeDateToISO(details.dob);
    const time24 = normalizeTime24(details.time);

    const res = await fetch("/api/kundli/interpret", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: details.name,
        date_of_birth: isoDate,
        time_of_birth: time24,
        place_of_birth: details.place || 'Delhi, India',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend Kundli calculation offline, falling back to local engine:', err);
  }
  return null;
};

export const generateCosmicProfile = (details: {
  name: string;
  email: string;
  phoneNumber?: string;
  photoUrl?: string;
  gender: string;
  country: string;
  language: string;
  dob: string;
  time: string;
  place: string;
  backendChart?: any;
  moonSign?: string;
  ascendant?: string;
  nakshatra?: string;
  lifePathNumber?: number;
}): UserProfile => {
  const isoDate = normalizeDateToISO(details.dob);
  const [year, month, day] = isoDate.split('-').map(n => parseInt(n, 10));
  const time24 = normalizeTime24(details.time);
  const hour = parseInt(time24.split(':')[0], 10) || 12;

  // 1. Check if signs are already provided accurately
  let moonSign = details.moonSign || '';
  let ascendant = details.ascendant || '';
  let nakshatra = details.nakshatra || '';

  // 2. Use Swiss Ephemeris data from backend chart if available
  if ((!moonSign || !ascendant || !nakshatra) && details.backendChart) {
    ascendant = details.backendChart.ascendant?.sign || '';
    const moonObj = details.backendChart.planets?.find((p: any) => p.name === 'Moon');
    if (moonObj) {
      moonSign = moonObj.sign || '';
      nakshatra = moonObj.nakshatra || '';
    }
  }

  // 3. Fallback calculation if neither is present
  if (!moonSign || !ascendant || !nakshatra) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    const daysSinceJ2000 = jd - 2451545.0 + (hour / 24.0);
    const moonDeg = (218.316 + 13.176396 * daysSinceJ2000 + 360000) % 360;
    
    const moonIndex = Math.floor(moonDeg / 30) % 12;
    const nakIndex = Math.floor(moonDeg / 13.333333) % 27;

    const sunDeg = (280.460 + 0.9856474 * daysSinceJ2000 + 360000) % 360;
    const ascDegree = (sunDeg + (hour * 15) + (day * 0.98) + 360000) % 360;
    const ascIndex = Math.floor(ascDegree / 30) % 12;

    moonSign = moonSign || ZODIAC_SIGNS[moonIndex] || 'Leo';
    ascendant = ascendant || ZODIAC_SIGNS[ascIndex] || 'Libra';
    nakshatra = nakshatra || NAKSHATRAS[nakIndex] || 'Purva Phalguni';
  }

  const lifePathNumber = details.lifePathNumber || calculateLifePath(details.dob);
  const soulNumber = calculateSoulNumber(details.name);
  const primaryZodiac = ZODIAC_SIGNS[(month - 1) % 12] || 'Virgo';

  const dominantPlanet = 
    moonSign === 'Aries' || moonSign === 'Scorpio' ? 'Mars (Mangal)' :
    moonSign === 'Taurus' || moonSign === 'Libra' ? 'Venus (Shukra)' :
    moonSign === 'Gemini' || moonSign === 'Virgo' ? 'Mercury (Budh)' :
    moonSign === 'Cancer' ? 'Moon (Chandra)' :
    moonSign === 'Leo' ? 'Sun (Surya)' :
    moonSign === 'Sagittarius' || moonSign === 'Pisces' ? 'Jupiter (Guru)' : 'Saturn (Shani)';

  return {
    ...details,
    phoneNumber: details.phoneNumber || '',
    dob: isoDate,
    time: time24,
    photoUrl: details.photoUrl || undefined,
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    moonSign,
    ascendant,
    nakshatra,
    lifePathNumber,
    soulNumber,
    expressionNumber: 5,
    dominantPlanet,
    primaryZodiac,
    preferences: {
      theme: 'dark',
      astrologySystem: 'vedic',
      numerologySystem: 'pythagorean',
      notifications: true
    }
  };
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem('grahganit_active_profile', JSON.stringify(profile));
  window.dispatchEvent(new Event('grahganit_profile_sync'));

  // Sync with database asynchronously
  fetch('/api/user/save-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: profile.name,
      email: profile.email,
      phone_number: profile.phoneNumber || '',
      gender: profile.gender,
      country: profile.country,
      language: profile.language,
      date_of_birth: profile.dob,
      time_of_birth: profile.time,
      place_of_birth: profile.place,
      moon_sign: profile.moonSign,
      ascendant: profile.ascendant,
      nakshatra: profile.nakshatra,
      life_path_number: profile.lifePathNumber,
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log('✅ Database sync:', data))
    .catch((err) => console.warn('Database sync notice:', err));
};

export const getActiveProfile = (): UserProfile | null => {
  const data = localStorage.getItem('grahganit_active_profile') || localStorage.getItem('astraeon_active_profile');
  if (!data) return null;
  try {
    const profile: UserProfile = JSON.parse(data);
    if (!profile || !profile.name || !profile.email) return null;
    return profile;
  } catch (e) {
    return null;
  }
};

export const clearUserProfile = () => {
  console.log('Clearing active user session...');
  localStorage.removeItem('grahganit_active_profile');
  localStorage.removeItem('astraeon_active_profile');
  window.dispatchEvent(new Event('grahganit_profile_sync'));
};
