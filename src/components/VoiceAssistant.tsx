import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, BrainCircuit } from 'lucide-react';
import { voiceAssistantChat } from '../services/ai';
import { cn } from '../lib/utils';

export default function VoiceAssistant() {
  const [active, setActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Simulated Voice Recognition (as full browser voice implementation might be tricky)
  const handleToggle = () => {
    setActive(!active);
    if (!active) {
      // Small simulated greeting
      setIsSpeaking(true);
      setResponse("Hello! I am ReWise AI. How can I help you save the planet today?");
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  const handleListen = () => {
    if (isListening) {
      setIsListening(false);
      // Process simulated voice
      handleChat(transcript || "How can I reuse plastic?");
    } else {
      setIsListening(true);
      setTranscript('');
      // In a real app, we'd use SpeechRecognition API here
      setTimeout(() => setTranscript('Show me some recycling tips'), 2000);
    }
  };

  const handleChat = async (text: string) => {
    if (!text.trim()) return;
    setTranscript(text);
    setIsListening(false);
    setUserInput('');
    setIsTyping(true);
    try {
      const aiResponse = await voiceAssistantChat(text);
      setResponse(aiResponse || "");
      setIsSpeaking(true);
      // In a real app, use SpeechSynthesis here
      setTimeout(() => setIsSpeaking(false), 5000);
    } catch (err) {
      setResponse("I'm sorry, my neural pathways are a bit cluttered. Can you repeat that?");
    } finally {
      setIsTyping(false);
    }
  };

  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleChat(userInput);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-neon w-80 p-6 rounded-[1.5rem] space-y-5 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-neon-green/10 pb-4">
              <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center relative shadow-lg">
                <BrainCircuit className={cn("w-5 h-5 text-neon-green", isSpeaking && "animate-pulse")} />
              </div>
              <div>
                <h4 className="font-display font-bold text-zinc-100 uppercase tracking-tight text-sm">Assistant</h4>
                <div className="flex items-center gap-1.5">
                   <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", active ? "bg-neon-green" : "bg-zinc-700")} />
                   <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">Terminal_Ready</span>
                </div>
              </div>
            </div>

            <div className="min-h-[120px] max-h-[200px] overflow-y-auto pr-2 flex flex-col justify-end space-y-4 scroll-smooth hide-scrollbar">
              {transcript && (
                <div className="text-[10px] text-neon-green/60 font-display italic text-right uppercase tracking-wider">Query: "{transcript}"</div>
              )}
              {isTyping && (
                <div className="flex gap-1.5 items-center py-2">
                   <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                   <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                   <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
              {response && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-zinc-100 font-sans leading-relaxed bg-white/[0.03] p-4 rounded-xl border border-white/5 backdrop-blur-sm"
                 >
                   {response}
                 </motion.div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-neon-green/10">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={onKeyPress}
                    placeholder="Ask ReWise..."
                    className="w-full bg-black/40 border border-white/10 rounded-full py-3 px-5 text-sm text-white focus:outline-none focus:border-neon-green transition-all placeholder:text-zinc-700 font-display font-medium tracking-tight"
                  />
                  <button 
                    onClick={() => handleChat(userInput)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neon-green flex items-center justify-center text-black hover:scale-105 transition-all shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <button 
                      onClick={handleListen}
                      className={cn(
                        "flex-1 h-12 rounded-full flex items-center justify-center gap-2 transition-all duration-300 font-display text-[10px] font-bold uppercase tracking-widest",
                        isListening ? "bg-red-500 text-white animate-pulse" : "bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20"
                      )}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isListening ? '...' : 'Voice'}
                    </button>
                    <div className="flex gap-1.5 h-8 items-center px-4 border-l border-neon-green/10">
                       {[0.4, 0.8, 0.5, 0.9, 0.3].map((h, i) => (
                         <motion.div
                           key={i}
                           animate={isSpeaking || isListening ? { height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] } : { height: '10%' }}
                           transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                           className="w-1 bg-neon-green/40 shadow-sm rounded-full"
                         />
                       ))}
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className={cn(
          "w-16 h-16 rounded-full glass-neon flex items-center justify-center shadow-[0_0_40px_rgba(57,255,20,0.4)] transition-all duration-500 relative",
          active ? "bg-neon-green text-zinc-950 rotate-90" : "text-neon-green"
        )}
      >
        {!active && (
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-neon-green"
          />
        )}
        {active ? <Sparkles className="w-8 h-8" /> : <BrainCircuit className="w-8 h-8" />}
      </motion.button>
    </div>
  );
}
