import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  Droplets, 
  Thermometer, 
  Wind, 
  Activity, 
  Sparkles, 
  Navigation, 
  RefreshCcw, 
  ShieldCheck,
  Cpu,
  Zap,
  Waves,
  MapPin,
  Satellite
} from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';
import { fetchEnvironmentalData, getEcoRecommendations, EnvironmentalData } from '../../services/environment';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

const liveNetworkData = Array.from({ length: 20 }).map((_, i) => ({
  time: i,
  throughput: 400 + Math.random() * 200,
  latency: 10 + Math.random() * 5,
}));

import { Language } from '../ui/LanguageSelector';
import { useTranslation } from '../../lib/translations';

interface WeatherReportProps {
  language: Language;
}

export default function WeatherReport({ language }: WeatherReportProps) {
  const t = useTranslation(language);
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState(liveNetworkData);
  const [systemLoad, setSystemLoad] = useState(72);
  const [windSpeed, setWindSpeed] = useState(12.4);

  const loadData = async () => {
    setLoading(true);
    try {
      let lat = 19.0760; // Fallback to Mumbai, India
      let lon = 72.8777;

      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        } catch (geoError) {
          console.warn("Geolocation access denied or failed. Using fallback (Mumbai, IN).");
        }
      }

      const result = await fetchEnvironmentalData(lat, lon);
      setEnvData(result);
      const advice = await getEcoRecommendations(result);
      setRecommendations(advice);
      setWindSpeed(10 + Math.random() * 15);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const envInterval = setInterval(loadData, 300000); 
    
    const monitorInterval = setInterval(() => {
        setNetworkData(prev => {
            const lastTime = prev[prev.length - 1].time;
            return [...prev.slice(1), {
              time: lastTime + 1,
              throughput: 400 + Math.random() * 200,
              latency: 10 + Math.random() * 5,
            }];
        });
        setSystemLoad(prev => Math.min(99, Math.max(10, prev + (Math.random() - 0.5) * 5)));
    }, 2000);

    return () => {
        clearInterval(envInterval);
        clearInterval(monitorInterval);
    };
  }, []);

  const getAQIStatus = (aqi: number) => {
    const statuses = [
      { label: 'Purity: High', color: 'text-emerald-400' },
      { label: 'Purity: Stable', color: 'text-cyan-400' },
      { label: 'Moderate Strain', color: 'text-amber-400' },
      { label: 'Unhealthy Sector', color: 'text-rose-400' },
      { label: 'Critical Alert', color: 'text-rose-600' }
    ];
    return statuses[aqi - 1] || statuses[0];
  };

  if (loading && !envData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-sans font-bold text-slate-500 tracking-[0.4em] uppercase animate-pulse">Syncing Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-16">
      {/* Telemetry Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-sans font-bold uppercase tracking-widest text-cyan-400">
            <Satellite className="w-3.5 h-3.5" />
            <span>{envData?.location || 'Operational Node 0x7'}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-none">
            {t.weather.title}
          </h2>
          <p className="text-slate-400 font-sans text-lg max-w-xl">
            {t.weather.subtitle}
          </p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="btn-secondary group"
        >
          <RefreshCcw className={cn("w-4 h-4 transition-transform group-hover:rotate-180", loading && "animate-spin")} /> 
          {language === 'english' ? 'Re-Sync Satellite' : language === 'hindi' ? 'सैटेलाइट को सिंक करें' : 'डेटा सिंक करो'}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Core Metrics */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <HoloCard className="p-10 flex flex-col justify-between min-h-[300px] glass-premium">
              <div className="flex justify-between items-start">
                <Thermometer className="w-10 h-10 text-emerald-400 opacity-20" />
                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">{t.weather.temp}</span>
              </div>
              <div className="space-y-2">
                <div className="text-8xl font-display font-extrabold text-white tracking-tighter tabular-nums">
                  {envData?.temp.toFixed(1)}<span className="text-emerald-400">°</span>
                </div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Local Thermal Index</div>
              </div>
            </HoloCard>

            <HoloCard className="p-10 flex flex-col justify-between min-h-[300px] glass-premium">
                <div className="flex justify-between items-start">
                    <Droplets className="w-10 h-10 text-cyan-400 opacity-20" />
                    <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">{t.weather.humidity}</span>
                </div>
                <div className="space-y-2">
                    <div className="text-8xl font-display font-extrabold text-white tracking-tighter tabular-nums">
                        {envData?.humidity}<span className="text-cyan-400">%</span>
                    </div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Relative Humidity Core</div>
                </div>
            </HoloCard>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <HoloCard className="p-6 space-y-4 glass-premium">
                <div className="flex items-center gap-2 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-widest">
                    <Wind className="w-4 h-4" /> {t.weather.aqi}
                </div>
                <div className={cn("text-xl font-display font-bold uppercase", getAQIStatus(envData?.aqi || 1).color)}>
                    {getAQIStatus(envData?.aqi || 1).label}
                </div>
            </HoloCard>

            <HoloCard className="p-6 space-y-4 glass-premium">
                <div className="flex items-center gap-2 text-white font-sans font-bold text-[10px] uppercase tracking-widest">
                    <Waves className="w-4 h-4" /> Wind Vector
                </div>
                <div className="text-xl font-display font-bold text-white uppercase italic">
                    {windSpeed.toFixed(1)} <span className="text-xs text-slate-500">km/h</span>
                </div>
            </HoloCard>

            <HoloCard className="p-6 space-y-4 glass-premium">
                <div className="flex items-center gap-2 text-rose-400 font-sans font-bold text-[10px] uppercase tracking-widest">
                    <Zap className="w-4 h-4" /> UV Radiation
                </div>
                <div className="text-xl font-display font-bold text-white uppercase italic">
                    Stable <span className="text-xs text-rose-400">4.2uV</span>
                </div>
            </HoloCard>
          </div>

          <HoloCard className="p-10 glass-premium">
            <div className="flex items-center justify-between mb-10">
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Activity className="w-4 h-4 text-emerald-400" /> Molecular Air Composition
               </div>
               <span className="text-[9px] font-mono text-slate-700">UNIT: μg/m³</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'CO2 Levels', val: (envData?.co || 0).toFixed(1), color: 'text-white' },
                { label: 'Nitrogen (NO2)', val: (envData?.no2 || 0).toFixed(1), color: 'text-emerald-400' },
                { label: 'Ozone (O3)', val: (envData?.o3 || 0).toFixed(1), color: 'text-cyan-400' },
                { label: 'PM2.5 Strain', val: (envData?.pm2_5 || 10).toFixed(1), color: 'text-rose-400' },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{stat.label}</div>
                    <div className={cn("text-2xl font-display font-bold tabular-nums", stat.color)}>{stat.val}</div>
                </div>
              ))}
            </div>
          </HoloCard>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <HoloCard className="p-8 glass-premium bg-emerald-500/[0.02]">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Eco Intelligence
            </div>
            <div className="space-y-8">
              {recommendations.slice(0, 3).map((rec, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-2 group"
                >
                  <h4 className="text-sm font-display font-bold text-white uppercase group-hover:text-emerald-400 transition-colors leading-tight">{rec.title}</h4>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed italic border-l border-white/10 pl-4">{rec.advice}</p>
                </motion.div>
              ))}
            </div>
          </HoloCard>

          <HoloCard className="p-8 glass-premium">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> System Integrity
            </div>
            <div className="space-y-8">
               <div className="h-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={networkData}>
                      <Line 
                        type="monotone" 
                        dataKey="throughput" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        dot={false}
                        isAnimationActive={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500">
                    <span>Processing Load</span>
                    <span className="text-cyan-400">{systemLoad.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: `${systemLoad}%` }}
                      className="h-full bg-cyan-400"
                    />
                  </div>
               </div>
               <div className="flex items-center gap-3 pt-4 border-t border-white/5 opacity-50">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-500 tracking-widest">Protocol Secured</span>
               </div>
            </div>
          </HoloCard>
        </div>
      </div>
    </div>
  );
}
