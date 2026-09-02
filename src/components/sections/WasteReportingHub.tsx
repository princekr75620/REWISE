import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, FileText, Gift, Trophy, Building2, Sparkles, ShieldCheck, 
  ArrowRight, CheckCircle2, TrendingUp, Zap, HelpCircle, Layers, Lock
} from 'lucide-react';
import { Language } from '../ui/LanguageSelector';
import { useTranslation } from '../../lib/translations';
import { WasteReport } from '../../types';
import { getReports } from '../../services/reports';
import ReportForm from '../reporting/ReportForm';
import MyReportsList from '../reporting/MyReportsList';
import RewardsDashboard from '../reporting/RewardsDashboard';
import CommunityLeaderboard from '../reporting/CommunityLeaderboard';
import AdminMunicipalDashboard from '../reporting/AdminMunicipalDashboard';
import { isMunicipalAdminAuthenticated } from '../reporting/MunicipalSecurityGate';

interface WasteReportingHubProps {
  language: Language;
  initialSubTab?: 'submit' | 'myReports' | 'rewards' | 'leaderboard' | 'admin';
}

export default function WasteReportingHub({ language, initialSubTab = 'submit' }: WasteReportingHubProps) {
  const t = useTranslation(language);
  const [activeSubTab, setActiveSubTab] = useState<'submit' | 'myReports' | 'rewards' | 'leaderboard' | 'admin'>(initialSubTab);
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReportsData = async () => {
    setIsLoading(true);
    try {
      const data = await getReports();
      setReports(data);
    } catch (e) {
      console.warn('Failed to load reports:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const handleReportCreated = (newReport: WasteReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  const isAuth = isMunicipalAdminAuthenticated();

  const navItems = [
    { id: 'submit', label: t.reportWaste?.submitTab || 'Report Waste', icon: Camera },
    { id: 'myReports', label: t.reportWaste?.myReportsTab || 'My Reports', icon: FileText, badge: reports.length },
    { id: 'rewards', label: t.reportWaste?.rewardsTab || 'Eco Rewards', icon: Gift },
    { id: 'leaderboard', label: t.reportWaste?.leaderboardTab || 'Leaderboard', icon: Trophy },
    { id: 'admin', label: t.reportWaste?.adminTab || 'Municipal Admin', icon: Building2, isSecure: true },
  ];

  return (
    <div id="waste-reporting-hub" className="min-h-[85vh] py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SIH Civic Waste Hotspot & Circular Reward Engine</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-tight">
          {t.reportWaste?.title || 'Report Waste & Hotspots'}
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {t.reportWaste?.subtitle || 'Geotag unmanaged garbage dumps, overflowing bins, and hazardous waste with AI verification, transparent municipal resolution, and certified Eco Points.'}
        </p>

        {/* Central User Journey Ribbon */}
        <div className="pt-2 overflow-x-auto pb-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-slate-900/60 border border-white/5 text-[11px] font-semibold text-slate-300 backdrop-blur-md">
            <span className="text-emerald-400">SEE WASTE</span>
            <span className="text-slate-600">➔</span>
            <span className="text-emerald-400">REPORT</span>
            <span className="text-slate-600">➔</span>
            <span className="text-emerald-400">AI VERIFICATION</span>
            <span className="text-slate-600">➔</span>
            <span className="text-emerald-400">AUTHORITY DISPATCH</span>
            <span className="text-slate-600">➔</span>
            <span className="text-emerald-400">RESOLVED</span>
            <span className="text-slate-600">➔</span>
            <span className="text-amber-400 font-bold">EARN ECO POINTS</span>
            <span className="text-slate-600">➔</span>
            <span className="text-teal-300">COMMUNITY IMPACT</span>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`relative px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'text-slate-950 font-bold shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeReportTab"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl -z-0"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {(item as any).isSecure && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono flex items-center gap-1 ${
                      isActive ? 'bg-slate-950/80 text-emerald-300' : 'bg-slate-800/80 text-slate-400'
                    }`}>
                      <Lock className="w-2.5 h-2.5" />
                      PIN
                    </span>
                  )}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="pt-2"
        >
          {activeSubTab === 'submit' && (
            <ReportForm 
              language={language}
              onSuccess={(r) => {
                handleReportCreated(r);
              }}
              onSwitchTab={(tab) => setActiveSubTab(tab as any)}
            />
          )}

          {activeSubTab === 'myReports' && (
            <MyReportsList 
              reports={reports}
              onOpenReportForm={() => setActiveSubTab('submit')}
            />
          )}

          {activeSubTab === 'rewards' && (
            <RewardsDashboard 
              reports={reports}
            />
          )}

          {activeSubTab === 'leaderboard' && (
            <CommunityLeaderboard />
          )}

          {activeSubTab === 'admin' && (
            <AdminMunicipalDashboard 
              reports={reports}
              onReportsUpdated={loadReportsData}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
