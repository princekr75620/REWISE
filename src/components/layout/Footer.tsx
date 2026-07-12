import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-slate-950/50 py-12 px-8 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-white">
              ReWise
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            The next-generation circular economy protocol. Leveraging neural material analysis 
            to re-engineer waste streams into premium value assets.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Platform</h4>
          <ul className="space-y-2">
            {['Scanner', 'Studio', 'Metrics', 'Network'].map(item => (
              <li key={item}>
                <a href="#" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Company</h4>
          <ul className="space-y-2">
            {['About', 'Vision', 'Privacy', 'Contact'].map(item => (
              <li key={item}>
                <a href="#" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-[10px] text-slate-600 font-sans font-bold uppercase tracking-widest">
          © 2026 ReWise. Developed by Prince Kumar.
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
