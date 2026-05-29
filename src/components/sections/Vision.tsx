import React from 'react';
import { motion } from 'framer-motion';
import { Shovel, Zap, CloudLightning, Leaf, ShieldAlert } from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';

export default function Vision() {
  const roadmap = [
    { year: '2026', step: 'Global Neural Grid Launch', status: 'INITIATED' },
    { year: '2027', step: 'Zero-Waste City Integration', status: 'PLANNING' },
    { year: '2028', step: 'Bio-Polymer Synthesis Core', status: 'R&D' },
    { year: '2030', step: 'Total Circularity Achieved', status: 'TARGET' },
  ];

  return (
    <div className="space-y-16 py-12">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="w-full md:w-1/2 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="text-cyan font-mono text-[10px] tracking-[0.5em] uppercase px-4 py-1 border border-cyan/20 w-fit glass">
              Future_Horizon
            </div>
            <h2 className="text-6xl font-bold tracking-tighter uppercase leading-none">
              A Planet <br/><span className="text-cyan">ReImagined.</span>
            </h2>
            <p className="text-gray-400 text-lg font-light leading-relaxed max-w-lg">
              Our vision goes beyond simple recycling. We are building the infrastructure for a post-waste 
              civilisation—where the concept of "trash" is as obsolete as the steam engine.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <HoloCard className="p-4 border-white/5 space-y-4">
              <ShieldAlert className="w-6 h-6 text-cyan" />
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-100">Waste Lockdown</div>
              <p className="text-[10px] text-gray-500 italic leading-relaxed">Securing toxic byproducts via molecular encapsulation.</p>
            </HoloCard>
            <HoloCard className="p-4 border-white/5 space-y-4">
              <Zap className="w-6 h-6 text-neon-green" />
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-100">Clean Synthesis</div>
              <p className="text-[10px] text-gray-500 italic leading-relaxed">Converting kinetic recycling energy back into the local grid.</p>
            </HoloCard>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <HoloCard className="h-full border-cyan/20 bg-cyan/5">
            <div className="flex items-center gap-3 mb-10">
              <Leaf className="w-5 h-5 text-cyan" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Roadmap to Neutrality</span>
            </div>
            
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
              
              {roadmap.map((item, i) => (
                <div key={i} className="flex gap-8 relative z-10 group">
                  <div className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center shrink-0 group-hover:border-cyan/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_#00FFFF]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold font-display text-white">{item.year}</span>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-cyan/10 text-cyan uppercase tracking-widest border border-cyan/20">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 font-light italic">{item.step}</div>
                  </div>
                </div>
              ))}
            </div>
          </HoloCard>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Global Target</span>
            <span className="text-2xl font-bold text-white tracking-widest">ZERO_EMISSION</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Grid Health</span>
            <span className="text-2xl font-bold text-neon-green tracking-widest uppercase">Stable_0x0</span>
          </div>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">Auth_Key: **-****-7729</div>
           <div className="text-[8px] text-zinc-600 font-mono mt-1">SECURED BY AI ETHICS PROTOCOL V4</div>
        </div>
      </div>
    </div>
  );
}
