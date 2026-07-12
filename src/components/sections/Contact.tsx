import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Globe, 
  Github, 
  Linkedin, 
  ShieldCheck, 
  Terminal, 
  AlertTriangle, 
  Lock, 
  Eye, 
  RefreshCw, 
  Key, 
  Clock,
  Trash2
} from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';
import { submitContactMessage, fetchContactMessages } from '../../lib/firebase';
import confetti from 'canvas-confetti';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [formState, setFormState] = useState<'idle' | 'logging' | 'encrypting' | 'routing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Admin Logs State
  const [messages, setMessages] = useState<any[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const loadMessagesFromFirestore = async () => {
    setIsLoadingMessages(true);
    try {
      const data = await fetchContactMessages();
      setMessages(data);
    } catch (e) {
      console.error("Error retrieving Firestore documents:", e);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toLowerCase() === 'prince' || passcode.trim() === '1234' || passcode.trim() === '') {
      setIsAuthenticated(true);
      setAuthError('');
      loadMessagesFromFirestore();
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ['#06b6d4', '#10b981']
      });
    } else {
      setAuthError('INVALID SECURITY SIGNATURE. RE-ENTER CREDENTIALS.');
    }
  };

  const handleForceRefresh = () => {
    if (isAuthenticated) {
      loadMessagesFromFirestore();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Full Name, Email Address, and Message are required nodes.');
      setFormState('error');
      return;
    }

    try {
      // Step 1: Simulate connection & telemetry logging
      setFormState('logging');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 2: Simulate quantum encryption
      setFormState('encrypting');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 3: Write directly to Firebase Firestore database `messages` collection
      setFormState('routing');
      await submitContactMessage(formData);

      // Backup Server API submission so server terminal also gets real-time logging
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } catch (bkErr) {
        console.warn('Backend logger sync bypassed:', bkErr);
      }

      setFormState('success');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#06b6d4', '#10b981', '#ffffff']
      });

      // Reset form fields
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });

      // Reload admin messages if currently open/authenticated
      if (isAuthenticated) {
        loadMessagesFromFirestore();
      }

    } catch (err: any) {
      console.error('Transmission fail:', err);
      setErrorMsg(err.message || 'Quantum handshake timeout. Please check your network packet alignment.');
      setFormState('error');
    }
  };

  return (
    <div className="space-y-12 py-12">
      {/* Comms Center Header */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-cyan-400 font-mono text-[10px] tracking-[0.5em] uppercase flex items-center gap-2"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400 font-sans" />
          <span>// COMMS_GATEWAY_HQ_V2.5 // SECURITY_ACTIVE</span>
        </motion.div>
        <h2 className="text-6xl font-bold tracking-tighter uppercase font-display">
          Connect <span className="text-gradient">Direct.</span>
        </h2>
        <p className="text-slate-300 max-w-3xl font-sans text-sm md:text-base leading-relaxed p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-xl">
          {"Hello, I am Prince Kumar, a Computer Science student specializing in Artificial Intelligence and Machine Learning. I am passionate about AI, Cybersecurity, Software Development, Data Structures & Algorithms, and emerging technologies. I am open to internships, collaborations, freelance opportunities, and innovative technology projects. Feel free to connect with me for professional discussions, project development, and technical collaboration."}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Info Deck */}
        <div className="lg:col-span-1 space-y-4">
          <HoloCard className="p-8 border-white/5 space-y-6 flex flex-col justify-between min-h-[450px]">
            <div className="space-y-6">
              <h3 className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                <span>Verified Endpoints</span>
              </h3>
              
              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'Email Address', value: 'princekr75620@gmail.com', color: 'text-cyan-400', href: 'mailto:princekr75620@gmail.com' },
                  { icon: Phone, label: 'Phone Number', value: '+91 9334978951', color: 'text-emerald-400', href: 'tel:+919334978951' },
                  { icon: MapPin, label: 'Location', value: 'India', color: 'text-rose-400', href: '#' },
                  { icon: Github, label: 'GitHub Connection', value: 'github.com/princekr75620', color: 'text-violet-400', href: 'https://github.com/princekr75620' }
                ].map((node, i) => (
                  <a 
                    key={i} 
                    href={node.href}
                    target={node.href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-all"
                  >
                    <div className={node.color}>
                      <node.icon className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-sans font-bold uppercase tracking-widest text-slate-500">{node.label}</label>
                      <span className="text-sm text-slate-200 font-display font-medium tracking-wide group-hover:text-white transition-colors">{node.value}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <span className="block text-[8px] font-mono uppercase tracking-[0.2em] text-slate-500">Secure Peer Transmissions</span>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/princekr75620" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="GitHub Profile"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-violet-500/20 hover:border-violet-400/30 text-slate-300 hover:text-violet-400 transition-all cursor-pointer animate-pulse"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com/in/#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="LinkedIn (Placeholder)"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-400/30 text-slate-500 hover:text-cyan-400 transition-all cursor-pointer"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  title="Portfolio (Placeholder)"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-400/30 text-slate-500 hover:text-emerald-400 transition-all cursor-pointer"
                >
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
          </HoloCard>
        </div>

        {/* Transmission Interface */}
        <div className="lg:col-span-2">
          <HoloCard className="p-8 md:p-12 border-white/5 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent flex flex-col justify-between min-h-[450px]">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    disabled={formState !== 'idle' && formState !== 'error'}
                    className="w-full bg-white/5 border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-cyan-400 transition-colors bg-transparent italic"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. john@rewise.ai"
                    disabled={formState !== 'idle' && formState !== 'error'}
                    className="w-full bg-white/5 border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-cyan-400 transition-colors bg-transparent italic"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 93349 78951"
                  disabled={formState !== 'idle' && formState !== 'error'}
                  className="w-full bg-white/5 border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-cyan-400 transition-colors bg-transparent italic"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400">Message</label>
                <textarea 
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Briefly explain your vision, query, or invitation..."
                  disabled={formState !== 'idle' && formState !== 'error'}
                  className="w-full bg-white/5 border-b border-white/10 py-3 px-0 text-white focus:outline-none focus:border-cyan-400 transition-colors bg-transparent resize-none italic"
                  required
                />
              </div>

              {/* Status Output */}
              <AnimatePresence mode="wait">
                {formState !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl font-mono text-[11px] uppercase tracking-wider"
                  >
                    {formState === 'logging' && (
                      <div className="text-cyan-400 flex items-center gap-2 animate-pulse">
                        <Terminal className="w-4 h-4 animate-spin" />
                        <span>[PROCESS] Initiating secure Firestore transmission path...</span>
                      </div>
                    )}
                    {formState === 'encrypting' && (
                      <div className="text-amber-400 flex items-center gap-2 animate-pulse">
                        <ShieldCheck className="w-4 h-4" />
                        <span>[PROCESS] Structuring payload fields for Firestore database... [SECURE]</span>
                      </div>
                    )}
                    {formState === 'routing' && (
                      <div className="text-purple-400 flex items-center gap-2 animate-pulse">
                        <Send className="w-4 h-4 animate-bounce" />
                        <span>[PROCESS] Routing packet to Firestore "messages" collection...</span>
                      </div>
                    )}
                    {formState === 'success' && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                        <div className="text-emerald-400 font-bold flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>TRANSMISSION ACCEPTED [FIRESTORE WRITE OK]</span>
                        </div>
                        <p className="text-slate-400 font-sans text-xs italic capitalize normal-case tracking-normal">
                          Success! Your message has been saved in Prince Kumar's secure Firestore database and logged to the comms system.
                        </p>
                        <button 
                          type="button" 
                          onClick={() => setFormState('idle')}
                          className="text-[10px] text-emerald-400 underline uppercase font-bold tracking-widest mt-2"
                        >
                          Send Another Transmission
                        </button>
                      </div>
                    )}
                    {formState === 'error' && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                        <div className="text-rose-400 font-bold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>TRANSMISSION FAILED [CORE_DB_ERR]</span>
                        </div>
                        <p className="text-slate-400 font-sans text-xs normal-case tracking-normal">
                          {errorMsg}
                        </p>
                        <button 
                          type="button" 
                          onClick={() => setFormState('idle')}
                          className="text-[10px] text-rose-400 underline uppercase font-bold tracking-widest mt-2"
                        >
                          Re-configure Node & Retry
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {formState === 'idle' && (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full md:w-auto px-12 py-4 bg-cyan-500 text-black font-display font-bold uppercase text-xs tracking-[0.3em] rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.2)] cursor-pointer"
                  >
                    Send to Firestore
                  </motion.button>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    Quantum Handshake: Activated
                  </span>
                </div>
              )}
            </form>
          </HoloCard>
        </div>
      </div>

      {/* Admin Signal Decryptor Panel */}
      <div className="pt-12 border-t border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-display uppercase tracking-wider text-slate-200">
              Admin Comms Decryption Protocol
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Access and read all real-time submissions received straight from the Firestore <code className="text-cyan-400">messages</code> collection database.
            </p>
          </div>
          <button
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-sans font-bold uppercase tracking-widest text-[#06b6d4]"
          >
            <Lock className="w-3.5 h-3.5 text-[#06b6d4]" />
            <span>{isAdminOpen ? "Close Admin Panel" : "Unlock Signal logs"}</span>
          </button>
        </div>

        <AnimatePresence>
          {isAdminOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <HoloCard className="p-6 md:p-8 border-[#06b6d4]/20 bg-[#0c162d]/50 space-y-6">
                {!isAuthenticated ? (
                  <form onSubmit={handleAdminVerify} className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
                        <Key className="w-4 h-4 text-cyan-400" />
                        <span>OPERATOR SECURITY AUTHENTICATION</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        Please enter the administrator credentials key to declassify and decrypt. 
                        <br/>
                        <span className="text-emerald-500/80 font-bold italic">Hint: Press Enter or submit empty to bypass and instant-unlock!</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="password"
                        placeholder="SECURITY KEY"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="flex-1 bg-black/40 border border-[#06b6d4]/30 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 font-mono focus:outline-none focus:border-cyan-400 transition-all font-bold"
                      />
                      <button
                        type="submit"
                        className="px-6 bg-[#06b6d4] hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        DECRYPT
                      </button>
                    </div>
                    {authError && (
                      <p className="text-[10px] font-mono text-red-500 tracking-wider">
                        ⚠️ {authError}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-mono text-[#10b981] uppercase tracking-widest">
                          <ShieldCheck className="w-5 h-5 text-[#10b981]" />
                          <span>HANDSHAKE SECURED // ACCESS ALLOWED</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                          {messages.length} Documents
                        </span>
                      </div>
                      
                      <button
                        onClick={handleForceRefresh}
                        disabled={isLoadingMessages}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/10 hover:bg-emerald-500/5 transition-all text-[10px] font-mono font-bold text-emerald-400"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                        <span>RE-FETCH</span>
                      </button>
                    </div>

                    {isLoadingMessages ? (
                      <div className="py-12 flex flex-col items-center justify-center space-y-3">
                        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                        <span className="text-xs font-mono text-cyan-500 uppercase tracking-[0.2em]">Querying Active Firestore Shards...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-12 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-2 opacity-50">
                        <Terminal className="w-8 h-8 text-slate-500" />
                        <span className="text-xs text-slate-400 font-sans">No transmissions recorded in the database yet.</span>
                      </div>
                    ) : (
                      <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map((msg, index) => (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={msg.id || index}
                            className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4 hover:border-cyan-400/20 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                              <div>
                                <span className="block text-xs font-display font-medium text-white">{msg.name}</span>
                                <span className="text-[10px] text-cyan-400 font-mono italic">{msg.email}</span>
                              </div>
                              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                                <span className="flex items-center gap-1.5 pb-0.5">
                                  <Phone className="w-3 h-3 text-emerald-400" />
                                  {msg.phone || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1.5 pb-0.5">
                                  <Clock className="w-3 h-3 text-[#f43f5e]" />
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-[#10b981]">
                              {msg.message}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </HoloCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
