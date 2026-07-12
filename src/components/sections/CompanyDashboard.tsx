import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Eye, Shield, ChevronRight, LayoutGrid, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import About from './About';
import Vision from './Vision';
import Privacy from './Privacy';
import Contact from './Contact';

type Section = 'about' | 'vision' | 'privacy' | 'contact';

export default function CompanyDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('about');

  const menuItems: { id: Section; label: string; icon: any; color: string }[] = [
    { id: 'about', label: 'About Architecture', icon: Info, color: 'text-emerald-400' },
    { id: 'vision', label: 'Future Vision', icon: Eye, color: 'text-cyan-400' },
    { id: 'privacy', label: 'Privacy Protocol', icon: Shield, color: 'text-rose-400' },
    { id: 'contact', label: 'Comms Hub', icon: Mail, color: 'text-amber-400' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'about': return <About />;
      case 'vision': return <Vision />;
      case 'privacy': return <Privacy />;
      case 'contact': return <Contact />;
      default: return <About />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0 space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Company Nexus</span>
            </div>
            <h2 className="text-4xl font-display font-bold text-white tracking-tight leading-tight">
              Corporate <br/><span className="text-gradient">Intelligence.</span>
            </h2>
            <p className="text-slate-500 font-sans text-xs italic leading-relaxed">
              Navigate our architectural DNA, future roadmap, security protocols, and communication channels.
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full group flex items-center justify-between p-4 rounded-2xl transition-all border",
                  activeSection === item.id
                    ? "bg-white/5 border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.02)]"
                    : "border-transparent bg-transparent hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    activeSection === item.id 
                      ? cn("bg-white/10 shadow-lg", item.color) 
                      : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300"
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-[11px] font-sans font-bold uppercase tracking-widest transition-colors",
                    activeSection === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  )}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all",
                  activeSection === item.id ? "text-white opacity-100" : "text-slate-500 opacity-0 group-hover:opacity-40"
                )} />
              </button>
            ))}
          </nav>

          <div className="p-6 rounded-[2rem] glass-premium border border-white/5 space-y-4">
            <h4 className="text-[9px] font-sans font-bold uppercase tracking-widest text-slate-500">System Integrity</h4>
            <div className="space-y-3">
              {[
                { label: 'Uptime', value: '99.99%', color: 'text-emerald-400' },
                { label: 'Ethical Core', value: 'v4.2.1', color: 'text-cyan-400' },
                { label: 'Blockchain', value: 'SECURED', color: 'text-rose-400' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] uppercase font-bold tracking-tighter">
                  <span className="text-slate-600">{stat.label}</span>
                  <span className={stat.color}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
