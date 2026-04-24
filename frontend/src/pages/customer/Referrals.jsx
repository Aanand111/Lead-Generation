import React, { useState, useEffect } from 'react';
import {  
    Users, UserPlus, Share2, Wallet,History as HistoryIcon, 
    Gift, ArrowUpRight, Copy, CheckCircle, 
    Star, Target, Zap, Gem, ExternalLink, Activity,
    ChevronRight, Info, TrendingUp
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
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Refer & Earn</h2>
                    <p>Invite your friends and colleagues to the platform and earn bonus credits for every referral.</p>
                </div>
                <div className="pageHeaderActions flex items-center gap-4">
                    <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 px-6 py-3 rounded-2xl flex items-center gap-4 group hover:bg-[var(--primary)]/10 transition-all cursor-default">
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Referral Bonus</div>
                        <div className="flex items-center gap-2">
                             <TrendingUp size={16} className="text-[var(--primary)]" />
                            <span className="text-xl font-black text-[var(--primary)] tabular-nums">+15% Extra</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2">
                    <div className="card p-12 bg-[var(--surface-color)] border border-[var(--border-color)] relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] shadow-xl rounded-[3rem] group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-0 right-0 p-12 opacity-5 text-indigo-500 group-hover:opacity-10 transition-opacity">
                            <Share2 size={240} strokeWidth={1} />
                        </div>
                        
                        <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-8 shadow-inner shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <UserPlus size={48} strokeWidth={1.5} />
                        </div>
                        
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-4 text-center">Your Invite Link</h3>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] max-w-sm text-center uppercase leading-relaxed tracking-wider mb-10 opacity-70">
                            Share your unique code with others and earn credit rewards when they sign up and start using the app.
                        </p>

                        <div className="flex flex-col md:flex-row items-stretch gap-4 w-full max-w-lg mb-8 relative z-10 transition-transform hover:scale-102">
                            <div className="flex-1 bg-[var(--bg-color)]/50 backdrop-blur-md border border-[var(--border-color)] px-8 py-5 rounded-3xl flex items-center justify-between group/code active:scale-95 transition-all">
                                <div>
                                    <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-1">Your Referral Code</div>
                                    <div className="text-2xl font-black text-indigo-500 tracking-[0.2em]">{referralData.referralCode}</div>
                                </div>
                                <button onClick={copyCode} className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/10 shadow-sm active:scale-90 cursor-pointer">
                                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                            <button className="bg-indigo-500 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                <Share2 size={18} /> Share With Friends
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card p-8 shadow-lg border border-[var(--border-color)] bg-[var(--surface-color)] hover:-translate-y-1 transition-all">
                        <div className="text-[11px] font-black italic text-[var(--text-muted)] uppercase tracking-widest mb-2 opacity-70">Total Friends Joined</div>
                        <div className="text-4xl font-black text-indigo-500 tabular-nums leading-none tracking-tighter mb-4">{referralData.totalReferrals} Joined</div>
                        <div className="w-full h-1 bg-[var(--bg-color)] rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[60%] animate-pulse"></div>
                        </div>
                    </div>

                    <div className="card p-8 shadow-lg border border-[var(--border-color)] bg-[var(--surface-color)] hover:-translate-y-1 transition-all">
                        <div className="text-[11px] font-black italic text-[var(--text-muted)] uppercase tracking-widest mb-2 opacity-70">Total Referral Earnings</div>
                        <div className="text-4xl font-black text-emerald-500 tabular-nums leading-none tracking-tighter mb-4">{referralData.totalRewards} Earned</div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic animate-bounce-slow">
                            <Star size={12} fill="currentColor" /> Ready to use
                        </div>
                    </div>

                    <div className="card p-8 bg-[var(--bg-color)] border border-dashed border-[var(--border-color)] hover:border-indigo-500/30 transition-all group cursor-default">
                        <div className="flex items-center gap-4 mb-4">
                            <Gift size={20} className="text-rose-400 group-hover:rotate-12 transition-transform" />
                            <h4 className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dark)] italic">Bonus Goals</h4>
                        </div>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase leading-relaxed tracking-wider mb-4 opacity-70">Refer 50 active friends to unlock Elite Partner Status.</p>
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic flex items-center justify-end gap-2">View Goals <ChevronRight size={14} /></div>
                    </div>
                </div>
            </div>

            <div className="card shadow-xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)]">
                <div className="flex items-center justify-between p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                    <div className="flex items-center gap-3">
                        <HistoryIcon size={24} className="text-indigo-500" />
                        <h3 className="text-lg font-black uppercase tracking-tight italic">Referral History</h3>
                    </div>
                    <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 group italic">
                        View Full List <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-color)]/50 text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] border-b border-[var(--border-color)]">
                            <tr>
                                <th className="px-8 py-5">User Details</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Reward</th>
                                <th className="px-8 py-5 text-right">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-24 italic text-[var(--text-muted)] opacity-30">
                                         <div className="flex flex-col items-center gap-4">
                                            <div className="spinner mb-2"></div>
                                            <span className="text-[10px] uppercase font-black tracking-widest">Loading Records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : referralData.referralHistory.length > 0 ? (
                                referralData.referralHistory.map((ref, idx) => (
                                    <tr key={idx} className="border-b border-[var(--border-color)] group hover:bg-indigo-500/[0.02] transition-all last:border-0">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-sm text-[var(--text-dark)] uppercase leading-none">{ref.name}</div>
                                                    <div className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest italic mt-1.5 opacity-70">UID: {ref.phone.slice(-4)}-NODE</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                ref.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${ref.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                                {ref.status || 'Decrypted'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-indigo-500 tabular-nums italic leading-none">{ref.reward || '25'} Credits</div>
                                            <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1 opacity-70 italic whitespace-nowrap">Reward Received</div>
                                        </td>
                                        <td className="px-8 py-6 text-right text-[10px] text-[var(--text-muted)] font-bold tabular-nums italic opacity-80">{new Date(ref.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-24 italic text-[var(--text-muted)] opacity-30">
                                        <div className="flex flex-col items-center gap-6">
                                            <Activity size={84} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-widest text-xs italic">No referrals found yet</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserReferrals;
