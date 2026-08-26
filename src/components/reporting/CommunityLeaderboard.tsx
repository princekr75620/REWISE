import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Flame, Users, ArrowUpRight, Filter } from 'lucide-react';
import { INITIAL_LEADERBOARD } from '../../services/reports';
import { LeaderboardEntry } from '../../types';

export default function CommunityLeaderboard() {
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'all'>('all');

  // Multiplier or simulated points depending on filter
  const entries: LeaderboardEntry[] = INITIAL_LEADERBOARD.map(e => {
    if (timeFilter === 'weekly') {
      return {
        ...e,
        ecoPoints: Math.round(e.ecoPoints * 0.18),
        reportsSubmitted: Math.max(1, Math.round(e.reportsSubmitted * 0.2)),
        wasteRecycledKg: Math.max(1, Math.round(e.wasteRecycledKg * 0.25))
      };
    }
    if (timeFilter === 'monthly') {
      return {
        ...e,
        ecoPoints: Math.round(e.ecoPoints * 0.65),
        reportsSubmitted: Math.max(1, Math.round(e.reportsSubmitted * 0.6)),
        wasteRecycledKg: Math.max(2, Math.round(e.wasteRecycledKg * 0.6))
      };
    }
    return e;
  });

  return (
    <div id="community-leaderboard-container" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" /> Civic Champions
          </div>
          <h2 className="text-2xl font-display font-bold text-white">REWISE Community Leaderboard</h2>
          <p className="text-xs text-slate-400">Celebrating citizens driving real-world circular impact and municipal cleanliness.</p>
        </div>

        {/* Time Period Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-white/10">
          {(['weekly', 'monthly', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                timeFilter === period 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {period === 'all' ? 'All Time' : period}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {entries.slice(0, 3).map((champion, idx) => {
          const podiumColor = idx === 0 
            ? 'from-amber-500/20 to-yellow-600/10 border-amber-500/40 text-amber-300' 
            : idx === 1 
            ? 'from-slate-400/20 to-zinc-500/10 border-slate-400/40 text-slate-200' 
            : 'from-amber-700/20 to-orange-800/10 border-amber-700/40 text-amber-400';

          return (
            <motion.div
              key={champion.username}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-2xl bg-gradient-to-b ${podiumColor} border backdrop-blur-md relative overflow-hidden flex flex-col justify-between space-y-4`}
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center font-display font-bold text-sm">
                  #{champion.rank}
                </span>
                <span className="text-2xl">
                  {idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  {champion.username}
                </h4>
                <div className="text-xs text-slate-400 mt-0.5">{champion.level}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Eco Points</span>
                  <div className="font-display font-bold text-emerald-400 text-base">{champion.ecoPoints}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Resolved</span>
                  <div className="font-display font-bold text-white text-base">{champion.reportsResolved}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5 font-semibold">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Citizen / Contributor</th>
                <th className="py-3.5 px-4 text-right">Reports Logged</th>
                <th className="py-3.5 px-4 text-right">Hotspots Resolved</th>
                <th className="py-3.5 px-4 text-right">Recycled (Kg)</th>
                <th className="py-3.5 px-4 text-right">Eco Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((user) => {
                const isUser = user.username.includes('(You)');
                return (
                  <tr 
                    key={user.rank} 
                    className={`transition-colors ${
                      isUser ? 'bg-emerald-500/10 hover:bg-emerald-500/15' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs ${
                        user.rank === 1 ? 'bg-amber-500/20 text-amber-300 font-bold' :
                        user.rank === 2 ? 'bg-slate-700 text-slate-200' :
                        user.rank === 3 ? 'bg-amber-900/40 text-amber-400' : 'text-slate-400 font-mono'
                      }`}>
                        {user.rank}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-emerald-400 uppercase">
                          {user.username.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-semibold ${isUser ? 'text-emerald-300 font-bold' : 'text-white'}`}>
                            {user.username}
                          </div>
                          <div className="text-[10px] text-slate-400">{user.level}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-300">
                      {user.reportsSubmitted}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-emerald-400">
                      {user.reportsResolved}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-teal-400 font-mono">
                      {user.wasteRecycledKg} kg
                    </td>

                    <td className="py-3 px-4 text-right font-display font-bold text-sm text-amber-400">
                      {user.ecoPoints.toLocaleString()} PTS
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
