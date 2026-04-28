import React, { useState, useEffect } from 'react';
import { 
    Search, MapPin, Filter, Layers, CreditCard, ChevronRight, 
    Download, Activity, CheckCircle, Smartphone, Mail, Briefcase, 
    Zap, Gem, Target, TrendingUp, Info, Hash, Clock, ArrowUpRight
} from 'lucide-react';
import api from '../../utils/api';

import { useConfirm } from '../../context/ConfirmContext';

const UserAvailableLeads = () => {
    const { confirm } = useConfirm();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
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
                setLeads(data.leads || data.data); // data.leads is the new modular response
                setUserCredits(data.walletBalance || data.userCredits || 0);
                if (data.pagination) {
                    setTotalPages(data.pagination.pages);
                }
                setLastSync(new Date());
            }
        } catch (err) {
            console.error("Failed to fetch leads", err);
            setError("Unable to connect to the lead service. Please try again.");
        } finally {
            if (!isQuiet) setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset to page 1 when filters change
    }, [filters]);

    useEffect(() => {
        fetchLeads();
    }, [filters, page]);

    // Polling Logic & Real-time Refresh
    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchLeads(true); // Quiet fetch in background
            }, 30000); // 30 second cycle
        }

        const handleWalletUpdate = (e) => {
            console.log('[LEADS] Refreshing credits due to real-time update');
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
            setMessage({ type: 'error', text: 'Oops! Not enough credits. Please recharge your wallet.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return;
        }

        // --- NEW CONFIRMATION POPUP ---
        const confirmed = await confirm(
            `This lead costs ${cost} credits. Are you sure you want to purchase and view this lead's details?`,
            'Confirm Purchase',
            'info'
        );

        if (!confirmed) return;
        // ------------------------------

        setLoading(true); // Show loader during purchase
        try {
            const { data } = await api.post(`/user/purchase-lead/${leadId}`);
            if (data.success) {
                setMessage({ type: 'success', text: 'Lead purchased successfully. Details are now available.' });
                fetchLeads(true); // Refresh credits and list quietly
            } else {
                setMessage({ type: 'error', text: data.message || "Unable to complete purchase." });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Transaction failed. Please try again.';
            setMessage({ type: 'error', text: errorMsg.toUpperCase() });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Active';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        if (diffInHours < 1) return 'Just now';
        if (diffInHours === 1) return '1h ago';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours/24)}d ago`;
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] min-h-screen pb-20">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="relative z-10">
                <div className="pageHeader mb-12">
                    <div className="pageHeaderTitle">
                            <div className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-lg shadow-indigo-500/20">
                                Live Updates
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none italic">
                                    Last Updated: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                        <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900 leading-tight">
                            Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Leads</span>
                        </h2>
                        <p className="text-slate-400 font-bold text-sm tracking-wide mt-2 max-w-xl">
                            Browse and find high-quality leads for your business. Purchase credits to access full contact details immediately.
                        </p>
                    </div>
                    
                    <div className="pageHeaderActions flex items-center gap-6">
                         <div className="flex items-center gap-3 bg-[var(--surface-color)]/30 backdrop-blur-md p-2 pl-5 rounded-3xl border border-[var(--border-color)]">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Auto Refresh</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${autoRefresh ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {autoRefresh ? 'ENABLED' : 'PAUSED'}
                                </span>
                             </div>
                             <button 
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`w-14 h-8 rounded-2xl relative transition-all duration-500 ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-200'}`}
                             >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-xl shadow-lg transition-all duration-500 ${autoRefresh ? 'left-7' : 'left-1'}`}></div>
                             </button>
                        </div>

                        <div className="glass-morphism p-1 rounded-3xl border border-[var(--border-color)] shadow-xl overflow-hidden flex items-center">
                            <div className="px-8 py-4 bg-[var(--surface-color)] rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default border border-[var(--border-color)] shadow-sm">
                                 <div className="space-y-1">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Available Credits</div>
                                    <div className="flex items-center gap-2">
                                        <Gem size={18} className="text-indigo-400" />
                                        <span className="text-2xl font-black tabular-nums tracking-tighter">{userCredits} Credits</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-12 p-6 rounded-3xl flex items-center gap-5 animate-slide-up border-2 backdrop-blur-xl ${
                        message.type === 'error' 
                        ? 'bg-red-500/5 text-red-600 border-red-500/10' 
                        : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                    }`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${message.type === 'error' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                            {message.type === 'error' ? <Activity size={20} /> : <CheckCircle size={20} />}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{message.text}</span>
                    </div>
                )}

                {/* Lead Search Bar */}
                <div className="mb-16 p-2 rounded-[2.5rem] bg-[var(--surface-color)] border border-[var(--surface-color)] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-2 transition-all focus-within:border-indigo-500/30">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                <MapPin size={18} />
                            </div>
                             <input 
                                type="text" placeholder="Search City..." 
                                onChange={(e) => setFilters({...filters, city: e.target.value})}
                                className="w-full pl-16 pr-6 py-5 bg-[var(--surface-color)] border-none rounded-[2rem] text-xs font-black uppercase tracking-widest focus:bg-[var(--surface-color)] focus:ring-0 transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                <TrendingUp size={18} />
                            </div>
                            <input 
                                type="text" placeholder="Postal Code..." 
                                onChange={(e) => setFilters({...filters, pincode: e.target.value})}
                                className="w-full pl-16 pr-6 py-5 bg-[var(--surface-color)] border-none rounded-[2rem] text-xs font-black uppercase tracking-widest focus:bg-[var(--surface-color)] focus:ring-0 transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                <Briefcase size={18} />
                            </div>
                             <input 
                                type="text" placeholder="Industry/Category..." 
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                                className="w-full pl-16 pr-6 py-5 bg-[var(--surface-color)] border-[var(--surface-color)] border-none rounded-[2rem] text-xs font-black uppercase tracking-widest focus:bg-[var(--surface-color)] focus:ring-0 transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                     <button onClick={fetchLeads} className="w-full md:w-auto px-10 py-5 bg-[var(--surface-color)] text-indigo-600 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-[var(--surface-color)] transition-all active:scale-95 flex items-center justify-center gap-3">
                        <Search size={18} /> Search Leads
                    </button>
                </div>

                {/* Latest Leads Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {loading ? (
                        [1,2,3,4,5,6].map(i => (
                            <div key={i} className="bg-[var(--surface-color)] rounded-[3rem] border border-[var(--surface-color)] p-10 h-[380px] shadow-sm animate-pulse flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="w-16 h-16 bg-[var(--surface-color)] rounded-2xl"></div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-[var(--surface-color)] rounded-full w-1/3"></div>
                                        <div className="h-8 bg-[var(--surface-color)] rounded-full w-2/3"></div>
                                    </div>
                                </div>
                                <div className="h-14 bg-slate-50 rounded-3xl w-full"></div>
                            </div>
                        ))
                    ) : leads.length > 0 ? (
                        leads.map((lead) => (
                            <div key={lead.id} className="group relative">
                                {/* Glow Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                                
                                <div className="bg-[var(--surface-color)] border border-[var(--surface-color)] p-10 rounded-[3.5rem] shadow-sm group-hover:shadow-2xl group-hover:border-indigo-500/20 transition-all duration-500 flex flex-col h-full overflow-hidden relative">
                                    
                                    {/* Monospace Lead ID */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                            <Hash size={12} className="text-indigo-500" />
                                            <span className="text-[10px] font-black font-mono text-indigo-500 tracking-wider">
                                                {lead.lead_uid.split('-')[0].toUpperCase()}***
                                            </span>
                                        </div>
                                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                            <Clock size={12} />
                                            {getTimeAgo(lead.created_at)}
                                        </div>
                                    </div>

                                    {/* Icon & Category */}
                                    <div className="flex items-start gap-6 mb-8">
                                        <div className="w-16 h-16 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                            <Target size={28} strokeWidth={1.5} />
                                        </div>
                                         <div className="pt-2">
                                            <div className="text-[9px] font-[var(--surface-color)] text-indigo-500 uppercase tracking-widest mb-1">Business Category</div>
                                            <h4 className="text-[var(--surface-color)] font-[var(--surface-color)] text-2xl uppercase text-slate-700 leading-tight">
                                                {lead.category_name || 'General Business'}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Masked Data Block */}
                                    <div className="space-y-6 flex-1">
                                        <div className="space-y-4">
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter leading-[1.1] group-hover:text-indigo-600 transition-colors">
                                                {lead.name}
                                            </h3>
                                            <div className="flex items-center gap-4 text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-indigo-500" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{lead.city}, {lead.state}</span>
                                                </div>
                                            </div>
                                        </div>

                                         <div className="p-5 bg-[var(--surface-color)] rounded-3xl space-y-2 border border-slate-50">
                                            <p className="text-[11px] font-bold text-slate-400 font-mono tracking-wide break-all opacity-60">
                                                {lead.contact_hint_1?.toLowerCase() || 'xxxxxxxx@gmail.com'}
                                            </p>
                                            <p className="text-[11px] font-bold text-slate-400 font-mono tracking-widest opacity-60">
                                                {lead.contact_hint_2 || '+91 xxxx xxx 000'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Buy Action */}
                                     <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Lead Price</div>
                                            <div className="text-lg font-black text-slate-800">{lead.credit_cost || 10} <span className="text-[10px] uppercase text-indigo-500 font-black">CREDITS</span></div>
                                        </div>
                                        <button 
                                            onClick={() => handlePurchase(lead.id, lead.credit_cost)}
                                            className="flex-1 py-4 bg-slate-900 group-hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-slate-900/10 transition-all duration-500 flex items-center justify-center gap-2 group-hover:translate-x-1"
                                        >
                                            Unlock Lead <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                     ) : (
                        <div className="col-span-full py-40 text-center glass-morphism rounded-[3rem] border border-slate-100 flex flex-col items-center gap-8 opacity-20">
                            <Activity size={84} strokeWidth={1} />
                            <p className="font-black uppercase tracking-widest text-xs">No leads found matching your criteria.</p>
                        </div>
                    )}
                </div>

                {/* Pagination (Phase 3) */}
                {totalPages > 1 && (
                    <div className="mt-16 flex items-center justify-center gap-4">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-6 py-3 glass-morphism rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${
                                        page === i + 1 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110' 
                                        : 'bg-[var(--surface-color)] text-slate-400 hover:bg-slate-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-6 py-3 glass-morphism rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Footer Top-up Banner */}
                 {userCredits < 20 && (
                    <div className="mt-20 p-12 rounded-[4rem] bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group shadow-2xl shadow-indigo-500/20 animate-slide-up">
                        <div className="absolute top-0 right-0 p-10 text-white/5 -rotate-12 transition-transform duration-1000 group-hover:rotate-0 group-hover:scale-125">
                            <Zap size={240} />
                        </div>
                        <div className="relative z-10 max-w-xl text-center md:text-left">
                            <h3 className="text-3xl font-black tracking-tighter uppercase mb-4 leading-none">Running Low on Credits?</h3>
                            <p className="text-sm font-medium text-white/70 leading-relaxed uppercase tracking-widest">
                                Your balance is low ({userCredits} Credits). Recharge your wallet now to continue purchasing high-quality leads.
                            </p>
                        </div>
                        <button className="relative z-10 bg-white text-indigo-600 px-10 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300">
                            Recharge Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserAvailableLeads;
