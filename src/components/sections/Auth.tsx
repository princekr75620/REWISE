import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Chrome, ShieldCheck, AlertCircle } from 'lucide-react';
import { auth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from '../../lib/firebase';
import { cn } from '../../lib/utils';

interface AuthProps {
  onSuccess: () => void;
  initialMode?: 'login' | 'signup';
}

export default function Auth({ onSuccess, initialMode = 'signup' }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-premium rounded-[2.5rem] overflow-hidden p-8 md:p-12 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Authentication</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-white tracking-tight">
            {mode === 'signup' ? 'Create Account.' : 'Welcome Back.'}
          </h2>
          <p className="text-slate-500 text-sm font-sans italic">
            Join the circular economy transition.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-center text-red-400 text-xs font-sans font-bold"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {mode === 'signup' && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-sans text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-sans text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Secure Password"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-sans text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary h-14 relative overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="uppercase tracking-widest text-[11px] font-bold">Connecting...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                {mode === 'signup' ? 'Construct Account' : 'Initialize Session'} <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="bg-[#020617] px-4 text-slate-700">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center py-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-slate-400 hover:text-white disabled:opacity-50"
          >
            <Chrome className="w-5 h-5" />
          </button>
          <button 
            disabled={loading}
            className="flex items-center justify-center py-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-slate-400 hover:text-white disabled:opacity-50"
          >
            <Github className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs font-sans font-bold text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-[0.2em]"
          >
            {mode === 'login' 
              ? "New to circular logic? Create Identity" 
              : "Already part of the network? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
