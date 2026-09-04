import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveUserProfile, generateCosmicProfile, fetchBackendChart, UserProfile } from '@/utils/profile';
import { searchCities, CitySearchResult } from '@/utils/locationService';
import { ChevronRight, ChevronLeft, Sparkles, Check, Heart, Shield, Award, CalendarDays, Loader2, Phone } from 'lucide-react';
import { DobInput } from '../common/DobInput';

interface OnboardingWizardProps {
  userName: string;
  userEmail: string;
  userPicture?: string;
  onComplete: () => void;
}

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const LANGUAGES = ['English', 'Spanish', 'Hindi', 'French', 'German'];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'United Arab Emirates', 'Australia'];
const LOCATIONS = ['Delhi, India', 'New Delhi, India', 'Delhi Cantt, India', 'Mumbai, India', 'Bangalore, India', 'New York, USA', 'London, UK'];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  userName,
  userEmail,
  userPicture,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: userName || '',
    phoneNumber: '',
    gender: 'Male',
    country: 'India',
    language: 'English',
    dob: '',
    time: '',
    place: '',
  });

  useEffect(() => {
    // 1. Instant local storage pre-fill
    try {
      const cached = localStorage.getItem('grahganit_active_profile');
      if (cached) {
        const p = JSON.parse(cached);
        if (p) {
          setFormData((prev) => ({
            ...prev,
            name: p.name || prev.name,
            phoneNumber: p.phoneNumber || prev.phoneNumber,
            gender: p.gender || prev.gender,
            country: p.country || prev.country,
            language: p.language || prev.language,
            dob: p.dob || prev.dob,
            time: p.time || prev.time,
            place: p.place || prev.place,
          }));
          if (p.place) {
            setAutocompleteInput(p.place);
          }
        }
      }
    } catch (e) {}

    if (userName) {
      setFormData((prev) => ({ ...prev, name: userName }));
    }

    // 2. Async database pre-fill
    if (userEmail) {
      const apiOrigin = typeof window !== 'undefined' && window.location.hostname === 'grahganit.in' ? 'https://www.grahganit.in' : '';
      fetch(`${apiOrigin}/api/user/profile/${encodeURIComponent(userEmail.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && (data.name || data.phone_number || data.date_of_birth)) {
            setFormData((prev) => ({
              ...prev,
              name: data.name || prev.name,
              phoneNumber: data.phone_number || prev.phoneNumber,
              gender: data.gender || prev.gender,
              country: data.country || prev.country,
              language: data.language || prev.language,
              dob: data.date_of_birth || prev.dob,
              time: data.time_of_birth || prev.time,
              place: data.place_of_birth || prev.place,
            }));
            if (data.place_of_birth) {
              setAutocompleteInput(data.place_of_birth);
            }
          }
        })
        .catch((err) => console.warn('Profile prefill notice:', err));
    }
  }, [userName, userEmail]);

  const [autocompleteInput, setAutocompleteInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<CitySearchResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderText, setLoaderText] = useState('Reading Planetary Positions...');
  const [calculatedProfile, setCalculatedProfile] = useState<UserProfile | null>(null);

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const results = await searchCities(searchQuery);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handlePlaceChange = (val: string) => {
    setAutocompleteInput(val);
    setFormData((f) => ({ ...f, place: val }));
    setShowDropdown(true);
    if (val.trim().length >= 2) {
      fetchSuggestions(val);
    } else {
      setSuggestions([]);
    }
  };

  // Auto-fill input text
  useEffect(() => {
    if (userName && !formData.name) {
      setFormData((prev) => ({ ...prev, name: userName }));
    }
  }, [userName]);

  // Loading text steps
  const loaderPhrases = [
    { threshold: 10, text: 'Reading Planetary Positions...' },
    { threshold: 25, text: 'Calculating Moon Sign...' },
    { threshold: 40, text: 'Finding Ascendant Lagna...' },
    { threshold: 55, text: 'Computing Nakshatra...' },
    { threshold: 70, text: 'Calculating Numerology Master Nodes...' },
    { threshold: 85, text: 'Generating Kundli and Astrological Houses...' },
    { threshold: 100, text: 'Building Your Cosmic Dashboard...' },
  ];

  // Loader interval effect
  useEffect(() => {
    if (step === 5) {
      let backendChartData: any = null;

      // Start fetching backend ephemeris chart immediately
      fetchBackendChart(formData).then((data) => {
        if (data) {
          backendChartData = data;
        }
      });

      const interval = setInterval(() => {
        setLoaderProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // On completion, generate profile with backend ephemeris data
            const cachedProfile = (() => {
              try {
                return JSON.parse(localStorage.getItem('grahganit_active_profile') || '{}');
              } catch {
                return {};
              }
            })();
            const profile = generateCosmicProfile({
              ...formData,
              email: userEmail,
              photoUrl: userPicture || cachedProfile.photoUrl || undefined,
              backendChart: backendChartData,
            });
            setCalculatedProfile(profile);
            saveUserProfile(profile);
            setTimeout(() => setStep(6), 600);
            return 100;
          }
          const next = prev + 3;
          const phase = loaderPhrases.find((p) => next <= p.threshold);
          if (phase) {
            setLoaderText(phase.text);
          }
          return next;
        });
      }, 120);

      return () => clearInterval(interval);
    }
  }, [step]);

  const handleNext = () => {
    if (step < 4) setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const triggerOnboardingSave = () => {
    setStep(5);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-glass-dark border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative min-h-[460px] flex flex-col justify-between overflow-hidden">
      
      {/* progress bar indicators */}
      {step < 5 && (
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5 mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            className="h-full bg-gradient-to-r from-purple to-gold rounded-full"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome slide */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="text-center flex flex-col items-center gap-4 py-6"
            >
              <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-gold text-2xl animate-bounce">
                ✨
              </div>
              <h3 className="text-2xl font-display font-medium text-gradient-gold leading-tight">
                Welcome, {formData.name || 'Seeker'}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm mx-auto font-sans">
                Let's configure your birth coordinates to compile your personalized cosmic identity.
              </p>
            </motion.div>
          )}

          {/* Step 2: Personal details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex flex-col gap-4 py-2"
            >
              <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-widest border-b border-white/5 pb-2">
                Personal Information
              </h4>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-white/20 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">
                    Phone / WhatsApp Number <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold/40" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 1234567890"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-white/20 transition-all font-sans"
                    />
                  </div>
                  {!formData.phoneNumber && (
                    <p className="text-[10px] text-amber-400/60 mt-1 font-mono">
                      * Required to receive consultation & chart updates
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white/70 outline-none transition-all font-sans"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g} className="bg-cosmos text-white">{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white/70 outline-none transition-all font-sans"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l} className="bg-cosmos text-white">{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white/70 outline-none transition-all font-sans"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-cosmos text-white">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Birth Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex flex-col gap-4 py-2"
            >
              <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-widest border-b border-white/5 pb-2">
                Birth Coordinates
              </h4>

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
                      className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Birth Place</label>
                  <input
                    type="text"
                    placeholder="Search city of birth..."
                    value={autocompleteInput}
                    onChange={(e) => handlePlaceChange(e.target.value)}
                    className="w-full bg-white/3 border border-white/10 focus:border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-white/20 transition-all font-sans"
                  />
                  {showDropdown && autocompleteInput.trim() && (
                    <div className="absolute top-[105%] left-0 right-0 bg-[#0f1122]/98 border border-white/10 rounded-xl p-1 z-30 shadow-2xl max-h-40 overflow-y-auto divide-y divide-white/5">
                      {loadingSuggestions ? (
                        <div className="px-3.5 py-2 text-xs text-white/40 animate-pulse font-sans">Searching cities...</div>
                      ) : suggestions.length > 0 ? (
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
              </div>
            </motion.div>
          )}

          {/* Step 4: Review before calculation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex flex-col gap-4 py-2"
            >
              <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-widest border-b border-white/5 pb-2">
                Verify Cosmic Registration
              </h4>

              <div className="p-4 bg-white/3 border border-white/5 rounded-2xl flex flex-col gap-3 text-xs text-white/70 font-sans">
                <div className="flex justify-between">
                  <span>Name</span>
                  <strong className="text-white">{formData.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Birth Date</span>
                  <strong className="text-white">{formData.dob}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Birth Time</span>
                  <strong className="text-white">{formData.time}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Birth Place</span>
                  <strong className="text-white">{formData.place || 'Delhi, India'}</strong>
                </div>
              </div>

              <button
                onClick={triggerOnboardingSave}
                className="w-full bg-gold text-cosmos font-semibold text-xs py-3 rounded-xl hover:bg-gold/90 transition-all shadow-lg shadow-gold/15 cursor-pointer uppercase tracking-widest mt-2"
              >
                Generate My Cosmic Blueprint
              </button>
            </motion.div>
          )}

          {/* Step 5: Cosmic Loader */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center gap-5 py-8"
            >
              <Loader2 className="w-10 h-10 text-gold animate-spin" />
              <div className="flex flex-col gap-1.5">
                <h4 className="text-sm font-semibold text-white uppercase font-mono tracking-widest">
                  Calculating Placements
                </h4>
                <p className="text-xs text-gold font-mono h-5">{loaderText}</p>
              </div>

              <div className="w-56 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gold transition-all duration-150" style={{ width: `${loaderProgress}%` }} />
              </div>
            </motion.div>
          )}

          {/* Step 6: Cosmic Profile Reveal */}
          {step === 6 && calculatedProfile && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-5 py-4"
            >
              <div className="text-center mb-1">
                <h3 className="text-lg font-display font-medium text-gradient-gold">
                  Cosmic Identity Ready
                </h3>
                <p className="text-[10px] text-white/50 mt-0.5">
                  Initial calculations compiled successfully.
                </p>
              </div>

              {/* Reveal Placements Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { label: 'Moon Sign (Rashi)', val: calculatedProfile.moonSign, emoji: '♋' },
                  { label: 'Ascendant (Lagna)', val: calculatedProfile.ascendant, emoji: '♍' },
                  { label: 'Nakshatra', val: calculatedProfile.nakshatra, emoji: '⭐' },
                  { label: 'Dominant Planet', val: calculatedProfile.dominantPlanet.split(' ')[0], emoji: '♃' },
                  { label: 'Life Path Number', val: calculatedProfile.lifePathNumber, emoji: '🔢' },
                  { label: 'Soul Number', val: calculatedProfile.soulNumber, emoji: '❤️' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="p-3.5 bg-white/3 border border-white/5 rounded-2xl flex flex-col justify-between gap-1 transition-all hover:border-gold/20"
                  >
                    <span className="text-[9px] font-mono text-white/40 uppercase block leading-none">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                      <span className="text-gold-soft select-none text-base">{item.emoji}</span>
                      <span>{item.val}</span>
                    </span>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={onComplete}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs py-3 rounded-xl transition-all cursor-pointer uppercase tracking-widest mt-2"
              >
                Enter Cosmic Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer wizard navigation */}
      {step < 5 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 text-xs text-white/60 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {step < 4 && (
            <button
              onClick={handleNext}
              disabled={
                (step === 2 && (!formData.name.trim() || !formData.phoneNumber.trim())) ||
                (step === 3 && (!formData.dob || !formData.time))
              }
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default OnboardingWizard;
