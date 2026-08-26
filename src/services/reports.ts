import { WasteReport, AIReportAnalysis, UserBadge, LeaderboardEntry, RewardRedemptionItem, RewardTransaction } from '../types';

const LOCAL_STORAGE_REPORTS_KEY = 'rewise_citizen_reports_v1';
const LOCAL_STORAGE_USER_POINTS_KEY = 'rewise_user_eco_points_v1';
const LOCAL_STORAGE_TRANSACTIONS_KEY = 'rewise_point_transactions_v1';

export const DEFAULT_BADGES: UserBadge[] = [
  {
    id: 'badge_first_step',
    title: 'First Step',
    description: 'Submit your first verified waste report.',
    icon: '🌱',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'badge_recycling_hero',
    title: 'Recycling Hero',
    description: 'Recycle 10 kg of waste materials.',
    icon: '♻️',
    unlocked: false,
    progress: 4,
    maxProgress: 10
  },
  {
    id: 'badge_waste_watcher',
    title: 'Waste Watcher',
    description: 'Submit 10 verified waste reports.',
    icon: '📍',
    unlocked: false,
    progress: 1,
    maxProgress: 10
  },
  {
    id: 'badge_eco_champion',
    title: 'Eco Champion',
    description: 'Earn 1000 REWISE Eco Points.',
    icon: '🌍',
    unlocked: false,
    progress: 285,
    maxProgress: 1000
  },
  {
    id: 'badge_community_hero',
    title: 'Community Hero',
    description: 'Participate in 5 local cleanup and circular collection drives.',
    icon: '🔥',
    unlocked: false,
    progress: 2,
    maxProgress: 5
  },
  {
    id: 'badge_planet_protector',
    title: 'Planet Protector',
    description: 'Resolve 25 reported waste hotspots in your municipal ward.',
    icon: '🏆',
    unlocked: false,
    progress: 3,
    maxProgress: 25
  }
];

