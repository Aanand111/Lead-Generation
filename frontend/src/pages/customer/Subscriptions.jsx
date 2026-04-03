import React, { useState, useEffect } from 'react';
import {  
    CreditCard, Check, Zap, Gem, Star, ShieldCheck, 
    TrendingUp, ArrowRight, Activity, Clock, Target, 
    Layers, Crown, Rocket, Info, ChevronRight,
    ExternalLink, Gift, Wallet, Package, History as HistoryIcon, AlertCircle, CheckCircle, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';

const UserSubscriptions = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [purchasing, setPurchasing] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        panNumber: ''
    });

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/user/subscription-plans');
            if (data.success) {
                setPlans(data.data);
                // Dynamically set first category as default if available
                if (data.data.length > 0) {
                    const firstCat = data.data[0].category ? data.data[0].category.toUpperCase() : 'LEADS';
                    setSelectedCategory(firstCat);
                }
            }
        } catch (err) {
            console.error("Failed to fetch plans", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const { data } = await api.get('/user/profile');
            if (data.success && data.data) {
                const profile = data.data;
                setUserDetails({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    address: profile.address || ''
                });
            }
        } catch (err) {
            console.error("Profile fetch failed", err);
        }
    };

    useEffect(() => {
        fetchPlans();
        fetchUserProfile();
    }, []);

    // Get unique categories from plans dynamically
    const categories = Array.from(new Set(plans.map(p => (p.category || 'LEADS').toUpperCase())));
    
    // Filter plans (Case-insensitive)
    const filteredPlans = plans.filter(p => (p.category || 'LEADS').toUpperCase() === selectedCategory);

    const initiatePurchase = (plan) => {
        setSelectedPlan(plan);
        setShowForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setPurchasing(selectedPlan.id);
        
        try {
            // 1. Create Razorpay Order
            const { data: orderData } = await api.post('/user/subscription/create-order', {
                planId: selectedPlan.id,
                ...userDetails
            });

            if (!orderData.success) throw new Error("Order creation failed");

            // 2. Open Razorpay Window
            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Lead Network Protocol",
                description: `Activating ${selectedPlan.name}`,
                order_id: orderData.order_id,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment
                        const { data: verifyData } = await api.post('/user/subscription/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyData.success) {
                            setMessage({ type: 'success', text: `Access Granted: ${verifyData.message}` });
                            setShowForm(false);
                            // Refresh plans or user status
                            fetchPlans();
                        }
                    } catch (err) {
                        setMessage({ type: 'error', text: 'Verification Sequence Critical Failure.' });
                    }
                },
                prefill: {
                    name: userDetails.name,
                    email: userDetails.email,
                    contact: userDetails.phone
                },
                theme: { color: "#6366f1" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                setMessage({ type: 'error', text: 'Payment Rejected: ' + response.error.description });
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Initialization failure. Check Uplink.' });
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Subscription Tier Matrix</h2>
                    <p>Select a credit-driven plan to scale your acquisition capacity within the lead network</p>
                </div>
                <div className="pageHeaderActions flex items-center gap-4">
                    <div className="bg-amber-500/5 border border-amber-500/10 px-6 py-3 rounded-2xl flex items-center gap-4 group hover:bg-amber-500/10 transition-all cursor-default">
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Yield Booster</div>
                        <div className="flex items-center gap-2">
                             <Crown size={16} fill="currentColor" className="text-amber-500" />
                            <span className="text-xl font-black text-amber-500 tabular-nums">VIP Status</span>
                        </div>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`mb-10 p-6 rounded-[2rem] flex items-center gap-4 transition-all animate-slide-up border ${
                    message.type === 'error' ? 'bg-red-50/10 text-red-500 border-red-500/20' : 'bg-emerald-50/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                }`}>
                    {message.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                    <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
                {categories.map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-10 py-4 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl border cursor-pointer italic ${
                            selectedCategory === cat 
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-[var(--primary-glow)] scale-110' 
                            : 'bg-[var(--surface-color)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-indigo-500 hover:text-indigo-500 shadow-sm'
                        }`}
                    >
                        {cat} SPECTRUM
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {loading ? (
                    <div className="col-span-full py-40 text-center">
                        <div className="spinner mb-4 mx-auto"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Syncing Financial Core...</span>
                    </div>
                ) : filteredPlans.length > 0 ? (
                    filteredPlans.map((plan, idx) => (
                        <div key={plan.id} className={`card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] group hover:-translate-y-4 transition-all duration-500 flex flex-col rounded-[3rem] relative ${idx === 1 ? 'ring-2 ring-indigo-500/30' : ''}`}>
                            {idx === 1 && (
                                <div className="absolute top-0 right-10 -translate-y-1/2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 z-10 italic">OPTIMAL YIELD</div>
                            )}
                            
                            <div className="p-10 border-b border-[var(--border-color)] bg-[var(--bg-color)]/20 relative group-hover:bg-indigo-500/5 transition-colors">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 ${
                                    idx === 0 ? 'bg-amber-500/10 text-amber-500' : idx === 1 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-rose-500/10 text-rose-500'
                                }`}>
                                    {idx === 0 ? <Zap size={28} /> : idx === 1 ? <Rocket size={28} /> : <Crown size={28} />}
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-2">{plan.name || `${selectedCategory} ${idx + 1}`}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums">₹{plan.price}</span>
                                    <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">/ activation</span>
                                </div>
                            </div>

                            <div className="p-10 flex-1 flex flex-col space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-[var(--bg-color)]/50 p-5 rounded-2xl border border-[var(--border-color)] group-hover:border-indigo-500/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">
                                            <Layers size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Lead Capture Capacity</div>
                                            <div className="text-lg font-black text-[var(--text-dark)] uppercase leading-none">{plan.lead_limit || 0} Nodes</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-[var(--bg-color)]/50 p-5 rounded-2xl border border-[var(--border-color)] group-hover:border-indigo-500/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
                                            <Wallet size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Wallet Credits</div>
                                            <div className="text-lg font-black text-[var(--text-dark)] uppercase leading-none">{plan.credits || 0} Digital Tokens</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-[var(--bg-color)]/50 p-5 rounded-2xl border border-[var(--border-color)] group-hover:border-indigo-500/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                                            <ImageIcon size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Poster Generation</div>
                                            <div className="text-lg font-black text-[var(--text-dark)] uppercase leading-none">{plan.poster_limit || 0} Sessions</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-[var(--bg-color)]/50 p-5 rounded-2xl border border-[var(--border-color)] group-hover:border-indigo-500/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Validity Period</div>
                                            <div className="text-lg font-black text-[var(--text-dark)] uppercase leading-none">{plan.validity_days || 30} Earth Days</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2 px-1">Infrastructure Perks</div>
                                    <div className="space-y-3">
                                        {['High-Priority Scans', 'Studio Creator Access', 'Global Referral Protocol', 'Lead Expiry Protection'].map(perk => (
                                            <div key={perk} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                                <span className="text-[11px] font-black text-[var(--text-dark)]/80 uppercase tracking-wider italic">{perk}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-[var(--border-color)]">
                                    <button 
                                        onClick={() => initiatePurchase(plan)}
                                        disabled={purchasing === plan.id}
                                        className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all duration-300 active:translate-y-1 ${
                                        idx === 1 
                                        ? 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-105' 
                                        : 'bg-[var(--bg-color)] text-[var(--text-dark)] border border-[var(--border-color)] hover:bg-[var(--primary)] hover:text-white'
                                    } ${purchasing === plan.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}>
                                        {purchasing === plan.id ? <RefreshCcw className="animate-spin mx-auto" size={18} /> : 'Activate Protocol'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-[3rem]">
                        <div className="flex flex-col items-center gap-6">
                            <CreditCard size={84} strokeWidth={1} />
                            <p className="font-black uppercase tracking-[0.4em] text-xs italic">Plan registry is currently being synchronized</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-20 p-12 rounded-[4rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 text-indigo-500/10 -rotate-12 transition-transform duration-700 group-hover:rotate-0">
                    <HistoryIcon size={160} />
                </div>
                <div className="relative z-10 max-w-xl">
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-4">Need Custom Capacity?</h3>
                    <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed mb-8 opacity-80">
                        Our enterprise extraction servers can be custom configured for high-volume lead capture. Contact the neural network admin for a personalized extraction protocol.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="px-6 py-3 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center gap-3">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dark)] italic">Encrypted Checkout</span>
                        </div>
                        <div className="px-6 py-3 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center gap-3">
                            <Zap size={18} className="text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dark)] italic">Instant Activation</span>
                        </div>
                    </div>
                </div>
                <button className="bg-[var(--surface-color)] text-[var(--text-dark)] px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl border border-[var(--border-color)] hover:border-indigo-500 transition-all flex items-center gap-3 hover:scale-105 active:scale-95 cursor-pointer relative z-10">
                    Contact Architecture Desk <ExternalLink size={18} />
                </button>
            </div>

            {/* Payment Verification Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-color)]/80 backdrop-blur-3xl animate-fade-in">
                    <div className="w-full max-w-xl bg-[var(--surface-color)] rounded-[3rem] border border-[var(--border-color)] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-10 border-b border-[var(--border-color)] bg-indigo-500/5">
                            <h3 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                <CreditCard className="text-indigo-500" />
                                Payment Verification Details
                            </h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Required for secure transaction processing</p>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Activation Target Name</label>
                                    <input 
                                        type="text" required
                                        value={userDetails.name}
                                        onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                                        className="w-full p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-[11px] font-bold focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Communication Node (Email)</label>
                                    <input 
                                        type="email" required
                                        value={userDetails.email}
                                        onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                                        className="w-full p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-[11px] font-bold focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Contact Uplink (Phone)</label>
                                    <input 
                                        type="tel" required
                                        value={userDetails.phone}
                                        onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                                        className="w-full p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-[11px] font-bold focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2 col-span-full">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Neural Identifier (PAN - Optional)</label>
                                    <input 
                                        type="text"
                                        value={userDetails.panNumber}
                                        onChange={(e) => setUserDetails({...userDetails, panNumber: e.target.value.toUpperCase()})}
                                        placeholder="ABCDE1234F"
                                        className="w-full p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-[11px] font-bold focus:border-indigo-500 outline-none uppercase placeholder:opacity-30"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-[var(--border-color)]">
                                <button 
                                    type="button" 
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-5 rounded-[2rem] bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                                >
                                    Abort
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={purchasing}
                                    className="flex-[2] py-5 rounded-[2rem] bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {purchasing ? <RefreshCcw className="animate-spin" size={16} /> : <>Initialize Gateway <ArrowRight size={16} /></>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSubscriptions;
