import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe } from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';

export default function Contact() {
  return (
    <div className="space-y-12 py-12">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-cyan-400 font-mono text-[10px] tracking-[0.5em] uppercase"
        >
          // Comms_Center_v1.0
        </motion.div>
        <h2 className="text-6xl font-bold tracking-tighter uppercase">Connect <span className="text-cyan-400">Direct.</span></h2>
        <p className="text-slate-400 max-w-xl font-sans italic leading-relaxed">
          Open communication channels for potential partnerships, circular economy initiatives, or technical support.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <HoloCard className="p-8 border-white/5 space-y-6">
            <h3 className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-slate-500">Contact Nodes</h3>
            
            <div className="space-y-6">
              {[
                { icon: Mail, label: 'Email', value: 'connect@rewise.ai', color: 'text-cyan-400' },
                { icon: Phone, label: 'Terminal', value: '+1 (555) ARCH-001', color: 'text-emerald-400' },
                { icon: MapPin, label: 'Origin', value: 'Zero-Waste Hub, San Francisco', color: 'text-rose-400' },
                { icon: Globe, label: 'Mesh', value: 'rewise.earth/hq', color: 'text-amber-400' }
              ].map((node, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={node.color}>
                    <node.icon className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-sans font-bold uppercase tracking-widest text-slate-600">{node.label}</label>
                    <span className="text-sm text-slate-200 font-display font-medium tracking-wide">{node.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center hover:bg-cyan-400/20 transition-colors">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center hover:bg-emerald-400/20 transition-colors">
                  <Send className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </HoloCard>
        </div>

        <div className="lg:col-span-2">
           <HoloCard className="p-8 md:p-12 border-white/5 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent">
             <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-500">Identity Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      className="w-full bg-white/5 border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-cyan-400 transition-colors bg-transparent italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-500">Node Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. john@rewise.ai"
                      className="w-full bg-white/5 border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-cyan-400 transition-colors bg-transparent italic"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-500">Transmission Content</label>
                  <textarea 
                    rows={4}
                    placeholder="Briefly explain your vision or inquiry..."
                    className="w-full bg-white/5 border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-cyan-400 transition-colors bg-transparent resize-none italic"
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto px-12 py-4 bg-cyan-500 text-black font-display font-bold uppercase text-xs tracking-[0.3em] rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                >
                  Encrypt & Send
                </motion.button>
             </form>
           </HoloCard>
        </div>
      </div>
    </div>
  );
}
