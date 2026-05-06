import React, { useState, useEffect } from 'react';
import {  
    Users, UserPlus, Share2, Wallet, History as HistoryIcon, 
    Gift, ArrowUpRight, Copy, CheckCircle, 
    Star, Target, Zap, Gem, ExternalLink, Activity,
    ChevronRight, Info, TrendingUp, Sparkles,
    MousePointer2, Network, Trophy
} from 'lucide-react';
import api from '../../utils/api';

const UserReferrals = () => {
    const [referralData, setReferralData] = useState({
        referralCode: 'USER-7281',
        totalReferrals: 0,
        totalRewards: 0,
        referralHistory: []
    });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const fetchReferralStats = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/user/referral-stats');
            if (data.success) {
                setReferralData(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch referral data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralStats();
    }, []);

    const copyCode = () => {
        navigator.clipboard.writeText(referralData.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="page-content animate-fade-in space-y-12 pb-20">
            {/* --- Growth Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-indigo-600/20">
                            Affiliate Program
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">
                            <TrendingUp size={12} /> Exponential Rewards
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-[0.9]">
                        Network <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-royal-blue">Expander</span>
                    </h1>
                    <p className="mt-6 text-sm md:text-base text-[var(--text-muted)] font-medium max-w-lg leading-relaxed italic">
                        Accelerate your earnings by scaling the LeadGen ecosystem. Invite partners and earn perpetual rewards.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-[var(--surface-color)] p-1.5 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl flex items-center gap-4 pr-8">
                         <div className="w-14 h-14 rounded-[2rem] bg-amber-100 text-amber-600 flex items-center justify-center shadow-lg">
                            <Star size={24} fill="currentColor" />
                         </div>
                         <div>
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 opacity-70">Active Bonus</div>
                            <div className="text-2xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums leading-none">
                                +15% EXTRA
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* --- Invitation Console --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                    <div className="card p-12 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[4rem] shadow-2xl relative overflow-hidden group min-h-[450px] flex flex-col justify-center">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-indigo-500 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-1000">
                            <Network size={320} strokeWidth={1} />
                        </div>
                        
                        <div className="relative z-10 max-w-xl">
                            <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-8 shadow-inner shadow-indigo-500/20">
                                <UserPlus size={40} strokeWidth={1.5} />
                            </div>
                            
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-4">Secure Invite Link</h3>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase leading-relaxed tracking-[0.2em] mb-10 opacity-60">
                                Distribute your unique authorization code. Every verified signup through your link injects bonus credits into your ledger.
                            </p>

                            <div className="flex flex-col md:flex-row items-stretch gap-4 relative">
                                <div className="flex-1 bg-slate-50 border border-slate-100 px-8 py-5 rounded-[2rem] flex items-center justify-between group/code hover:border-indigo-500/30 transition-all shadow-inner">
                                    <div>
                                        <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 italic">Personal Referral Code</div>
                                        <div className="text-2xl font-black text-black tracking-[0.3em] uppercase">{referralData.referralCode}</div>
                                    </div>
                                    <button 
                                        onClick={copyCode}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-600 hover:bg-black hover:text-white'}`}
                                    >
                                        {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                                <button className="bg-black text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <Share2 size={20} /> Distribute
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="card p-10 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-indigo-500 group-hover:scale-110 transition-transform">
                            <Users size={120} strokeWidth={1} />
                        </div>
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 italic">Active Connections</div>
                        <div className="text-4xl font-black text-[var(--text-dark)] tracking-tighter uppercase italic">{referralData.totalReferrals} <span className="text-sm opacity-30 not-italic">Nodes</span></div>
                        <div className="mt-8 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-royal-blue w-[40%] animate-pulse"></div>
                        </div>
                    </div>

                    <div className="card p-10 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-emerald-500 group-hover:scale-110 transition-transform">
                            <Wallet size={120} strokeWidth={1} />
                        </div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 italic">Yield Generated</div>
                        <div className="text-4xl font-black text-[var(--text-dark)] tracking-tighter uppercase italic">{referralData.totalRewards} <span className="text-sm opacity-30 not-italic">Credits</span></div>
                        <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">
                            <Star size={12} fill="currentColor" className="animate-bounce" /> Unlocked & Available
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Milestone & History Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Network Goals Widget */}
                <div className="lg:col-span-4">
                    <div className="card p-12 bg-gradient-to-br from-indigo-900 to-royal-blue text-white rounded-[4rem] shadow-2xl relative overflow-hidden group h-full">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] text-white -rotate-12 group-hover:rotate-0 group-hover:scale-125 transition-transform duration-1000">
                            <Trophy size={220} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 space-y-10">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] italic backdrop-blur-md shadow-2xl">
                                <Sparkles size={16} fill="currentColor" /> Milestone Quest
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-[0.9]">Elite <br /> Partner Status</h3>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 leading-relaxed italic">
                                    Refer 50 active partners to unlock global acquisition discounts and VIP priority support.
                                </p>
                            </div>
                            <div className="space-y-6 pt-10 border-t border-white/10">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Quest Progress</span>
                                    <span className="text-2xl font-black tabular-nums tracking-tighter italic">{referralData.totalReferrals}/50</span>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (referralData.totalReferrals / 50) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <button className="w-full py-6 bg-white text-indigo-900 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-amber-400 hover:text-black transition-all active:scale-95">
                                Launch Growth Plan
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-8">
                    <div className="card bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[4rem] shadow-xl overflow-hidden h-full flex flex-col">
                        <div className="px-12 py-10 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                                    <HistoryIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tighter italic">Network Ledger</h3>
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Real-Time Connection Feed</p>
                                </div>
                            </div>
                            <button className="px-8 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-indigo-600 hover:bg-slate-50 transition-all flex items-center gap-3">
                                Full Registry <ArrowUpRight size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="px-12 py-6">Partner Identity</th>
                                        <th className="px-12 py-6 text-center">Status</th>
                                        <th className="px-12 py-6 text-center">Incentive</th>
                                        <th className="px-12 py-6 text-right">Synchronization</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-32 opacity-20">
                                                <Activity size={64} className="animate-spin mx-auto mb-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing Ledger...</span>
                                            </td>
                                        </tr>
                                    ) : referralData.referralHistory.length > 0 ? (
                                        referralData.referralHistory.map((ref, idx) => (
                                            <tr key={idx} className="group border-b border-slate-50 last:border-0 hover:bg-indigo-50/30 transition-all">
                                                <td className="px-12 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                            <Users size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-[var(--text-dark)] uppercase italic leading-none">{ref.name}</div>
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Node ID: {ref.phone.slice(-4)}-LGN</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-8 text-center">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                                        ref.status === 'ACTIVE' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' : 'bg-amber-500/5 text-amber-600 border-amber-500/10'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${ref.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`}></div>
                                                        {ref.status || 'AUTHENTICATED'}
                                                    </span>
                                                </td>
                                                <td className="px-12 py-8 text-center">
                                                    <div className="text-lg font-black text-indigo-600 tabular-nums italic leading-none">+{ref.reward || '25'}</div>
                                                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic opacity-60">Credits Injected</div>
                                                </td>
                                                <td className="px-12 py-8 text-right">
                                                    <div className="text-[11px] font-black text-slate-400 tabular-nums italic opacity-80">{new Date(ref.created_at).toLocaleDateString()}</div>
                                                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">UTC-0500</div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-40 opacity-20">
                                                <Target size={84} strokeWidth={1} className="mx-auto mb-6" />
                                                <p className="text-[10px] font-black uppercase tracking-widest italic">The network awaits your first node</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserReferrals;
