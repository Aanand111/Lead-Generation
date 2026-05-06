import React, { useState, useEffect } from 'react';
import { 
    Search, MapPin, Filter, Layers, CreditCard, ChevronRight, 
    Download, Activity, CheckCircle, Smartphone, Mail, Briefcase, 
    Zap, Gem, Target, TrendingUp, Info, Hash, Clock, ArrowUpRight,
    Sparkles, SlidersHorizontal, MousePointer2
} from 'lucide-react';
import api from '../../utils/api';
import { useConfirm } from '../../context/ConfirmContext';

const UserAvailableLeads = () => {
    const { confirm } = useConfirm();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filters, setFilters] = useState({
        city: '',
        pincode: '',
        category: ''
    });
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastSync, setLastSync] = useState(new Date());
    const [userCredits, setUserCredits] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLeads = async (isQuiet = false) => {
        if (!isQuiet) setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/user/available-leads', { 
                params: { ...filters, page } 
            });
            if (data.success) {
                setLeads(data.leads || data.data || []);
                setUserCredits(data.walletBalance || data.userCredits || 0);
                if (data.pagination) {
                    setTotalPages(Math.max(1, data.pagination.pages || 1));
                }
                setLastSync(new Date());
            } else {
                setError(data.message || 'Unable to load available leads.');
            }
        } catch (err) {
            console.error("Failed to fetch leads", err);
            setError("Unable to connect to the lead service. Please try again.");
        } finally {
            if (!isQuiet) setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [filters]);

    useEffect(() => {
        fetchLeads();
    }, [filters, page]);

    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchLeads(true);
            }, 30000);
        }

        const handleWalletUpdate = (e) => {
            if (e.detail?.wallet_balance !== undefined) {
                setUserCredits(e.detail.wallet_balance);
            } else {
                fetchLeads(true);
            }
        };

        window.addEventListener('wallet_updated', handleWalletUpdate);
        return () => {
            clearInterval(interval);
            window.removeEventListener('wallet_updated', handleWalletUpdate);
        };
    }, [autoRefresh, filters]);

    const handlePurchase = async (leadId, cost = 10) => {
        if (userCredits < cost) {
            setMessage({ type: 'error', text: 'Insufficient Credits. Please recharge.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return;
        }

        const confirmed = await confirm(
            `This high-quality lead costs ${cost} credits. Ready to unlock?`,
            'Acquire Lead',
            'info'
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            const { data } = await api.post(`/user/purchase-lead/${leadId}`);
            if (data.success) {
                setMessage({ type: 'success', text: 'Lead acquired. Accessing decrypted data...' });
                fetchLeads(true);
            } else {
                setMessage({ type: 'error', text: data.message || "Acquisition failed." });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Transaction failed.';
            setMessage({ type: 'error', text: errorMsg.toUpperCase() });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'ACTIVE';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        if (diffInHours < 1) return 'JUST NOW';
        if (diffInHours === 1) return '1H AGO';
        if (diffInHours < 24) return `${diffInHours}H AGO`;
        return `${Math.floor(diffInHours/24)}D AGO`;
    };

    return (
        <div className="page-content animate-fade-in space-y-12 pb-20">
            {/* --- Hero / Header Section --- */}
            <div className="relative">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2"></div>
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-indigo-600/20">
                                Global Repository
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">
                                <Clock size={12} /> Sync: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-[0.9]">
                            Acquisition <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-[#4f46e5]">Center</span>
                        </h1>
                        <p className="mt-6 text-sm md:text-base text-[var(--text-muted)] font-medium max-w-lg leading-relaxed">
                            Access real-time verified business prospects. Filter by region and industry to find your perfect match.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                         {/* Wallet Card */}
                         <div className="bg-[var(--surface-color)] p-1 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl group cursor-default">
                             <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-[2.2rem] text-white flex items-center gap-6 shadow-inner">
                                 <div>
                                     <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">My Capital</div>
                                     <div className="text-3xl font-black tabular-nums tracking-tighter">{userCredits} <span className="text-xs uppercase opacity-60">CR</span></div>
                                 </div>
                                 <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                     <Zap size={22} fill="currentColor" className="text-amber-300" />
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* --- Advanced Filter Console --- */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-transparent to-emerald-500/10 rounded-[3rem] blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative p-2 rounded-[3rem] bg-[var(--surface-color)] border border-[var(--border-color)] shadow-2xl flex flex-col md:flex-row items-center gap-3 backdrop-blur-xl">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3 p-2">
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-6 flex items-center text-[var(--text-muted)] group-focus-within/input:text-indigo-500 transition-colors">
                                <MapPin size={18} />
                            </div>
                            <input 
                                type="text" placeholder="Filter by City" 
                                value={filters.city}
                                onChange={(e) => setFilters({...filters, city: e.target.value})}
                                className="w-full pl-16 pr-6 py-5 bg-[var(--bg-color)]/30 border border-transparent focus:border-indigo-500/20 rounded-3xl text-xs font-black uppercase tracking-widest focus:ring-0 transition-all placeholder:text-[var(--text-muted)]/50"
                            />
                        </div>
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-6 flex items-center text-[var(--text-muted)] group-focus-within/input:text-indigo-500 transition-colors">
                                <Hash size={18} />
                            </div>
                            <input 
                                type="text" placeholder="Postal Code" 
                                value={filters.pincode}
                                onChange={(e) => setFilters({...filters, pincode: e.target.value})}
                                className="w-full pl-16 pr-6 py-5 bg-[var(--bg-color)]/30 border border-transparent focus:border-indigo-500/20 rounded-3xl text-xs font-black uppercase tracking-widest focus:ring-0 transition-all placeholder:text-[var(--text-muted)]/50"
                            />
                        </div>
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-6 flex items-center text-[var(--text-muted)] group-focus-within/input:text-indigo-500 transition-colors">
                                <SlidersHorizontal size={18} />
                            </div>
                            <input 
                                type="text" placeholder="Industry Type" 
                                value={filters.category}
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                                className="w-full pl-16 pr-6 py-5 bg-[var(--bg-color)]/30 border border-transparent focus:border-indigo-500/20 rounded-3xl text-xs font-black uppercase tracking-widest focus:ring-0 transition-all placeholder:text-[var(--text-muted)]/50"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 w-full md:w-auto">
                        <div 
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-3 px-6 py-5 rounded-3xl border cursor-pointer transition-all ${autoRefresh ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">{autoRefresh ? 'Active' : 'Live'}</span>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoRefresh ? 'left-4.5' : 'left-0.5'}`}></div>
                            </div>
                        </div>
                        <button onClick={() => fetchLeads()} className="flex-1 md:flex-none px-12 py-5 bg-black text-white hover:bg-indigo-600 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
                            <Search size={18} /> Find
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Status Messaging --- */}
            {(message.text || error) && (
                <div className={`p-6 rounded-[2rem] border-2 backdrop-blur-xl flex items-center gap-5 animate-slide-up ${
                    error || message.type === 'error' ? 'bg-rose-500/5 text-rose-600 border-rose-500/10' : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                }`}>
                    <div className="w-10 h-10 rounded-2xl bg-current/10 flex items-center justify-center">
                        {error || message.type === 'error' ? <Info size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{error || message.text}</span>
                </div>
            )}

            {/* --- Leads Repository --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {loading ? (
                    [1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-[var(--surface-color)] rounded-[3.5rem] p-10 h-[450px] shadow-sm border border-[var(--border-color)] animate-pulse flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex justify-between">
                                    <div className="w-20 h-8 bg-slate-50 rounded-full"></div>
                                    <div className="w-12 h-4 bg-slate-50 rounded-full"></div>
                                </div>
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-50 rounded-full w-1/3"></div>
                                    <div className="h-10 bg-slate-50 rounded-full w-3/4"></div>
                                </div>
                            </div>
                            <div className="h-16 bg-slate-50 rounded-3xl w-full"></div>
                        </div>
                    ))
                ) : leads.length > 0 ? (
                    leads.map((lead) => (
                        <div key={lead.id} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10"></div>
                            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-10 rounded-[3.5rem] shadow-sm group-hover:shadow-2xl group-hover:border-indigo-500/20 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                                
                                <div className="flex items-center justify-between mb-8">
                                    <div className="px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                                        <Hash size={12} className="text-indigo-400" />
                                        <span className="text-[10px] font-black font-mono text-indigo-500 uppercase tracking-tighter">ID: {lead.lead_uid?.split('-')[0] || 'N/A'}***</span>
                                    </div>
                                    <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic flex items-center gap-1.5 opacity-60">
                                        <Clock size={12} /> {getTimeAgo(lead.created_at)}
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 mb-8">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                                        <Target size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="pt-2">
                                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 italic">Vetted Lead</div>
                                        <h4 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-tight">{lead.category_name || 'Market Prospect'}</h4>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-[var(--text-dark)] tracking-tighter leading-none group-hover:text-indigo-600 transition-colors uppercase italic">{lead.name}</h3>
                                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                            <MapPin size={14} className="text-emerald-500" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">{lead.city}, {lead.state}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-[var(--bg-color)]/50 rounded-[2rem] border border-[var(--border-color)] space-y-3">
                                        <div className="flex items-center gap-3 opacity-30 grayscale blur-[1px]">
                                            <Mail size={14} />
                                            <span className="text-[11px] font-mono tracking-wide lowercase truncate">{lead.contact_hint_1 || 'xxxxxx@xxxxx.com'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-30 grayscale blur-[1px]">
                                            <Smartphone size={14} />
                                            <span className="text-[11px] font-mono tracking-[0.3em] font-black">{lead.contact_hint_2 || 'xxxxxx 000'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-[var(--border-color)] flex items-center justify-between gap-6">
                                    <div className="space-y-0.5">
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Acquisition Price</div>
                                        <div className="text-2xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums">{lead.credit_cost || 10} <span className="text-[11px] uppercase text-indigo-500">CR</span></div>
                                    </div>
                                    <button 
                                        onClick={() => handlePurchase(lead.id, lead.credit_cost)}
                                        className="flex-1 py-4 bg-black text-white hover:bg-indigo-600 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all duration-500 flex items-center justify-center gap-2 group-hover:translate-x-1 active:scale-95"
                                    >
                                        Unlock <ArrowUpRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center rounded-[4rem] bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col items-center gap-10 grayscale opacity-40">
                        <div className="w-24 h-24 rounded-full bg-indigo-500/5 flex items-center justify-center">
                            <Target size={48} strokeWidth={1} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Data Not Found</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No prospects match your current parameters</p>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Pagination Console --- */}
            {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-6">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-8 py-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-20 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        Prev
                    </button>
                    <div className="flex items-center gap-3">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-12 h-12 rounded-2xl font-black text-[11px] transition-all ${
                                    page === i + 1 
                                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 scale-110' 
                                    : 'bg-[var(--surface-color)] text-[var(--text-muted)] hover:bg-slate-50 border border-[var(--border-color)]'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-8 py-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-20 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* --- Urgent Action Banner --- */}
            {userCredits < 20 && (
                <div className="relative group overflow-hidden rounded-[4rem] bg-gradient-to-br from-indigo-600 to-indigo-900 p-12 text-white shadow-2xl shadow-indigo-600/20 animate-slide-up">
                    <div className="absolute top-0 right-0 p-12 text-white/5 -rotate-12 transition-transform duration-1000 group-hover:rotate-0 group-hover:scale-125">
                        <Zap size={240} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
                                <Sparkles size={14} fill="currentColor" /> Low Balance Alert
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter uppercase mb-4 leading-none italic">Refill Your Ledger</h3>
                            <p className="text-sm font-medium text-white/60 leading-relaxed uppercase tracking-[0.2em]">
                                Your capital is depleted ({userCredits} CR). Secure more credits to maintain your acquisition momentum.
                            </p>
                        </div>
                        <button className="bg-white text-indigo-900 px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-emerald-400 hover:text-black hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3">
                            Buy Credits <MousePointer2 size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAvailableLeads;
