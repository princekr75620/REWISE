import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Box, Layers, ArrowRight, Zap, Lightbulb, ShoppingBag, ScrollText, RefreshCw, Send, BrainCircuit, Rocket, CheckCircle2 } from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';
import { generateStudioBlueprints } from '../../services/ai';
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

const EXAMPLES = [
  {
    title: 'Architectural Lampion',
    original: 'Glass Bottle',
    description: 'Bespoke ambient lighting with an integrated smart-dimming structure.',
    image: 'https://images.unsplash.com/photo-1542728929-14a3ecc66149?w=800&auto=format&fit=crop',
    id: '01'
  },
  {
    title: 'Modular Tech Carry',
    original: 'Denim Waste',
    description: 'Resilient high-fashion carryall with enhanced tensile strength.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop',
    id: '02'
  },
  {
    title: 'Geometric Vessel',
    original: 'Pulp Material',
    description: 'Polymer-infused geometric storage with parametric scaling.',
    image: 'https://images.unsplash.com/photo-1591017403986-ed8184539503?w=800&auto=format&fit=crop',
    id: '03'
  }
];

import { useTranslation } from '../../lib/translations';
import { Language } from '../ui/LanguageSelector';

interface UpcyclingStudioProps {
  language: Language;
}

export default function UpcyclingStudio({ language }: UpcyclingStudioProps) {
  const t = useTranslation(language);
  const [wasteItem, setWasteItem] = useState('');
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [manifestedIndices, setManifestedIndices] = useState<Set<number>>(new Set());
  const [selectedItem, setSelectedItem] = useState<Blueprint | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const brainstorm = async () => {
    if (!wasteItem.trim()) return;
    setLoading(true);
    setError('');
    setManifestedIndices(new Set());
    try {
      const data = await generateStudioBlueprints(wasteItem, language);
      setBlueprints(data);
      // Success feedback
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981']
      });
    } catch (err) {
      setError('Synthesis failed. Please ensure the waste item is identifiable.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSynthesis = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 800);
  };

  const handleJoinCommunity = () => {
    setJoined(true);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.8 },
      colors: ['#10b981', '#ffffff', '#06b6d4']
    });
    setTimeout(() => setJoined(false), 5000);
  };

  const saveToVault = (blueprint: Blueprint) => {
    const stored = localStorage.getItem('rewise_vault');
    const vault = stored ? JSON.parse(stored) : [];
    
    // Prevent duplicates
    if (vault.some((b: Blueprint) => b.title === blueprint.title)) return;
    
    vault.push(blueprint);
    localStorage.setItem('rewise_vault', JSON.stringify(vault));
    // Dispatch storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  const handleManifest = (index: number) => {
    const bp = blueprints[index];
    if (bp) saveToVault(bp);
    
    setManifestedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.9 },
      colors: ['#06b6d4', '#10b981']
    });
  };

  const handleViewExample = (example: typeof EXAMPLES[0]) => {
    // Convert example to blueprint-like structure for the modal
    const mockBP: Blueprint = {
      title: example.title,
      originalMaterial: example.original,
      concept: example.description,
      vibe: "Curated Designer Concept",
      difficulty: "Advanced",
      estimatedCost: "Premium",
      materials: [example.original, "Smart Components", "Architectural Grade Housing"],
      steps: [
        "Material sanitation and structural integrity assessment.",
        "Parametric mapping of component geometry.",
        "Integration of smart sustainability modules.",
        "Final aesthetic finish and precision assembly."
      ]
    };
    setSelectedItem(mockBP);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-32">
      {/* Header & Input Section */}
      <div className="flex flex-col items-center text-center space-y-12">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-sans font-bold uppercase tracking-widest text-cyan-400">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Generative Design Engine</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-tight">
            {t.studio.title}
          </h1>
          <p className="text-slate-400 font-sans text-xl leading-relaxed">
            {t.studio.subtitle}
          </p>
        </div>
        
        <div className="w-full max-w-xl relative group">
          <input 
            ref={inputRef}
            type="text" 
            placeholder={t.studio.placeholder}
            value={wasteItem}
            onChange={(e) => setWasteItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && brainstorm()}
            className="w-full bg-slate-900/50 border border-white/10 glass-premium px-8 py-6 rounded-2xl text-lg focus:outline-none focus:border-cyan-400/50 placeholder:text-slate-600 font-sans text-white transition-all shadow-2xl"
          />
          <button 
            onClick={brainstorm}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* AI Generated Grid */}
      <AnimatePresence mode="wait">
        {blueprints.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-display font-bold text-white">Generated Blueprints</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {blueprints.map((bp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <HoloCard 
                    className={cn(
                      "h-full p-8 glass-premium border-white/5 hover:border-cyan-500/30 transition-all group flex flex-col justify-between",
                      manifestedIndices.has(i) && "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                    )} 
                    glow={false}
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">{t.studio.protocol} {i+1}</span>
                        <div className="flex gap-2">
                          <div className={cn(
                            "px-3 py-1 rounded-full border text-[9px] font-sans font-bold uppercase",
                            manifestedIndices.has(i) 
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                              : "bg-white/5 border border-white/10 text-slate-400"
                          )}>
                            {manifestedIndices.has(i) ? t.studio.manifested : bp.difficulty}
                          </div>
                          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-sans font-bold uppercase text-cyan-400">
                            {bp.estimatedCost}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-3xl font-display font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">{bp.title}</h3>
                        <p className="text-sm font-sans italic text-slate-500 text-gradient font-bold">{bp.vibe}</p>
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed font-sans mt-4">"{bp.concept}"</p>

                      <div className="space-y-6 pt-6 border-t border-white/5">
                        <div className="flex flex-wrap gap-2 text-slate-500">
                           {bp.materials.map((m, idx) => (
                             <span key={idx} className="text-[10px] font-sans font-bold uppercase tracking-wide">#{m.replace(/\s+/g, '')}</span>
                           ))}
                        </div>
                        
                        <div className="space-y-4">
                          <h5 className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <ScrollText className="w-3.5 h-3.5 text-cyan-400" /> Executive Protocol
                          </h5>
                          <div className="space-y-4">
                            {bp.steps.slice(0, 3).map((step, idx) => (
                              <div key={idx} className="flex gap-4 items-start group/step">
                                 <span className="text-xs font-mono text-cyan-500/30 group-hover/step:text-cyan-400 transition-colors mt-0.5">0{idx+1}</span>
                                 <p className="text-xs text-slate-400 font-sans leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => setSelectedItem(bp)}
                        className="flex-1 bg-white/5 border border-white/10 text-white py-3.5 rounded-xl transition-all font-sans font-bold text-xs hover:bg-white/10"
                      >
                        {t.studio.viewProtocol || 'View Protocol'}
                      </button>
                      <button 
                        onClick={() => handleManifest(i)}
                        disabled={manifestedIndices.has(i)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all font-sans font-bold text-xs",
                          manifestedIndices.has(i)
                            ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                            : "bg-cyan-500 text-white hover:bg-cyan-400"
                        )}
                      >
                        {manifestedIndices.has(i) ? (
                          <>Manifested <CheckCircle2 className="w-4 h-4" /></>
                        ) : (
                          <>Manifest <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  </HoloCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-12">
        {[
          { icon: BrainCircuit, title: 'Generative Design', desc: 'Advanced neural models optimized for structural integrity and aesthetic form.' },
          { icon: Box, title: 'CAD Integration', desc: 'Download precise dimensional data for professional manufacturing and assembly.' },
          { icon: Layers, title: 'Material Logic', desc: 'Sophisticated analysis of material properties to ensure longevity and safety.' }
        ].map((feature, i) => (
          <div key={i} className="space-y-6 group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all text-slate-600 group-hover:text-cyan-400">
              <feature.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">{feature.title}</h3>
            <p className="text-slate-500 font-sans leading-relaxed text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Gallery Showcase */}
      <div className="space-y-16">
        <div className="text-center space-y-4">
           <h2 className="text-4xl font-display font-bold text-white">Curated Collection</h2>
           <p className="text-slate-500 font-sans max-w-xl mx-auto">Explore the most successful transformations from our global design community.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {EXAMPLES.map((example, i) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handleViewExample(example)}
            >
              <div className="h-[500px] rounded-[2.5rem] overflow-hidden glass-premium border border-white/10 flex flex-col group-hover:border-cyan-500/20 transition-all shadow-2xl">
                <div className="relative h-[60%] overflow-hidden">
                  <img 
                    src={example.image} 
                    alt={example.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <span className="text-4xl font-display font-bold text-white/10 italic">0{example.id}</span>
                    <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1 rounded-full text-[9px] font-sans font-bold text-emerald-400 tracking-widest uppercase">
                      Premium Class
                    </div>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-[10px] font-sans font-bold text-cyan-400 uppercase tracking-widest">
                      {example.original} → {example.title}
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                      {example.title}
                    </h3>
                    <p className="text-slate-500 text-xs font-sans leading-relaxed italic">
                      "{example.description}"
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">View Concept</span>
                    <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hero CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="glass-premium rounded-[3rem] p-12 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-6 relative z-10 text-center md:text-left">
          <h2 className="text-5xl lg:text-7xl font-display font-bold text-white max-w-xl leading-none">
            Ready to <span className="text-cyan-400 underline decoration-cyan-500/20 underline-offset-8">Manifest?</span>
          </h2>
          <p className="text-slate-400 font-sans text-lg max-w-md mx-auto md:mx-0">
            Our AI synthesis engine is trained on millions of high-fidelity material protoypes.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
          <button 
            onClick={handleStartSynthesis}
            className="btn-primary"
          >
            Start Synthesis <Rocket className="w-5 h-5" />
          </button>
          <button 
            onClick={handleJoinCommunity}
            disabled={joined}
            className={cn(
              "btn-secondary min-w-[200px]",
              joined && "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
            )}
          >
            {joined ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Welcome Aboard
              </>
            ) : (
              "Join Design Community"
            )}
          </button>
        </div>
      </motion.div>

      {/* Detail Modal */}
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
              className="relative w-full max-w-3xl glass-premium rounded-[3rem] p-8 md:p-16 overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(6,182,212,0.1)]"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <RefreshCw className="w-6 h-6 rotate-45" />
              </button>

              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-sans font-bold uppercase tracking-widest text-cyan-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Executive Protocol</span>
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
                        <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" /> Essential Components
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.materials.map((m, i) => (
                          <div key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-sans text-slate-300">
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-sans font-bold uppercase tracking-widest text-cyan-400">
                        <span>Original Material</span>
                        <span>Estimated Effort</span>
                      </div>
                      <div className="flex justify-between items-center text-white">
                        <span className="font-display font-bold">{selectedItem.originalMaterial}</span>
                        <span className="font-display font-bold">{selectedItem.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ScrollText className="w-3.5 h-3.5 text-cyan-400" /> Synthesis Workflow
                    </h4>
                    <div className="space-y-6">
                      {selectedItem.steps.map((step, i) => (
                        <div key={i} className="flex gap-6 items-start">
                          <span className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-xs font-mono text-cyan-400 border border-white/5">
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
                        saveToVault(selectedItem);
                        confetti({
                          particleCount: 50,
                          spread: 60,
                          origin: { y: 0.8 },
                          colors: ['#10b981', '#06b6d4']
                        });
                        setSelectedItem(null);
                    }}
                    className="flex-1 btn-primary"
                  >
                    Download Blueprint
                  </button>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 btn-secondary"
                  >
                    Close Terminal
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
