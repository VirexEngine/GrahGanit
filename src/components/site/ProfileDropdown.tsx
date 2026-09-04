import React, { useState, useEffect } from 'react';
import { getActiveProfile, clearUserProfile, UserProfile } from '@/utils/profile';
import { User, LogOut, HelpCircle, LayoutDashboard, Calendar, Compass, Star, Settings, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';

export const ProfileDropdown: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const syncProfile = () => {
    setProfile(getActiveProfile());
  };

  useEffect(() => {
    syncProfile();
    // Watch for updates
    window.addEventListener('grahganit_profile_sync', syncProfile);
    return () => {
      window.removeEventListener('grahganit_profile_sync', syncProfile);
    };
  }, []);

  const handleLogout = () => {
    clearUserProfile();
    setIsOpen(false);
    navigate({ to: '/' });
  };

  if (!profile) {
    return (
      <Link to="/login">
        <button className="bg-gold/15 border border-gold/30 hover:bg-gold/25 text-gold font-mono uppercase tracking-widest text-[10px] py-1.5 px-4 rounded-full transition-all cursor-pointer">
          Sign In
        </button>
      </Link>
    );
  }

  const isAdmin = profile.isAdmin || profile.email === 'admin@grahganit.in';

  return (
    <div className="relative z-50">
      {/* Avatar Node */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full border border-gold/40 bg-gradient-to-br from-purple to-cosmos flex items-center justify-center text-xs font-bold text-white shadow-inner cursor-pointer hover:border-gold transition-colors select-none"
      >
        {profile.name[0]}
      </button>

      {isOpen && (
        <>
          {/* Backdrop Click Shield */}
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-[115%] w-60 bg-[#0c0d1e]/98 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3 font-sans">
            {/* Header info */}
            <div className="border-b border-white/5 pb-2.5">
              <span className="text-xs font-semibold text-white block">{profile.name}</span>
              <span className="text-[9px] text-gold font-mono block mt-0.5 uppercase tracking-wider">
                {profile.moonSign} Moon • {profile.ascendant} Ascendant
              </span>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-1.5 text-xs text-white/70">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25 font-semibold transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                  <span>Admin Control Panel</span>
                </Link>
              )}
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-white/40 shrink-0" />
                <span>Cosmic Dashboard</span>
              </Link>
              <Link
                to="/free-tools/kundli"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                <Compass className="w-4 h-4 text-white/40 shrink-0" />
                <span>My Kundli</span>
              </Link>
              <Link
                to="/horoscopes/daily"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                <Calendar className="w-4 h-4 text-white/40 shrink-0" />
                <span>Daily Horoscope</span>
              </Link>
              <Link
                to="/horoscopes/monthly"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                <Star className="w-4 h-4 text-white/40 shrink-0" />
                <span>Monthly Horoscope</span>
              </Link>
              <Link
                to="/my-bookings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                <Calendar className="w-4 h-4 text-white/40 shrink-0" />
                <span>My Bookings</span>
              </Link>
              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-white/40 shrink-0" />
                <span>Book Consultation</span>
              </Link>
            </div>

            {/* Logout Trigger */}
            <button
              onClick={handleLogout}
              className="border-t border-white/5 pt-2.5 flex items-center gap-2.5 p-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
export default ProfileDropdown;
