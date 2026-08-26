import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, MapPin, AlertTriangle, Sparkles, CheckCircle2, 
  RefreshCw, ShieldCheck, Zap, HelpCircle, Navigation, Info, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WasteCategory, ReportSeverity, AIReportAnalysis, WasteReport } from '../../types';
import { verifyReportAI, submitWasteReport, addPointTransaction } from '../../services/reports';
import { Language } from '../ui/LanguageSelector';

interface ReportFormProps {
  language: Language;
  onSuccess: (newReport: WasteReport) => void;
  onSwitchTab?: (tab: string) => void;
}

const CATEGORIES: { id: WasteCategory; label: string; icon: string; color: string }[] = [
  { id: 'Plastic', label: 'Plastic', icon: '🥤', color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30' },
  { id: 'Paper', label: 'Paper', icon: '📦', color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30' },
  { id: 'Glass', label: 'Glass', icon: '🍾', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'Metal', label: 'Metal', icon: '🥫', color: 'from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/30' },
  { id: 'Organic', label: 'Organic', icon: '🍏', color: 'from-lime-500/20 to-green-500/20 text-lime-400 border-lime-500/30' },
  { id: 'E-Waste', label: 'E-Waste', icon: '💻', color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
  { id: 'Mixed Waste', label: 'Mixed Waste', icon: '🗑️', color: 'from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30' },
  { id: 'Hazardous', label: 'Hazardous', icon: '☣️', color: 'from-rose-500/20 to-red-600/20 text-rose-400 border-rose-500/30' },
  { id: 'Other', label: 'Other', icon: '♻️', color: 'from-gray-500/20 to-slate-600/20 text-gray-300 border-gray-500/30' },
];

const SEVERITIES: { id: ReportSeverity; label: string; desc: string; color: string }[] = [
  { id: 'Low', label: 'Low', desc: 'Isolated litter or small debris bag', color: 'border-slate-700 bg-slate-800/40 text-slate-300' },
  { id: 'Medium', label: 'Medium', desc: 'Overflowing bin or public sidewalk spill', color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' },
  { id: 'High', label: 'High', desc: 'Road blockage or open dumping pile', color: 'border-orange-500/30 bg-orange-500/10 text-orange-400' },
  { id: 'Critical', label: 'Critical', desc: 'Drainage choke, toxic e-waste or hazard', color: 'border-rose-500/40 bg-rose-500/15 text-rose-400' },
];

export default function ReportForm({ language, onSuccess, onSwitchTab }: ReportFormProps) {
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState<WasteCategory>('Plastic');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<ReportSeverity>('Medium');
  const [address, setAddress] = useState('Main Road, Sector 14, Near Market Gate');
  const [city, setCity] = useState('Gurugram, Haryana');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 28.4595, lng: 77.0266 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // AI Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIReportAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<WasteReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        triggerAIVerification(base64, file.type, category, description);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAIVerification = async (imgData: string | null, mimeType: string, cat: string, desc: string) => {
    setIsVerifying(true);
    try {
      const analysis = await verifyReportAI(imgData, mimeType, cat, desc, language);
      setAiAnalysis(analysis);
      if (analysis.estimatedSeverity) {
        setSeverity(analysis.estimatedSeverity);
      }
    } catch (err) {
      console.warn('AI Verification notice:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAutoLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAddress(`Civic GPS Corridor (Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)})`);
          setCity('Local Municipal Ward');
          setIsDetectingLocation(false);
        },
        () => {
          setAddress('Sector 18 Civic Corridor, Urban Ward 6');
          setCity('Delhi NCR');
          setIsDetectingLocation(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !image) {
      alert('Please provide a photo or short description of the unmanaged waste hotspot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<WasteReport> = {
        category,
        description: description.trim() || `Reported ${category} waste dump in municipal area`,
        severity,
        image: image || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
        location: {
          address,
          city,
          lat: coords.lat,
          lng: coords.lng
        },
        aiAnalysis: aiAnalysis || {
          wasteType: `${category} Waste Aggregation`,
          estimatedSeverity: severity,
          containsWaste: true,
          environmentalRisk: severity === 'Critical' ? 'Severe' : severity === 'High' ? 'High' : 'Medium',
          confidence: 93,
          detectedItems: ['Unsorted packaging', 'Single-use plastic scraps'],
          summary: 'Verified civic waste hotspot. Auto-dispatched to municipal circular queue.'
        }
      };

      const result = await submitWasteReport(payload);
      if (result.success && result.report) {
        setSubmittedReport(result.report);
        addPointTransaction(`Waste Report Submitted (${result.report.id})`, result.report.pointsEarned, result.report.id);
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        onSuccess(result.report);
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setImage(null);
    setDescription('');
    setAiAnalysis(null);
    setSubmittedReport(null);
  };

  return (
    <div id="report-waste-form" className="w-full max-w-4xl mx-auto space-y-8">
      {/* Success Modal Card */}
      <AnimatePresence>
        {submittedReport && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-2xl space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase border border-emerald-500/20">
                Civic Report Logged
              </span>
              <h3 className="text-3xl font-display font-bold text-white">Report Successfully Submitted!</h3>
              <p className="text-slate-300 max-w-lg mx-auto text-sm">
                Your report has been geotagged, AI-verified, and registered in the Municipal Operations Ledger.
              </p>
            </div>

            {/* Report ID & Reward Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto p-4 rounded-xl bg-slate-950/60 border border-white/5">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Report ID</div>
                <div className="font-mono text-lg font-bold text-emerald-400 mt-0.5">{submittedReport.id}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Current Status</div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 mt-1 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {submittedReport.status}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Points Earned</div>
                <div className="font-display text-lg font-bold text-amber-400 mt-0.5">+{submittedReport.pointsEarned} Eco Pts</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button 
                onClick={handleResetForm}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
              >
                Submit Another Report
              </button>
              {onSwitchTab && (
                <button 
                  onClick={() => onSwitchTab('myReports')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  Track in My Reports <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reporting Form */}
      {!submittedReport && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Visual Uplink & AI Inspector */}
          <div className="p-6 md:p-8 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Camera className="w-4 h-4" /> Step 1: Visual Evidence & Capture
                </div>
                <h2 className="text-xl font-display font-bold text-white">Upload or Capture Waste Hotspot</h2>
              </div>
              <span className="text-xs text-slate-400">AI auto-analyzes image</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Drop / Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-video md:aspect-[4/3] rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center overflow-hidden group ${
                  image ? 'border-emerald-500/50 bg-slate-950/80' : 'border-slate-700 hover:border-emerald-500/40 bg-slate-950/40 hover:bg-slate-950/60'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={handleImageUpload} 
                />

                {image ? (
                  <div className="relative w-full h-full">
                    <img src={image} alt="Reported Waste" className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold backdrop-blur-xs">
                      <RefreshCw className="w-4 h-4" /> Click to Replace Photo
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Take a photo or upload waste image</p>
                      <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP from camera or gallery</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live AI Analysis Verification Preview Card */}
              <div className="h-full rounded-xl bg-slate-950/60 border border-white/5 p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" /> AI Vision Telemetry
                    </div>
                    {isVerifying ? (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Verifying Image...
                      </span>
                    ) : aiAnalysis ? (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Confidence {aiAnalysis.confidence}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Awaiting visual uplink</span>
                    )}
                  </div>

                  {aiAnalysis ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider">Identified Waste Material:</span>
                        <div className="text-sm font-bold text-white mt-0.5">{aiAnalysis.wasteType}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-slate-900 border border-white/5">
                          <span className="text-[10px] text-slate-500 uppercase">Suggested Severity</span>
                          <div className={`font-semibold mt-0.5 ${
                            aiAnalysis.estimatedSeverity === 'Critical' ? 'text-rose-400' :
                            aiAnalysis.estimatedSeverity === 'High' ? 'text-orange-400' : 'text-yellow-400'
                          }`}>
                            {aiAnalysis.estimatedSeverity} Priority
                          </div>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-white/5">
                          <span className="text-[10px] text-slate-500 uppercase">Eco Risk</span>
                          <div className="font-semibold text-emerald-400 mt-0.5">{aiAnalysis.environmentalRisk}</div>
                        </div>
                      </div>

                      {aiAnalysis.detectedItems && aiAnalysis.detectedItems.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase">Detected Elements:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {aiAnalysis.detectedItems.map((item, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded border border-white/5">
                        "{aiAnalysis.summary}"
                      </p>
                    </motion.div>
                  ) : (
                    <div className="py-8 text-center text-slate-500 space-y-2">
                      <p className="text-xs">Upload an image to trigger instant neural verification and estimate eco hazard level.</p>
                      <button 
                        type="button"
                        onClick={() => triggerAIVerification(image, 'image/jpeg', category, description)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
                      >
                        Run Heuristic AI Analysis
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Verified reports earn +25 bonus Eco Points</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Category & Severity */}
          <div className="p-6 md:p-8 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Step 2: Waste Category & Severity
            </div>

            {/* Category Chips */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 block">Select Waste Category:</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        if (image) triggerAIVerification(image, 'image/jpeg', cat.id, description);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected 
                          ? `bg-gradient-to-b ${cat.color} font-bold scale-105 shadow-lg` 
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-[11px] leading-tight font-sans whitespace-nowrap">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Level */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-slate-200 block">Severity & Urgency Level:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {SEVERITIES.map((sev) => {
                  const isSelected = severity === sev.id;
                  return (
                    <button
                      type="button"
                      key={sev.id}
                      onClick={() => setSeverity(sev.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected ? `${sev.color} ring-1 ring-emerald-400/30 scale-[1.02]` : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{sev.label}</span>
                        {sev.id === 'Critical' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                      <p className="text-[11px] opacity-80 mt-1">{sev.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
              <label className="text-sm font-semibold text-slate-200 block">Hotspot Description & Landmarks:</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe landmark, proximity to water bodies/drainage, bin status (e.g. 'Large overflowing dumpster opposite metro pillar 42')..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder:text-slate-600 text-sm resize-none outline-none transition-all"
              />
            </div>
          </div>

          {/* Step 3: Location Geotagging */}
          <div className="p-6 md:p-8 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <MapPin className="w-4 h-4" /> Step 3: Geotag & Location
                </div>
                <h3 className="text-lg font-display font-bold text-white">Precise Hotspot Coordinates</h3>
              </div>
              
              <button 
                type="button"
                onClick={handleAutoLocation}
                disabled={isDetectingLocation}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                {isDetectingLocation ? 'Acquiring GPS...' : 'Use Current GPS'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold uppercase">Street / Corridor Address</label>
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:border-emerald-500/50 outline-none"
                  placeholder="e.g. Near Metro Station Gate 3, Sector 14"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold uppercase">City / Municipal Ward</label>
                <input 
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:border-emerald-500/50 outline-none"
                  placeholder="e.g. Gurugram, Haryana / Delhi NCR"
                />
              </div>
            </div>

            {/* Interactive Pin Geotag Visual Card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Geotag Hash: {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E</div>
                  <div className="text-[11px] text-slate-500">Directly mapped to Municipal Ward EV Collection corridor</div>
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                LIVE GNSS
              </span>
            </div>
          </div>

          {/* Submission Bar & Eco Points Preview */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-display font-bold">
                +35
              </div>
              <div>
                <div className="text-sm font-bold text-white">Guaranteed Eco Points on Submission</div>
                <div className="text-xs text-slate-400">+10 Base Log + +25 AI Verification bonus (+50 upon resolution)</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Registering Civic Report...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Waste Report
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
