import React, { useState, useEffect } from 'react';
import {  
    CreditCard, Check, Zap, Gem, Star, ShieldCheck, 
    TrendingUp, ArrowRight, Activity, Clock, Target, 
    Layers, Crown, Rocket, Info, ChevronRight,
    ExternalLink, Gift, Wallet, Package, History as HistoryIcon, AlertCircle, CheckCircle, RefreshCcw, Image as ImageIcon,
    Sparkles, Lock, MousePointer2, X
} from 'lucide-react';
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
                    name: profile.full_name || profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    address: profile.address || '',
                    panNumber: profile.pan_number || ''
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

    const categories = Array.from(new Set(plans.map(p => (p.category || 'LEADS').toUpperCase())));
    const filteredPlans = plans.filter(p => (p.category || 'LEADS').toUpperCase() === selectedCategory);

    const initiatePurchase = (plan) => {
        setSelectedPlan(plan);
        setShowForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setPurchasing(selectedPlan.id);
        try {
            const { data: orderData } = await api.post('/user/subscription/create-order', {
                planId: selectedPlan.id,
                ...userDetails
            });
            if (!orderData.success) throw new Error("Order creation failed");

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "LeadGen Network Protocol",
                description: `Activating ${selectedPlan.name}`,
                order_id: orderData.order_id,
                handler: async (response) => {
                    try {
                        const { data: verifyData } = await api.post('/user/subscription/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        if (verifyData.success) {
                            setMessage({ type: 'success', text: `Success: ${verifyData.message}` });
                            setShowForm(false);
                            fetchPlans();
                        }
                    } catch (err) {
                        setMessage({ type: 'error', text: 'Synchronization Failed.' });
                    }
                },
                prefill: { name: userDetails.name, email: userDetails.email, contact: userDetails.phone },
                theme: { color: "#6366f1" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                setMessage({ type: 'error', text: 'Transaction Rejected.' });
            });
            rzp.open();
        } catch (err) {
            setMessage({ type: 'error', text: 'Payment Initialization Failed.' });
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="page-content animate-fade-in space-y-12 pb-20">
            {/* --- Premium Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Financial Console</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest italic">
                            <Crown size={12} fill="currentColor" /> Authorized Tier: Premium
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-[0.9]">
                        Service <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-royal-blue to-emerald-500">Acquisition</span>
                    </h1>
                    <p className="mt-6 text-sm md:text-base text-[var(--text-muted)] font-medium max-w-lg leading-relaxed italic">
                        Select an operational blueprint to scale your lead generation activities. Instant activation upon verification.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-[var(--surface-color)] p-1.5 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl flex items-center gap-4 pr-8 group cursor-default">
                         <div className="w-14 h-14 rounded-[2rem] bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                            <ShieldCheck size={24} />
                         </div>
                         <div>
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 opacity-70">Security Protocol</div>
                            <div className="text-2xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-none">
                                ENCRYPTED
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* --- Status Message --- */}
            {message.text && (
                <div className={`p-6 rounded-[2rem] border-2 backdrop-blur-xl flex items-center gap-5 animate-slide-up ${
                    message.type === 'error' ? 'bg-rose-500/5 text-rose-600 border-rose-500/10' : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                }`}>
                    <div className="w-10 h-10 rounded-2xl bg-current/10 flex items-center justify-center">
                        {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{message.text}</span>
                </div>
            )}

            {/* --- Category Switcher --- */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4 relative z-10">
                {categories.map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-12 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-xl border cursor-pointer italic ${
                            selectedCategory === cat 
                            ? 'bg-black text-white border-black scale-110 shadow-2xl' 
                            : 'bg-[var(--surface-color)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-indigo-500 hover:text-indigo-500'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* --- Plans Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                {loading ? (
                    [1,2,3].map(i => (
                        <div key={i} className="bg-[var(--surface-color)] rounded-[4rem] p-12 h-[600px] border border-[var(--border-color)] animate-pulse flex flex-col justify-between">
                            <div className="space-y-8">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem]"></div>
                                <div className="h-10 bg-slate-50 rounded-full w-3/4"></div>
                                <div className="h-6 bg-slate-50 rounded-full w-1/2"></div>
                                <div className="space-y-4">
                                    {[1,2,3,4].map(j => <div key={j} className="h-4 bg-slate-50 rounded-full w-full"></div>)}
                                </div>
                            </div>
                            <div className="h-16 bg-slate-50 rounded-[2rem] w-full"></div>
                        </div>
                    ))
                ) : filteredPlans.length > 0 ? (
                    filteredPlans.map((plan, idx) => (
                        <div key={plan.id} className={`group relative bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[4rem] shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] transition-all duration-700 flex flex-col overflow-hidden ${idx === 1 ? 'md:-translate-y-6 md:scale-105 border-indigo-500/20' : ''}`}>
                            
                            {idx === 1 && (
                                <div className="absolute top-0 right-14 -translate-y-1/2 px-6 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl z-20 italic">Recommended</div>
                            )}

                            <div className="p-12 pb-10 border-b border-slate-50 bg-gradient-to-br from-slate-50/50 to-transparent relative">
                                <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-500 ${
                                    idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-indigo-600 text-white' : 'bg-rose-100 text-rose-600'
                                }`}>
                                    {idx === 0 ? <Zap size={32} /> : idx === 1 ? <Rocket size={32} /> : <Crown size={32} />}
                                </div>
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-4">{plan.name}</h3>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums">₹{plan.price}</span>
                                    <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-50">One-Time Asset</span>
                                </div>
                            </div>

                            <div className="p-12 space-y-10 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-500/10 transition-all">
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">Capacity</div>
                                        <div className="text-lg font-black text-[var(--text-dark)] uppercase leading-none">{plan.lead_limit} Leads</div>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-500/10 transition-all">
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">Credits</div>
                                        <div className="text-lg font-black text-[var(--text-dark)] uppercase leading-none">{plan.credits} CR</div>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-500/10 transition-all">
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">Creative</div>
                                        <div className="text-lg font-black text-[var(--text-dark)] uppercase leading-none">{plan.poster_limit} Posters</div>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-500/10 transition-all">
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">Horizon</div>
                                        <div className="text-lg font-black text-[var(--text-dark)] uppercase leading-none">{plan.validity_days} Days</div>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {['Premium Dashboard Access', 'Live Market Updates', 'Priority Data Delivery', 'Secure Cloud Archiving'].map(perk => (
                                        <div key={perk} className="flex items-center gap-4 group/perk">
                                            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg group-hover/perk:scale-125 transition-transform">
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                            <span className="text-[11px] font-black text-[var(--text-dark)] uppercase tracking-widest italic opacity-70 group-hover/perk:opacity-100 transition-opacity">{perk}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-10">
                                    <button 
                                        onClick={() => initiatePurchase(plan)}
                                        disabled={purchasing === plan.id}
                                        className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl transition-all duration-500 active:scale-95 flex items-center justify-center gap-3 ${
                                        idx === 1 
                                        ? 'bg-black text-white hover:bg-indigo-600' 
                                        : 'bg-[var(--surface-color)] text-[var(--text-dark)] border border-[var(--border-color)] hover:bg-black hover:text-white'
                                    } ${purchasing === plan.id ? 'opacity-30 cursor-wait' : 'cursor-pointer'}`}>
                                        {purchasing === plan.id ? <RefreshCcw className="animate-spin" size={20} /> : <>Initialize Acquisition <ArrowRight size={18} /></>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center rounded-[4rem] bg-[var(--surface-color)] border border-[var(--border-color)] opacity-20">
                         <CreditCard size={84} strokeWidth={1} className="mx-auto mb-6" />
                         <p className="text-[10px] font-black uppercase tracking-widest italic">Plans are being re-calibrated</p>
                    </div>
                )}
            </div>

            {/* --- Enterprise Widget --- */}
            <div className="p-14 bg-indigo-600 rounded-[5rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(79,70,229,0.3)]">
                <div className="absolute top-0 right-0 p-14 text-white/5 -rotate-12 transition-transform duration-1000 group-hover:rotate-0 group-hover:scale-125">
                    <Target size={280} strokeWidth={1} />
                </div>
                <div className="relative z-10 max-w-2xl text-center md:text-left space-y-6">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest italic backdrop-blur-md">
                        <Sparkles size={16} fill="currentColor" /> Enterprise Solutions
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">Custom Volume Strategy</h3>
                    <p className="text-[12px] font-medium text-white/60 leading-relaxed uppercase tracking-[0.2em] italic">
                        Requiring high-velocity lead flow? Consult with our architects to deploy a customized plan designed for your specific business scale.
                    </p>
                </div>
                <button className="bg-white text-indigo-600 px-12 py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[12px] shadow-2xl hover:bg-emerald-400 hover:text-black hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-4 relative z-10">
                    Deploy Custom <ExternalLink size={20} />
                </button>
            </div>

            {/* --- Secure Checkout Modal --- */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-[40px] animate-fade-in">
                    <div className="w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-hidden animate-zoom-in relative">
                        <div className="p-12 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center"><Lock size={20} /></div>
                                    Secure Verification
                                </h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-14">Required for Transaction Authorization</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="p-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Full Identity (Read-Only)</label>
                                    <div className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400">
                                        {userDetails.name || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Contact Registry (Read-Only)</label>
                                    <div className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black tabular-nums text-slate-400">
                                        {userDetails.phone || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-3 col-span-full">
                                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 italic">PAN Card Number (Required) <span className="text-rose-500">*</span></label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={userDetails.panNumber}
                                        placeholder="EX: ABCDE1234F"
                                        onChange={(e) => setUserDetails({...userDetails, panNumber: e.target.value.toUpperCase()})}
                                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                    />
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Your PAN will be encrypted and stored for compliance.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-10 border-t border-slate-50">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors">Abort</button>
                                <button 
                                    type="submit" disabled={purchasing}
                                    className="flex-[2] py-6 rounded-[2rem] bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-black/10 hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                                >
                                    {purchasing ? <RefreshCcw className="animate-spin" size={20} /> : <>Authorize Payment <MousePointer2 size={18} fill="currentColor" /></>}
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