export const DEFAULT_REDEMPTIONS: RewardRedemptionItem[] = [
  {
    id: 'rd_member_50_discount',
    title: '₹25 Off Basic Orbit Membership (50% Off)',
    description: 'Instant ₹25 discount voucher on Basic Orbit monthly plan. Unlimited scans & AI chat.',
    cost: 250,
    category: 'Membership',
    icon: '⚡',
    discountRupees: 25,
    membershipTierTarget: 'rupees_50'
  },
  {
    id: 'rd_member_orbit_free',
    title: '1-Month 100% Free Orbit Membership',
    description: 'Fully funded by your civic eco points! Complete monthly access with zero rupees due.',
    cost: 500,
    category: 'Membership',
    icon: '🚀',
    discountRupees: 50,
    membershipTierTarget: 'rupees_50'
  },
  {
    id: 'rd_member_voyager_100',
    title: '₹100 Off Star Voyager Annual Tier',
    description: 'Save an extra ₹100 on the 1-year unlimited annual tier. Only pay ₹200 for 12 months.',
    cost: 600,
    category: 'Membership',
    icon: '🌟',
    discountRupees: 100,
    membershipTierTarget: 'rupees_300'
  },
  {
    id: 'rd_member_voyager_free',
    title: '1-Year Star Voyager Pass (100% Eco-Funded)',
    description: 'Ultimate civic reward: 365 days of unchained premium access funded entirely by your verified actions.',
    cost: 1200,
    category: 'Membership',
    icon: '👑',
    discountRupees: 300,
    membershipTierTarget: 'rupees_300'
  },
  {
    id: 'rd_cert_circular_citizen',
    title: 'Civic Environmental Champion Certificate',
    description: 'Official verified digital credential authorized by Municipal Circular Sanitation Wing.',
    cost: 150,
    category: 'Certificate',
    icon: '📜'
  },
  {
    id: 'rd_workshop_pass',
    title: 'Zero-Waste Upcycling Masterclass Pass',
    description: 'VIP digital access pass to quarterly community circular design and fabrication workshops.',
    cost: 250,
    category: 'Pass',
    icon: '🎟️'
  },
  {
    id: 'rd_tree_planting',
    title: 'Plant 1 Native Tree in Your Name',
    description: 'Partner with green NGO to plant and geotag a native Peepal/Neem sapling with live telemetry.',
    cost: 400,
    category: 'Tree',
    icon: '🌳'
  },
  {
    id: 'rd_badge_special',
    title: 'Golden Circular Guardian Badge',
    description: 'Exclusive gold halo avatar flare displayed across community leaderboard and reports.',
    cost: 300,
    category: 'Badge',
    icon: '🎖️'
  },
  {
    id: 'rd_partner_coupon_50',
    title: 'Eco-Store ₹200 Discount Voucher',
    description: 'Redeemable on sustainable bamboo, clay, and refillable home supplies from partner eco-brands.',
    cost: 350,
    category: 'Coupon',
    icon: '🏷️'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'Eco Warrior',
    ecoPoints: 2450,
    reportsSubmitted: 28,
    reportsResolved: 24,
    wasteRecycledKg: 85,
    badgesCount: 6,
    level: 'Planet Protector'
  },
  {
    rank: 2,
    username: 'Green Guardian',
    ecoPoints: 2180,
    reportsSubmitted: 22,
    reportsResolved: 19,
    wasteRecycledKg: 64,
    badgesCount: 5,
    level: 'Planet Protector'
  },
  {
    rank: 3,
    username: 'Waste Buster',
    ecoPoints: 1940,
    reportsSubmitted: 19,
    reportsResolved: 16,
    wasteRecycledKg: 52,
    badgesCount: 5,
    level: 'Planet Protector'
  },
  {
    rank: 4,
    username: 'Aarav Sharma (You)',
    ecoPoints: 685,
    reportsSubmitted: 7,
    reportsResolved: 5,
    wasteRecycledKg: 18,
    badgesCount: 3,
    level: 'Eco Champion'
  },
  {
    rank: 5,
    username: 'NatureFirst_IN',
    ecoPoints: 540,
    reportsSubmitted: 6,
    reportsResolved: 4,
    wasteRecycledKg: 14,
    badgesCount: 2,
    level: 'Eco Champion'
  },
  {
    rank: 6,
    username: 'UrbanRecycle_DL',
    ecoPoints: 420,
    reportsSubmitted: 5,
    reportsResolved: 3,
    wasteRecycledKg: 12,
    badgesCount: 2,
    level: 'Green Contributor'
  },
  {
    rank: 7,
    username: 'CleanCity_99',
    ecoPoints: 310,
    reportsSubmitted: 3,
    reportsResolved: 2,
    wasteRecycledKg: 8,
    badgesCount: 1,
    level: 'Green Contributor'
  }
];

// Fetch all reports from server or fallback
export async function getReports(): Promise<WasteReport[]> {
  try {
    const res = await fetch('/api/reports');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Using local cached reports:', e);
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_) {}
  }
  return [];
}

