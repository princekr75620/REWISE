import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ShieldCheck, CheckCircle2, AlertTriangle, Clock, 
  Truck, ArrowRight, Check, X, FileText, Sparkles, MapPin, RefreshCw, Send,
  Lock, KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WasteReport, ReportStatus, ReportSeverity } from '../../types';
import { updateReportAdmin, addPointTransaction } from '../../services/reports';
import MunicipalSecurityGate, { isMunicipalAdminAuthenticated, lockMunicipalAdmin } from './MunicipalSecurityGate';

interface AdminMunicipalDashboardProps {
  reports: WasteReport[];
  onReportsUpdated: () => void;
}

const WARD_CONTRACTORS = [
  'Ward 14 Rapid Sanitation EV Hauler #4',
  'EcoRecycle Urban Hazardous Unit',
  'Municipal Bio-Segregation Squad A',
  'Green Corridor Express Collector #9'
];

export default function AdminMunicipalDashboard({ reports, onReportsUpdated }: AdminMunicipalDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(isMunicipalAdminAuthenticated());
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [assignee, setAssignee] = useState(WARD_CONTRACTORS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLockAdmin = () => {
    lockMunicipalAdmin();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <MunicipalSecurityGate onUnlock={() => setIsAuthenticated(true)} />;
  }

  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'Reported').length;
  const verifiedReports = reports.filter(r => r.status === 'AI Verified').length;
  const assignedReports = reports.filter(r => r.status === 'Assigned' || r.status === 'Action Taken').length;
  const resolvedReports = reports.filter(r => r.status === 'Resolved').length;
  const criticalReports = reports.filter(r => r.severity === 'Critical').length;
  const totalEcoPoints = reports.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0) + 1240;

  const filteredReports = reports.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus, customNote?: string) => {
    setIsProcessing(true);
    try {
      const updates: any = {
        status: newStatus,
        note: customNote || `Status escalated to ${newStatus} by Municipal Officer`,
        actor: 'Municipal Command Center'
      };

      if (newStatus === 'Assigned') {
        updates.assignedTo = assignee;
      }
      if (newStatus === 'Resolved') {
        updates.resolutionNote = resolutionNote || 'Area verified clear and disinfected by Ward Sanitation Squad. Secondary recycling initiated.';
      }

      const res = await updateReportAdmin(reportId, updates);
      if (res.success) {
        if (newStatus === 'Resolved') {
          addPointTransaction(`Civic Resolution Bonus (${reportId})`, 50, reportId);
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 }
          });
          setToastMessage(`Report ${reportId} marked Resolved. +50 bonus points credited to reporting citizen.`);
        } else {
          setToastMessage(`Report ${reportId} updated to ${newStatus}.`);
        }

        setTimeout(() => setToastMessage(null), 4000);
        setSelectedReport(null);
        setResolutionNote('');
        onReportsUpdated();
      }
    } catch (err) {
      console.error('Error updating report status:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="admin-municipal-dashboard" className="w-full max-w-6xl mx-auto space-y-8">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3 backdrop-blur-md shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & KPI Stat Blocks */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider border border-blue-500/20">
              <Building2 className="w-3.5 h-3.5" /> Municipal Sanitation Operations
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              Civic Hotspot Resolution Command
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Review incoming citizen reports, verify AI classifications, dispatch sanitation EV haulers, and credit citizen Eco Points upon clearance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Verified</span>
            </div>

            <button 
              onClick={onReportsUpdated}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-white/5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync Ledger
            </button>

            <button 
              onClick={handleLockAdmin}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-2 border border-rose-500/30 transition-all shadow-sm"
              title="Lock Admin Session"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>

        {/* 6 Key Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Reports</span>
            <div className="text-2xl font-display font-bold text-white mt-1">{totalReports}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5">
            <span className="text-[10px] text-amber-500 font-semibold uppercase">Pending Triage</span>
            <div className="text-2xl font-display font-bold text-amber-400 mt-1">{pendingReports}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5">
            <span className="text-[10px] text-blue-400 font-semibold uppercase">AI Verified</span>
            <div className="text-2xl font-display font-bold text-blue-400 mt-1">{verifiedReports}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5">
            <span className="text-[10px] text-purple-400 font-semibold uppercase">In Transit</span>
            <div className="text-2xl font-display font-bold text-purple-400 mt-1">{assignedReports}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5">
            <span className="text-[10px] text-emerald-400 font-semibold uppercase">Resolved</span>
            <div className="text-2xl font-display font-bold text-emerald-400 mt-1">{resolvedReports}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5">
            <span className="text-[10px] text-rose-400 font-semibold uppercase">Critical Alerts</span>
            <div className="text-2xl font-display font-bold text-rose-400 mt-1">{criticalReports}</div>
          </div>
        </div>
      </div>

      {/* Hotspots Queue Table & Interactive Resolution Console */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Live Citizen Reports Triage Queue</h3>
            <p className="text-xs text-slate-400">Select any report to inspect AI telemetry, dispatch squads, or issue resolution bonuses.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter reports by municipal status"
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-emerald-500/50 outline-none"
            >
              <option value="all">All States</option>
              <option value="reported">Reported</option>
              <option value="ai verified">AI Verified</option>
              <option value="assigned">Assigned</option>
              <option value="action taken">Action Taken</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Reports Queue List */}
        <div className="divide-y divide-white/5 rounded-xl border border-white/5 overflow-hidden bg-slate-950/40">
          {filteredReports.map((r) => (
            <div 
              key={r.id}
              onClick={() => setSelectedReport(r)}
              className={`p-4 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.03] ${
                selectedReport?.id === r.id ? 'bg-emerald-500/10 border-l-4 border-emerald-400' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <img src={r.image} alt={r.category} className="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-900" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">{r.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{r.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      r.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                      r.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {r.severity}
                    </span>
                  </div>
                  <p className="text-xs text-white line-clamp-1 max-w-md">{r.description}</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {r.location.address}, {r.location.city}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  r.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  r.status === 'AI Verified' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  r.status === 'Assigned' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {r.status}
                </span>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReport(r);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1"
                >
                  Manage <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Inspector Drawer / Modal for Selected Report */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Admin Resolution Console</div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                    Report ID: <span className="font-mono text-emerald-400">{selectedReport.id}</span>
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Main Snapshot & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/10">
                  <img src={selectedReport.image} alt={selectedReport.category} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Location:</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{selectedReport.location.address}, {selectedReport.location.city}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Citizen Description:</span>
                    <p className="text-slate-300 mt-0.5">{selectedReport.description}</p>
                  </div>
                  {selectedReport.aiAnalysis && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-1">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Verified: {selectedReport.aiAnalysis.wasteType}
                      </div>
                      <p className="text-[11px] text-slate-400">{selectedReport.aiAnalysis.summary}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action 1: Verify AI Classification */}
              {selectedReport.status === 'Reported' && (
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-3">
                  <div className="text-xs font-bold text-blue-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> AI Classification Verification
                  </div>
                  <p className="text-xs text-slate-300">
                    Verify visual evidence to approve report validity and award citizen +25 AI verification points.
                  </p>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, 'AI Verified', 'Report validated and confirmed by Municipal Inspector')}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm AI Verification (+25 Pts)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, 'Rejected', 'Report rejected as invalid or duplicate')}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                    >
                      Reject (Spam / Invalid)
                    </button>
                  </div>
                </div>
              )}

              {/* Action 2: Assign to Sanitation Squad */}
              {(selectedReport.status === 'AI Verified' || selectedReport.status === 'Reported') && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Dispatch Ward Sanitation Contractor
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      aria-label="Select sanitation squad or EV contractor"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                    >
                      {WARD_CONTRACTORS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, 'Assigned', `Dispatched to ${assignee}`)}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Dispatch EV Hauler
                    </button>
                  </div>
                </div>
              )}

              {/* Action 3: Mark as Resolved & Credit Citizen Bonus */}
              {selectedReport.status !== 'Resolved' && (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-4">
                  <div className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Complete Resolution & Grant Citizen Reward
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-semibold">Resolution Notes & Clearance Details:</label>
                    <textarea 
                      rows={2}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="e.g. 140kg plastic waste cleared by EV Hauler #4 and baled for secondary recycling at Sector 14 Material Facility..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs resize-none outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'Resolved')}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Hotspot Resolved & Credit +50 Bonus Eco Points
                  </button>
                </div>
              )}

              {/* If already resolved */}
              {selectedReport.status === 'Resolved' && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Hotspot Fully Resolved
                  </div>
                  <p className="text-slate-300">{selectedReport.resolutionNote || 'Area verified clean and safe.'}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
