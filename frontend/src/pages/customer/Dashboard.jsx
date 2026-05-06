import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  
    LayoutDashboard, Users, CreditCard, Layers, ArrowUpRight, 
    ArrowDownRight, Star, Clock, Trophy, Share2, Wallet, 
    Zap, Gem, Target, TrendingUp, History as HistoryIcon, Image as ImageIcon,
    ShieldCheck, Sparkles, ArrowRight, ChevronRight, Bell, Calendar
 } from 'lucide-react';
import api from '../../utils/api';
import LeadAdModal from '../../components/LeadAdModal';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        creditBalance: 0,
        totalPurchasedLeads: 0,
        totalReferrals: 0,
        todaysPosters: 1, 
        recentPurchases: [],
        recentTransactions: []
    });
    const [banners, setBanners] = useState([]);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, bannersRes] = await Promise.all([
                    api.get('/user/dashboard-stats'),
                    api.get('/user/banners')
                ]);
                
                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
                if (bannersRes.data.success) {
                    setBanners(bannersRes.data.data.filter(b => b.placement === 'home' || b.placement === 'all'));
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        const handleWalletUpdate = (e) => {
            fetchStats();
        };

        window.addEventListener('wallet_updated', handleWalletUpdate);
        return () => {
            window.removeEventListener('wallet_updated', handleWalletUpdate);
        };
    }, []);

    const handleBannerClick = async (banner) => {
        if (!banner) return;
        try {
            await api.post(`/user/banners/${banner.id}/interaction?type=click`);
            if (banner.type === 'LEAD_GENERATION' || banner.link === '#LEAD_GEN') {
                setSelectedBanner(banner);
                setIsLeadModalOpen(true);
                return;
            }
            if (banner.link) {
                window.open(banner.link, '_blank');
            }
        } catch (error) {
            console.error('Error tracking banner click:', error);
            if (banner.link) window.open(banner.link, '_blank');
        }
    };

    const userStats = [
        { label: 'Available Credits', value: stats.creditBalance, icon: <Wallet size={22} />, color: 'text-indigo-500', bg: 'bg-indigo-500/10', glow: 'shadow-indigo-500/20' },
        { label: 'Unlocked Leads', value: stats.totalPurchasedLeads, icon: <Target size={22} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' },
        { label: 'Friends Referred', value: stats.totalReferrals, icon: <Users size={22} />, color: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' },
        { label: 'Free Posters', value: `${stats.todaysPosters}/1`, icon: <ImageIcon size={22} />, color: 'text-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/20' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content animate-fade-in space-y-8 pb-10">
            {/* --- Premium Welcome Section --- */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-black p-8 md:p-12 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
                            <Sparkles size={12} fill="currentColor" /> Welcome Back, Partner
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-4 leading-tight">
                            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Lead Pipeline</span>
                        </h1>
                        <p className="text-white/50 text-sm md:text-base font-medium leading-relaxed mb-8 max-w-lg">
                            Track your business growth, manage lead acquisitions, and monitor your referral network all in one powerful control center.
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <button 
                                onClick={() => navigate('/user/leads/available')}
                                className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                Get Leads <ArrowRight size={14} />
                            </button>
                            <button 
                                onClick={() => navigate('/user/subscriptions')}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[11px] backdrop-blur-md transition-all flex items-center gap-2"
                            >
                                <Zap size={14} fill="currentColor" className="text-amber-400" /> Upgrade Plan
                            </button>
                        </div>
                    </div>
                    
                    <div className="hidden lg:block">
                        <div className="w-64 h-64 relative">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse blur-3xl"></div>
                            <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
                                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">My Balance</div>
                                <div className="text-4xl font-black text-white italic tabular-nums mb-6">₹{stats.creditBalance}</div>
                                <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
                                    <TrendingUp size={14} /> +12.5% this week
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Stats Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {userStats.map((stat, idx) => (
                    <div key={idx} className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent rounded-[2.2rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] hover:border-indigo-500/30 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg ${stat.glow}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5 opacity-70">
                                        {stat.label}
                                    </div>
                                    <div className="text-2xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums">
                                        {stat.value}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Network & Identity Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 rounded-[2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Affiliate Identity</div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-[var(--text-dark)] tracking-widest uppercase">{stats.referralCode || 'N/A'}</span>
                                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase">Active</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(stats.referralCode);
                            // Custom toast logic could go here
                        }}
                        className="w-10 h-10 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500 hover:border-indigo-500/30 transition-all shadow-sm active:scale-90"
                    >
                        <Layers size={16} />
                    </button>
                </div>

                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">
                            Connected To Node
                        </div>
                        <div className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight flex items-center gap-2">
                            {stats.parentName || 'ORGANIC NODE'} 
                            <ChevronRight size={14} className="text-amber-500" />
                        </div>
                        <div className="text-[10px] font-bold text-amber-500/80 italic uppercase flex items-center gap-2">
                            <Star size={10} fill="currentColor" /> {stats.parentRole || (stats.parentId ? 'AUTHORIZED AGENT' : 'Direct System Entry')}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Content Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Leads Table */}
                    <div className="card shadow-xl shadow-black/[0.02] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] rounded-[2.5rem]">
                        <div className="flex items-center justify-between p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">Recent Lead Acquisitions</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Last 5 activities</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/user/leads/my')}
                                className="text-[10px] font-black text-indigo-500 hover:text-white uppercase tracking-widest bg-indigo-500/5 hover:bg-indigo-500 px-5 py-2.5 rounded-xl border border-indigo-500/10 transition-all active:scale-95"
                            >
                                View Portfolio
                            </button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--bg-color)]/50 text-[10px] uppercase font-black tracking-[0.2em] text-[var(--text-muted)]">
                                    <tr>
                                        <th className="px-8 py-5">Prospect Identity</th>
                                        <th className="px-8 py-5 text-center">Verification</th>
                                        <th className="px-8 py-5 text-right">Investment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentPurchases && stats.recentPurchases.length > 0 ? (
                                        stats.recentPurchases.map((lead, idx) => (
                                            <tr key={idx} className="border-b border-[var(--border-color)] group hover:bg-indigo-500/[0.03] transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-[10px]">
                                                            {lead.lead_name?.[0] || 'L'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-[var(--text-dark)] group-hover:text-indigo-600 transition-colors">{lead.lead_name || 'Anonymous Lead'}</div>
                                                            <div className="text-[9px] text-[var(--text-muted)] font-black italic uppercase tracking-tighter">UID: {lead.lead_uid || lead.lead_id} • {new Date(lead.purchase_date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                            <ShieldCheck size={12} /> {lead.status || 'Verified'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-xs tabular-nums text-indigo-500 group-hover:scale-110 transition-transform">
                                                    {lead.credits_used || 10} CR
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-16 text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40">
                                                No acquisitions found in database
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Refer & Earn Banner */}
                    <div className="relative group overflow-hidden rounded-[3rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 p-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="relative bg-[#0f172a] rounded-[2.9rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-[60px] opacity-30"></div>
                            <div className="relative z-10 flex-1 text-center md:text-left">
                                <div className="text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic flex items-center justify-center md:justify-start gap-2">
                                    <Gem size={14} fill="currentColor" /> Exclusive Program
                                </div>
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-4">
                                    Expand Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Empire</span>
                                </h3>
                                <p className="text-white/50 text-sm font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                                    Invite your network and earn 50 credits for every active subscription your friends secure.
                                </p>
                            </div>
                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="flex -space-x-4 mb-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0f172a] bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xl`}>
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-white/10 backdrop-blur-md flex items-center justify-center text-[9px] font-black text-white">
                                        +12
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('/user/referrals')}
                                    className="bg-white text-black px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-emerald-400 transition-all active:scale-95"
                                >
                                    Get Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Wallet Activity List */}
                    <div className="card shadow-xl shadow-black/[0.02] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] rounded-[2.5rem]">
                        <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <HistoryIcon size={20} />
                                </div>
                                <h4 className="text-[14px] font-black uppercase tracking-tight">Recent Ledger</h4>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-[var(--bg-color)]/80 border border-[var(--border-color)] text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                Live
                            </div>
                        </div>
                        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                                stats.recentTransactions.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-[var(--bg-color)]/30 border border-transparent hover:border-indigo-500/20 hover:bg-white transition-all cursor-default group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? 'bg-rose-500/5 text-rose-500' : 'bg-emerald-500/5 text-emerald-500'}`}>
                                                {['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-[var(--text-dark)] uppercase truncate max-w-[120px] group-hover:text-indigo-600 transition-colors">
                                                    {tx.remarks || tx.type.replace(/_/g, ' ')}
                                                </div>
                                                <div className="text-[9px] text-[var(--text-muted)] font-bold italic uppercase flex items-center gap-2">
                                                    <Calendar size={10} />
                                                    {new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-black tabular-nums ${['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {tx.credits ? (['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? `-${tx.credits}` : `+${tx.credits}`) : tx.amount}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 opacity-30 grayscale">
                                    <HistoryIcon size={40} className="mx-auto mb-4" />
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">No ledger entries</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Poster Maker Mini-App */}
                    <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative card p-10 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:-translate-x-4 group-hover:-translate-y-4 transition-all duration-700">
                                <ImageIcon size={220} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-8 transform group-hover:rotate-12 transition-transform">
                                    <ImageIcon size={28} />
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter mb-3 italic">Visual Studio</h4>
                                <p className="text-xs font-medium text-[var(--text-muted)] mb-8 leading-relaxed">
                                    Generate professional marketing materials with your dynamic business details automatically embedded.
                                </p>
                                <div className="flex items-center gap-3 mb-8 text-[11px] font-black uppercase tracking-widest text-emerald-500 italic bg-emerald-500/5 w-fit px-4 py-2 rounded-full border border-emerald-500/10">
                                    <Star size={14} fill="currentColor" className="animate-pulse" /> Daily Free Credit
                                </div>
                                <button 
                                    onClick={() => navigate('/user/posters')}
                                    className="w-full py-5 bg-black text-white hover:bg-indigo-600 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-black/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    Launch Maker <Zap size={14} fill="currentColor" className="text-amber-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LeadAdModal 
                isOpen={isLeadModalOpen} 
                onClose={() => setIsLeadModalOpen(false)} 
                banner={selectedBanner}
            />
        </div>
    );
};

export default CustomerDashboard;
