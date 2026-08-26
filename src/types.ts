export type WasteCategory = 
  | 'Plastic' 
  | 'Paper' 
  | 'Glass' 
  | 'Metal' 
  | 'Organic' 
  | 'E-Waste' 
  | 'Mixed Waste' 
  | 'Hazardous' 
  | 'Other';

export type ReportSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReportStatus = 'Reported' | 'AI Verified' | 'Assigned' | 'Action Taken' | 'Resolved' | 'Rejected';

export interface TimelineEvent {
  status: ReportStatus;
  timestamp: string;
  note?: string;
  actor?: string;
}

export interface AIReportAnalysis {
  wasteType: string;
  estimatedSeverity: ReportSeverity;
  containsWaste: boolean;
  environmentalRisk: 'Low' | 'Medium' | 'High' | 'Severe';
  confidence: number;
  detectedItems: string[];
  summary: string;
}

export interface WasteReportLocation {
  address: string;
  city: string;
  zone?: string;
  lat: number;
  lng: number;
}

export interface WasteReport {
  id: string; // e.g. RW-2026-00421
  userId: string;
  userName?: string;
  image: string;
  category: WasteCategory;
  description: string;
  severity: ReportSeverity;
  location: WasteReportLocation;
  aiAnalysis?: AIReportAnalysis;
  status: ReportStatus;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  resolutionNote?: string;
  resolutionImage?: string;
  pointsEarned: number;
  isDuplicate?: boolean;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  action: string;
  points: number;
  timestamp: string;
  relatedReportId?: string;
}

export interface UserBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar?: string;
  ecoPoints: number;
  reportsSubmitted: number;
  reportsResolved: number;
  wasteRecycledKg: number;
  badgesCount: number;
  level: string;
}

export interface RewardRedemptionItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'Certificate' | 'Pass' | 'Tree' | 'Badge' | 'Coupon' | 'Membership';
  icon: string;
  discountRupees?: number;
  membershipTierTarget?: 'rupees_50' | 'rupees_300';
  redeemed?: boolean;
}

export interface BlueprintItem {
  id?: string;
  title: string;
  originalMaterial: string;
  concept?: string;
  description?: string;
  difficulty: string;
  estimatedCost: string;
  materials: string[];
  steps: string[];
  vibe?: string;
  impact?: string;
  dimensions?: string;
  toolsRequired?: string[];
  blueprintCode?: string;
  videoTutorialTarget?: string;
}

export interface WasteIdea {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  materialsNeeded: string[];
  steps: string[];
  estimatedCost: string;
  videoTutorialTarget: string;
}

export interface ScanResult {
  itemName: string;
  material: string;
  confidence: number;
  reuseIdeas: WasteIdea[];
  sustainabilityScore: number;
  impactReduction: string;
}
