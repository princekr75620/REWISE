import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RefreshCw, AlertCircle, Sparkles, Microscope, ArrowRight, Zap, Target, PlusCircle, HelpCircle, QrCode, Scan, Compass, FileCode } from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';
import { analyzeWaste, generateMoreReuseIdeas, analyzeCode, analyzeCodeImage } from '../../services/ai';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';
import { canScan, recordScan } from '../../lib/subscription';
import { BlueprintSchematicModal } from '../ui/BlueprintSchematicModal';
import { BlueprintItem } from '../../types';

interface ScanResult {
  itemName: string;
  material: string;
  confidence: number;
  reuseIdeas: {
    title: string;
    description: string;
    difficulty: string;
    materialsNeeded: string[];
    steps: string[];
    estimatedCost: string;
    videoTutorialTarget: string;
  }[];
  sustainabilityScore: number;
  impactReduction: string;
}

import { LanguageSelector, Language } from '../ui/LanguageSelector';
import { useTranslation } from '../../lib/translations';

interface ScannerProps {
  language: Language;
}

export default function Scanner({ language }: ScannerProps) {
  const t = useTranslation(language);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [activeBlueprintModal, setActiveBlueprintModal] = useState<BlueprintItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR and Barcode states/refs
  const [scanMode, setScanMode] = useState<'visual' | 'code'>('visual');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [codeResult, setCodeResult] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        window.clearInterval(scanIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleModeChange = (mode: 'visual' | 'code') => {
    stopCamera();
    setScanMode(mode);
    reset();
    if (mode === 'code') {
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  const startCamera = async () => {
    setQrError(null);
    setCodeResult(null);
    setIsCameraActive(true);
    setIsLocked(false);
    setError(null);
    setResult(null);
    setImage(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      
      let attempts = 0;
      const bindVideo = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().catch(e => console.error("Playback failed:", e));
          
          if (scanIntervalRef.current) {
            window.clearInterval(scanIntervalRef.current);
          }
          scanIntervalRef.current = window.setInterval(scanFrame, 300);
        } else if (attempts < 10) {
          attempts++;
          setTimeout(bindVideo, 50);
        }
      };
      bindVideo();
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setQrError("Camera access failed. Please ensure camera permissions are granted in your browser settings.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    setIsCameraActive(false);
    setIsLocked(false);
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || isLocked) return;
    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (decoded) {
        // High-tech lock-on transition
        setIsLocked(true);
        if (scanIntervalRef.current) {
          window.clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }

        // Cybernetic chime synthesizer
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);

            setTimeout(() => {
              const osc2 = audioCtx.createOscillator();
              const gain2 = audioCtx.createGain();
              osc2.connect(gain2);
              gain2.connect(audioCtx.destination);
              osc2.frequency.setValueAtTime(1320, audioCtx.currentTime); // E6
              gain2.gain.setValueAtTime(0.15, audioCtx.currentTime);
              osc2.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15); // A6
              gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
              osc2.start();
              osc2.stop(audioCtx.currentTime + 0.18);
            }, 100);
          }
        } catch (beepError) {
          console.warn("Audio lock-on fallback:", beepError);
        }

        // Post-chime visual delay to satisfy user's feedback loop
        setTimeout(() => {
          stopCamera();
          handleCodeDetected(decoded.data);
        }, 900);
      }
    }
  };

  const handleCodeDetected = async (scannedText: string) => {
    if (!canScan()) {
      setError("⚠️ Visual Scanner limit reached! Your Free Tier is capped at 5 image scans. Please upgrade to the Basic Orbit (₹50) or Star Voyager (1 year) plan in the 'Company' section under 'Membership & Billing' to unlock unlimited visual image parsing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedIdea(null);
    setError(null);
    setCodeResult(scannedText);
    
    try {
      const data = await analyzeCode(scannedText, language);
      setResult(data as ScanResult);
      await recordScan();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#10B981', '#FFFFFF']
      });
    } catch (err) {
      setError("Analysis failed. We could not resolve the carbon barcode profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const decodeQRFromDataURL = (dataUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);
        resolve(decoded ? decoded.data : null);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = dataUrl;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImage(dataUrl);
        processImage(dataUrl, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imgData: string, mimeType: string) => {
    if (!canScan()) {
      setError("⚠️ Visual Scanner limit reached! Your Free Tier is capped at 5 image scans. Please upgrade to the Basic Orbit (₹50) or Star Voyager (1 year) plan in the 'Company' section under 'Membership & Billing' to unlock unlimited visual image parsing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedIdea(null);
    setError(null);
    
    try {
      if (scanMode === 'code') {
        const decoded = await decodeQRFromDataURL(imgData);
        if (decoded) {
          setCodeResult(decoded);
          const data = await analyzeCode(decoded, language);
          setResult(data as ScanResult);
          await recordScan();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06B6D4', '#10B981', '#FFFFFF']
          });
        } else {
          // Robust AI Multimodal fallback if local JS canvas analyzer fails (e.g., barcodes, off-angle QRs, blurry label images)
          const data = await analyzeCodeImage(imgData, mimeType, language);
          setCodeResult(data.itemName || "Identified Product");
          setResult(data as ScanResult);
          await recordScan();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06B6D4', '#10B981', '#FFFFFF']
          });
        }
      } else {
        const data = await analyzeWaste(imgData, mimeType, language);
        setResult(data as ScanResult);
        await recordScan();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#06B6D4', '#FFFFFF']
        });
      }
    } catch (err) {
      setError("Analysis failed. Please ensure the image is clear.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setSelectedIdea(null);
    setError(null);
    setLoadingMore(false);
    setQrError(null);
    setCodeResult(null);
  };

  const handleGetMoreIdeas = async () => {
    if (!result || loadingMore) return;
    setLoadingMore(true);
    try {
      const moreIdeas = await generateMoreReuseIdeas(result.itemName, result.material, language);
      setResult({
        ...result,
        reuseIdeas: [...result.reuseIdeas, ...moreIdeas]
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#FFFFFF']
      });
    } catch (err) {
      console.error("Failed to get more ideas:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-24">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-400">
          <Zap className="w-3 h-3" />
          <span>Real-time Visual Analysis</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
          {t.scanner.title}
        </h2>
        <p className="text-slate-400 font-sans text-lg">
          {t.scanner.subtitle}
        </p>
      </div>

      {/* Modern Dual-Core Mode Selector Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl w-full max-w-md">
          <button
            onClick={() => handleModeChange('visual')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all",
              scanMode === 'visual'
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Camera className="w-4 h-4" />
            <span>Visual Object recognition</span>
          </button>
          <button
            onClick={() => handleModeChange('code')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all",
              scanMode === 'code'
                ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <QrCode className="w-4 h-4" />
            <span>QR & Barcode Scan</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Upload/Preview Zone */}
        <div className="space-y-6">
          {scanMode === 'visual' ? (
            // Visual Mode Markup
            !image ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="group relative cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-[500px] rounded-3xl glass-premium border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 group-hover:border-emerald-500/50 transition-all">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 transition-all text-emerald-500 group-hover:text-white">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-display font-bold text-white mb-2">{t.scanner.dropPrompt}</h4>
                    <p className="text-sm text-slate-500 font-sans">JPG, PNG or WEBP (Max 10MB)</p>
                  </div>
                  <button className="btn-secondary">Browse Files</button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
              </motion.div>
            ) : (
              <motion.div layout className="space-y-6">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-premium border border-white/10 group">
                  <img 
                    src={image} 
                    alt="Scan preview" 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                  />
                  
                  {loading && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                      <div className="relative w-16 h-16">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-2 border-emerald-500 border-t-transparent rounded-full"
                        />
                        <Target className="absolute inset-0 m-auto w-6 h-6 text-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-center space-y-2">
                        <span className="block text-emerald-400 font-display text-sm tracking-widest uppercase font-bold animate-pulse">{t.scanner.analyzing}</span>
                        <p className="text-slate-500 text-xs font-sans uppercase">Cross-referencing Material Database</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <button 
                    onClick={reset}
                    className="text-xs font-sans font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Cancel & Restart
                  </button>
                </div>
              </motion.div>
            )
          ) : (
            // QR & Barcode Mode Markup
            <div className="space-y-6">
              {isCameraActive ? (
                <div className={cn(
                  "relative h-[500px] rounded-3xl overflow-hidden glass-premium flex items-center justify-center bg-black transition-all duration-300 border-2",
                  isLocked 
                    ? "border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.4)] scale-[1.01]" 
                    : "border-cyan-500/30"
                )}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  
                  {/* Holographic scanning guide */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className={cn(
                      "w-60 h-60 border-2 rounded-3xl relative flex items-center justify-center transition-all duration-300",
                      isLocked 
                        ? "border-emerald-400 bg-emerald-950/20 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                        : "border-cyan-400/40 bg-cyan-950/5"
                    )}>
                      <div className={cn("absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 -mt-2 -ml-2 rounded-tl-lg transition-colors duration-300", isLocked ? "border-emerald-400" : "border-cyan-400")} />
                      <div className={cn("absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 -mt-2 -mr-2 rounded-tr-lg transition-colors duration-300", isLocked ? "border-emerald-400" : "border-cyan-400")} />
                      <div className={cn("absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 -mb-2 -ml-2 rounded-bl-lg transition-colors duration-300", isLocked ? "border-emerald-400" : "border-cyan-400")} />
                      <div className={cn("absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 -mb-2 -mr-2 rounded-br-lg transition-colors duration-300", isLocked ? "border-emerald-400" : "border-cyan-400")} />
                      
                      {/* Interactive target laser */}
                      <motion.div 
                        animate={isLocked ? { y: 0 } : { y: [-110, 110, -110] }}
                        transition={isLocked ? { duration: 0.1 } : { duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                        className={cn(
                          "absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent to-transparent transition-all duration-300",
                          isLocked 
                            ? "via-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)]" 
                            : "via-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)]"
                        )}
                      />
                    </div>
                  </div>

                  {/* Real-time feedback badge */}
                  <div className={cn(
                    "absolute top-6 left-6 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border transition-all duration-300",
                    isLocked ? "border-emerald-500/50 text-emerald-400" : "border-cyan-500/30 text-cyan-400"
                  )}>
                    <div className={cn("w-2 h-2 rounded-full animate-ping", isLocked ? "bg-emerald-400" : "bg-cyan-400")} />
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                      {isLocked ? "LOCK-ON SECURED: COMPLETE" : "LENS ACTIVE: POS SCANNER"}
                    </span>
                  </div>

                  {/* Active controls */}
                  <div className="absolute bottom-6">
                    <button 
                      onClick={stopCamera}
                      className="px-6 py-3 bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-rose-500/40 rounded-full text-xs font-sans font-bold text-slate-300 hover:text-rose-400 uppercase tracking-widest transition-all shadow-xl backdrop-blur-md"
                    >
                      Disable Camera
                    </button>
                  </div>
                </div>
              ) : !image ? (
                <div className="grid gap-6">
                  {/* Camera launcher visual card */}
                  <div
                    onClick={startCamera}
                    className="h-[280px] rounded-3xl glass-premium border border-white/5 hover:border-cyan-500/30 flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 transition-all text-cyan-400 group-hover:text-white">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-display font-bold text-white mb-1">Activate Real-time QR Cam</h4>
                      <p className="text-xs text-slate-500 font-sans max-w-xs mx-auto">Seamlessly analyze product codes and carbon indices in real-time.</p>
                    </div>
                    <button className="text-xs font-sans font-bold text-cyan-400 group-hover:underline">Launch Scanner</button>
                  </div>

                  {/* Manual snapshot uploader */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-[200px] rounded-3xl glass-premium border border-white/5 border-dashed hover:border-cyan-500/30 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-display font-medium text-slate-300">Upload Code Image</h4>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">Detect product QR code strings saved in your directory.</p>
                    </div>
                    <button className="btn-secondary py-1.5 px-4 text-xs">Browse Code Photo</button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-premium border border-white/10 group bg-slate-950/60 flex items-center justify-center p-4">
                    <img 
                      src={image} 
                      alt="QR preview" 
                      className="max-w-full max-h-full object-contain grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
                    />
                    {loading && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                        <div className="relative w-16 h-16">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-cyan-500 border-t-transparent rounded-full"
                          />
                          <Scan className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
                        </div>
                        <div className="text-center space-y-2">
                          <span className="block text-cyan-400 font-display text-sm tracking-widest uppercase font-bold animate-pulse">Running Code Audit...</span>
                          <p className="text-slate-500 text-xs font-sans uppercase">Decoding product material catalog</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button 
                      onClick={reset}
                      className="text-xs font-sans font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Cancel & Restart
                    </button>
                  </div>
                </div>
              )}

              {qrError && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-xs text-amber-300 font-sans leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{qrError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Zone */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {!result && !loading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 glass-premium rounded-3xl border-white/5"
              >
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-8 text-slate-600">
                   {scanMode === 'code' ? <QrCode className="w-8 h-8 opacity-40 text-cyan-400" /> : <Camera className="w-8 h-8 opacity-40" />}
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-wider">
                  {scanMode === 'code' ? 'Awaiting Product Scan' : 'Awaiting Visual Input'}
                </h3>
                <p className="text-slate-500 text-sm font-sans max-w-xs mx-auto leading-relaxed">
                  {scanMode === 'code' 
                    ? 'Activate your device camera to scan circular QR / Barcodes, or browse a product snapshot to render sustainability specs.'
                    : 'Start by uploading a clear photo of your waste item for material identification and AI-driven sustainability analysis.'}
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 glass-premium rounded-3xl border-rose-500/20"
              >
                <AlertCircle className="w-12 h-12 text-rose-500 mb-6" />
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Analysis Interrupted</h3>
                <p className="text-slate-400 text-sm mt-2">{error}</p>
                <button onClick={reset} className="btn-secondary mt-8">Try Again</button>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {selectedIdea === null ? (
                  <>
                    <div className="glass-premium p-8 rounded-3xl space-y-6 relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] text-emerald-400 font-sans font-bold uppercase tracking-[0.2em]">
                            {codeResult ? "Decoder Audit Complete" : "Identification Successful"}
                          </span>
                          <h3 className="text-5xl font-display font-extrabold text-white leading-none tracking-tighter">
                            {result.itemName}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-display font-bold text-white leading-none">{result.sustainabilityScore}</div>
                          <span className="text-[9px] text-emerald-400 font-sans font-bold uppercase tracking-widest">Eco Index</span>
                        </div>
                      </div>

                      {codeResult && (
                        <div className="p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between">
                          <div className="font-mono text-xs text-cyan-400 truncate max-w-xs flex gap-2">
                            <span className="text-slate-500 font-sans font-bold uppercase text-[10px] tracking-wider">Scanned:</span> 
                            <span>{codeResult}</span>
                          </div>
                          <span className="text-[9px] font-sans font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 tracking-widest shrink-0">Product Core</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-sans font-bold uppercase text-slate-300">
                            {result.material}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-sans font-bold uppercase text-emerald-400">
                            {result.confidence || 98}% Match
                          </span>
                        </div>

                        {result.reuseIdeas.length > 0 && (
                          <button
                            onClick={() => {
                              const firstIdea = result.reuseIdeas[0];
                              setActiveBlueprintModal({
                                title: firstIdea.title,
                                originalMaterial: result.material,
                                concept: firstIdea.description,
                                difficulty: firstIdea.difficulty,
                                estimatedCost: firstIdea.estimatedCost,
                                materials: firstIdea.materialsNeeded,
                                steps: firstIdea.steps,
                                impact: result.impactReduction,
                                videoTutorialTarget: firstIdea.videoTutorialTarget,
                                vibe: `${result.itemName} Precision Transformation`
                              });
                            }}
                            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                          >
                            <Compass className="w-3.5 h-3.5 text-cyan-400" />
                            <span>📐 Open Master Blueprint</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-sans font-bold text-slate-500 uppercase tracking-[0.3em] pl-2">Generated Blueprints</h4>
                        <span className="text-[10px] font-mono text-cyan-400/80 uppercase">CAD & Schematics Available</span>
                      </div>
                      <div className="grid gap-4">
                        {result.reuseIdeas.map((idea, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-premium p-6 rounded-2xl hover:border-emerald-500/30 transition-all group relative"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div 
                                onClick={() => setSelectedIdea(idx)}
                                className="space-y-2 cursor-pointer flex-1"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    idea.difficulty === 'Easy' ? 'bg-emerald-500' : 
                                    idea.difficulty === 'Medium' ? 'bg-amber-400' : 'bg-rose-500'
                                  )} />
                                  <h5 className="text-xl font-display font-bold text-white group-hover:text-emerald-400 transition-colors">
                                    {idea.title}
                                  </h5>
                                </div>
                                <p className="text-sm text-slate-400 font-sans line-clamp-1">{idea.description}</p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setActiveBlueprintModal({
                                      title: idea.title,
                                      originalMaterial: result.material,
                                      concept: idea.description,
                                      difficulty: idea.difficulty,
                                      estimatedCost: idea.estimatedCost,
                                      materials: idea.materialsNeeded,
                                      steps: idea.steps,
                                      impact: result.impactReduction,
                                      videoTutorialTarget: idea.videoTutorialTarget,
                                      vibe: `${result.itemName} Upcycling Protocol`
                                    });
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Blueprint</span>
                                </button>

                                <button 
                                  onClick={() => setSelectedIdea(idx)}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.button
                        layout
                        onClick={handleGetMoreIdeas}
                        disabled={loadingMore}
                        className={cn(
                          "w-full flex items-center justify-center gap-3 py-5 rounded-2xl transition-all font-sans font-bold uppercase tracking-widest text-xs",
                          loadingMore 
                            ? "bg-slate-900/50 text-slate-500 cursor-not-allowed"
                            : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-lg"
                        )}
                      >
                        {loadingMore ? (
                          <>
                            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            Synthesizing New Protocols...
                          </>
                        ) : (
                          <>
                            <HelpCircle className="w-5 h-5 transition-transform group-hover:rotate-12" />
                            {t.scanner.getMore}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <button 
                      onClick={() => setSelectedIdea(null)}
                      className="text-[10px] font-sans font-bold text-slate-500 hover:text-white transition-all uppercase tracking-[0.3em] flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Return to Results
                    </button>

                    <div className="glass-premium p-8 rounded-3xl space-y-8">
                       <div className="border-b border-white/5 pb-6">
                          <h3 className="text-3xl font-display font-bold text-emerald-400 mb-2 uppercase italic">{result.reuseIdeas[selectedIdea].title}</h3>
                          <p className="text-slate-400 font-sans italic">"{result.reuseIdeas[selectedIdea].description}"</p>
                       </div>

                       <div className="grid md:grid-cols-2 gap-12">
                          <div className="space-y-8">
                             <div className="space-y-4">
                                <h5 className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-4">Required Materials</h5>
                                <ul className="space-y-3">
                                   {result.reuseIdeas[selectedIdea].materialsNeeded.map((m, i) => (
                                      <li key={i} className="flex items-center gap-3 text-sm text-slate-400 font-sans">
                                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" /> {m}
                                      </li>
                                   ))}
                                </ul>
                             </div>
                             
                             <div className="space-y-4">
                                <h5 className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-4">Resource Cost</h5>
                                <div className="text-2xl font-display font-bold text-white">{result.reuseIdeas[selectedIdea].estimatedCost}</div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h5 className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest border-l-2 border-rose-500 pl-4">Construction Protocol</h5>
                             <div className="space-y-6">
                                {result.reuseIdeas[selectedIdea].steps.map((step, i) => (
                                   <div key={i} className="flex gap-4 group">
                                      <span className="text-xs font-mono text-emerald-500/50 mt-1">0{i+1}</span>
                                      <p className="text-sm text-slate-400 font-sans leading-relaxed">{step}</p>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col sm:flex-row gap-3 pt-2">
                         <button
                            onClick={() => {
                              const curr = result.reuseIdeas[selectedIdea];
                              setActiveBlueprintModal({
                                title: curr.title,
                                originalMaterial: result.material,
                                concept: curr.description,
                                difficulty: curr.difficulty,
                                estimatedCost: curr.estimatedCost,
                                materials: curr.materialsNeeded,
                                steps: curr.steps,
                                impact: result.impactReduction,
                                videoTutorialTarget: curr.videoTutorialTarget,
                                vibe: `${result.itemName} Precision Protocol`
                              });
                            }}
                            className="flex-1 px-6 py-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                         >
                            <Compass className="w-4 h-4 text-cyan-400" />
                            <span>📐 Open Technical Blueprint</span>
                         </button>

                         <a 
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(result.reuseIdeas[selectedIdea].videoTutorialTarget)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                          >
                             Search Visual Tutorials <ArrowRight className="w-5 h-5" />
                          </a>
                       </div>
                    </div>
                  </motion.div>
                )}

                {/* AI Attribution & Methodology Link */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500">
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                    </div>
                    <span>Intelligence: Gemini 1.5 Flash</span>
                  </div>
                  
                  <button 
                    onClick={() => setShowMethodology(true)}
                    className="group flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    <span>Scoring Methodology</span>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Methodology Modal */}
      <AnimatePresence>
        {showMethodology && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMethodology(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-premium rounded-[2.5rem] p-8 md:p-12 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-rose-500" />
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white tracking-tight">Sustainability Indexing</h3>
                </div>
                
                <p className="text-slate-400 font-sans leading-relaxed">
                  Our circular logic engine evaluates items based on four primary pillars to calculate the ReWise Sustainability Score (0-100).
                </p>

                <div className="space-y-4">
                  {[
                    { label: "Material Composition", desc: "Chemical volatility and biodegradation rate of identified materials.", color: "text-emerald-400" },
                    { label: "Reuse Potential", desc: "The ease with which the item can be transformed into high-utility objects.", color: "text-cyan-400" },
                    { label: "Carbon Offset", desc: "Estimated energy savings by diverted waste from standard landfill protocols.", color: "text-amber-400" },
                    { label: "Social Impact", desc: "Potential for local circular economy integration and community value.", color: "text-rose-400" }
                  ].map((pill, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <h5 className={cn("text-xs font-sans font-bold uppercase tracking-widest", pill.color)}>{pill.label}</h5>
                      <p className="text-[11px] text-slate-500 font-sans">{pill.desc}</p>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowMethodology(false)}
                  className="w-full btn-primary mt-4"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blueprint CAD Schematic Modal */}
      <AnimatePresence>
        {activeBlueprintModal && (
          <BlueprintSchematicModal
            blueprint={activeBlueprintModal}
            onClose={() => setActiveBlueprintModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
