import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Send, Sparkles, BrainCircuit, MessageSquare, Volume2, Command, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { voiceAssistantChat } from '../../services/ai';
import { canChat, recordChat } from '../../lib/subscription';

import { Language } from '../ui/LanguageSelector';
import { useTranslation } from '../../lib/translations';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  language: Language;
}

export default function VoiceAssistant({ onCommand, language }: VoiceAssistantProps) {
  const t = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: language === 'hindi' ? 'नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?' : language === 'haryanvi' ? 'राम राम! के मदद करूँ थारी?' : language === 'punjabi' ? 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?' : 'Hello! I am ReWise AI. I can help you navigate or answer questions about sustainability.' }
  ]);
  const [input, setInput] = useState('');
  const [errorType, setErrorType] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<any>(null);

  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleInput(transcript);
        setIsListening(false);
        setErrorType(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setErrorType(event.error);
        
        if (event.error === 'not-allowed') {
          addAssistantMessage('Microphone access was denied. Please enable it in your browser settings.');
        } else if (event.error === 'network') {
          addAssistantMessage('Connectivity issue detected with the voice module. Please try again or use text input.');
        } else if (event.error === 'no-speech') {
          // Silent failure for no-speech is usually better, but we can reset state
        }
      };

      recognitionRef.current = recognition;
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    initSpeechRecognition();
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  const handleInput = async (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    const command = text.toLowerCase();
    
    // Check for navigation commands first
    if (command.includes('scanner') || command.includes('scan')) {
      onCommand?.('scanner');
      addAssistantMessage('Navigating to Visual Scanner.');
      return;
    } else if (command.includes('dashboard') || command.includes('metrics') || command.includes('analytic')) {
      onCommand?.('dashboard');
      addAssistantMessage('Opening Environmental Metrics.');
      return;
    } else if (command.includes('home') || command.includes('main')) {
      onCommand?.('home');
      addAssistantMessage('Returning to Home.');
      return;
    } else if (command.includes('studio') || command.includes('design')) {
      onCommand?.('studio');
      addAssistantMessage('Opening Design Studio.');
      return;
    } else if (command.includes('gmail') || command.includes('inbox') || command.includes('mail') || command.includes('email')) {
      onCommand?.('gmail');
      addAssistantMessage('Opening Gmail Communication Hub.');
      return;
    } else if (
      command.includes('operation') || 
      command.includes('collection') || 
      command.includes('transport') ||
      command.includes('segregation') ||
      command.includes('recycling') ||
      command.includes('fleet')
    ) {
      onCommand?.('operations');
      const msg = 'Opening Waste Operations Command Dashboard (Collection, Transportation, Segregation, Recycling Centers).';
      addAssistantMessage(msg);
      return;
    }

    // If not a navigation command, use Gemini
    if (!canChat()) {
      let limitMsg = '⚠️ AI Session Quota reached. Your Free Tier allowance of 5 messages is fully exhausted. Please upgrade to the Basic Orbit (₹50) or Star Voyager (₹300/yr) plan inside the "Company -> Membership & Billing" page for unlimited assistant access.';
      if (language === 'hindi') {
        limitMsg = '⚠️ चैट सीमा समाप्त! आपकी निःशुल्क 5 संदेशों की कोटा सीमा पूरी हो चुकी है। कृपया असीमित बातचीत के लिए "Company -> Membership & Billing" में जाकर अपनी सदस्यता अपग्रेड करें।';
      } else if (language === 'haryanvi') {
        limitMsg = '⚠️ फ्री चैट लिमिट खत्म हो ली! थारे 5 फ्री संदेश पूरे हो गए सैं। असीमित चैट खातर "Company -> Membership & Billing" कूट पै जाकै अपग्रेड कर लो।';
      } else if (language === 'punjabi') {
        limitMsg = '⚠️ ਚੈਟ ਸੀਮਾ ਖ਼ਤਮ! ਤੁਹਾਡੀ ਮੁਫ਼ਤ 5 ਸੁਨੇਹਿਆਂ ਦੀ ਸੀਮਾ ਪੂਰੀ ਹੋ ਚੁੱਕੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਅਣਲਿਮਟਿਡ ਚੈਟ ਲਈ "Company -> Membership & Billing" ਵਿੱਚ ਜਾ ਕੇ ਆਪਣੀ ਮੈਂਬਰਸ਼ਿਪ ਨੂੰ ਅਪਗ੍ਰੇਡ ਕਰੋ।';
      }
      addAssistantMessage(limitMsg);
      return;
    }

    setIsProcessing(true);
    try {
      const langPrompt = language === 'hindi' ? 'Respond in Hindi.' : language === 'haryanvi' ? 'Respond in Haryanvi (using Devanagari script).' : language === 'punjabi' ? 'Respond in Punjabi.' : 'Respond in English.';
      const response = await voiceAssistantChat(`${text}. ${langPrompt}`);
      if (response) {
        addAssistantMessage(response);
        await recordChat();
      }
    } catch (error) {
      addAssistantMessage(language === 'hindi' ? 'क्षमा करें, मेरा संपर्क अभी अस्थिर है।' : 'Sorry, my neural links are currently unstable.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'assistant', content }]);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      initSpeechRecognition();
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setErrorType(null);
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start failed, re-initializing:', err);
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 100);
      }
    }
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    handleInput(input);
    setInput('');
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] z-[100] group"
      >
        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20 group-hover:opacity-40" />
        <BrainCircuit className="w-8 h-8 relative z-10" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-[400px] max-w-[90vw] h-[550px] glass-premium rounded-3xl overflow-hidden z-[100] flex flex-col border border-white/10 shadow-2xl"
          >
            <div className="p-6 bg-slate-900/50 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold text-white leading-none">ReWise AI</h4>
                  <span className="text-[10px] text-emerald-400 font-sans font-bold uppercase tracking-widest leading-none">Active Feedback</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar bg-slate-950/30"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%] space-y-2",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm font-sans leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-emerald-500 text-white rounded-tr-none shadow-lg shadow-emerald-500/10" 
                      : "bg-slate-900/80 text-slate-300 rounded-tl-none border border-white/5"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-2 text-emerald-400/50 text-[10px] font-sans font-bold uppercase tracking-widest animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> Neural Sync in progress...
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-900/50 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Ask ReWise..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-emerald-500/50 text-white"
                  />
                </div>
                <button 
                  onClick={handleSend}
                  disabled={isProcessing}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition-all border border-white/5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center">
                 <button 
                   onClick={toggleListening}
                   className={cn(
                     "relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 group",
                     isListening ? "bg-emerald-500 scale-110 shadow-[0_0_30px_rgba(16,185,129,0.5)]" : "bg-white/5 hover:bg-white/10"
                   )}
                 >
                    {isListening && (
                      <>
                        <motion.div 
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute inset-0 bg-emerald-400 rounded-full"
                        />
                        <motion.div 
                          initial={{ scale: 1, opacity: 0.3 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 bg-emerald-400 rounded-full"
                        />
                      </>
                    )}
                    <Mic className={cn("w-6 h-6 relative z-10 transition-colors", isListening ? "text-white" : "text-slate-500")} />
                 </button>
              </div>
              
              <div className="text-center flex flex-col gap-1">
                  <span className={cn(
                    "text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-colors",
                    isListening ? "text-emerald-400 animate-pulse" : errorType === 'network' ? "text-red-400" : "text-slate-600"
                  )}>
                    {isListening ? "Listening..." : errorType === 'network' ? "Network Error" : "Tap to Speak"}
                  </span>
                  {!isListening && (
                    <div className="flex items-center justify-center gap-1.5 opacity-30">
                       <Command className="w-2.5 h-2.5" />
                       <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-slate-500">"Open Dashboard"</span>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

