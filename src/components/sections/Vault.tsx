import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ScrollText, RefreshCw, Trash2, ExternalLink, Box, Zap, ChevronRight, Bookmark } from 'lucide-react';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface Blueprint {
  title: string;
  originalMaterial: string;
  concept: string;
  difficulty: string;
  estimatedCost: string;
  materials: string[];
  steps: string[];
  vibe: string;
}

export default function Vault() {
  const [savedBlueprints, setSavedBlueprints] = useState<Blueprint[]>([]);
  const [selectedItem, setSelectedItem] = useState<Blueprint | null>(null);

  useEffect(() => {
    const loadVault = () => {
      const stored = localStorage.getItem('rewise_vault');
      if (stored) {
        setSavedBlueprints(JSON.parse(stored));
      }
    };
    loadVault();
    // Listen for storage changes
    window.addEventListener('storage', loadVault);
    return () => window.removeEventListener('storage', loadVault);
  }, []);

  const removeBlueprint = (index: number) => {
    const updated = savedBlueprints.filter((_, i) => i !== index);
    setSavedBlueprints(updated);
    localStorage.setItem('rewise_vault', JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-400">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Secured Archive</span>
          </div>
          <h2 className="text-5xl font-display font-bold text-white tracking-tight">Your Rewise Vault.</h2>
          <p className="text-slate-500 font-sans text-lg max-w-xl">
            A curated directory of your manifested blueprints and circular logic protocols.
          </p>
        </div>
      </div>

      {savedBlueprints.length === 0 ? (
        <div className="py-32 text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700 border border-white/5">
            <Box className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Archive Empty</h3>
            <p className="text-slate-500 font-sans text-sm italic">Generate and manifest designs in the Upcycling Studio to populate your vault.</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {savedBlueprints.map((bp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
              >
                <div 
                   onClick={() => setSelectedItem(bp)}
                   className="h-full glass-premium rounded-[2rem] p-8 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col justify-between group-hover:shadow-[0_0_40px_rgba(16,185,129,0.05)]"
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-sans font-bold uppercase text-slate-400">
                        {bp.difficulty}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlueprint(i);
                        }}
                        className="p-2 rounded-lg bg-red-500/0 hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                        {bp.title}
                      </h3>
                      <p className="text-xs font-sans italic text-slate-500 font-bold uppercase tracking-wider">{bp.originalMaterial}</p>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed font-sans line-clamp-3">
                      {bp.concept}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">Protocol Stored</span>
                    <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Modal (Shared with UpcyclingStudio UI for consistency) */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-3xl glass-premium rounded-[3rem] p-8 md:p-16 overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(16,185,129,0.1)]"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <RefreshCw className="w-6 h-6 rotate-45" />
              </button>

              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Vault Retrieval</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
                    {selectedItem.title}
                  </h2>
                  <p className="text-xl font-sans italic text-gradient font-bold">{selectedItem.vibe}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Essential Components
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.materials.map((m, i) => (
                          <div key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-sans text-slate-300">
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-400">
                        <span>Original Material</span>
                        <span>Complexity</span>
                      </div>
                      <div className="flex justify-between items-center text-white">
                        <span className="font-display font-bold">{selectedItem.originalMaterial}</span>
                        <span className="font-display font-bold">{selectedItem.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ScrollText className="w-3.5 h-3.5 text-emerald-400" /> Synthesis Workflow
                    </h4>
                    <div className="space-y-6">
                      {selectedItem.steps.map((step, i) => (
                        <div key={i} className="flex gap-6 items-start">
                          <span className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-xs font-mono text-emerald-400 border border-white/5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-slate-400 font-sans leading-relaxed pt-2">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => {
                        confetti({
                          particleCount: 50,
                          spread: 60,
                          origin: { y: 0.8 },
                          colors: ['#10b981']
                        });
                    }}
                    className="flex-1 btn-primary"
                  >
                    Reshare Protocol
                  </button>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 btn-secondary"
                  >
                    Close Vault
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
