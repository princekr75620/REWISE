import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export type Language = 'english' | 'hindi' | 'haryanvi' | 'punjabi';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const languages: { id: Language; label: string; native: string }[] = [
    { id: 'english', label: 'English', native: 'English' },
    { id: 'hindi', label: 'Hindi', native: 'हिंदी' },
    { id: 'haryanvi', label: 'Haryanvi', native: 'हरियाणवी' },
    { id: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  ];

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:border-emerald-500/30 transition-all group"
      >
        <Languages className="w-4 h-4 text-emerald-400" />
        <span className="text-[10px] font-sans font-bold text-white uppercase tracking-widest hidden sm:inline">
          {languages.find(l => l.id === currentLanguage)?.native}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-slate-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-[60]"
          >
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  onLanguageChange(lang.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs transition-all",
                  currentLanguage === lang.id 
                    ? "bg-emerald-500/10 text-emerald-400 font-bold" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex flex-col items-start">
                  <span className="font-sans">{lang.native}</span>
                  <span className="text-[9px] opacity-40">{lang.label}</span>
                </div>
                {currentLanguage === lang.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
