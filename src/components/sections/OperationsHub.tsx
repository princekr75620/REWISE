import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Recycle, 
  Layers, 
  Factory, 
  MapPin, 
  Gauge, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Navigation, 
  Cpu, 
  Zap, 
  Sparkles, 
  Filter, 
  Download, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Box, 
  FileText,
  Radio,
  Check
} from 'lucide-react';
import { HoloCard } from '../ui/HoloCard';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { Language } from '../ui/LanguageSelector';
import { useTranslation } from '../../lib/translations';

interface OperationsHubProps {
  language?: Language;
}

type TabType = 'overview' | 'collection' | 'transportation' | 'segregation' | 'recycling';

interface PickupRequest {
  id: string;
  category: string;
  weight: string;
  location: string;
  urgency: 'Express (2h)' | 'Same Day' | 'Scheduled';
  status: 'Pending' | 'In Transit' | 'Collected' | 'Processed';
  time: string;
}

interface Vehicle {
  id: string;
  name: string;
  driver: string;
  status: 'In Transit' | 'Loading' | 'At Facility' | 'Standby';
  loadCapacity: string;
  currentLoad: string;
  zone: string;
  battery: number;
  eta: string;
  targetFacility: string;
}

interface SmartBin {
  id: string;
  location: string;
  material: string;
  fillLevel: number;
  status: 'Normal' | 'High' | 'Critical';
  lastEmptied: string;
}

interface SegregationStream {
  material: string;
  percentage: number;
  dailyTons: number;
  purity: number;
  color: string;
  status: string;
}

interface RecyclingFacility {
  id: string;
  name: string;
  type: string;
  capacityUsed: number;
  dailyProcessing: string;
  outputProduct: string;
  status: 'Operating Peak' | 'Optimal' | 'Maintenance';
  machines: { name: string; status: 'Online' | 'Standby' | 'Load Alert'; load: number }[];
}

const initialPickups: PickupRequest[] = [
  { id: 'REQ-9021', category: 'Plastics & PET Bottles', weight: '240 kg', location: 'Tech Zone 4, Block C, Gurgaon', urgency: 'Express (2h)', status: 'In Transit', time: '10:15 AM' },
  { id: 'REQ-9022', category: 'Electronic & PCB Scrap', weight: '85 kg', location: 'Cyber City Sector 29, Delhi NCR', urgency: 'Same Day', status: 'Pending', time: '11:00 AM' },
  { id: 'REQ-9023', category: 'Industrial Metal Shavings', weight: '520 kg', location: 'MIDC Phase II, Pune', urgency: 'Scheduled', status: 'Collected', time: '09:30 AM' },
  { id: 'REQ-9024', category: 'Discarded Denim & Textiles', weight: '310 kg', location: 'Textile Market Hub, Surat', urgency: 'Same Day', status: 'Pending', time: '11:45 AM' },
  { id: 'REQ-9025', category: 'Cullet & Glass Bottles', weight: '450 kg', location: 'Hospitality Belt, North Goa', urgency: 'Scheduled', status: 'Processed', time: '08:00 AM' },
];

const initialVehicles: Vehicle[] = [
  { id: 'EV-01', name: 'EcoHauler Alpha-01', driver: 'Rajesh Sharma', status: 'In Transit', loadCapacity: '5.0 Tons', currentLoad: '3.8 Tons', zone: 'North Ring Road (Zone A)', battery: 78, eta: '18 mins', targetFacility: 'Central Polymer Eco-Hub' },
  { id: 'EV-02', name: 'EcoHauler Beta-04', driver: 'Vikram Singh', status: 'Loading', loadCapacity: '3.5 Tons', currentLoad: '2.9 Tons', zone: 'Tech Park Sector 18 (Zone B)', battery: 92, eta: 'At Depot', targetFacility: 'Urban E-Waste Refiner' },
  { id: 'EV-03', name: 'HydroCargo Super-08', driver: 'Anita Desai', status: 'At Facility', loadCapacity: '8.0 Tons', currentLoad: '7.4 Tons', zone: 'Industrial Corridor (Zone C)', battery: 64, eta: 'Unloading', targetFacility: 'EcoMetals Smelting Plant' },
  { id: 'EV-04', name: 'UrbanTrike E-Collector 12', driver: 'Sunil Verma', status: 'In Transit', loadCapacity: '1.2 Tons', currentLoad: '0.9 Tons', zone: 'Commercial Market (Zone D)', battery: 85, eta: '12 mins', targetFacility: 'Central Polymer Eco-Hub' },
];

