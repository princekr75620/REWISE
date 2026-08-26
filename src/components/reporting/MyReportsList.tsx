import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Clock, AlertCircle, MapPin, Sparkles, 
  ShieldCheck, ArrowRight, Eye, Calendar, Award, ExternalLink, Filter
} from 'lucide-react';
import { WasteReport, ReportStatus } from '../../types';

interface MyReportsListProps {
  reports: WasteReport[];
  onSelectReport?: (report: WasteReport) => void;
  onOpenReportForm?: () => void;
}

const STATUS_STEPS: ReportStatus[] = [
  'Reported',
  'AI Verified',
  'Assigned',
  'Action Taken',
  'Resolved'
];

export default function MyReportsList({ reports, onSelectReport, onOpenReportForm }: MyReportsListProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

  const filteredReports = reports.filter(r => {
    if (filterCategory === 'all') return true;
    return r.category.toLowerCase() === filterCategory.toLowerCase();
  });

  const getStatusIndex = (status: ReportStatus): number => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div id="my-reports-container" className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
        <div className="space-y-0.5">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            My Submitted Hotspot Reports
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {filteredReports.length} Active Logs
            </span>
          </h2>
          <p className="text-xs text-slate-400">Track real-time municipal status timeline, AI verification telemetry, and earned Eco Points.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter reports by waste category"
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-emerald-500/50 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="plastic">Plastics</option>
            <option value="e-waste">E-Waste</option>
            <option value="organic">Organic</option>
            <option value="mixed waste">Mixed Waste</option>
            <option value="hazardous">Hazardous</option>
          </select>

          {onOpenReportForm && (
            <button
              onClick={onOpenReportForm}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10 shrink-0 ml-auto sm:ml-0"
            >
              + New Report
            </button>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/30 border border-white/5 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">No reports found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">You have not submitted any waste reports in this category yet. Report local waste hotspots to earn Eco Points!</p>
          </div>
          {onOpenReportForm && (
            <button
              onClick={onOpenReportForm}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all"
            >
              Report Waste Hotspot
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => {
            const currentStepIdx = getStatusIndex(report.status);
            const isResolved = report.status === 'Resolved';

            return (
              <motion.div 
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 md:p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 transition-all backdrop-blur-md space-y-5 group"
              >
                {/* Top Bar: ID, Category, Severity & Reward */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      {report.id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
                      {report.category}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      report.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      report.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {report.severity} Urgency
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-display">
                      <Award className="w-3.5 h-3.5" /> +{report.pointsEarned} Eco Pts
                    </div>

                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </div>
                </div>

                {/* Main Content: Thumbnail, Info & Description */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-3 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-white/5 relative">
                    <img src={report.image} alt={report.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {report.aiAnalysis && (
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono flex items-center gap-1 border border-emerald-500/20">
                        <Sparkles className="w-2.5 h-2.5" /> AI {report.aiAnalysis.confidence}%
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-9 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{report.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {report.location.address}, {report.location.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* AI Analysis Pill if available */}
                    {report.aiAnalysis && (
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white">AI Telemetry:</span> {report.aiAnalysis.wasteType} — {report.aiAnalysis.summary}
                        </div>
                      </div>
                    )}

                    {/* Assigned or Resolution Note */}
                    {report.assignedTo && (
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="text-slate-500 font-semibold uppercase text-[10px]">Assigned Contractor:</span>
                        <span className="text-slate-300 font-medium">{report.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5-Stage Status Timeline */}
                <div className="pt-3 border-t border-white/5">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
                    Municipal Resolution Lifecycle
                  </div>

                  <div className="relative grid grid-cols-5 gap-2 text-center">
                    {/* Connecting background line */}
                    <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-slate-800 -z-0" />
                    
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      const timelineEvent = report.timeline?.find(t => t.status === step);

                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center space-y-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted 
                              ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' 
                              : 'bg-slate-800 text-slate-500 border border-white/10'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          
                          <span className={`text-[10px] md:text-xs font-semibold ${
                            isCurrent ? 'text-emerald-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                          }`}>
                            {step}
                          </span>

                          {timelineEvent && (
                            <span className="text-[9px] text-slate-500 hidden sm:block font-mono">
                              {new Date(timelineEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400">{selectedReport.id}</span>
                  <span className="text-xs text-slate-400">Complete Civic Manifest</span>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
                >
                  ✕ Close
                </button>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden bg-slate-950">
                <img src={selectedReport.image} alt="Report Preview" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">{selectedReport.description}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {selectedReport.location.address}, {selectedReport.location.city}
                </p>
              </div>

              {selectedReport.timeline && selectedReport.timeline.length > 0 && (
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Audit Log & Timestamps</h4>
                  <div className="space-y-2 text-xs">
                    {selectedReport.timeline.map((ev, i) => (
                      <div key={i} className="flex items-start justify-between p-2.5 rounded bg-slate-950/60 border border-white/5">
                        <div>
                          <div className="font-semibold text-emerald-400">{ev.status}</div>
                          {ev.note && <div className="text-slate-400 text-[11px] mt-0.5">{ev.note}</div>}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(ev.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.resolutionNote && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Municipal Resolution Certificate
                  </div>
                  <p className="text-slate-300">{selectedReport.resolutionNote}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
