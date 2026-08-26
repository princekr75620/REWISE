import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Sparkles, Trophy, Gift, ArrowRight, ShieldCheck, CheckCircle2, 
  TrendingUp, TreePine, Ticket, Tag, RefreshCw, Star, Zap, Clock,
  CreditCard, Flame, ExternalLink, Copy, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserBadge, RewardRedemptionItem, RewardTransaction, WasteReport } from '../../types';
import { 
  DEFAULT_BADGES, DEFAULT_REDEMPTIONS, calculateUserLevel, 
  getPointTransactions, addPointTransaction, getUserEcoPoints,
  saveMembershipVoucher, getActiveMembershipVouchers, ActiveMembershipVoucher
} from '../../services/reports';
import { purchaseSubscription, SubscriptionTier } from '../../lib/subscription';

interface RewardsDashboardProps {
  reports: WasteReport[];
  onNavigateToSubscription?: () => void;
}

export default function RewardsDashboard({ reports, onNavigateToSubscription }: RewardsDashboardProps) {
  const [points, setPoints] = useState<number>(getUserEcoPoints());
  const [badges, setBadges] = useState<UserBadge[]>(DEFAULT_BADGES);
  const [redemptions, setRedemptions] = useState<RewardRedemptionItem[]>(DEFAULT_REDEMPTIONS);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [redeemedSuccess, setRedeemedSuccess] = useState<string | null>(null);
  const [activeVouchers, setActiveVouchers] = useState<ActiveMembershipVoucher[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync points and transactions
  const syncData = () => {
    const currentPts = getUserEcoPoints();
    setPoints(currentPts);
    setTransactions(getPointTransactions());
    setActiveVouchers(getActiveMembershipVouchers());
  };

  useEffect(() => {
    syncData();

    const handlePointsUpdate = () => syncData();
    window.addEventListener('rewise_points_updated', handlePointsUpdate);
    window.addEventListener('rewise_vouchers_updated', handlePointsUpdate);
    return () => {
      window.removeEventListener('rewise_points_updated', handlePointsUpdate);
      window.removeEventListener('rewise_vouchers_updated', handlePointsUpdate);
    };
  }, []);

  // Derive badges based on submitted reports
  useEffect(() => {
    const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
    const verifiedCount = reports.filter(r => r.status === 'AI Verified' || r.status === 'Assigned' || r.status === 'Action Taken' || r.status === 'Resolved').length;

    setBadges(prev => prev.map(b => {
      if (b.id === 'badge_first_step') {
        const prog = Math.min(1, reports.length);
        return { ...b, progress: prog, unlocked: prog >= 1 };
      }
      if (b.id === 'badge_waste_watcher') {
        const prog = Math.min(10, verifiedCount);
        return { ...b, progress: prog, unlocked: prog >= 10 };
      }
      if (b.id === 'badge_planet_protector') {
        const prog = Math.min(25, resolvedCount);
        return { ...b, progress: prog, unlocked: prog >= 25 };
      }
      if (b.id === 'badge_eco_champion') {
        const prog = Math.min(1000, points);
        return { ...b, progress: prog, unlocked: prog >= 1000 };
      }
      return b;
    }));
  }, [reports, points]);

  const levelInfo = calculateUserLevel(points);

  const handleRedeem = async (item: RewardRedemptionItem) => {
    if (points < item.cost) {
      alert(`Insufficient Eco Points! You need ${item.cost - points} more Eco Points to redeem ${item.title}.`);
      return;
    }

    // Direct 100% Membership activation if requested
    if (item.category === 'Membership' && item.discountRupees && (item.discountRupees === 50 || item.discountRupees === 300)) {
      const tierToActivate: SubscriptionTier = item.membershipTierTarget || (item.discountRupees === 50 ? 'rupees_50' : 'rupees_300');
      const planName = tierToActivate === 'rupees_50' ? 'Basic Orbit Tier (1 Month)' : 'Star Voyager Tier (1 Year)';
      
      const confirmActivate = window.confirm(`🎉 Confirm 100% Eco-Funded Activation:\n\nUse ${item.cost} Eco Points to activate ${planName} immediately with ZERO monetary cost?`);
      if (!confirmActivate) return;

      try {
        addPointTransaction(`Redeemed 100% Free Membership: ${item.title}`, -item.cost);
        await purchaseSubscription(
          tierToActivate,
          'REWISE Civic Eco Points (100% Discount)',
          'Eco Citizen Hero',
          'ECO-REWARDS-100-FREE'
        );
        syncData();
        setRedeemedSuccess(`🌟 Congratulations! ${planName} has been fully activated for your account using ${item.cost} Eco Points!`);
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        return;
      } catch (err: any) {
        alert("Failed to activate membership: " + err.message);
        return;
      }
    }

    // If it is a discount voucher (e.g. ₹25 or ₹100 off)
    if (item.category === 'Membership' && item.discountRupees) {
      const code = `ECO-${item.discountRupees}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      addPointTransaction(`Redeemed Membership Discount Voucher: ${item.title}`, -item.cost);
      
      saveMembershipVoucher({
        id: `vch_${Date.now()}`,
        code,
        discountRupees: item.discountRupees,
        tierTarget: item.membershipTierTarget || 'rupees_50',
        title: item.title,
        createdDate: new Date().toLocaleDateString()
      });

      syncData();
      setRedeemedSuccess(`🎟️ Voucher Generated: Use code ${code} for ₹${item.discountRupees} OFF on Membership!`);
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      return;
    }

    // Standard non-membership reward item
    addPointTransaction(`Redeemed Reward: ${item.title}`, -item.cost);
    syncData();
    setRedemptions(prev => prev.map(r => r.id === item.id ? { ...r, redeemed: true } : r));
    setRedeemedSuccess(`Successfully redeemed "${item.title}"! Digital certificate & record generated.`);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });

    setTimeout(() => setRedeemedSuccess(null), 6000);
  };

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredRedemptions = selectedCategory === 'All' 
    ? redemptions 
    : redemptions.filter(r => r.category === selectedCategory);

  const resolvedReportsCount = reports.filter(r => r.status === 'Resolved').length;

  return (
    <div id="rewards-dashboard-container" className="w-full max-w-6xl mx-auto space-y-8">
      {/* Top Banner: Eco Level & Point Engine */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-slate-950 border border-emerald-500/30 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Civic Sustainability Ledger
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              REWISE Eco Points System
            </h2>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Earn certified points for reporting waste hotspots, verifying unmanaged dumps, participating in ward cleanups, and upcycling materials. Convert your points into <strong>Membership Discounts & 100% Free Subscriptions</strong>!
            </p>
          </div>

          {/* Points Counter Box */}
          <div className="w-full md:w-auto p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center md:text-right shrink-0">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Eco Points</div>
            <div className="text-4xl md:text-5xl font-display font-bold text-emerald-400 tracking-tight mt-0.5">
              {points.toLocaleString()} <span className="text-sm font-sans text-emerald-500/70 font-semibold">PTS</span>
            </div>
            <div className="text-[11px] text-amber-400 font-medium mt-1 flex items-center justify-center md:justify-end gap-1">
              <Award className="w-3.5 h-3.5" /> Tier: {levelInfo.levelName}
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-400" /> Current Rank: <span className="text-emerald-400 font-bold">{levelInfo.levelName}</span>
            </span>
            <span className="text-slate-400">
              Next Rank: <strong className="text-white">{levelInfo.nextLevelName}</strong> ({Math.max(0, levelInfo.max - points)} pts remaining)
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-950 border border-white/10 overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300"
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>{levelInfo.min} Pts (Starter)</span>
            <span>500 Pts (Champion)</span>
            <span>1,000+ Pts (Planet Protector)</span>
          </div>
        </div>

        {/* 4 Core Civic Activity Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-center">
            <div className="text-2xl font-display font-bold text-white">{reports.length}</div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">Reports Submitted</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-center">
            <div className="text-2xl font-display font-bold text-emerald-400">{resolvedReportsCount}</div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">Reports Resolved</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-center">
            <div className="text-2xl font-display font-bold text-teal-400">18.5 <span className="text-xs">kg</span></div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">Waste Recycled</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-center">
            <div className="text-2xl font-display font-bold text-amber-400">7 <span className="text-xs">items</span></div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">Waste Reused</div>
          </div>
        </div>
      </div>

      {/* SPECIAL FEATURE BANNER: Membership Discount via Eco Points */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-emerald-950/80 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold tracking-wider uppercase border border-cyan-500/20">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Membership Discount & Free Tier Exchange
          </div>
          <h3 className="text-2xl font-display font-bold text-white">
            Use Your Points to Slash Subscription Costs!
          </h3>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Every 10 Eco Points = ₹1 Discount. Use <strong>250 PTS</strong> for 50% off Orbit (₹25), <strong>500 PTS</strong> for 100% Free Orbit, or <strong>1200 PTS</strong> for a full 1-Year Free Star Voyager Pass!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => setSelectedCategory('Membership')}
            className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Gift className="w-4 h-4" /> View Membership Deals
          </button>
        </div>
      </div>

      {/* Active Unused Membership Vouchers Bar */}
      {activeVouchers.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4" /> Active Membership Vouchers ({activeVouchers.length})
            </span>
            <span className="text-[11px] text-slate-400">Ready to apply during checkout</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeVouchers.map((v) => (
              <div key={v.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white">{v.title}</div>
                  <div className="text-[10px] text-amber-400 font-mono font-bold mt-0.5">Code: {v.code}</div>
                </div>
                <button
                  onClick={() => handleCopyVoucher(v.code)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedCode === v.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === v.code ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redeemed Success Alert Banner */}
      <AnimatePresence>
        {redeemedSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between gap-3 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{redeemedSuccess}</span>
            </div>
            <button onClick={() => setRedeemedSuccess(null)} className="text-emerald-400 hover:text-white text-xs font-bold">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewards Redemption Store */}
      <div className="space-y-5 pt-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" /> Redeem Rewards Store
            </h3>
            <p className="text-xs text-slate-400">Exchange your Eco Points for membership discounts, green passes, and partner rewards.</p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/5">
            {['All', 'Membership', 'Certificate', 'Pass', 'Tree', 'Coupon'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'Membership' ? '⚡ Membership (Discounts & Free)' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRedemptions.map((item) => {
            const canAfford = points >= item.cost;
            const isMembership = item.category === 'Membership';
            const isFreePass = item.discountRupees === 50 || item.discountRupees === 300;

            return (
              <div 
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  isMembership 
                    ? 'bg-gradient-to-b from-cyan-950/40 via-slate-900/80 to-slate-950 border-cyan-500/30 hover:border-cyan-400/50 shadow-lg' 
                    : 'bg-slate-900/60 border-white/10 hover:border-emerald-500/30'
                }`}
              >
                {isMembership && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold uppercase tracking-wider border border-cyan-500/30">
                    {isFreePass ? '100% Free Tier' : 'Discount Voucher'}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`px-2.5 py-1 rounded-full font-display font-bold text-xs border ${
                      isMembership 
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {item.cost} PTS
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={!canAfford || item.redeemed}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      item.redeemed 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : canAfford 
                          ? isMembership 
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10' 
                          : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {item.redeemed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                      </>
                    ) : canAfford ? (
                      <>
                        <Zap className="w-3.5 h-3.5" /> {isFreePass ? 'Claim & Activate Plan' : 'Redeem Discount'}
                      </>
                    ) : (
                      `Need ${item.cost - points} More Pts`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Badges & Achievements
            </h3>
            <p className="text-xs text-slate-400">Unlock prestigious credentials through real civic actions.</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const pct = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));
            return (
              <div 
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                  badge.unlocked 
                    ? 'bg-slate-900/80 border-amber-500/30 ring-1 ring-amber-500/20' 
                    : 'bg-slate-950/50 border-white/5 opacity-80'
                }`}
              >
                {badge.unlocked && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase tracking-wider border border-amber-500/30">
                    Unlocked 🏆
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    badge.unlocked ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800 border border-white/5 grayscale'
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{badge.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{badge.description}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Progress</span>
                    <span className="font-mono">{badge.progress} / {badge.maxProgress}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${badge.unlocked ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Point Transaction History */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Eco Points Audit Ledger
        </h3>

        <div className="rounded-xl bg-slate-950/60 border border-white/5 divide-y divide-white/5 overflow-hidden">
          {transactions.slice(0, 6).map((tx) => (
            <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-white">{tx.action}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(tx.timestamp).toLocaleString()}
                </div>
              </div>
              <span className={`font-display font-bold text-sm ${tx.points >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tx.points > 0 ? `+${tx.points}` : tx.points} PTS
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