const smartBins: SmartBin[] = [
  { id: 'BIN-101', location: 'Civic Center Plaza - North', material: 'PET & Mixed Plastics', fillLevel: 94, status: 'Critical', lastEmptied: '22 hrs ago' },
  { id: 'BIN-102', location: 'IT Park Food Court Tower B', material: 'Aluminum Cans & Metal', fillLevel: 45, status: 'Normal', lastEmptied: '5 hrs ago' },
  { id: 'BIN-103', location: 'Electronics Commercial Complex', material: 'E-Waste & Batteries', fillLevel: 88, status: 'Critical', lastEmptied: '18 hrs ago' },
  { id: 'BIN-104', location: 'Metro Station Terminal 3', material: 'Paper & Cardboard', fillLevel: 62, status: 'High', lastEmptied: '10 hrs ago' },
];

const segregationStreams: SegregationStream[] = [
  { material: 'PET & Rigid Polymers', percentage: 41, dailyTons: 4.8, purity: 98.6, color: '#06b6d4', status: 'Optical AI Sorting Active' },
  { material: 'Ferrous & Non-Ferrous Metals', percentage: 26, dailyTons: 3.1, purity: 99.2, color: '#10b981', status: 'Magnetic Eddy Current Active' },
  { material: 'Electronic Circuitry & PCB', percentage: 16, dailyTons: 1.9, purity: 97.4, color: '#a855f7', status: 'XRF Spectrometry Active' },
  { material: 'Textiles & Natural Fibers', percentage: 11, dailyTons: 1.3, purity: 96.1, color: '#f59e0b', status: 'NIR Spectral Scan Active' },
  { material: 'Glass Cullet & Ceramics', percentage: 6, dailyTons: 0.7, purity: 99.0, color: '#38bdf8', status: 'Color Optical Divert Active' },
];

const recyclingFacilities: RecyclingFacility[] = [
  {
    id: 'FAC-01',
    name: 'Central Circular Polymer Eco-Hub',
    type: 'Plastic Extrusion & Granulation',
    capacityUsed: 86,
    dailyProcessing: '14.2 Tons / Day',
    outputProduct: 'rPET Grade-A Extrusion Pellets',
    status: 'Operating Peak',
    machines: [
      { name: 'Twin-Screw Continuous Extruder #1', status: 'Online', load: 88 },
      { name: 'Optical Flake Wash & Dryer Unit', status: 'Online', load: 92 },
      { name: 'Dual Shaft Hydraulic Shredder', status: 'Online', load: 76 },
    ]
  },
  {
    id: 'FAC-02',
    name: 'EcoMetals Precision Smelting Unit',
    type: 'Metal Refining & Ingot Casting',
    capacityUsed: 68,
    dailyProcessing: '8.5 Tons / Day',
    outputProduct: '99.8% Pure Recycled Aluminum Bars',
    status: 'Optimal',
    machines: [
      { name: 'Induction Tilting Furnace Alpha', status: 'Online', load: 74 },
      { name: 'Continuous Ingot Billet Caster', status: 'Online', load: 65 },
      { name: 'Heavy Scrap Shearing Press', status: 'Standby', load: 0 },
    ]
  },
  {
    id: 'FAC-03',
    name: 'Urban E-Waste Refiner & Recovery',
    type: 'Urban Mining & Hydrometallurgy',
    capacityUsed: 92,
    dailyProcessing: '3.8 Tons / Day',
    outputProduct: 'Recovered Copper, Gold & Clean Fibers',
    status: 'Operating Peak',
    machines: [
      { name: 'Automated PCB Desoldering Line', status: 'Online', load: 94 },
      { name: 'Chemical Leaching & Recovery Tank', status: 'Online', load: 89 },
      { name: 'Electrostatic Separator Unit', status: 'Online', load: 82 },
    ]
  },
  {
    id: 'FAC-04',
    name: 'Bio-Composite & Material Foundry',
    type: 'Upcycled Architectural Panels',
    capacityUsed: 54,
    dailyProcessing: '6.0 Tons / Day',
    outputProduct: 'Acoustic Wall Panels & Eco-Tiles',
    status: 'Optimal',
    machines: [
      { name: 'High-Pressure Hot Platen Press', status: 'Online', load: 58 },
      { name: 'Fiber Blending & Binder Injector', status: 'Online', load: 50 },
    ]
  }
];

