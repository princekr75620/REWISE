import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Shield } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { Language } from '../ui/LanguageSelector';

interface HeroProps {
  language: Language;
  onNavigate: (tab: string) => void;
}

export default function Hero({ language, onNavigate }: HeroProps) {
  const t = useTranslation(language);

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] -z-10 blur-3xl pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8 max-w-5xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/5 text-[11px] font-sans font-semibold uppercase tracking-widest text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'english' ? 'Generative AI Sustainability Core' : language === 'hindi' ? 'जेनरेटिव AI सस्टेनेबिलिटी कोर' : language === 'punjabi' ? 'ਜੇਨਰੇਟਿਵ AI ਸਸਟੇਨੇਬਿਲਟੀ ਕੋਰ' : 'AI सस्टेनेबिलिटी सिस्टम'}</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-display font-bold leading-[0.9] tracking-tight text-white">
          {t.hero.title} <br />
          <span className="text-gradient">Sustainable Innovation.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-sans leading-relaxed">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <motion.button 
            onClick={() => onNavigate('scanner')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary w-full sm:w-auto"
          >
            {t.hero.startScanning} <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button 
            onClick={() => onNavigate('studio')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary w-full sm:w-auto"
          >
            {t.hero.exploreStudio}
          </motion.button>
        </div>
      </motion.div>

      {/* Floating Elements/Metrics (Optional but keeps it premium) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-white/5 pt-12"
      >
        {[
          { label: 'CO2 Avoided', val: '1.2k', unit: 'Tons' },
          { label: 'Precision', val: '99.9', unit: '%' },
          { label: 'Reuse Cycles', val: '85k+', unit: 'Cycle' },
          { label: 'System Purity', val: '92.1', unit: '%' },
        ].map((stat, i) => (
          <div key={i} className="text-center group">
            <div className="text-2xl md:text-3xl font-display font-bold text-white group-hover:text-emerald-400 transition-colors">
              {stat.val}<span className="text-sm font-sans text-slate-500 ml-0.5">{stat.unit}</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-sans font-bold mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
