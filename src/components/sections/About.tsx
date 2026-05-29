import React from 'react';
import { motion } from 'framer-motion';
import { Target, Cpu, Recycle, Globe, Zap } from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';

export default function About() {
  const pillars = [
    { icon: Target, title: 'Mission', desc: 'Eliminate waste by converting every discarded object into a valuable resource.' },
    { icon: Cpu, title: 'AI Integration', desc: 'Using neural networks to decode material composition and optimal reuse pathways.' },
    { icon: Recycle, title: 'Circular Ethos', desc: 'Promoting a world where products are designed for infinite life cycles.' },
  ];

  return (
    <div className="space-y-12 py-12">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-neon-green font-mono text-[10px] tracking-[0.5em] uppercase"
        >
          // Project_Bio_v1.0
        </motion.div>
        <h2 className="text-6xl font-bold tracking-tighter uppercase">Our <span className="text-neon-green">Architecture.</span></h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {pillars.map((item, i) => (
          <HoloCard key={i} className="text-center group border-white/5">
            <div className="w-16 h-16 border border-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <item.icon className="w-8 h-8 text-neon-green" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight mb-4">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-light italic">"{item.desc}"</p>
          </HoloCard>
        ))}
      </div>

      <HoloCard className="p-8 md:p-12 border-neon-green/20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold tracking-tighter uppercase">The AI Role in <br/><span className="text-neon-green">Preservation.</span></h3>
            <p className="text-gray-400 font-light leading-relaxed">
              We don't just recycle; we re-engineer. Our AI engines analyze the chemical structure of waste, 
              providing blueprints for everything from recycled textiles to industrial filaments. 
              By tracking every atom in the circular economy, ReWise ensures nothing ever reaches a landfill.
            </p>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white leading-none">99.8%</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Analysis Precision</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-neon-green leading-none">0.0</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Leachate Target</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded border border-white/10 overflow-hidden glass">
             <div className="absolute inset-0 bg-neon-green/5" />
             <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-48 h-48 border border-neon-green/20 rounded-full flex items-center justify-center"
                >
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border border-cyan/20 rounded-full border-t-cyan flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  >
                    <Recycle className="w-12 h-12 text-neon-green" />
                  </motion.div>
                </motion.div>
             </div>
             <div className="absolute bottom-4 left-4 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
               NEURAL_RENDER_LIVE_0x82A
             </div>
          </div>
        </div>
      </HoloCard>
    </div>
  );
}
