import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle, 
  HelpCircle, 
  ArrowRight, 
  X, 
  Zap, 
  Sparkles, 
  Loader2, 
  Trash2, 
  RotateCcw, 
  User, 
  ArrowLeft,
  AlertTriangle,
  Flame,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { 
  getSubscriptionState, 
  subscribeToSubscription, 
  purchaseSubscription, 
  resetUsageLimits, 
  UserSubscription, 
  SubscriptionTier 
} from '../../lib/subscription';
import { HoloCard } from '../ui/HoloCard';
import confetti from 'canvas-confetti';

export default function Subscription() {
  const [subscription, setSubscription] = useState<UserSubscription>(getSubscriptionState());
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  
  // Form checkout state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Workflow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [recentTransaction, setRecentTransaction] = useState<any | null>(null);

  // Subscribe to core subscription state
  useEffect(() => {
    const unsubscribe = subscribeToSubscription((sub) => {
      setSubscription(sub);
    });
    return () => unsubscribe();
  }, []);

  // Format Card Number (space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  // Format CVV
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanNum = cardNumber.replace(/\D/g, '');
    const isAmex = /^3[47]/.test(cleanNum);
    const limit = isAmex ? 4 : 3;
    const value = e.target.value.replace(/\D/g, '').slice(0, limit);
    setCvv(value);
  };

  const startCheckout = (tier: SubscriptionTier) => {
    if (tier === 'free') {
      // Downgrade or Reset back to Free
      if (confirm("Are you sure you want to revert to the Free Tier? This will restore standard counts.")) {
        resetUsageLimits();
        confetti({
          particleCount: 30,
          spread: 30
        });
      }
      return;
    }
    setSelectedPlan(tier);
    setFormError(null);
  };

  // Card brand details and Luhn algorithms
  const checkLuhn = (num: string): boolean => {
    const clean = num.replace(/\D/g, '');
    if (!clean || clean.length < 13) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const getCardBrandName = (num: string): string => {
    const clean = num.replace(/\D/g, '');
    if (/^4/.test(clean)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    if (/^3[47]/.test(clean)) return 'AMEX';
    if (/^(6011|65|64[4-9]|622)/.test(clean)) return 'DISCOVER';
    if (/^(30[0-5]|36|38)/.test(clean)) return 'DINERS CLUB';
    if (/^(352[89]|35[3-8][0-9])/.test(clean)) return 'JCB';
    if (/^(508[5-9]|606[1-9]|607[0-9]|608[0-5]|652[1-2]|653[0-1])/.test(clean)) return 'RUPAY';
    return 'UNKNOWN';
  };

  const isExpiryDateValid = (expiryStr: string): boolean => {
    if (!/^\d{2}\/\d{2}$/.test(expiryStr)) return false;
    const [mStr, yStr] = expiryStr.split('/');
    const month = parseInt(mStr, 10);
    const year = parseInt(`20${yStr}`, 10);
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    const currentYear = now.getFullYear();
    
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Dynamic Validations
    if (!cardName.trim()) {
      setFormError("Cardholder Name is required.");
      return;
    }
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 16) {
      setFormError("Card number must be between 13 and 16 digits.");
      return;
    }

    // Luhn validation check
    if (!checkLuhn(cleanCard)) {
      setFormError("❌ Card Checksum Error: Invalid card number (failed the Luhn/Mod 10 verification algorithm). Please type a real debit/credit card number.");
      return;
    }

    if (!isExpiryDateValid(expiry)) {
      setFormError("❌ Expiration Error: Expiry date MM/YY must be a valid future or current month, and format must be MM/YY.");
      return;
    }

    const brand = getCardBrandName(cleanCard);
    const expectedCvvLength = brand === 'AMEX' ? 4 : 3;
    if (cvv.length !== expectedCvvLength) {
      setFormError(`❌ Security Code Error: CVV code must be exactly ${expectedCvvLength} digits for ${brand} cards.`);
      return;
    }

    // Begin premium transaction simulation
    setIsProcessing(true);
    const steps = [
      "Contacting secure payment broker nodes...",
      `Routing through ${brand} transaction gateway...`,
      "Generating asymmetric credential key pairs...",
      "Validating card index signatures...",
      "Settling ledger nodes and writing subscriptions..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      if (!selectedPlan) return;
      const amount = selectedPlan === 'rupees_50' ? '₹50' : '₹300';
      const duration = selectedPlan === 'rupees_50' ? 'Monthly Access' : '1 Year Access';
      
      const newSub = await purchaseSubscription(selectedPlan, `Credit / Debit Card (${brand})`, cardName, cleanCard);
      
      const txHash = `TX-${Math.floor(100000 + Math.random() * 900000)}-RW`;
      const receipt = {
        txHash,
        amount,
        duration,
        planName: selectedPlan === 'rupees_50' ? 'Basic Orbit Tier' : 'Star Voyager Annual Tier',
        date: new Date().toLocaleString(),
        cardEnding: cleanCard.slice(-4),
        cardholder: cardName
      };

      setRecentTransaction(receipt);
      setIsProcessing(false);
      setShowReceipt(true);

      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#06b6d4', '#10b981', '#ffffff']
      });

    } catch (err: any) {
      setFormError(err.message || "Payment protocol aborted during bank handoff.");
      setIsProcessing(false);
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setSelectedPlan(null);
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
  };

  return (
    <div className="space-y-12 py-4">
      {/* Dynamic Header */}
      <div className="space-y-4">
        <div className="text-cyan-400 font-mono text-[10px] tracking-[0.5em] uppercase flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>// SUBSCRIPTION_MEMBERSHIP_SUITE</span>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold tracking-tighter uppercase font-display">
          Elevate Your <span className="text-gradient">Experience.</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-4xl font-sans">
          Manage your circular account credentials. Swap subscription layers smoothly. Enjoy limited sandbox testing, or purchase persistent unlimited access bounds across chatbot channels and visual image recognition shards.
        </p>
      </div>

      {/* Usage Analytics Panel */}
      <div className="grid md:grid-cols-3 gap-6">
        <HoloCard className="p-6 border-white/5 bg-slate-900/30 flex flex-col justify-between space-y-4 col-span-1">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Current Credentials</span>
            <h4 className="text-lg font-bold font-display uppercase text-white tracking-wide">
              {subscription.tier === 'free' ? 'Free Sandbox Plan' : 
               subscription.tier === 'rupees_50' ? 'Basic Orbit Tier' : 'Star Voyager Annual'}
            </h4>
          </div>
          {subscription.tier === 'free' ? (
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-300 font-sans leading-relaxed">
              You are using limited trial allowances. Image scans and AI chats are capped at 5 requests each.
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-400 font-sans leading-relaxed flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full, Unlimited premium access active across all systems.</span>
            </div>
          )}
        </HoloCard>

        {/* Scan Usage Progress Bar */}
        <HoloCard className="p-6 border-white/5 bg-slate-900/30 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Image Recognition</span>
              <h4 className="text-lg font-bold font-display uppercase text-white tracking-wide">Visual Scan Index</h4>
            </div>
            <span className="text-xs font-mono font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg">
              {subscription.tier === 'free' ? `${subscription.scansUsed} / 5` : 'UNLIMITED'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 rounded-full bg-slate-850 overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: subscription.tier === 'free' ? `${(subscription.scansUsed / 5) * 100}%` : '100%' }}
                className={`h-full ${subscription.tier === 'free' ? 'bg-amber-400' : 'bg-emerald-400'}`}
              />
            </div>
            {subscription.tier === 'free' && (
              <span className="text-[9px] font-mono text-slate-500 block uppercase">
                {5 - subscription.scansUsed} trials remaining
              </span>
            )}
          </div>
        </HoloCard>

        {/* Chatbot Usage Progress Bar */}
        <HoloCard className="p-6 border-white/5 bg-slate-900/30 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Neural Assistant</span>
              <h4 className="text-lg font-bold font-display uppercase text-white tracking-wide">AI Chat Sandbox</h4>
            </div>
            <span className="text-xs font-mono font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg">
              {subscription.tier === 'free' ? `${subscription.chatsUsed} / 5` : 'UNLIMITED'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 rounded-full bg-slate-850 overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: subscription.tier === 'free' ? `${(subscription.chatsUsed / 5) * 100}%` : '100%' }}
                className={`h-full ${subscription.tier === 'free' ? 'bg-amber-400' : 'bg-emerald-400'}`}
              />
            </div>
            {subscription.tier === 'free' && (
              <span className="text-[9px] font-mono text-slate-500 block uppercase">
                {5 - subscription.chatsUsed} messages remaining
              </span>
            )}
          </div>
        </HoloCard>
      </div>

      {/* PLANS SELECTION CARDS */}
      <div className="grid md:grid-cols-3 gap-8 pt-4">
        {/* Tier 1: Free */}
        <HoloCard className={`p-8 border-white/5 bg-[#070e1b] flex flex-col justify-between space-y-8 relative ${subscription.tier === 'free' ? 'ring-2 ring-slate-500/30' : ''}`}>
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Sandbox Access</span>
              <h3 className="text-3xl font-display font-semibold text-white uppercase tracking-wider">Free Starter</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Explore the foundational concepts of our circular metrics with basic quota bounds.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-5xl font-display font-bold text-white">₹0</span>
              <span className="text-xs text-slate-500 font-mono"> / lifetime limits</span>
            </div>

            <ul className="space-y-3.5 border-t border-white/5 pt-6 text-xs text-slate-300 font-sans">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Limit of 5 times scan images</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Limit of 5 times chatbot messages</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Basic waste material breakdown</span>
              </li>
            </ul>
          </div>

          <button 
            disabled={subscription.tier === 'free'}
            onClick={() => startCheckout('free')}
            className={`w-full py-3.5 text-center font-display rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${
              subscription.tier === 'free' 
                ? 'bg-slate-800/10 text-slate-600 border border-slate-700/10 cursor-not-allowed'
                : 'bg-white/5 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer'
            }`}
          >
            {subscription.tier === 'free' ? 'Current Tier Is Free Sandbox' : 'Downgrade to Sandbox'}
          </button>
        </HoloCard>

        {/* Tier 2: ₹50 / Month */}
        <HoloCard className={`p-8 border-cyan-500/15 bg-gradient-to-b from-[#06b6d4]/5 to-transparent flex flex-col justify-between space-y-8 relative overflow-hidden ${
          subscription.tier === 'rupees_50' ? 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : ''
        }`}>
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-mono font-bold text-cyan-400 uppercase tracking-widest animate-pulse">
            <Flame className="w-2.5 h-2.5 text-cyan-400" />
            <span>Popular</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block">Boundless Orbit</span>
              <h3 className="text-3xl font-display font-semibold text-white uppercase tracking-wider">Basic Orbit</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                Unlock fully persistent unchained parameters. No usage barriers whatsoever.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-5xl font-display font-bold text-white">₹50</span>
              <span className="text-xs text-slate-500 font-mono"> / monthly cycle</span>
            </div>

            <ul className="space-y-3.5 border-t border-white/5 pt-6 text-xs text-slate-300 font-sans">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold text-cyan-400">Unlimited scan images</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold text-cyan-400">Unlimited chatbot messages</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Priority algorithmic pipeline</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Gmail communications integration</span>
              </li>
            </ul>
          </div>

          <button 
            disabled={subscription.tier === 'rupees_50'}
            onClick={() => startCheckout('rupees_50')}
            className={`w-full py-4 text-center font-display rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              subscription.tier === 'rupees_50'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20'
                : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
            }`}
          >
            {subscription.tier === 'rupees_50' ? 'Subscription is Active' : 'Acquire Orbit Tier'}
          </button>
        </HoloCard>

        {/* Tier 3: ₹300 / 1 Year */}
        <HoloCard className={`p-8 border-emerald-500/15 bg-gradient-to-b from-[#10b981]/5 to-transparent flex flex-col justify-between space-y-8 relative overflow-hidden ${
          subscription.tier === 'rupees_300' ? 'ring-2 ring-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''
        }`}>
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
            <Clock className="w-2.5 h-2.5 text-emerald-400" />
            <span>Best Value</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block">Hyperion Node</span>
              <h3 className="text-3xl font-display font-semibold text-white uppercase tracking-wider">Star Voyager</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                Maximum economy plan. Zero interruptions with 12 full months of pre-allocated bounds.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-white">₹300</span>
                <span className="text-xs text-slate-500 font-mono"> / 1 year</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">SAVE ₹300 OVER MONTHLY</span>
            </div>

            <ul className="space-y-3.5 border-t border-white/5 pt-6 text-xs text-slate-300 font-sans">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-400">Unlimited scan images</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-400">Unlimited chatbot messages</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated client-side priority</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unrestricted system design tools</span>
              </li>
            </ul>
          </div>

          <button 
            disabled={subscription.tier === 'rupees_300'}
            onClick={() => startCheckout('rupees_300')}
            className={`w-full py-4 text-center font-display rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              subscription.tier === 'rupees_300'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-[#10b981] text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
            }`}
          >
            {subscription.tier === 'rupees_300' ? 'Annual Subscription is Active' : 'Acquire Star Voyager'}
          </button>
        </HoloCard>
      </div>

      {/* CHECKOUT MODAL FLOW */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl glass-premium rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-2xl bg-[#091122] overflow-hidden"
            >
              {/* Back Button / Title */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <h3 className="text-sm font-display font-bold uppercase tracking-widest text-white leading-none">
                    Configure Gateway Payment
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center mb-6">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold leading-none mb-1">Selected Plan coordinate</span>
                  <span className="text-xs text-white font-bold block">
                    {selectedPlan === 'rupees_50' ? 'Basic Orbit Tier (Monthly Option)' : 'Star Voyager Annual (1 Year Option)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold leading-none mb-1">Total Due</span>
                  <span className="text-lg text-cyan-400 font-bold block">
                    {selectedPlan === 'rupees_50' ? '₹50' : '₹300'}
                  </span>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 font-sans text-xs">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-mono text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">Cardholder Holder Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Prince Kumar"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">Card Number Coordinate</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-20 text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono tracking-wider"
                    />
                    <div className="absolute right-3.5 top-3.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-cyan-400">
                      {getCardBrandName(cardNumber)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">Expiry Target</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono text-center"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">Security CVV Code</label>
                    <input 
                      type="password" 
                      placeholder={cardNumber.replace(/\D/g, '').startsWith('34') || cardNumber.replace(/\D/g, '').startsWith('37') ? "••••" : "•••"}
                      maxLength={cardNumber.replace(/\D/g, '').startsWith('34') || cardNumber.replace(/\D/g, '').startsWith('37') ? 4 : 3}
                      value={cvv}
                      onChange={handleCvvChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono text-center"
                      id="cvv_input_field"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5" /> Secure TLS Handshake
                  </span>

                  <button 
                    type="submit"
                    className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] cursor-pointer"
                  >
                    Transmit Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* PROCESSING SIMULATOR MODAL */}
        {isProcessing && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xs w-full text-center space-y-4"
            >
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 animate-pulse">Running Transaction Protocol</h4>
              <p className="text-[10px] text-slate-500 font-sans italic">{processingStep}</p>
            </motion.div>
          </div>
        )}

        {/* DIGITAL RECEIPT CONFIRMATION MODAL */}
        {showReceipt && recentTransaction && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-sm w-full glass-premium border-emerald-500/20 p-8 rounded-[2.5rem] bg-[#050d18] text-center space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400" />
              
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-display font-bold uppercase text-white tracking-widest">
                  Transmission Success
                </h4>
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  Credentials Authenticated
                </p>
              </div>

              {/* Digital Check Design layout */}
              <div className="text-left bg-black/40 rounded-2xl p-4 space-y-3 font-mono text-[10px] border border-white/5 leading-relaxed text-slate-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">LEDGER TX:</span>
                  <span className="text-white font-bold">{recentTransaction.txHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CONTRACT:</span>
                  <span className="text-cyan-400 font-bold">{recentTransaction.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TERMS:</span>
                  <span className="text-slate-200">{recentTransaction.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CREDENTIALS:</span>
                  <span className="text-slate-200">Ending •••• {recentTransaction.cardEnding}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ISSUER:</span>
                  <span className="text-slate-200">{recentTransaction.cardholder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FUNDS REMITTED:</span>
                  <span className="text-emerald-400 font-bold">{recentTransaction.amount}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Thank you for your active participation. Your premium access constraints have been lifted globally. Enjoy unchained circular analysis tools.
              </p>

              <button 
                onClick={closeReceipt}
                className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-display font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer"
              >
                Engage Premium Node
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
