import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getGmailToken, 
  authenticateGmail, 
  getGmailInbox, 
  sendGmailMessage, 
  trashGmailMessage 
} from '../../lib/gmail';
import { 
  Mail, 
  Send, 
  Trash2, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Inbox, 
  X, 
  Plus, 
  ArrowLeft, 
  User, 
  ExternalLink,
  ShieldAlert,
  Loader
} from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';
import confetti from 'canvas-confetti';

export default function GmailHub() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inbox State
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  // Compose State
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [sendingState, setSendingState] = useState<'idle' | 'confirming' | 'sending' | 'success' | 'error'>('idle');
  const [sendingError, setSendingError] = useState('');

  // Trash Operations state
  const [messageToTrash, setMessageToTrash] = useState<any | null>(null);
  const [trashingState, setTrashingState] = useState<'idle' | 'confirming' | 'processing' | 'done'>('idle');

  // Check initial login state
  useEffect(() => {
    const existingToken = getGmailToken();
    if (existingToken) {
      setToken(existingToken);
      // Recover email stored in local storage or session
      const storedUser = localStorage.getItem('rewise_user');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setEmail(userObj.email || 'Google User');
        } catch (_) {
          setEmail('Google User');
        }
      }
      loadInbox(existingToken, true);
    }
  }, []);

  const handleOAuthConnect = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const authResult = await authenticateGmail();
      setToken(authResult.token);
      setEmail(authResult.email);
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ['#06b6d4', '#10b981']
      });
      await loadInbox(authResult.token, false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authorization failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loadInbox = async (authToken: string, isSilent: boolean = false) => {
    if (!authToken && !token) return;
    if (!isSilent) setLoadingInbox(true);
    try {
      const msgs = await getGmailInbox(15, searchTerm);
      setMessages(msgs);
      if (msgs.length > 0 && !selectedMessage) {
        setSelectedMessage(null); // Clear selected to avoid misalignment
      }
    } catch (e: any) {
      console.error("Inbox load err:", e);
      if (e.message?.includes("token")) {
        // Token likely expired
        setToken(null);
      }
    } finally {
      setLoadingInbox(false);
    }
  };

  const triggerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) loadInbox(token, false);
  };

  // Safe Deliver via Gmail compose
  const confirmSendMessage = () => {
    if (!composeData.to.trim() || !composeData.subject.trim() || !composeData.body.trim()) {
      alert("Please populate To, Subject, and Body fields.");
      return;
    }
    setSendingState('confirming');
  };

  const executeSendMessage = async () => {
    setSendingState('sending');
    try {
      await sendGmailMessage(composeData.to, composeData.subject, composeData.body);
      setSendingState('success');
      confetti({
        particleCount: 80,
        spread: 50,
        colors: ['#10b981', '#06b6d4']
      });
      // Reset compose
      setComposeData({ to: '', subject: '', body: '' });
      setIsComposing(false);
      // Wait a moment then refresh inbox
      setTimeout(() => {
        if (token) loadInbox(token, true);
        setSendingState('idle');
      }, 1500);
    } catch (err: any) {
      setSendingState('error');
      setSendingError(err.message || 'Transmission hand-off failed.');
    }
  };

  // Safe mutating Trash action with Dialog requirement
  const confirmDeleteMessage = (msg: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessageToTrash(msg);
    setTrashingState('confirming');
  };

  const executeDeleteMessage = async () => {
    if (!messageToTrash) return;
    setTrashingState('processing');
    try {
      await trashGmailMessage(messageToTrash.id);
      setTrashingState('done');
      
      // Remove local copy from list
      setMessages(prev => prev.filter(m => m.id !== messageToTrash.id));
      if (selectedMessage?.id === messageToTrash.id) {
        setSelectedMessage(null);
      }

      setTimeout(() => {
        setTrashingState('idle');
        setMessageToTrash(null);
      }, 1200);

    } catch (err: any) {
      alert(err.message || "Failed to complete trash node update.");
      setTrashingState('idle');
      setMessageToTrash(null);
    }
  };

  return (
    <div className="space-y-10 py-6">
      {/* Workspace Hub Header */}
      <div className="space-y-4">
        <div className="text-cyan-400 font-mono text-[10px] tracking-[0.5em] uppercase flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>// WORKSPACE_INTEGRATION_ONLINE // GMAIL_COMMS</span>
        </div>
        <h2 className="text-6xl font-bold tracking-tighter uppercase font-display">
          Gmail <span className="text-gradient">Inbox.</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-4xl font-sans">
          Welcome to the Prince Kumar Gmail Gateway. View, scan, search, compose, and organize your core emails right from this secure sandboxed circular workstation application.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!token ? (
          /* UNCONNECTED OAUTH LOGIN SCREEN */
          <motion.div
            key="unconnected-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-xl mx-auto"
          >
            <HoloCard className="p-8 md:p-12 border-white/5 bg-gradient-to-b from-[#0c1a30] to-[#040d1a] space-y-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center animate-pulse">
                <Mail className="w-8 h-8 text-cyan-400" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold font-display uppercase tracking-wide text-white">
                  Establish Gmail Link
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm mx-auto">
                  To securely fetch signals and compose updates, please connect your authorized Google Workspace account. This leverages in-memory secure session synchronization.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-mono text-red-400 text-left w-full flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Verified Material Button */}
              <button 
                onClick={handleOAuthConnect}
                disabled={isLoggingIn}
                className="gsi-material-button w-full sm:w-auto shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper bg-white py-3.5 px-6 rounded-xl flex items-center justify-center gap-3">
                  <div className="gsi-material-button-icon h-5 w-5">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents text-slate-800 text-xs font-bold uppercase tracking-wider font-sans">
                    {isLoggingIn ? "Establishing Handshake..." : "Sign in with Google"}
                  </span>
                </div>
              </button>

              <div className="pt-4 border-t border-white/5 w-full flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                <span>Scope: read / send / compose</span>
                <span>In-Memory Storage Only</span>
              </div>
            </HoloCard>
          </motion.div>
        ) : (
          /* SIGNED IN WORKSPACE INBOX INTERFACE */
          <motion.div
            key="connected-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid lg:grid-cols-12 gap-8"
          >
            {/* Left column sidebar for Mail List / Search */}
            <div className="lg:col-span-5 space-y-4">
              <HoloCard className="p-4 border-white/5 bg-[#091122]">
                <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                      Linked: {email}
                    </span>
                  </div>

                  <button 
                    onClick={() => setToken(null)}
                    className="text-[9px] font-mono text-red-400 uppercase hover:underline"
                  >
                    Disconnect Node
                  </button>
                </div>

                {/* Email searching */}
                <form onSubmit={triggerSearch} className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input 
                      type="text" 
                      placeholder="Search messages (e.g. from:prince)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#06b6d4]/10 border border-white/10 text-cyan-400 transition-all cursor-pointer"
                    title="Search Inbox shards"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {/* Actions line */}
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => {
                      setIsComposing(true);
                      setSelectedMessage(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#06b6d4] text-black font-display font-medium text-[10px] uppercase tracking-wider hover:bg-cyan-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                    <span>Compose New Email</span>
                  </button>
                  <button 
                    onClick={() => loadInbox(token, false)}
                    className="p-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs flex items-center gap-2 cursor-pointer"
                    title="Force refresh inbox"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingInbox ? 'animate-spin' : ''}`} />
                    <span className="text-[9px] font-mono uppercase tracking-wider">REFRESH</span>
                  </button>
                </div>

                {/* Mail List Body */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {loadingInbox ? (
                    <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                      <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest animate-pulse">Consulting Gmail Server Shards...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-white/5 rounded-2xl space-y-2 opacity-50 flex flex-col items-center justify-center">
                      <Inbox className="w-8 h-8 text-slate-500" />
                      <span className="text-xs text-slate-400 font-sans">No emails decoded. Try another query or send a test email.</span>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          setIsComposing(false);
                        }}
                        className={`p-4 rounded-xl text-left transition-all cursor-pointer border relative group ${
                          selectedMessage?.id === msg.id 
                            ? 'bg-[#0c1a30]/90 border-cyan-500/40 shadow-inner' 
                            : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-display truncate max-w-[70%]">
                            {msg.from.split('<')[0].trim() || msg.from}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 shrink-0">
                            {msg.date.split(',')[0]}
                          </span>
                        </div>
                        <h4 className="text-xs font-medium font-sans text-slate-100 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {msg.subject || '(No Subject)'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-sans line-clamp-2 mt-1 leading-normal">
                          {msg.snippet}
                        </p>

                        {/* Hover Quick Delete Trigger */}
                        <button
                          onClick={(e) => confirmDeleteMessage(msg, e)}
                          className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-black cursor-pointer"
                          title="Trash Message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </HoloCard>
            </div>

            {/* Right column detailed display view */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {isComposing ? (
                  /* COMPOSE EMAIL VIEW */
                  <motion.div
                    key="compose-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <HoloCard className="p-6 md:p-8 border-cyan-500/25 bg-gradient-to-br from-cyan-400/5 to-transparent space-y-6">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-sm font-display uppercase tracking-widest font-bold text-white">
                            Compose Outer Transmission
                          </h3>
                        </div>
                        <button 
                          onClick={() => setIsComposing(false)}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4 font-sans text-xs">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Recipient Address (To)</label>
                          <input 
                            type="email" 
                            placeholder="e.g. princekr75620@gmail.com"
                            value={composeData.to}
                            onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Subject Heading</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Collaborative Technology Invitation"
                            value={composeData.subject}
                            onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors font-medium"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Message Body</label>
                          <textarea 
                            rows={8}
                            placeholder="State your message contents here..."
                            value={composeData.body}
                            onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors resize-none leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Compose button Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <button 
                          type="button" 
                          onClick={() => setIsComposing(false)}
                          className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-slate-500 hover:text-white"
                        >
                          Cancel Draft
                        </button>
                        
                        <button 
                          onClick={confirmSendMessage}
                          className="px-8 py-3 bg-[#06b6d4] text-black font-display font-bold uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer"
                        >
                          Deliver Message
                        </button>
                      </div>
                    </HoloCard>
                  </motion.div>
                ) : selectedMessage ? (
                  /* EMAIL DETAILED DECRYPTED VIEW */
                  <motion.div
                    key="detail-view"
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                  >
                    <HoloCard className="p-6 md:p-8 border-white/5 bg-[#09101f] space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-white/5 pb-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block">// SECURE_DECRYPTED_NODE</span>
                          <h3 className="text-lg font-bold font-display uppercase text-white leading-tight">
                            {selectedMessage.subject || '(No Subject)'}
                          </h3>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={(e) => confirmDeleteMessage(selectedMessage, e)}
                            className="p-2 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[9px] uppercase font-bold tracking-widest hidden sm:inline">Trash</span>
                          </button>
                          <button 
                            onClick={() => setSelectedMessage(null)}
                            className="p-2 rounded-xl border border-white/5 text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Metadata row */}
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 grid md:grid-cols-2 gap-3 text-xs font-sans">
                        <div>
                          <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">From</span>
                          <span className="text-cyan-400 font-medium truncate block">{selectedMessage.from}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Date Received</span>
                          <span className="text-slate-300 font-mono block">{selectedMessage.date}</span>
                        </div>
                      </div>

                      {/* Display content body */}
                      <div className="py-2">
                        <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-3">Decoded Content</span>
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 font-sans text-xs md:text-sm text-slate-200 leading-relaxed max-h-[350px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                          {selectedMessage.snippetBody || selectedMessage.snippet || '(Empty Body)'}
                        </div>
                      </div>

                      {/* Reply shortcut trigger */}
                      <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button 
                          onClick={() => {
                            const match = selectedMessage.from.match(/<([^>]+)>/);
                            const toEmail = match ? match[1] : selectedMessage.from;
                            setComposeData({
                              to: toEmail,
                              subject: `Re: ${selectedMessage.subject}`,
                              body: `\n\nOn ${selectedMessage.date}, ${selectedMessage.from} wrote:\n> ${selectedMessage.snippet}`
                            });
                            setIsComposing(true);
                          }}
                          className="px-6 py-2.5 rounded-xl border border-cyan-500/20 hover:bg-cyan-500/10 hover:text-[#06b6d4] text-xs font-sans font-bold uppercase tracking-widest text-[#06b6d4] transition-all cursor-pointer"
                        >
                          Transmit Reply Key
                        </button>
                      </div>
                    </HoloCard>
                  </motion.div>
                ) : (
                  /* DEFAULT EMPTY DETAILED STATE */
                  <div className="h-full min-h-[400px] border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <Inbox className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
                    <h4 className="text-sm font-display uppercase tracking-widest text-slate-300">
                      Select Email Node
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1 font-sans">
                      Select a decoded transmission from the list to decrypt full payload content headers and body.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SENDING CONFIRMATION MODAL DIALOG */}
      <AnimatePresence>
        {sendingState === 'confirming' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full glass-premium border-cyan-500/30 p-6 rounded-3xl text-left space-y-6"
            >
              <div className="flex items-center gap-3 text-cyan-400 pb-3 border-b border-white/5">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-display uppercase tracking-wider font-bold">Transmit Handshake Authorization</h4>
              </div>
              
              <div className="space-y-2 text-xs font-sans leading-relaxed text-slate-300">
                <p>You are about to transmit a Gmail packet directly with the following coordinates:</p>
                <div className="p-3 bg-black/40 rounded-xl space-y-1 font-mono text-[11px]">
                  <div><span className="text-slate-500">Destination:</span> <span className="text-cyan-400">{composeData.to}</span></div>
                  <div><span className="text-slate-500">Subject:</span> {composeData.subject}</div>
                </div>
                <p className="text-slate-400 italic">This message will be dispatched immediately on behalf of your Google account.</p>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button 
                  onClick={() => setSendingState('idle')}
                  className="px-4 py-2 border border-white/10 rounded-lg text-xs font-mono uppercase text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeSendMessage}
                  className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase"
                >
                  Confirm & Transmit
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* SENDING LOADING / SUCCESS / ERROR OVERLAY */}
        {(sendingState === 'sending' || sendingState === 'success' || sendingState === 'error') && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-xs w-full glass-premium p-6 rounded-3xl text-center space-y-4"
            >
              {sendingState === 'sending' && (
                <>
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Transmitting Envelope...</h4>
                </>
              )}
              {sendingState === 'success' && (
                <>
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#10b981]">Signal Transmitted Successfully</h4>
                </>
              )}
              {sendingState === 'error' && (
                <>
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-red-400">Transmission Interrupted</h4>
                  <p className="text-[10px] text-slate-400 font-sans">{sendingError}</p>
                  <button 
                    onClick={() => setSendingState('idle')}
                    className="px-4 py-1.5 rounded bg-white/5 text-[9px] font-mono text-red-400 uppercase border border-red-500/20"
                  >
                    Retry Compose
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* TRASH MUTATIVE CONFIRMATION MODAL DIALOG (MANDATORY per guidelines) */}
        {trashingState === 'confirming' && messageToTrash && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full glass-premium border-red-500/35 p-6 rounded-3xl text-left space-y-6"
            >
              <div className="flex items-center gap-3 text-red-400 pb-3 border-b border-white/5">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h4 className="text-sm font-display uppercase tracking-wider font-bold">Trash Operation Consent</h4>
              </div>
              
              <div className="space-y-3 text-xs font-sans leading-relaxed text-slate-300">
                <p>Are you sure you want to move the following transmission into your Gmail account trash directory?</p>
                <div className="p-3.5 bg-red-950/20 border border-red-500/10 rounded-xl space-y-1 font-sans">
                  <div><span className="font-bold text-slate-400">Subject:</span> <span className="text-slate-200">{messageToTrash.subject}</span></div>
                  <div><span className="font-bold text-slate-400">Sender:</span> <span className="text-cyan-400">{messageToTrash.from}</span></div>
                </div>
                <p className="text-amber-500 font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Warning: This is a mutating operation on your live Google account.</span>
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button 
                  onClick={() => {
                    setTrashingState('idle');
                    setMessageToTrash(null);
                  }}
                  className="px-4 py-2 border border-white/10 rounded-lg text-xs font-mono uppercase text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDeleteMessage}
                  className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-black text-xs font-mono font-bold uppercase"
                >
                  Confirm & Trash Mail
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* TRASH MUTATIVE PROCESSING DIALOG */}
        {(trashingState === 'processing' || trashingState === 'done') && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xs w-full glass-premium p-6 rounded-3xl text-center space-y-4"
            >
              {trashingState === 'processing' && (
                <>
                  <Loader className="w-8 h-8 text-red-400 animate-spin mx-auto" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-red-400">Refactoring Gmail index...</h4>
                </>
              )}
              {trashingState === 'done' && (
                <>
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#10b981]">Trash Operation Complete</h4>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
