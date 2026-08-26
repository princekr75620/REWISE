import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Bookmark, 
  CheckCircle2, 
  Maximize2, 
  Wrench, 
  Layers, 
  Cpu, 
  ArrowRight, 
  Youtube, 
  Copy, 
  Check, 
  Sparkles,
  Share2,
  Compass,
  FileCode,
  Ruler
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../../lib/utils';
import { BlueprintItem } from '../../types';

interface BlueprintSchematicModalProps {
  blueprint: BlueprintItem | null;
  onClose: () => void;
  onSavedToVault?: () => void;
}

export function BlueprintSchematicModal({ 
  blueprint, 
  onClose,
  onSavedToVault 
}: BlueprintSchematicModalProps) {
  const [activeTab, setActiveTab] = useState<'schematic' | 'steps' | 'specs'>('schematic');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomCAD, setZoomCAD] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!blueprint) return null;

  const blueprintCode = blueprint.blueprintCode || `CAD-REV-${Math.abs(blueprint.title.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 9000 + 1000)}`;

  const handleSaveVault = () => {
    try {
      const stored = localStorage.getItem('rewise_vault');
      const vault = stored ? JSON.parse(stored) : [];
      
      const exists = vault.some((b: any) => b.title === blueprint.title);
      if (!exists) {
        vault.push({
          title: blueprint.title,
          originalMaterial: blueprint.originalMaterial,
          concept: blueprint.concept || blueprint.description || '',
          difficulty: blueprint.difficulty,
          estimatedCost: blueprint.estimatedCost,
          materials: blueprint.materials || [],
          steps: blueprint.steps || [],
          vibe: blueprint.vibe || 'Architectural Eco Blueprint',
          impact: blueprint.impact || 'Carbon Offset Certified',
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('rewise_vault', JSON.stringify(vault));
        window.dispatchEvent(new Event('storage'));
      }
      setIsSaved(true);
      if (onSavedToVault) onSavedToVault();
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#ffffff']
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopySpecs = () => {
    const text = `=== REWISE TECHNICAL BLUEPRINT ===
Protocol ID: ${blueprintCode}
Project: ${blueprint.title}
Base Material: ${blueprint.originalMaterial}
Complexity: ${blueprint.difficulty}
Estimated Budget: ${blueprint.estimatedCost}

MATERIALS REQUIRED:
${(blueprint.materials || []).map((m, i) => `[${i + 1}] ${m}`).join('\n')}

CONSTRUCTION STEPS:
${(blueprint.steps || []).map((s, i) => `Step ${i + 1}: ${s}`).join('\n')}

Impact: ${blueprint.impact || 'Zero Waste Circular Transformation'}
=================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadBlueprint = () => {
    window.print();
  };

  // Generate dynamic schematic drawing SVG according to material category
  const renderCadDrawing = () => {
    const mat = (blueprint.originalMaterial || '').toLowerCase();
    
    return (
      <div className="relative w-full h-72 sm:h-84 bg-[#0a1424] rounded-2xl border border-cyan-500/30 overflow-hidden flex flex-col justify-between p-4 font-mono select-none">
        {/* Technical Blueprint Grid Background */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.4) 1px, transparent 1px),
              linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 40px 40px, 10px 10px, 10px 10px'
          }}
        />

        {/* Blueprint Watermark & Technical Framing */}
        <div className="relative z-10 flex justify-between items-start text-[9px] text-cyan-400/70 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>ISO-9001 / CAD-SPEC: {blueprintCode}</span>
          </div>
          <div className="text-right">
            <span>SCALE: 1:2.5 / METRIC (mm)</span>
          </div>
        </div>

        {/* Central Vector CAD Drawing */}
        <div className="relative z-10 my-auto flex items-center justify-center">
          <svg className="w-full max-w-[340px] h-40" viewBox="0 0 340 160" fill="none" stroke="currentColor">
            {/* Dimension guide lines */}
            <line x1="30" y1="20" x2="30" y2="140" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <line x1="310" y1="20" x2="310" y2="140" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <line x1="20" y1="80" x2="320" y2="80" stroke="#06b6d4" strokeWidth="0.7" strokeDasharray="4 4" opacity="0.3" />

            {/* Dimension measurements horizontal */}
            <line x1="45" y1="25" x2="295" y2="25" stroke="#38bdf8" strokeWidth="1.2" />
            <polygon points="45,25 52,22 52,28" fill="#38bdf8" />
            <polygon points="295,25 288,22 288,28" fill="#38bdf8" />
            <text x="170" y="20" fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="monospace">L = 240.00 mm (±0.5)</text>

            {/* Dimension measurement vertical */}
            <line x1="320" y1="40" x2="320" y2="135" stroke="#38bdf8" strokeWidth="1.2" />
            <polygon points="320,40 317,47 323,47" fill="#38bdf8" />
            <polygon points="320,135 317,128 323,128" fill="#38bdf8" />
            <text x="330" y="90" fill="#38bdf8" fontSize="8" textAnchor="middle" transform="rotate(90,330,90)" fontFamily="monospace">H = 95mm</text>

            {/* Geometric Component CAD Wireframe */}
            {mat.includes('bottle') || mat.includes('glass') || mat.includes('plastic') ? (
              <g stroke="#22d3ee" strokeWidth="1.5" opacity="0.9">
                {/* Bottle body */}
                <rect x="70" y="45" width="180" height="85" rx="12" fill="rgba(6, 182, 212, 0.05)" />
                {/* Neck & Mouth */}
                <path d="M 250 65 L 290 70 L 290 105 L 250 110" />
                {/* Cut line / Upcycle incision marker */}
                <line x1="160" y1="35" x2="160" y2="140" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx="160" cy="45" r="3" fill="#f43f5e" />
                <circle cx="160" cy="130" r="3" fill="#f43f5e" />
                <text x="160" y="152" fill="#f43f5e" fontSize="8" textAnchor="middle" fontFamily="monospace">CUT-PLANE [P1]</text>
                
                {/* Internal components / Structural mesh */}
                <circle cx="115" cy="87" r="18" stroke="#34d399" strokeWidth="1.2" strokeDasharray="2 2" />
                <line x1="97" y1="87" x2="133" y2="87" stroke="#34d399" strokeWidth="1" />
                <line x1="115" y1="69" x2="115" y2="105" stroke="#34d399" strokeWidth="1" />
              </g>
            ) : mat.includes('jeans') || mat.includes('denim') || mat.includes('cloth') || mat.includes('textile') ? (
              <g stroke="#38bdf8" strokeWidth="1.5" opacity="0.9">
                {/* Textile pattern */}
                <path d="M 80 45 L 240 45 L 260 130 L 60 130 Z" fill="rgba(56, 189, 248, 0.06)" />
                <line x1="80" y1="85" x2="245" y2="85" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="160" y="80" fill="#f43f5e" fontSize="8" textAnchor="middle" fontFamily="monospace">HEM SEAM [±2mm]</text>
                <circle cx="120" cy="110" r="8" stroke="#34d399" strokeWidth="1.2" />
                <circle cx="200" cy="110" r="8" stroke="#34d399" strokeWidth="1.2" />
              </g>
            ) : (
              <g stroke="#22d3ee" strokeWidth="1.5" opacity="0.9">
                {/* Isometric Block Blueprint */}
                <polygon points="160,40 240,65 160,95 80,65" fill="rgba(6, 182, 212, 0.08)" />
                <polygon points="80,65 160,95 160,135 80,105" fill="rgba(6, 182, 212, 0.04)" />
                <polygon points="160,95 240,65 240,105 160,135" fill="rgba(6, 182, 212, 0.12)" />
                <line x1="160" y1="40" x2="160" y2="95" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="80" y1="65" x2="240" y2="105" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3 3" />
                <text x="160" y="150" fill="#22d3ee" fontSize="8" textAnchor="middle" fontFamily="monospace">STRUCTURE STABILITY 98.4%</text>
              </g>
            )}

            {/* Corner Crosshairs */}
            <path d="M 20 20 L 30 20 M 20 20 L 20 30" stroke="#06b6d4" strokeWidth="1" />
            <path d="M 320 20 L 310 20 M 320 20 L 320 30" stroke="#06b6d4" strokeWidth="1" />
            <path d="M 20 140 L 30 140 M 20 140 L 20 130" stroke="#06b6d4" strokeWidth="1" />
            <path d="M 320 140 L 310 140 M 320 140 L 320 130" stroke="#06b6d4" strokeWidth="1" />
          </svg>
        </div>

        {/* CAD Footer Telemetry */}
        <div className="relative z-10 pt-2 border-t border-cyan-500/20 flex justify-between items-center text-[9px] text-cyan-300 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            DIFFICULTY: {blueprint.difficulty.toUpperCase()}
          </span>
          <span className="text-cyan-400/80">EST. BUDGET: {blueprint.estimatedCost}</span>
          <span className="text-slate-400">REWISE™ NEURAL ARCHITECT</span>
        </div>
      </div>
    );
  };

  const videoSearch = blueprint.videoTutorialTarget || `${blueprint.title} DIY upcycling tutorial`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl"
      />

      {/* Blueprint Container Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full max-w-4xl bg-[#090f1d] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_0_80px_rgba(6,182,212,0.2)] text-white z-10 max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Top Technical Blueprint Header Bar */}
        <div className="flex items-start justify-between border-b border-cyan-500/20 pb-4 mb-4 gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-300">
                <Compass className="w-3 h-3 text-cyan-400" />
                TECHNICAL BLUEPRINT SPEC
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400 uppercase">
                REV: {blueprintCode}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-tight">
              {blueprint.title}
            </h2>
            <p className="text-xs sm:text-sm text-cyan-400/90 font-mono">
              ORIGINAL MEDIUM: <span className="text-white font-bold">{blueprint.originalMaterial}</span>
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blueprint Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
          {[
            { id: 'schematic', label: '📐 CAD Schematic', icon: Compass },
            { id: 'steps', label: '📋 Construction Steps', icon: Layers },
            { id: 'specs', label: '🔧 Technical Specs', icon: Wrench },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === tab.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Blueprint Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {activeTab === 'schematic' && (
            <div className="space-y-6">
              {/* CAD Visualizer Frame */}
              {renderCadDrawing()}

              {/* Concept Synopsis */}
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                  Design Hypothesis & Transformation Logic
                </span>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  {blueprint.concept || blueprint.description || "Upcycle raw material geometry to produce high-durability, ecological functionality with zero structural compromise."}
                </p>
              </div>

              {/* Quick Specs Bento Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono">
                  <span className="text-[9px] text-slate-500 uppercase block">Complexity</span>
                  <span className="text-sm font-bold text-emerald-400">{blueprint.difficulty}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono">
                  <span className="text-[9px] text-slate-500 uppercase block">Estimated Cost</span>
                  <span className="text-sm font-bold text-cyan-300">{blueprint.estimatedCost}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono">
                  <span className="text-[9px] text-slate-500 uppercase block">Structural Life</span>
                  <span className="text-sm font-bold text-amber-300">3-5 Years</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono">
                  <span className="text-[9px] text-slate-500 uppercase block">Circular Rating</span>
                  <span className="text-sm font-bold text-rose-400">98/100</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Sequential Assembly Sequence ({blueprint.steps?.length || 0} Steps)
                </span>
                <span className="text-[10px] font-mono text-slate-500">PRECISION TOLERANCE: ±1mm</span>
              </div>

              <div className="space-y-3">
                {(blueprint.steps || []).map((step, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex gap-4 items-start group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-xs font-bold text-cyan-400 shrink-0 mt-0.5 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                      0{idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">Phase {idx + 1} Execution</h4>
                      <p className="text-sm text-slate-300 font-sans leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Materials & Components */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Bill of Materials (BOM)
                </span>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {(blueprint.materials || []).map((mat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      <span className="text-xs font-mono text-slate-200">{mat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Parameters */}
              <div className="p-4 rounded-2xl bg-[#0e1b30] border border-cyan-500/20 space-y-3 font-mono">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">
                  Material Chemistry & Upcycling Compliance
                </span>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[10px] block">PRIMARY MEDIUM:</span>
                    <span>{blueprint.originalMaterial}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">SECURITY CLEARANCE:</span>
                    <span>Class-A Non-Toxic DIY</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">CARBON REDUCTION:</span>
                    <span className="text-emerald-400">{blueprint.impact || '0.85 kg CO₂ Equivalent'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">RECOMMENDED TOOLS:</span>
                    <span>Craft Blade, Hot Adhesive, Ruler</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Bar */}
        <div className="pt-4 mt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveVault}
              className={cn(
                "px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer",
                isSaved
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              )}
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 text-cyan-400" />}
              {isSaved ? "Saved in Vault" : "Save to Vault"}
            </button>

            <button
              onClick={handleCopySpecs}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied ? "Specs Copied" : "Copy Specs"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoSearch)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-mono font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Youtube className="w-4 h-4" />
              Watch Video
            </a>

            <button
              onClick={handleDownloadBlueprint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              Print / Save Blueprint
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
