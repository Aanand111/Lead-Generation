import React, { useState, useEffect } from 'react';
import { 
    Users, Wallet, TrendingUp, Activity, 
    Zap, Sparkles, ChevronRight, ArrowUpRight, 
    UserPlus, PlusCircle, Share2, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SubVendorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalReferrals: 0,
        walletBalance: 0,
        totalLeadsInjected: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/sub-vendor/stats');
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error("Failed to sync sub-vendor stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { 
            label: 'Network Nodes', 
            count: stats.totalReferrals, 
            icon: <Users size={24} />, 
            color: 'bg-indigo-500',
            subText: 'Total referred users'
        },
        { 
            label: 'Liquidity Pool', 
            count: `₹${stats.walletBalance}`, 
            icon: <Wallet size={24} />, 
            color: 'bg-emerald-500',
            subText: 'Current wallet balance'
        },
        { 
            label: 'Data Contribution', 
            count: stats.totalLeadsInjected, 
            icon: <Activity size={24} />, 
            color: 'bg-amber-500',
            subText: 'Leads forged into grid'
        }
    ];

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            <header className="mb-12">
                <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2 italic">
                    Agent Protocol <Activity size={10} /> Operational Overview
                </div>
                <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Agent Dashboard</h1>
                <p className="text-xs font-bold text-[var(--text-muted)] italic leading-none">Real-time telemetry and network metrics for sub-node contribution.</p>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <button onClick={() => navigate('/sub-vendor/refer-user')} className="p-8 rounded-[2rem] bg-indigo-500 text-white flex flex-col items-center justify-center gap-4 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all active:scale-95 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-150 transition-transform">
                        <UserPlus size={100} />
                    </div>
                    <UserPlus size={32} className="relative z-10" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Refer New User</span>
                </button>
                <button onClick={() => navigate('/sub-vendor/leads/upload')} className="p-8 rounded-[2rem] bg-amber-500 text-white flex flex-col items-center justify-center gap-4 hover:shadow-2xl hover:shadow-amber-500/20 transition-all active:scale-95 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-150 transition-transform">
                        <PlusCircle size={100} />
                    </div>
                    <PlusCircle size={32} className="relative z-10" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Forge New Lead</span>
                </button>
                <div className="p-8 rounded-[2rem] bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <Zap size={32} className="text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Verified Status</span>
                    <div className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 italic">
                        ACTIVE PROTOCOL
                    </div>
                </div>
            </div>

            {/* Network Identity Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <Zap size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">My Agent Token</div>
                            <div className="text-lg font-black text-[var(--text-dark)] tracking-widest uppercase">{stats.referralCode || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="text-indigo-500 opacity-30 group-hover:opacity-100 transition-opacity">
                        <Share2 size={16} />
                    </div>
                </div>

                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Managed By (Parent Node)</div>
                        <div className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight">
                            {stats.parentName || 'CORE SYSTEM'}
                        </div>
                        <div className="text-[9px] font-bold text-[var(--text-muted)] italic">
                            Parent ID: {stats.parentId || 'Direct'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {statCards.map((card, idx) => (
                    <div key={idx} className="card p-10 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-2xl shadow-indigo-500/5 group hover:border-amber-500/30 transition-all duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-4 rounded-2xl ${card.color} text-white shadow-xl shadow-${card.color.split('-')[1]}-500/20`}>
                                {card.icon}
                            </div>
                            <Sparkles className="text-amber-500/20" size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 italic">{card.label}</p>
                            <h2 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-3 tabular-nums">{card.count}</h2>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] italic opacity-60 uppercase">{card.subText}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity placeholder/summary */}
            <div className="mt-12 grid grid-cols-1 gap-8">
                <div className="card p-10 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-2xl shadow-indigo-500/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight italic">Performance Spectrum</h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mt-1">Growth rate and node contribution history</p>
                        </div>
                        <TrendingUp className="text-indigo-500" size={24} />
                    </div>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[2rem] bg-[var(--bg-color)]/30">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                            <Activity size={48} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Compiling Data Streams...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubVendorDashboard;
