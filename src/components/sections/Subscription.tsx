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
  HeartHandshake,
  Gift,
  Tag,
  Check
} from 'lucide-react';
import { 
  getSubscriptionState, 
  subscribeToSubscription, 
  purchaseSubscription, 
  resetUsageLimits, 
  UserSubscription, 
  SubscriptionTier 
} from '../../lib/subscription';
import { 
  getUserEcoPoints, 
  deductUserEcoPoints, 
  getActiveMembershipVouchers, 
  consumeMembershipVoucher,
  ActiveMembershipVoucher
} from '../../services/reports';
import { HoloCard } from '../ui/HoloCard';
import confetti from 'canvas-confetti';

export default function Subscription() {
  const [subscription, setSubscription] = useState<UserSubscription>(getSubscriptionState());
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [ecoPoints, setEcoPoints] = useState<number>(getUserEcoPoints());
  const [activeVouchers, setActiveVouchers] = useState<ActiveMembershipVoucher[]>(getActiveMembershipVouchers());
  
  // Eco Discount State
  const [usePointsDiscount, setUsePointsDiscount] = useState<boolean>(true);
  const [selectedPointsToUse, setSelectedPointsToUse] = useState<number>(0);
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<ActiveMembershipVoucher | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<{ text: string; isError: boolean } | null>(null);

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

  // Subscribe to core subscription state & Eco Points updates
  useEffect(() => {
    const unsubscribe = subscribeToSubscription((sub) => {
      setSubscription(sub);
    });

    const updatePoints = () => {
      setEcoPoints(getUserEcoPoints());
      setActiveVouchers(getActiveMembershipVouchers());
    };

    window.addEventListener('rewise_points_updated', updatePoints);
    window.addEventListener('rewise_vouchers_updated', updatePoints);

    return () => {
      unsubscribe();
      window.removeEventListener('rewise_points_updated', updatePoints);
      window.removeEventListener('rewise_vouchers_updated', updatePoints);
    };
  }, []);

  // Set default points to use whenever a plan is selected
  useEffect(() => {
    if (!selectedPlan || selectedPlan === 'free') {
      setSelectedPointsToUse(0);
      setAppliedVoucher(null);
      setVoucherMessage(null);
      return;
    }

    const basePrice = selectedPlan === 'rupees_50' ? 50 : 300;
    // Calculate suggested points: 10 pts = ₹1 discount. Max points = basePrice * 10
    const maxPointsForFullPlan = basePrice * 10; // 500 for Orbit, 3000 for Voyager
    const affordablePoints = Math.min(ecoPoints, maxPointsForFullPlan);

    // If user has saved vouchers for this plan, check for best auto-match
    const matchingVoucher = activeVouchers.find(v => v.tierTarget === selectedPlan);
    if (matchingVoucher) {
      setAppliedVoucher(matchingVoucher);
      setSelectedPointsToUse(0);
    } else if (affordablePoints >= 250 && selectedPlan === 'rupees_50') {
      setSelectedPointsToUse(affordablePoints >= 500 ? 500 : 250);
    } else if (affordablePoints >= 600 && selectedPlan === 'rupees_300') {
      setSelectedPointsToUse(affordablePoints >= 1200 ? 1200 : 600);
    } else {
      setSelectedPointsToUse(affordablePoints > 0 ? affordablePoints : 0);
    }
  }, [selectedPlan, ecoPoints, activeVouchers]);

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
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };

  // Pricing Calculations with Discounts
  const basePlanPrice = selectedPlan === 'rupees_50' ? 50 : selectedPlan === 'rupees_300' ? 300 : 0;
  
  // Points discount calculation: 10 pts = ₹1 discount (or special presets: 250pts = ₹25, 500pts = ₹50, 600pts = ₹100, 1200pts = ₹300)
  let pointsDiscountRupees = 0;
  if (usePointsDiscount && selectedPointsToUse > 0) {
    if (selectedPlan === 'rupees_50') {
      if (selectedPointsToUse >= 500) pointsDiscountRupees = 50;
      else if (selectedPointsToUse >= 250) pointsDiscountRupees = 25;
      else pointsDiscountRupees = Math.floor(selectedPointsToUse / 10);
    } else if (selectedPlan === 'rupees_300') {
      if (selectedPointsToUse >= 1200) pointsDiscountRupees = 300;
      else if (selectedPointsToUse >= 600) pointsDiscountRupees = 100;
      else pointsDiscountRupees = Math.floor(selectedPointsToUse / 10);
    } else {
      pointsDiscountRupees = Math.floor(selectedPointsToUse / 10);
    }
  }

  const voucherDiscountRupees = appliedVoucher ? appliedVoucher.discountRupees : 0;
  const totalDiscount = Math.min(basePlanPrice, pointsDiscountRupees + voucherDiscountRupees);
  const finalPriceDue = Math.max(0, basePlanPrice - totalDiscount);
  const isFullyEcoFunded = finalPriceDue === 0;

  const handleApplyVoucherCode = (codeToApply?: string) => {
    const code = (codeToApply || voucherCodeInput).trim().toUpperCase();
    if (!code) return;

    if (code === 'ECOFREE' || code === 'ECO100FREE') {
      setAppliedVoucher({
        id: 'code_free',
        code,
        discountRupees: basePlanPrice,
        tierTarget: selectedPlan === 'rupees_300' ? 'rupees_300' : 'rupees_50',
        title: 'Special Promo: 100% Free Access',
        createdDate: new Date().toLocaleDateString()
      });
      setVoucherMessage({ text: '🎉 100% Discount Voucher applied successfully!', isError: false });
      return;
    }

    if (code === 'ECO25' || code.includes('ECO-25')) {
      setAppliedVoucher({
        id: 'code_25',
        code,
        discountRupees: 25,
        tierTarget: 'rupees_50',
        title: 'Promo Voucher: ₹25 Off',
        createdDate: new Date().toLocaleDateString()
      });
      setVoucherMessage({ text: '✅ ₹25 Discount Voucher applied!', isError: false });
      return;
    }

    if (code === 'ECO100' || code.includes('ECO-100')) {
      setAppliedVoucher({
        id: 'code_100',
        code,
        discountRupees: 100,
        tierTarget: 'rupees_300',
        title: 'Promo Voucher: ₹100 Off',
        createdDate: new Date().toLocaleDateString()
      });
      setVoucherMessage({ text: '✅ ₹100 Discount Voucher applied!', isError: false });
      return;
    }

    const saved = activeVouchers.find(v => v.code.toUpperCase() === code);
    if (saved) {
      setAppliedVoucher(saved);
      setVoucherMessage({ text: `✅ Applied: ${saved.title} (-₹${saved.discountRupees})`, isError: false });
      return;
    }

    setVoucherMessage({ text: '❌ Invalid or expired coupon code.', isError: true });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedPlan) return;

    // IF 100% Eco Funded with 0 Rupees Due
    if (isFullyEcoFunded) {
      setIsProcessing(true);
      setProcessingStep("Validating Eco Points proof of civic action...");
      await new Promise(resolve => setTimeout(resolve, 600));
      setProcessingStep("Redeeming points against civic treasury ledger...");
      await new Promise(resolve => setTimeout(resolve, 600));
      setProcessingStep("Writing persistent subscription credentials...");
      await new Promise(resolve => setTimeout(resolve, 600));

      try {
        // Deduct points if points were used
        if (usePointsDiscount && selectedPointsToUse > 0) {
          deductUserEcoPoints(
            selectedPointsToUse, 
            `Eco Points Redeemed for 100% Discount on ${selectedPlan === 'rupees_50' ? 'Basic Orbit Tier' : 'Star Voyager Annual Tier'}`
          );
        }

        if (appliedVoucher && !appliedVoucher.id.startsWith('code_')) {
          consumeMembershipVoucher(appliedVoucher.id);
        }

        const duration = selectedPlan === 'rupees_50' ? 'Monthly Access (100% Eco-Funded)' : '1 Year Access (100% Eco-Funded)';
        await purchaseSubscription(
          selectedPlan, 
          `REWISE Civic Eco Points (100% Discount: ₹${basePlanPrice} Saved)`, 
          cardName.trim() || 'Verified Eco Citizen', 
          'ECO-POINTS-FREE'
        );

        const txHash = `TX-${Math.floor(100000 + Math.random() * 900000)}-ECO`;
        const receipt = {
          txHash,
          amount: '₹0 (100% Eco-Points Funded)',
          savedAmount: `₹${basePlanPrice} Saved via Points & Vouchers`,
          duration,
          planName: selectedPlan === 'rupees_50' ? 'Basic Orbit Tier' : 'Star Voyager Annual Tier',
          date: new Date().toLocaleString(),
          cardEnding: 'ECO-REWARDS',
          cardholder: cardName.trim() || 'Civic Sustainability Contributor'
        };

        setRecentTransaction(receipt);
        setIsProcessing(false);
        setShowReceipt(true);

        confetti({
          particleCount: 160,
          spread: 80,
          colors: ['#06b6d4', '#10b981', '#ffffff']
        });
        return;
      } catch (err: any) {
        setFormError(err.message || "Eco points redemption aborted.");
        setIsProcessing(false);
        return;
      }
    }

    // Standard or Partial Discount Card Payment Validation
    if (!cardName.trim()) {
      setFormError("Cardholder Name is required.");
      return;
    }
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 16) {
      setFormError("Card number must be between 13 and 16 digits.");
      return;
    }

    if (!checkLuhn(cleanCard)) {
      setFormError("❌ Card Checksum Error: Invalid card number (failed the Luhn verification). Please type a valid card number.");
      return;
    }

    if (!isExpiryDateValid(expiry)) {
      setFormError("❌ Expiration Error: Expiry date MM/YY must be a valid future or current month, format MM/YY.");
      return;
    }

    const brand = getCardBrandName(cleanCard);
    const expectedCvvLength = brand === 'AMEX' ? 4 : 3;
    if (cvv.length !== expectedCvvLength) {
      setFormError(`❌ Security Code Error: CVV code must be exactly ${expectedCvvLength} digits for ${brand} cards.`);
      return;
    }

    // Begin payment simulation with discounted final price
    setIsProcessing(true);
    const steps = [
      "Contacting secure payment broker nodes...",
      `Applying Eco Points Discount (-₹${totalDiscount})...`,
      `Routing net ₹${finalPriceDue} through ${brand} gateway...`,
      "Settling ledger nodes and writing subscriptions..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 700));
    }

    try {
      // Deduct used points
      if (usePointsDiscount && selectedPointsToUse > 0) {
        deductUserEcoPoints(
          selectedPointsToUse, 
          `Eco Points Redeemed for Discount on ${selectedPlan === 'rupees_50' ? 'Basic Orbit' : 'Star Voyager'}`
        );
      }

      if (appliedVoucher && !appliedVoucher.id.startsWith('code_')) {
        consumeMembershipVoucher(appliedVoucher.id);
      }

      const duration = selectedPlan === 'rupees_50' ? 'Monthly Access' : '1 Year Access';
      await purchaseSubscription(
        selectedPlan, 
        `Card (${brand}) + Eco Points Discount (Saved ₹${totalDiscount})`, 
        cardName, 
        cleanCard
      );
      
      const txHash = `TX-${Math.floor(100000 + Math.random() * 900000)}-RW`;
      const receipt = {
        txHash,
        amount: `₹${finalPriceDue} (Saved ₹${totalDiscount} via Eco Points)`,
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
          Manage your circular account credentials. Swap subscription layers smoothly. Use your earned <strong>REWISE Eco Points</strong> to unlock exclusive discounts or get 100% free monthly & annual subscriptions!
        </p>
      </div>

      {/* SPECIAL CIVIC REWARDS DISCOUNT HIGHLIGHT BAR */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-cyan-950/80 border border-emerald-500/30 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shrink-0 text-emerald-400">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
              <span>Civic Eco Points Balance:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-white font-bold">{ecoPoints.toLocaleString()} PTS</span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5">
              You can apply your points for <strong>up to 100% discount</strong> on both Basic Orbit & Star Voyager annual tiers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-teal-300 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20 font-medium">
            10 Eco PTS = ₹1 Discount
          </span>
        </div>
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

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-white">₹50</span>
                <span className="text-xs text-slate-500 font-mono"> / monthly cycle</span>
              </div>
              
              {/* Eco Points Discount Helper Tag */}
              <div className="pt-2">
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1 font-bold">
                  <Gift className="w-3 h-3 text-emerald-400" /> 
                  {ecoPoints >= 500 ? 'FREE with 500 Eco Points' : ecoPoints >= 250 ? '₹25 with 250 Eco Points (50% Off)' : 'Eco Points Discount Eligible'}
                </span>
              </div>
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
            {subscription.tier === 'rupees_50' ? 'Subscription is Active' : 'Acquire Orbit Tier (Discount Eligible)'}
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

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-white">₹300</span>
                <span className="text-xs text-slate-500 font-mono"> / 1 year</span>
              </div>
              
              {/* Eco Points Discount Helper Tag */}
              <div className="pt-2">
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1 font-bold">
                  <Gift className="w-3 h-3 text-emerald-400" /> 
                  {ecoPoints >= 1200 ? 'FREE 1-Year with 1200 Eco Points' : ecoPoints >= 600 ? '₹200 with 600 Eco Points (₹100 Off)' : 'Eco Points Discount Eligible'}
                </span>
              </div>
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
            {subscription.tier === 'rupees_300' ? 'Annual Subscription is Active' : 'Acquire Star Voyager (Discount Eligible)'}
          </button>
        </HoloCard>
      </div>

      {/* CHECKOUT MODAL FLOW WITH ECO POINTS DISCOUNT */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg glass-premium rounded-2xl p-4 sm:p-5 border border-white/10 shadow-2xl bg-[#091122] max-h-[92vh] flex flex-col my-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                      Checkout & Rewards
                    </h3>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {selectedPlan === 'rupees_50' ? 'Basic Orbit (Monthly)' : 'Star Voyager (1 Year)'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Container for Compact Form */}
              <div className="overflow-y-auto pr-1 space-y-3 custom-scrollbar text-xs">
                {/* Compact Price Summary Bar */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {selectedPlan === 'rupees_50' ? 'Basic Orbit Tier' : 'Star Voyager Annual'}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">₹{basePlanPrice}</span>
                    </div>
                    {totalDiscount > 0 ? (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Gift className="w-3 h-3" /> Eco Discount: -₹{totalDiscount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Standard Price</span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Net Payable</span>
                    <span className={`text-base font-display font-bold leading-tight ${isFullyEcoFunded ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {isFullyEcoFunded ? '₹0 (FREE)' : `₹${finalPriceDue}`}
                    </span>
                  </div>
                </div>

                {/* Compact Eco Points Redemption Box */}
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                        Use Eco Points
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {ecoPoints} PTS
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={usePointsDiscount} 
                        onChange={(e) => setUsePointsDiscount(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {usePointsDiscount && (
                    <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-emerald-500/15">
                      <button
                        type="button"
                        onClick={() => setSelectedPointsToUse(0)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all ${
                          selectedPointsToUse === 0 
                            ? 'bg-white/15 text-white border border-white/20' 
                            : 'bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        None
                      </button>

                      {selectedPlan === 'rupees_50' ? (
                        <>
                          <button
                            type="button"
                            disabled={ecoPoints < 250}
                            onClick={() => setSelectedPointsToUse(250)}
                            className={`py-1.5 px-1.5 rounded-lg text-[10px] font-medium transition-all ${
                              selectedPointsToUse === 250 
                                ? 'bg-emerald-500 text-slate-950 font-bold' 
                                : ecoPoints >= 250 
                                  ? 'bg-slate-900/90 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10' 
                                  : 'bg-slate-900/30 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            250 Pts (-₹25)
                          </button>
                          <button
                            type="button"
                            disabled={ecoPoints < 500}
                            onClick={() => setSelectedPointsToUse(500)}
                            className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              selectedPointsToUse === 500 
                                ? 'bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20' 
                                : ecoPoints >= 500 
                                  ? 'bg-slate-900/90 text-teal-300 border border-teal-500/30 hover:bg-teal-500/10' 
                                  : 'bg-slate-900/30 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            500 Pts (FREE)
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={ecoPoints < 600}
                            onClick={() => setSelectedPointsToUse(600)}
                            className={`py-1.5 px-1.5 rounded-lg text-[10px] font-medium transition-all ${
                              selectedPointsToUse === 600 
                                ? 'bg-emerald-500 text-slate-950 font-bold' 
                                : ecoPoints >= 600 
                                  ? 'bg-slate-900/90 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10' 
                                  : 'bg-slate-900/30 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            600 Pts (-₹100)
                          </button>
                          <button
                            type="button"
                            disabled={ecoPoints < 1200}
                            onClick={() => setSelectedPointsToUse(1200)}
                            className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              selectedPointsToUse === 1200 
                                ? 'bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20' 
                                : ecoPoints >= 1200 
                                  ? 'bg-slate-900/90 text-teal-300 border border-teal-500/30 hover:bg-teal-500/10' 
                                  : 'bg-slate-900/30 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            1200 Pts (FREE)
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Compact Promo Code Input Row */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                    <span>Promo Voucher</span>
                    {appliedVoucher && (
                      <button 
                        type="button" 
                        onClick={() => { setAppliedVoucher(null); setVoucherMessage(null); }}
                        className="text-rose-400 hover:underline text-[9px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      placeholder="e.g. ECO25, ECO100, ECOFREE"
                      value={voucherCodeInput}
                      onChange={(e) => setVoucherCodeInput(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyVoucherCode()}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold font-mono transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {voucherMessage && (
                    <p className={`text-[10px] ${voucherMessage.isError ? 'text-rose-400' : 'text-emerald-400'} font-medium`}>
                      {voucherMessage.text}
                    </p>
                  )}
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-3 font-sans">
                  {formError && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-mono text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* IF 100% DISCOUNT: Compact Banner */}
                  {isFullyEcoFunded ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>100% Free Eco Activation</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Zero payment required. Covered fully by your civic points & rewards!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold mb-1">Cardholder Name</label>
                          <input 
                            type="text" 
                            placeholder="Prince Kumar"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold mb-1">Card Number</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="4000 1234 5678 9010"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 pr-14 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                            />
                            <div className="absolute right-2 top-2 text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-white/10 text-cyan-400">
                              {getCardBrandName(cardNumber)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold mb-1">Expiry (MM/YY)</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={handleExpiryChange}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono text-center"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold mb-1">CVV Code</label>
                          <input 
                            type="password" 
                            placeholder={cardNumber.replace(/\D/g, '').startsWith('34') || cardNumber.replace(/\D/g, '').startsWith('37') ? "••••" : "•••"}
                            maxLength={cardNumber.replace(/\D/g, '').startsWith('34') || cardNumber.replace(/\D/g, '').startsWith('37') ? 4 : 3}
                            value={cvv}
                            onChange={handleCvvChange}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono text-center"
                            id="cvv_input_field"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                    <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3 text-cyan-400" /> Secure 256-bit TLS
                    </span>

                    <button 
                      type="submit"
                      className={`px-5 py-2.5 font-display font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-md cursor-pointer ${
                        isFullyEcoFunded 
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-emerald-500/20' 
                          : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
                      }`}
                    >
                      {isFullyEcoFunded ? `Activate Free (₹0)` : `Pay ₹${finalPriceDue}`}
                    </button>
                  </div>
                </form>
              </div>
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
                  <span className="text-slate-200">{recentTransaction.cardEnding}</span>
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
                Thank you for your active participation in civic circularity. Your premium access constraints have been lifted globally. Enjoy unchained circular analysis tools.
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