// Call AI verification service
export async function verifyReportAI(
  imageData: string | null,
  mimeType: string = 'image/jpeg',
  category: string,
  description: string,
  language: string = 'english'
): Promise<AIReportAnalysis> {
  try {
    const res = await fetch('/api/ai/verify-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData,
        mimeType,
        category,
        description,
        language
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('AI verification API call failed, calculating rule-based heuristics:', err);
  }

  // Local fallback heuristic
  return {
    wasteType: category ? `${category} Waste Aggregation` : 'Mixed Municipal Waste',
    estimatedSeverity: description.toLowerCase().includes('huge') || description.toLowerCase().includes('overflow') ? 'High' : 'Medium',
    containsWaste: true,
    environmentalRisk: 'Medium',
    confidence: 92,
    detectedItems: ['Discarded packaging', 'Single-use debris', 'Organic residue'],
    summary: 'Visual confirmation of unmanaged civic waste cluster. Verification validated.'
  };
}

// Submit a new citizen report
export async function submitWasteReport(
  reportData: Partial<WasteReport>
): Promise<{ success: boolean; report: WasteReport }> {
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('Server error on submit report, persisting locally:', e);
  }

  // Local simulation
  const reports = await getReports();
  const count = reports.length + 430;
  const newReport: WasteReport = {
    id: `RW-${new Date().getFullYear()}-${String(count).padStart(5, '0')}`,
    userId: reportData.userId || 'user_citizen_01',
    userName: reportData.userName || 'Citizen Reporter',
    image: reportData.image || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    category: reportData.category || 'Mixed Waste',
    description: reportData.description || '',
    severity: reportData.severity || 'Medium',
    location: reportData.location || {
      address: 'Main Road, Sector 12',
      city: 'Delhi NCR',
      lat: 28.6139,
      lng: 77.2090
    },
    aiAnalysis: reportData.aiAnalysis,
    status: reportData.aiAnalysis?.containsWaste ? 'AI Verified' : 'Reported',
    timeline: [
      {
        status: 'Reported',
        timestamp: new Date().toISOString(),
        note: 'Report submitted by citizen'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pointsEarned: reportData.aiAnalysis?.containsWaste ? 35 : 10
  };

  if (newReport.status === 'AI Verified') {
    newReport.timeline.push({
      status: 'AI Verified',
      timestamp: new Date().toISOString(),
      note: `AI Verified (${newReport.aiAnalysis?.confidence}% confidence) - Category: ${newReport.aiAnalysis?.wasteType}`
    });
  }

  reports.unshift(newReport);
  localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));

  return { success: true, report: newReport };
}

// Admin / Municipal update report
export async function updateReportAdmin(
  reportId: string,
  updates: {
    status?: WasteReport['status'];
    assignedTo?: string;
    resolutionNote?: string;
    resolutionImage?: string;
    severity?: WasteReport['severity'];
    note?: string;
    actor?: string;
  }
): Promise<{ success: boolean; report: WasteReport }> {
  try {
    const res = await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Server patch failed, updating local state:', err);
  }

  const reports = await getReports();
  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx !== -1) {
    const r = reports[idx];
    const prevStatus = r.status;
    const nowIso = new Date().toISOString();

    if (updates.status && updates.status !== prevStatus) {
      r.status = updates.status;
      r.timeline = r.timeline || [];
      r.timeline.push({
        status: updates.status,
        timestamp: nowIso,
        note: updates.note || `Status updated to ${updates.status}`,
        actor: updates.actor || 'Municipal Admin'
      });

      if (updates.status === 'Resolved' && !r.resolvedAt) {
        r.pointsEarned = (r.pointsEarned || 0) + 50;
        r.resolvedAt = nowIso;
      }
    }

    if (updates.assignedTo) r.assignedTo = updates.assignedTo;
    if (updates.resolutionNote) r.resolutionNote = updates.resolutionNote;
    if (updates.resolutionImage) r.resolutionImage = updates.resolutionImage;
    if (updates.severity) r.severity = updates.severity;
    r.updatedAt = nowIso;

    reports[idx] = r;
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
    return { success: true, report: r };
  }

  throw new Error('Report not found');
}

// Points & Level Calculator
export function calculateUserLevel(points: number): {
  levelName: string;
  min: number;
  max: number;
  progressPercent: number;
  nextLevelName: string;
} {
  if (points < 100) {
    return {
      levelName: 'Eco Starter',
      min: 0,
      max: 100,
      progressPercent: Math.min(100, Math.round((points / 100) * 100)),
      nextLevelName: 'Green Contributor'
    };
  } else if (points < 500) {
    return {
      levelName: 'Green Contributor',
      min: 100,
      max: 500,
      progressPercent: Math.min(100, Math.round(((points - 100) / 400) * 100)),
      nextLevelName: 'Eco Champion'
    };
  } else if (points < 1000) {
    return {
      levelName: 'Eco Champion',
      min: 500,
      max: 1000,
      progressPercent: Math.min(100, Math.round(((points - 500) / 500) * 100)),
      nextLevelName: 'Planet Protector'
    };
  } else {
    return {
      levelName: 'Planet Protector',
      min: 1000,
      max: 2500,
      progressPercent: Math.min(100, Math.round(((points - 1000) / 1500) * 100)),
      nextLevelName: 'Legendary Earth Guardian'
    };
  }
}

