import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Scan, Zap, Sparkles, User, LogOut, Languages, Bookmark, LayoutGrid, Mail, CreditCard, Gauge, Truck, Camera } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LanguageSelector, Language } from '../ui/LanguageSelector';
import { useTranslation } from '../../lib/translations';
import { subscribeToSubscription, getSubscriptionState } from '../../lib/subscription';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn?: boolean;
  user?: any;
  onLogout?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Navbar({ activeTab, setActiveTab, isLoggedIn, user, onLogout, language, onLanguageChange }: NavbarProps) {
  const t = useTranslation(language);
  const [subscription, setSubscription] = React.useState(getSubscriptionState());

  React.useEffect(() => {
    const unsubscribe = subscribeToSubscription((sub) => {
      setSubscription(sub);
    });
    return () => unsubscribe();
  }, []);
  
  const navItems = [
    { id: 'home', label: t.nav.home, icon: Leaf },
    { id: 'scanner', label: t.nav.scanner, icon: Scan },
    { id: 'generator', label: t.nav.generator, icon: Zap },
    { id: 'reportWaste', label: t.nav.reportWaste || 'Report Waste', icon: Camera },
    { id: 'operations', label: t.nav.operations || 'Operations', icon: Gauge },
    { id: 'vault', label: 'Vault', icon: Bookmark },
    { id: 'subscription', label: 'Membership', icon: CreditCard },
    { id: 'company', label: 'Company', icon: LayoutGrid },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 px-8 lg:px-20 border-b border-white/5 bg-atmos-bg/80 backdrop-blur-md z-50 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setActiveTab('home')}
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center transition-transform group-hover:rotate-12">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-display font-bold tracking-tight text-white">
          ReWise
        </span>
      </div>
      
      <div className="hidden lg:flex items-center gap-10">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "relative text-sm font-sans font-medium transition-colors py-2",
              activeTab === item.id ? "text-emerald-400" : "text-slate-400 hover:text-white"
            )}
          >
            {item.label}
            {activeTab === item.id && (
              <motion.div
                layoutId="nav-active"
                className="absolute -bottom-1 left-0 right-0 h-px bg-emerald-400"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Tier badge for guests or logged in users */}
        <div 
          onClick={() => setActiveTab('company')}
          className={cn(
            "hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border cursor-pointer hover:bg-white/10 hover:scale-105 active:scale-95 transition-all",
            subscription.tier === 'free' ? "bg-amber-500/5 text-amber-400 border-amber-500/20" :
            subscription.tier === 'rupees_50' ? "bg-cyan-500/5 text-cyan-400 border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" :
            "bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-pulse"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
            {subscription.tier === 'free' ? 'Sandbox Mode' : subscription.tier === 'rupees_50' ? 'Orbit Premium' : 'Voyager Annual'}
          </span>
        </div>

        <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-sans font-bold text-white uppercase tracking-wider">{user?.displayName || 'User'}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={() => setActiveTab('login')}
              className="hidden sm:flex text-sm font-sans font-medium text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => setActiveTab('auth')}
              className="bg-white text-black px-6 py-2 rounded-full text-sm font-sans font-bold hover:bg-emerald-400 hover:text-white transition-all shadow-xl"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
