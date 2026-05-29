import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Send, Mic, Copy, Download, Share2, Sparkles, Wand2, Zap, BrainCircuit, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';
import { generateReuseIdeas } from '../../services/ai';
import { cn } from '../../lib/utils';

import { Language } from '../ui/LanguageSelector';
import { useTranslation } from '../../lib/translations';

interface GeneratorProps {
  language: Language;
}

export default function Generator({ language }: GeneratorProps) {
  const t = useTranslation(language);
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdeaIdx, setSelectedIdeaIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setIdeas([]);
    setSelectedIdeaIdx(null);
    setError(null);
    try {
      const data = await generateReuseIdeas(input, language);
      if (Array.isArray(data)) {
        setIdeas(data);
      } else {
        throw new Error('Invalid response structure received from AI');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate proper solutions. Please try describing your item differently or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-20 space-y-16">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-400">
          <BrainCircuit className="w-4 h-4" />
          <span>Generative Ideation Protocol</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-tight">
          {t.generator.title}
        </h2>
        <p className="max-w-2xl mx-auto text-slate-400 font-sans text-lg">
          {t.generator.subtitle}
        </p>
      </div>

      {/* Input Field */}
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-4 bg-slate-900/50 border border-white/10 glass-premium p-2 rounded-2xl focus-within:border-emerald-500/30 transition-all shadow-2xl">
          <input 
            type="text" 
            placeholder={t.generator.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-slate-600 px-6 py-2 font-sans font-medium"
          />
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-sans font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? t.generator.loading : t.generator.generate}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        {!loading && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { en: "Plastic Bottle", hi: "प्लास्टिक की बोतल" },
              { en: "Old Jeans", hi: "पुरानी जींस" },
              { en: "Cardboard Box", hi: "गत्ते का डिब्बा" },
              { en: "Glass Jar", hi: "कांच का जार" },
              { en: "Broken Chair", hi: "टूटी कुर्सी" }
            ].map((chip) => {
              const label = language === 'hindi' ? chip.hi : chip.en;
              return (
                <button
                  key={chip.en}
                  onClick={() => {
                    setInput(label);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/25 text-xs font-sans transition-all duration-300 cursor-pointer"
                >
                  + {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-xl mx-auto flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-2xl font-sans text-sm shadow-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Grid / Details Presentation */}
      <AnimatePresence mode="wait">
        {selectedIdeaIdx === null ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <motion.div 
                  key={`loading-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-80 rounded-3xl glass-premium animate-pulse p-8 space-y-6"
                >
                  <div className="w-1/2 h-8 bg-white/5 rounded-lg" />
                  <div className="w-full h-32 bg-white/5 rounded-2xl" />
                  <div className="mt-auto w-1/3 h-4 bg-white/5 rounded-lg" />
                </motion.div>
              ))
            ) : (
              ideas.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <HoloCard 
                    onClick={() => setSelectedIdeaIdx(idx)}
                    className="h-full p-8 flex flex-col justify-between group-hover:border-emerald-500/30 transition-all shadow-xl" 
                    glow={true}
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                         <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">Protocol v4.{idx + 1}</span>
                         <span className="text-[10px] font-sans font-bold text-amber-400 capitalize px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/20">
                           {item.difficulty || "Medium"}
                         </span>
                      </div>
                      
                      <h3 className="text-3xl font-display font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                        {item.idea}
                      </h3>
                      <p className="text-sm text-slate-400 font-sans italic leading-relaxed pt-2 border-l border-white/10 pl-4 line-clamp-3">"{item.process}"</p>
                    </div>
                    
                    <div className="mt-12 pt-6 flex items-center justify-between border-t border-white/5">
                      <span className="text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-widest">{item.impact}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIdeaIdx(idx);
                        }}
                        className="text-[11px] font-sans font-bold text-emerald-400 hover:text-white flex items-center gap-2 transition-all uppercase tracking-widest group/btn cursor-pointer"
                      >
                        View Details <ArrowRight className="w-4 h-4 text-emerald-500 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </HoloCard>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          ideas[selectedIdeaIdx] && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Back Button */}
              <button 
                onClick={() => setSelectedIdeaIdx(null)}
                className="text-[11px] font-sans font-bold text-slate-500 hover:text-white transition-all uppercase tracking-[0.3em] flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-500" /> Return to Idea List
              </button>

              {/* Details Card */}
              <HoloCard className="p-8 md:p-12 space-y-10" glow={true}>
                {/* Title Block */}
                <div className="border-b border-white/10 pb-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-sans font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      {ideas[selectedIdeaIdx].impact || "Saves Environmental Waste"}
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-widest",
                      ideas[selectedIdeaIdx].difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      ideas[selectedIdeaIdx].difficulty === "Hard" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                      "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    )}>
                      Difficulty: {ideas[selectedIdeaIdx].difficulty || "Medium"}
                    </span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
                    {ideas[selectedIdeaIdx].idea}
                  </h3>
                  <p className="text-slate-400 font-sans text-lg leading-relaxed italic border-l-2 border-emerald-500 pl-4 py-1">
                    "{ideas[selectedIdeaIdx].process}"
                  </p>
                </div>

                {/* Grid for Steps & Materials */}
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Left Column: Materials & Cost */}
                  <div className="space-y-8">
                    {/* Materials Needed */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-sans font-bold text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-4">
                        Required Materials
                      </h5>
                      <ul className="space-y-3">
                        {(ideas[selectedIdeaIdx].materialsNeeded || ["Original item", "Basic crafting tools", "Affixing tape or wire glue"]).map((material: string, i: number) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-sans">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{material}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Estimated Cost */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-sans font-bold text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-4">
                        Estimated Cost
                      </h5>
                      <div className="text-2xl font-display font-bold text-white">
                        {ideas[selectedIdeaIdx].estimatedCost || "₹0 - ₹100"}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Execution Steps */}
                  <div className="space-y-6">
                    <h5 className="text-xs font-sans font-bold text-slate-500 uppercase tracking-widest border-l-2 border-rose-500 pl-4">
                      Construction Protocol
                    </h5>
                    <div className="space-y-6">
                      {(ideas[selectedIdeaIdx].steps || [
                        "Clean and sanitize the target item completely to prepare a fresh canvas.",
                        "Carefully cut, mold, or assemble as required using standard safety equipment.",
                        "Integrate wire frame, soil, adhesive, or mountings depending on the desired outcome."
                      ]).map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 group">
                          <span className="text-sm font-mono text-emerald-400 mt-0.5 font-bold">0{i + 1}</span>
                          <p className="text-sm text-slate-300 font-sans leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      ideas[selectedIdeaIdx].videoTutorialTarget || `how to upcycle make ${ideas[selectedIdeaIdx].idea}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 font-sans font-bold text-sm tracking-wide hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-red-600/10"
                  >
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Watch YouTube Blueprint
                  </a>

                  <button 
                    onClick={() => {
                      const textToCopy = `Upcycling Concept: ${ideas[selectedIdeaIdx].idea}\n\nDescription: ${ideas[selectedIdeaIdx].process}\n\nMaterials Needed:\n${(ideas[selectedIdeaIdx].materialsNeeded || ["Original item"]).map((m: string) => `- ${m}`).join('\n')}\n\nSteps:\n${(ideas[selectedIdeaIdx].steps || ["Assemble safely"]).map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n')}`;
                      navigator.clipboard.writeText(textToCopy);
                    }}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-sm tracking-wide hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Blueprint Instructions
                  </button>
                </div>
              </HoloCard>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {ideas.length === 0 && !loading && (
        <div className="pt-20 text-center space-y-12">
            <h4 className="text-sm font-sans font-bold text-slate-600 uppercase tracking-[0.4em]">Integrated Technologies</h4>
            <div className="flex flex-wrap items-center justify-center gap-12 grayscale opacity-40">
               {['RERESEARCH', 'AI CORE', 'CIRCULAR LOGIC', 'SUSTAIN LABS'].map(brand => (
                 <span key={brand} className="text-xl font-display font-bold text-white">{brand}</span>
               ))}
            </div>
        </div>
      )}
    </div>
  );
}
