import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Scan, Zap, CloudSun, Sparkles, User, LogOut, Languages, Bookmark, LayoutGrid } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LanguageSelector, Language } from '../ui/LanguageSelector';
import { useTranslation } from '../../lib/translations';

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
  
  const navItems = [
    { id: 'home', label: t.nav.home, icon: Leaf },
    { id: 'scanner', label: t.nav.scanner, icon: Scan },
    { id: 'generator', label: t.nav.generator, icon: Zap },
    { id: 'studio', label: t.nav.studio, icon: Sparkles },
    { id: 'vault', label: 'Vault', icon: Bookmark },
    { id: 'company', label: 'Company', icon: LayoutGrid },
    { id: 'weather', label: t.nav.weather, icon: CloudSun },
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
