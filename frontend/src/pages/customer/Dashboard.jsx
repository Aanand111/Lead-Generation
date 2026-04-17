import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  
    LayoutDashboard, Users, CreditCard, Layers, ArrowUpRight, 
    ArrowDownRight, Star, Clock, Trophy, Share2, Wallet, 
    Zap, Gem, Target, TrendingUp,History as HistoryIcon, Image as ImageIcon
 } from 'lucide-react';
import api from '../../utils/api';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/user/dashboard-stats');
                if (data.success) {
                    setStats(data.data);
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Listen for real-time wallet updates
        const handleWalletUpdate = (e) => {
            console.log('[DASHBOARD] Refreshing stats due to wallet update');
            fetchStats();
        };

        window.addEventListener('wallet_updated', handleWalletUpdate);
        
        return () => {
            window.removeEventListener('wallet_updated', handleWalletUpdate);
        };
    }, []);

    const userStats = [
        { label: 'Available Credits', value: stats.creditBalance, icon: <Wallet size={24} />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Unlocked Leads', value: stats.totalPurchasedLeads, icon: <Target size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Friends Referred', value: stats.totalReferrals, icon: <Users size={24} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Free Posters', value: `${stats.todaysPosters}/1`, icon: <ImageIcon size={24} />, color: 'text-rose-500', bg: 'bg-rose-500/10' }
    ];

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Dashboard</h2>
                    <p>Welcome back! Here's an overview of your activity and lead performance.</p>
                </div>
                <div className="pageHeaderActions flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/user/subscriptions')}
                        className="btn btn-primary flex items-center gap-2 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20"
                    >
                        <Zap size={16} /> Upgrade Plan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {userStats.map((stat, idx) => (
                    <div key={idx} className="card p-6 shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                                {stat.icon}
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">
                                    {stat.label}
                                </div>
                                <div className="text-2xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums">
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Lead Purchases */}
                    <div className="card shadow-md border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)]">
                        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <div className="flex items-center gap-3">
                                <Target size={24} className="text-indigo-500" />
                                <h3 className="text-lg font-black uppercase tracking-tight">Recent Leads</h3>
                            </div>
                            <button className="text-[11px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10 hover:bg-indigo-500/10 transition-all">
                                View History
                            </button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--bg-color)]/50 text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">
                                    <tr>
                                        <th className="px-6 py-4">Lead Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Credits</th>
                                        <th className="px-6 py-4 text-right">Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentPurchases && stats.recentPurchases.length > 0 ? (
                                        stats.recentPurchases.map((lead, idx) => (
                                            <tr key={idx} className="border-b border-[var(--border-color)] group hover:bg-indigo-500/[0.02] transition-all">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-sm text-[var(--text-dark)]">{lead.lead_name || 'Anonymous Lead'}</div>
                                                    <div className="text-[10px] text-[var(--text-muted)] font-bold italic uppercase">UID: {lead.lead_uid || lead.lead_id}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> {lead.status || 'Purchased'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 font-black text-xs tabular-nums text-indigo-500">{lead.credits_used || 10} Credits</td>
                                                <td className="px-6 py-5 text-right text-[10px] text-[var(--text-muted)] font-bold tabular-nums italic">
                                                    {new Date(lead.purchase_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-50">
                                                No leads purchased yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Refer & Earn Stats */}
                    <div className="card p-8 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2.5rem] shadow-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Trophy size={160} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Refer & Earn</h3>
                                <p className="text-white/70 font-medium text-sm leading-relaxed max-w-md">
                                    Grow your network and earn extra credits by inviting your colleagues to the platform.
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/30 text-center min-w-[120px]">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Total Friends</div>
                                        <div className="text-2xl font-black tabular-nums">12</div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/30 text-center min-w-[120px]">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Credits Earned</div>
                                        <div className="text-2xl font-black tabular-nums">450</div>
                                    </div>
                                </div>
                            </div>
                            <button className="bg-white text-indigo-600 px-8 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs">
                                <Share2 size={18} /> Get Invite Link
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Wallet History List */}
                    <div className="card shadow-md border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)]">
                        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <HistoryIcon size={20} className="text-indigo-500" />
                                <h4 className="text-[13px] font-black uppercase tracking-tight">Wallet History</h4>
                            </div>
                            <HistoryIcon size={16} className="text-[var(--text-muted)]" />
                        </div>
                        <div className="p-6 space-y-4">
                            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                                stats.recentTransactions.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-color)]/50 border border-[var(--border-color)] hover:border-indigo-500/30 transition-all cursor-default group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-[var(--text-dark)] uppercase truncate max-w-[150px]">
                                                    {tx.remarks || tx.type.replace(/_/g, ' ')}
                                                </div>
                                                <div className="text-[9px] text-[var(--text-muted)] font-bold italic tracking-tighter uppercase flex items-center gap-2">
                                                    <span>{tx.type.replace(/_/g, ' ')}</span>
                                                    <span>•</span>
                                                    <span>{new Date(tx.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-black tabular-nums ${['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {tx.credits ? (['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? `-${tx.credits}` : `+${tx.credits}`) : tx.amount}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">No transactions yet</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Poster Widget */}
                    <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:-translate-x-4 transition-transform duration-500">
                            <ImageIcon size={180} />
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Poster Maker</h4>
                        <p className="text-[11px] font-medium text-[var(--text-muted)] mb-6 leading-relaxed">
                            Create marketing posters with your details to share on WhatsApp and Social Media.
                        </p>
                        <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">
                            <Star size={14} fill="currentColor" /> 1 Free Credit Available
                        </div>
                        <button className="btn btn-primary w-full py-4 font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-indigo-500/10">
                            Create Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
