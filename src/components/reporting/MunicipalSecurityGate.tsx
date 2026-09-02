import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Lock, Unlock, AlertTriangle, KeyRound, 
  Eye, EyeOff, Building2, CheckCircle2, Sparkles, ArrowRight, Delete
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MunicipalSecurityGateProps {
  onUnlock: () => void;
}

const MUNICIPAL_PASSCODE = '051206';
const AUTH_STORAGE_KEY = 'rewise_municipal_admin_auth_token';

export function isMunicipalAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'auth_granted_051206';
  } catch (e) {
    return false;
  }
}

export function lockMunicipalAdmin(): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

export default function MunicipalSecurityGate({ onUnlock }: MunicipalSecurityGateProps) {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const [isUnlockedSuccess, setIsUnlockedSuccess] = useState(false);

  const handleSubmit = (passToVerify?: string) => {
    const code = (passToVerify !== undefined ? passToVerify : pin).trim();
    
    if (!code) {
      setError('Please enter the municipal security passcode');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      if (code === MUNICIPAL_PASSCODE) {
        setIsUnlockedSuccess(true);
        try {
          sessionStorage.setItem(AUTH_STORAGE_KEY, 'auth_granted_051206');
        } catch (e) {
          // ignore
        }
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          onUnlock();
        }, 700);
      } else {
        setIsVerifying(false);
        setError('Access Denied: Incorrect Security Passcode');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, 400);
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 12) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin === MUNICIPAL_PASSCODE) {
        handleSubmit(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`relative glass-premium rounded-3xl p-6 sm:p-8 border border-white/15 bg-slate-950/90 shadow-2xl overflow-hidden backdrop-blur-xl transition-all ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Security Badge */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center justify-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isUnlockedSuccess 
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/30' 
                : error 
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400' 
                  : 'bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30 text-cyan-400 shadow-lg shadow-blue-500/10'
            }`}>
              {isUnlockedSuccess ? (
                <Unlock className="w-8 h-8 animate-bounce" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Municipal Command Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Restricted Admin Access
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Please enter your authorized administrative security passcode to access the municipal triage console.
            </p>
          </div>
        </div>

        {/* Passcode Input Form */}
        <form onSubmit={handleFormSubmit} className="mt-6 space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> Administrative Passcode
              </span>
              <span className="text-[10px] text-slate-500">6-Digit Key</span>
            </label>

            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                maxLength={12}
                placeholder="Enter Passcode (••••••)"
                autoFocus
                className={`w-full px-4 py-3.5 rounded-2xl bg-black/50 border text-center text-lg font-mono tracking-widest text-white placeholder:text-slate-600 placeholder:tracking-normal focus:outline-none transition-all ${
                  error 
                    ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40' 
                    : isUnlockedSuccess
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-white/15 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Numeric Keypad */}
          <div className="pt-2">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/5 hover:border-white/20 text-white font-mono text-base font-bold transition-all active:scale-95 shadow-sm hover:shadow-cyan-500/10"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-white/5 text-slate-400 hover:text-rose-400 text-xs font-mono font-semibold transition-all active:scale-95"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/5 hover:border-white/20 text-white font-mono text-base font-bold transition-all active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                title="Backspace"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isVerifying || isUnlockedSuccess}
            className={`w-full py-3.5 px-6 rounded-2xl font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              isUnlockedSuccess
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 hover:from-blue-400 hover:to-emerald-400 text-slate-950 shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-[0.98]'
            }`}
          >
            {isUnlockedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Access Granted • Unlocking...</span>
              </>
            ) : isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Enter Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-5 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>End-to-End TLS Guarded • SIH Civic Authority Control</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