export default function OperationsHub({ language = 'english' }: OperationsHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [pickups, setPickups] = useState<PickupRequest[]>(() => {
    const saved = localStorage.getItem('rewise_ops_pickups');
    return saved ? JSON.parse(saved) : initialPickups;
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('rewise_ops_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });
  const [bins, setBins] = useState<SmartBin[]>(smartBins);

  // New Pickup Modal Form State
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [newCategory, setNewCategory] = useState('Plastics & PET Bottles');
  const [newWeight, setNewWeight] = useState('150 kg');
  const [newLocation, setNewLocation] = useState('');
  const [newUrgency, setNewUrgency] = useState<'Express (2h)' | 'Same Day' | 'Scheduled'>('Same Day');

  // Dispatch Vehicle Modal State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]?.id || '');
  const [dispatchZone, setDispatchZone] = useState('South City Sector 55');
  const [dispatchFacility, setDispatchFacility] = useState('Central Circular Polymer Eco-Hub');

  // Log Segregation Batch State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchMaterial, setBatchMaterial] = useState('PET & Rigid Polymers');
  const [batchTons, setBatchTons] = useState('1.5');
  const [batchPurity, setBatchPurity] = useState('99.0');

  useEffect(() => {
    localStorage.setItem('rewise_ops_pickups', JSON.stringify(pickups));
  }, [pickups]);

  useEffect(() => {
    localStorage.setItem('rewise_ops_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const handleCreatePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    const newReq: PickupRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newCategory,
      weight: newWeight,
      location: newLocation.trim(),
      urgency: newUrgency,
      status: 'Pending',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPickups([newReq, ...pickups]);
    setShowPickupModal(false);
    setNewLocation('');

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#ffffff']
    });
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setVehicles(prev => prev.map(v => {
      if (v.id === selectedVehicle) {
        return {
          ...v,
          status: 'In Transit',
          zone: dispatchZone,
          targetFacility: dispatchFacility,
          eta: '15 mins'
        };
      }
      return v;
    }));
    setShowDispatchModal(false);
  };

  const handleEmptyBin = (binId: string) => {
    setBins(prev => prev.map(b => {
      if (b.id === binId) {
        return { ...b, fillLevel: 5, status: 'Normal', lastEmptied: 'Just now' };
      }
      return b;
    }));
  };

  const handleUpdatePickupStatus = (id: string, newStatus: PickupRequest['status']) => {
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const totalCollectedToday = pickups.reduce((acc, curr) => {
    const num = parseFloat(curr.weight) || 0;
    return acc + num;
  }, 1180);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
            <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
            <span>Circular Logistics & Operations Nexus</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-tight">
            Waste Operations <br />
            <span className="text-gradient">Command Dashboard</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl font-sans">
            End-to-end telemetry across waste collection routes, electric vehicle transport, AI optical segregation streams, and circular recycling center facilities.
          </p>
        </div>

        {/* Quick Action Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowPickupModal(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Pickup</span>
          </button>

          <button
            onClick={() => setShowDispatchModal(true)}
            className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Dispatch Fleet</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-premium p-6 rounded-2xl border border-cyan-500/20 space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono uppercase">
            <span>Collection Volume</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-display font-bold text-white">
            {(totalCollectedToday / 1000).toFixed(2)} <span className="text-sm font-mono text-cyan-400">Tons</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% vs yesterday
          </div>
        </div>

        <div className="glass-premium p-6 rounded-2xl border border-emerald-500/20 space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono uppercase">
            <span>Active EV Fleet</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-display font-bold text-white">
            {vehicles.filter(v => v.status === 'In Transit').length} / {vehicles.length} <span className="text-sm font-mono text-emerald-400">Active</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <Zap className="w-3 h-3" /> 100% Zero-Emission Fleet
          </div>
        </div>

        <div className="glass-premium p-6 rounded-2xl border border-purple-500/20 space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono uppercase">
            <span>Sorting Purity</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-display font-bold text-white">
            98.8% <span className="text-sm font-mono text-purple-400">AI Accuracy</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" /> 1.2% Contamination Divert
          </div>
        </div>

        <div className="glass-premium p-6 rounded-2xl border border-amber-500/20 space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono uppercase">
            <span>Recycling Throughput</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-display font-bold text-white">
            32.5 <span className="text-sm font-mono text-amber-400">Tons / Day</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 4 Facilities Operational
          </div>
        </div>
      </div>

      {/* Main Navigation Segment Control */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-full sm:w-fit">
        {[
          { id: 'overview', label: '📊 Unified Overview', icon: Gauge },
          { id: 'collection', label: '🚛 Waste Collection', icon: Box },
          { id: 'transportation', label: '📍 Fleet Transportation', icon: Truck },
          { id: 'segregation', label: '🔬 AI Segregation', icon: Layers },
          { id: 'recycling', label: '🏭 Recycling Centers', icon: Factory },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer",
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Unified Overview (Shows Snapshot of all 4 pillars) */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Operations Flow Pipeline Diagram */}
          <div className="glass-premium p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-display font-bold text-white tracking-tight">Circular Value Chain Status</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time synchronized stages from waste generation to industrial circular output</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 uppercase font-bold w-fit">
                Live Synchronization: Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div 
                onClick={() => setActiveTab('collection')}
                className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex justify-between items-center">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">01</span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">Collection</span>
                </div>
                <h4 className="text-base font-display font-bold text-white group-hover:text-cyan-300 transition-colors">Smart Bins & Pickups</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{pickups.length} scheduled requests across 4 municipal sectors.</p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                  <span>Manage Bins</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Step 2 */}
              <div 
                onClick={() => setActiveTab('transportation')}
                className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex justify-between items-center">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">02</span>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">Transit</span>
                </div>
                <h4 className="text-base font-display font-bold text-white group-hover:text-emerald-300 transition-colors">Electric Fleet Logistics</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">4 EV haulers in active corridor routing with zero tailpipe emissions.</p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span>Track Fleet</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => setActiveTab('segregation')}
                className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex justify-between items-center">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs flex items-center justify-center font-bold">03</span>
                  <span className="text-[10px] font-mono text-purple-400 uppercase">Sorting</span>
                </div>
                <h4 className="text-base font-display font-bold text-white group-hover:text-purple-300 transition-colors">AI Optical Stream</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Multi-spectrum infrared classification achieving 98.8% purity.</p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-purple-400">
                  <span>View Streams</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Step 4 */}
              <div 
                onClick={() => setActiveTab('recycling')}
                className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex justify-between items-center">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs flex items-center justify-center font-bold">04</span>
                  <span className="text-[10px] font-mono text-amber-400 uppercase">Refining</span>
                </div>
                <h4 className="text-base font-display font-bold text-white group-hover:text-amber-300 transition-colors">Recycling Centers</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">4 specialized plants producing certified circular secondary raw materials.</p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-amber-400">
                  <span>Center Ops</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Dual Panels: Urgent Bins & Live Transit Vehicles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Urgent Bins Alert */}
            <div className="glass-premium p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-mono font-bold uppercase text-white">Smart Bins Needing Attention</h4>
                </div>
                <button 
                  onClick={() => setActiveTab('collection')}
                  className="text-xs font-mono text-cyan-400 hover:underline"
                >
                  View All ({bins.length})
                </button>
              </div>

              <div className="space-y-3">
                {bins.slice(0, 3).map((bin) => (
                  <div key={bin.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{bin.location}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase",
                          bin.status === 'Critical' ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-cyan-500/20 text-cyan-300"
                        )}>
                          {bin.fillLevel}% FULL
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{bin.material} • Last checked {bin.lastEmptied}</p>
                    </div>

                    <button
                      onClick={() => handleEmptyBin(bin.id)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold shrink-0 cursor-pointer"
                    >
                      Empty Bin
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Fleet Dispatches */}
            <div className="glass-premium p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-mono font-bold uppercase text-white">Live Transport Fleet Status</h4>
                </div>
                <button 
                  onClick={() => setActiveTab('transportation')}
                  className="text-xs font-mono text-cyan-400 hover:underline"
                >
                  Fleet Map
                </button>
              </div>

              <div className="space-y-3">
                {vehicles.slice(0, 3).map((v) => (
                  <div key={v.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{v.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {v.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{v.driver} • Zone: {v.zone}</p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-cyan-300 block">{v.currentLoad}</span>
                      <span className="text-[9px] text-slate-500 uppercase">ETA {v.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Waste Collection Management */}
      {activeTab === 'collection' && (
        <div className="space-y-8">
          {/* Header & New Request Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-display font-bold text-white">Waste Collection & Pickup System</h3>
              <p className="text-xs text-slate-400 font-mono">Municipal bin telemetry, on-demand scheduled pickups, and route collection queues.</p>
            </div>

            <button
              onClick={() => setShowPickupModal(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer w-fit"
            >
              <Plus className="w-4 h-4" /> Book New Pickup
            </button>
          </div>

          {/* Smart Bin Telemetry Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Smart Municipal & Enterprise Bins (Real-Time Sensor Telemetry)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bins.map((bin) => (
                <div key={bin.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{bin.id}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase",
                        bin.status === 'Critical' ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse" : "bg-emerald-500/20 text-emerald-300"
                      )}>
                        {bin.status}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white font-sans line-clamp-1">{bin.location}</h5>
                    <p className="text-xs text-slate-400 font-mono">{bin.material}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Fill Level</span>
                      <span className={cn("font-bold", bin.fillLevel > 80 ? "text-rose-400" : "text-cyan-400")}>{bin.fillLevel}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-500", bin.fillLevel > 80 ? "bg-rose-500" : "bg-cyan-400")}
                        style={{ width: `${bin.fillLevel}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleEmptyBin(bin.id)}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    Dispatch Collection & Reset
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Request Manifest Table */}
          <div className="glass-premium rounded-3xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-400" />
                Active Pickup Requests & Scheduled Hauls ({pickups.length})
              </h4>
              <span className="text-[10px] font-mono text-slate-400">STATUS UPDATE REVERSIBLE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500 uppercase text-[10px]">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Material Category</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">Pickup Location</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pickups.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-cyan-300">{p.id}</td>
                      <td className="py-3.5 px-4 text-white font-sans">{p.category}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">{p.weight}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-sans max-w-xs truncate">{p.location}</td>
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                          p.urgency === 'Express (2h)' ? "bg-rose-500/20 text-rose-300" : "bg-cyan-500/20 text-cyan-300"
                        )}>
                          {p.urgency}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={p.status}
                          onChange={(e) => handleUpdatePickupStatus(p.id, e.target.value as any)}
                          className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Collected">Collected</option>
                          <option value="Processed">Processed</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {p.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Transportation & Fleet Logistics */}
      {activeTab === 'transportation' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-display font-bold text-white">Electric Transport Fleet & Logistics</h3>
              <p className="text-xs text-slate-400 font-mono">Live route tracking, payload capacity optimization, and zero-emission delivery pipelines.</p>
            </div>

            <button
              onClick={() => setShowDispatchModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer w-fit"
            >
              <Navigation className="w-4 h-4" /> Dispatch Hauler Unit
            </button>
          </div>

          {/* Fleet Vehicle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => (
              <div key={v.id} className="glass-premium p-6 rounded-3xl border border-white/10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <h4 className="text-lg font-display font-bold text-white">{v.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">DRIVER: <span className="text-white font-bold">{v.driver}</span></p>
                  </div>

                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase",
                    v.status === 'In Transit' ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" :
                    v.status === 'Loading' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                    "bg-emerald-500/20 text-emerald-300"
                  )}>
                    {v.status}
                  </span>
                </div>

                {/* Fleet Metrics Bento */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-center">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Current Load</span>
                    <span className="text-sm font-bold text-cyan-300">{v.currentLoad}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">EV Battery</span>
                    <span className="text-sm font-bold text-emerald-400">{v.battery}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Estimated ETA</span>
                    <span className="text-sm font-bold text-amber-300">{v.eta}</span>
                  </div>
                </div>

                {/* Route Target */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Current Corridor
                    </span>
                    <span className="text-white font-bold">{v.zone}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Factory className="w-3.5 h-3.5 text-emerald-400" /> Target Destination
                    </span>
                    <span className="text-cyan-300 font-bold">{v.targetFacility}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-white/5 flex gap-3">
                  <button 
                    onClick={() => {
                      setVehicles(prev => prev.map(item => item.id === v.id ? { ...item, status: 'At Facility', eta: 'Arrived' } : item));
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    Confirm Facility Arrival
                  </button>
                  <button 
                    onClick={() => {
                      setVehicles(prev => prev.map(item => item.id === v.id ? { ...item, status: 'In Transit', eta: '20 mins' } : item));
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold cursor-pointer"
                  >
                    Re-Route
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Segregation & AI Sorting Stream */}
      {activeTab === 'segregation' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-display font-bold text-white">AI Optical & Material Segregation Stream</h3>
              <p className="text-xs text-slate-400 font-mono">Infrared spectrometry, robotic sorting arms, and automated contaminant rejection.</p>
            </div>

            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer w-fit"
            >
              <Plus className="w-4 h-4" /> Log Incoming Batch Test
            </button>
          </div>

          {/* Real-time Material Fraction Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-premium p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <h4 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Active Material Stream Separation & Purity
              </h4>

              <div className="space-y-5">
                {segregationStreams.map((stream, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stream.color }} />
                        <span className="font-bold text-white">{stream.material}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">{stream.dailyTons} Tons/day ({stream.percentage}%)</span>
                        <span className="text-emerald-400 font-bold">{stream.purity}% Purity</span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${stream.percentage * 2}%`, backgroundColor: stream.color }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 block">{stream.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Diagnostics Panel */}
            <div className="glass-premium p-6 md:p-8 rounded-3xl border border-purple-500/20 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase">
                  <Cpu className="w-4 h-4" />
                  Optical Scanner Telemetry
                </div>
                <h5 className="text-xl font-display font-bold text-white">Neural Sorter Alpha-9</h5>
                
                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500">CONVEYOR SPEED</span>
                    <span className="font-bold text-white">1.8 m/sec</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500">ITEMS DETECTED</span>
                    <span className="font-bold text-cyan-400">4,280 / hour</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500">REJECT DIVERTER</span>
                    <span className="font-bold text-rose-400">1.2% Contaminants</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500">AI MODEL VERSION</span>
                    <span className="font-bold text-emerald-400">v4.2-NeuralSpectra</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300">
                ✨ Auto-calibration active. Next diagnostic scheduled in 45 minutes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Recycling Center Management */}
      {activeTab === 'recycling' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-display font-bold text-white">Recycling Center & Processing Facility Ops</h3>
              <p className="text-xs text-slate-400 font-mono">Plant capacity load, extrusion & smelting machinery telemetry, and industrial dispatch output.</p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>4 Processing Plants Active</span>
            </div>
          </div>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recyclingFacilities.map((fac) => (
              <div key={fac.id} className="glass-premium p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-amber-400" />
                      <h4 className="text-lg font-display font-bold text-white">{fac.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{fac.type}</p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {fac.status}
                  </span>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Plant Capacity Utilization</span>
                    <span className="font-bold text-cyan-400">{fac.capacityUsed}% ({fac.dailyProcessing})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full"
                      style={{ width: `${fac.capacityUsed}%` }}
                    />
                  </div>
                </div>

                {/* Machinery Telemetry */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Machinery Equipment Telemetry</span>
                  <div className="space-y-1.5">
                    {fac.machines.map((m, i) => (
                      <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-sans">{m.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">{m.load}% load</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                            m.status === 'Online' ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                          )}>
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Output Produced */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">Circular Output Ready for Manufacturing:</span>
                  <p className="text-xs font-bold text-white font-sans">{fac.outputProduct}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Schedule Pickup */}
      <AnimatePresence>
        {showPickupModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPickupModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-premium rounded-3xl p-6 sm:p-8 border border-cyan-500/30 text-white space-y-6 z-10"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase">
                  <Box className="w-4 h-4" /> Waste Collection Booking
                </div>
                <h3 className="text-2xl font-display font-bold text-white">Schedule On-Demand Pickup</h3>
              </div>

              <form onSubmit={handleCreatePickup} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px]">Material Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Plastics & PET Bottles">Plastics & PET Bottles</option>
                    <option value="Electronic & PCB Scrap">Electronic & PCB Scrap</option>
                    <option value="Industrial Metal Shavings">Industrial Metal Shavings</option>
                    <option value="Discarded Denim & Textiles">Discarded Denim & Textiles</option>
                    <option value="Cullet & Glass Bottles">Cullet & Glass Bottles</option>
                    <option value="Paper & Packaging Waste">Paper & Packaging Waste</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px]">Estimated Weight</label>
                    <input
                      type="text"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="e.g. 200 kg"
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px]">Urgency Window</label>
                    <select
                      value={newUrgency}
                      onChange={(e) => setNewUrgency(e.target.value as any)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Express (2h)">Express (2h)</option>
                      <option value="Same Day">Same Day</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px]">Pickup Address / Geolocation</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Enter complete address or landmark"
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPickupModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold uppercase cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    Confirm & Dispatch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Dispatch Vehicle */}
      <AnimatePresence>
        {showDispatchModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDispatchModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-premium rounded-3xl p-6 sm:p-8 border border-emerald-500/30 text-white space-y-6 z-10"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                  <Truck className="w-4 h-4" /> Logistics Controller
                </div>
                <h3 className="text-2xl font-display font-bold text-white">Dispatch Transport Hauler</h3>
              </div>

              <form onSubmit={handleDispatch} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px]">Select Vehicle</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.driver} - {v.status})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px]">Assigned Source Collection Corridor</label>
                  <input
                    type="text"
                    value={dispatchZone}
                    onChange={(e) => setDispatchZone(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px]">Target Recycling Plant</label>
                  <select
                    value={dispatchFacility}
                    onChange={(e) => setDispatchFacility(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                  >
                    {recyclingFacilities.map(f => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    Launch Transit Run
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Log Segregation Batch Test */}
      <AnimatePresence>
        {showBatchModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBatchModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-premium rounded-3xl p-6 sm:p-8 border border-purple-500/30 text-white space-y-6 z-10"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase">
                  <Layers className="w-4 h-4" /> Optical Sorter Batch Test
                </div>
                <h3 className="text-2xl font-display font-bold text-white">Log Segregation Stream Batch</h3>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setShowBatchModal(false);
                confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
              }} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px]">Material Fraction</label>
                  <select
                    value={batchMaterial}
                    onChange={(e) => setBatchMaterial(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                  >
                    {segregationStreams.map((s, idx) => (
                      <option key={idx} value={s.material}>{s.material}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px]">Batch Weight (Tons)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={batchTons}
                      onChange={(e) => setBatchTons(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px]">Purity Target (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      max="100"
                      value={batchPurity}
                      onChange={(e) => setBatchPurity(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold uppercase cursor-pointer shadow-lg shadow-purple-500/20"
                  >
                    Save & Test Batch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
