import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText, Server, Check } from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';
import confetti from 'canvas-confetti';

export default function Privacy() {
  const [downloaded, setDownloaded] = useState(false);

  const saveToVault = () => {
    const privacyProtocol = {
      title: 'ReWise Privacy Protocol',
      originalMaterial: 'Data Integrity',
      concept: 'A comprehensive guide to ReWise decentralized data security and user anonymity standards.',
      difficulty: 'System-Level',
      estimatedCost: 'N/A',
      vibe: 'Legal Architecture',
      materials: ['Neural Encryption', 'Edge Processing', 'Decentralized Grid'],
      steps: [
        'Review Data Collection scope and necessity.',
        'Initialize multi-layer neural encryption on all input vectors.',
        'Distribute encrypted fragments across decentralized nodes.',
        'Enable user-level access keys for data management and deletion.'
      ]
    };

    const stored = localStorage.getItem('rewise_vault');
    const vault = stored ? JSON.parse(stored) : [];
    
    if (!vault.some((b: any) => b.title === privacyProtocol.title)) {
      vault.push(privacyProtocol);
      localStorage.setItem('rewise_vault', JSON.stringify(vault));
      window.dispatchEvent(new Event('storage'));
    }

    setDownloaded(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#fb7185']
    });
    setTimeout(() => setDownloaded(false), 3000);
  };
  const sections = [
    { 
      title: 'Data Collection', 
      icon: Eye,
      content: 'We only collect data necessary for material analysis and circular blueprint generation. Your personal identification remains encrypted at the edge.' 
    },
    { 
      title: 'Neural Encryption', 
      icon: Lock,
      content: 'Every scan and user profile is protected by multi-layer neural encryption protocols. We do not sell user data to third-party entities.' 
    },
    { 
      title: 'Transparency', 
      icon: FileText,
      content: 'Users maintain full ownership of their manifested designs. All analysis logs are accessible and can be deleted upon request.' 
    },
    { 
      title: 'Server Security', 
      icon: Server,
      content: 'Our distributed grid ensures that no single node holds complete user datasets, preventing large-scale security breaches.' 
    }
  ];

  return (
    <div className="space-y-12 py-12">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-rose-400 font-mono text-[10px] tracking-[0.5em] uppercase"
        >
          // Security_Protocol_v4.2
        </motion.div>
        <h2 className="text-6xl font-bold tracking-tighter uppercase">Privacy <span className="text-rose-400">Locked.</span></h2>
        <p className="text-slate-400 max-w-2xl font-sans italic leading-relaxed">
          At ReWise, your digital footprint is as important as your environmental footprint. We ensure absolute data integrity through decentralized architecture.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section, i) => (
          <HoloCard key={i} className="p-8 border-white/5 space-y-4 group hover:border-rose-400/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-400/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <section.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight">{section.title}</h3>
            </div>
            <p className="text-slate-500 font-sans text-sm leading-relaxed italic">
              {section.content}
            </p>
          </HoloCard>
        ))}
      </div>

      <div className="p-8 rounded-[2rem] bg-rose-400/5 border border-rose-400/10 flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-400 flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider">Verified Security</h4>
            <p className="text-[10px] text-rose-400/60 font-mono uppercase tracking-[0.2em]">Compliance level: high_alpha</p>
          </div>
        </div>
        <button 
          onClick={saveToVault}
          className="px-6 py-2 rounded-full border border-rose-400/20 text-rose-400 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-rose-400 hover:text-white transition-all flex items-center gap-2"
        >
          {downloaded ? (
            <>Archived <Check className="w-3.5 h-3.5" /></>
          ) : (
            'Download Full Policy'
          )}
        </button>
      </div>
    </div>
  );
}