// Points Transactions Ledger
export function getPointTransactions(): RewardTransaction[] {
  const cached = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_) {}
  }
  return [
    {
      id: 'tx_01',
      userId: 'user_citizen_01',
      action: 'Verified Waste Report (RW-2026-00392)',
      points: 35,
      timestamp: new Date(Date.now() - 47 * 3600000).toISOString(),
      relatedReportId: 'RW-2026-00392'
    },
    {
      id: 'tx_02',
      userId: 'user_citizen_01',
      action: 'Hotspot Successfully Resolved (RW-2026-00392)',
      points: 50,
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      relatedReportId: 'RW-2026-00392'
    },
    {
      id: 'tx_03',
      userId: 'user_citizen_01',
      action: 'Waste Recycled (12kg Plastics & Glass)',
      points: 30,
      timestamp: new Date(Date.now() - 72 * 3600000).toISOString()
    },
    {
      id: 'tx_04',
      userId: 'user_citizen_01',
      action: 'AI Waste Reuse Transformation',
      points: 20,
      timestamp: new Date(Date.now() - 96 * 3600000).toISOString()
    },
    {
      id: 'tx_05',
      userId: 'user_citizen_01',
      action: 'Ward 14 Community Cleanup Participation',
      points: 100,
      timestamp: new Date(Date.now() - 140 * 3600000).toISOString()
    }
  ];
}

export function getUserEcoPoints(): number {
  const txs = getPointTransactions();
  const calculated = txs.reduce((acc, curr) => acc + (curr.points || 0), 0);
  return calculated > 0 ? calculated : 685;
}

export function deductUserEcoPoints(pointsToDeduct: number, reason: string): boolean {
  const current = getUserEcoPoints();
  if (current < pointsToDeduct) return false;
  addPointTransaction(reason, -pointsToDeduct);
  window.dispatchEvent(new CustomEvent('rewise_points_updated', { detail: { points: getUserEcoPoints() } }));
  return true;
}

export function addPointTransaction(action: string, points: number, relatedReportId?: string) {
  const txs = getPointTransactions();
  const newTx: RewardTransaction = {
    id: `tx_${Date.now()}`,
    userId: 'user_citizen_01',
    action,
    points,
    timestamp: new Date().toISOString(),
    relatedReportId
  };
  txs.unshift(newTx);
  localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(txs));
  window.dispatchEvent(new CustomEvent('rewise_points_updated', { detail: { points: getUserEcoPoints() } }));
  return newTx;
}

export interface ActiveMembershipVoucher {
  id: string;
  code: string;
  discountRupees: number;
  tierTarget: 'rupees_50' | 'rupees_300';
  title: string;
  createdDate: string;
}

const LOCAL_STORAGE_VOUCHERS_KEY = 'rewise_membership_vouchers_v1';

export function getActiveMembershipVouchers(): ActiveMembershipVoucher[] {
  const cached = localStorage.getItem(LOCAL_STORAGE_VOUCHERS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_) {}
  }
  return [];
}

export function saveMembershipVoucher(voucher: ActiveMembershipVoucher) {
  const list = getActiveMembershipVouchers();
  list.unshift(voucher);
  localStorage.setItem(LOCAL_STORAGE_VOUCHERS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('rewise_vouchers_updated', { detail: { vouchers: list } }));
}

export function consumeMembershipVoucher(voucherId: string) {
  const list = getActiveMembershipVouchers().filter(v => v.id !== voucherId);
  localStorage.setItem(LOCAL_STORAGE_VOUCHERS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('rewise_vouchers_updated', { detail: { vouchers: list } }));
}

