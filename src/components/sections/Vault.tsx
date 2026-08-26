import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ScrollText, RefreshCw, Trash2, ExternalLink, Box, Zap, ChevronRight, Bookmark, Compass } from 'lucide-react';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { BlueprintSchematicModal } from '../ui/BlueprintSchematicModal';
import { BlueprintItem } from '../../types';

export default function Vault() {
  const [savedBlueprints, setSavedBlueprints] = useState<BlueprintItem[]>([]);
  const [activeBlueprintModal, setActiveBlueprintModal] = useState<BlueprintItem | null>(null);

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
            <p className="text-slate-500 font-sans text-sm italic">Generate and manifest designs in the Upcycling Studio, Scanner, or Generator to populate your vault.</p>
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
                   onClick={() => setActiveBlueprintModal(bp)}
                   className="h-full glass-premium rounded-[2rem] p-8 border border-white/5 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between group-hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]"
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono font-bold uppercase text-cyan-300">
                        {bp.difficulty || "Medium"}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlueprint(i);
                        }}
                        className="p-2 rounded-lg bg-red-500/0 hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                        {bp.title}
                      </h3>
                      <p className="text-xs font-mono italic text-slate-500 font-bold uppercase tracking-wider">{bp.originalMaterial}</p>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed font-sans line-clamp-3">
                      {bp.concept || bp.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Open Blueprint CAD
                    </span>
                    <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Blueprint CAD Schematic Modal */}
      <AnimatePresence>
        {activeBlueprintModal && (
          <BlueprintSchematicModal
            blueprint={activeBlueprintModal}
            onClose={() => setActiveBlueprintModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
