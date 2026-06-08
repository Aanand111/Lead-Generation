import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, CreditCard, Layers, ArrowUpRight,
    ArrowDownRight, Star, Clock, Trophy, Share2, Wallet,
    Zap, Gem, Target, TrendingUp, History as HistoryIcon, Image as ImageIcon,
    ShieldCheck, Sparkles, ArrowRight, ChevronRight, Bell, Calendar,
    Package, Activity, Crown, Cpu, Fingerprint, Award, Shield, UserPlus
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
    const [, setBanners] = useState([]);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const selectedBanner = null;
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

        const handleWalletUpdate = () => {
            fetchStats();
        };

        window.addEventListener('wallet_updated', handleWalletUpdate);
        return () => {
            window.removeEventListener('wallet_updated', handleWalletUpdate);
        };
    }, []);

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

    // ==========================================
    // 1. ELITE USER PREMIUM REDESIGN VIEW
    // ==========================================
    if (stats.isPremium) {
        return (
            <div className="page-content animate-fade-in space-y-10 pb-12">
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes goldFloat {
                        0% { transform: translateY(0px) rotate(4deg); }
                        50% { transform: translateY(-12px) rotate(2deg); }
                        100% { transform: translateY(0px) rotate(4deg); }
                    }
                    @keyframes goldGlowPulse {
                        0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.1), inset 0 0 15px rgba(212,175,55,0.05); }
                        50% { box-shadow: 0 0 35px rgba(212,175,55,0.25), inset 0 0 25px rgba(212,175,55,0.15); }
                    }
                    @keyframes slowRotate {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .gilded-vip-badge {
                        background: linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.02) 100%);
                        border: 1px solid rgba(212, 175, 55, 0.35);
                        color: #F5E5AB;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    }
                    .elite-obsidian-card {
                        background: linear-gradient(135deg, rgba(24, 24, 24, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%) !important;
                        border: 1px solid rgba(212, 175, 55, 0.22) !important;
                        box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 30px -5px rgba(212, 175, 55, 0.08) !important;
                    }
                    .elite-interactive-hud:hover {
                        border-color: rgba(212, 175, 55, 0.55) !important;
                        box-shadow: 0 15px 35px -10px rgba(212, 175, 55, 0.18) !important;
                        transform: translateY(-4px);
                    }
                `}} />

                {/* --- SPECTACULAR ELITE WELCOME SECTION --- */}
                <div className="relative overflow-hidden rounded-[3.5rem] p-10 md:p-14 border border-[#D4AF37]/35 shadow-[0_50px_100px_-20px_rgba(212,175,55,0.15)] bg-gradient-to-br from-[#0c0c0c] via-[#161616] to-[#000000] transition-all duration-700">
                    {/* Golden Ambient Blur Nodes */}
                    <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full blur-[140px] -translate-y-1/3 translate-x-1/4 bg-[#D4AF37]/10 animate-pulse"></div>
                    <div className="absolute -bottom-10 left-0 w-[350px] h-[350px] rounded-full blur-[110px] bg-amber-500/5 -translate-x-1/4"></div>

                    {/* Interactive background stardust orbits */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}></div>

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                        <div className="max-w-2xl text-center lg:text-left space-y-6">
                            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full gilded-vip-badge text-[10px] font-black uppercase tracking-[0.25em] backdrop-blur-md">
                                <Crown size={12} className="text-[#D4AF37] animate-bounce" fill="currentColor" /> 
                                Authenticated Elite VIP License
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                                WELCOME BACK,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5E5AB] via-[#D4AF37] to-[#F5E5AB] bg-[length:200%_auto] animate-shine">
                                    {stats.isPremium ? 'ELITE COMMANDER' : 'PARTNER'}
                                </span>
                            </h1>

                            <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed max-w-xl">
                                System parameters loaded. You are operating on the premium secure network grid. Enjoy absolute speed, priority lead reserves, and unlimited Visual Studio rendering.
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/user/leads/available')}
                                    className="px-10 py-5 bg-gradient-to-r from-[#F5E5AB] via-[#D4AF37] to-[#F5E5AB] text-black font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl hover:shadow-[#D4AF37]/35 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                                >
                                    Acquire Hot Leads <ArrowRight size={14} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={() => navigate('/user/subscriptions')}
                                    className="px-8 py-5 bg-white/5 hover:bg-white/10 text-white border border-[#D4AF37]/30 rounded-2xl font-black uppercase tracking-widest text-[10px] backdrop-blur-md transition-all flex items-center gap-2"
                                >
                                    <Gem size={14} fill="currentColor" className="text-[#D4AF37]" /> Manage Subscriptions
                                </button>
                            </div>
                        </div>

                        {/* --- Floating Elite Asset HUD Hologram --- */}
                        <div className="shrink-0 relative">
                            <div className="absolute inset-0 rounded-[3rem] blur-[30px] bg-[#D4AF37]/15 animate-pulse"></div>
                            <div 
                                className="w-80 h-48 rounded-[2.5rem] border border-[#D4AF37]/45 p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-2xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)',
                                    animation: 'goldFloat 6s ease-in-out infinite'
                                }}
                            >
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-[40px] pointer-events-none"></div>
                                
                                <div className="flex justify-between items-start z-10">
                                    <div className="flex items-center gap-2">
                                        <Fingerprint size={28} className="text-[#D4AF37] opacity-80" />
                                        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">VIP Node ID</div>
                                    </div>
                                    <Crown size={22} className="text-[#D4AF37]" fill="currentColor" />
                                </div>

                                <div className="z-10 space-y-1 my-4">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] opacity-80">Available Liquid Assets</div>
                                    <div className="text-4xl font-black text-white italic tracking-tight tabular-nums flex items-baseline gap-1">
                                        ₹{stats.creditBalance}
                                        <span className="text-[10px] font-black text-[#D4AF37] not-italic uppercase tracking-widest ml-1">Credits</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center z-10 border-t border-white/10 pt-3">
                                    <div className="text-[8px] font-bold text-white/50 uppercase tracking-widest">
                                        Owner: <span className="text-[#F5E5AB]">{stats.referralCode}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-400 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                        <Activity size={10} className="animate-pulse" /> Verified Node
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CORE STATISTICS ENGINE (THE GILDED VAULT) --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Liquid Reserve', value: `₹${stats.creditBalance}`, icon: <Wallet size={22} />, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10 border-[#D4AF37]/25', desc: 'Active Vault Balance' },
                        { label: 'Assets Secured', value: stats.totalPurchasedLeads, icon: <Package size={22} />, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10 border-[#D4AF37]/25', desc: 'Purchased Leads Portfolio' },
                        { label: 'Pipeline Density', value: stats.availableLeads, icon: <Activity size={22} />, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10 border-[#D4AF37]/25', desc: 'Total System Inventory' },
                        { label: 'Network Power', value: stats.totalReferrals, icon: <Users size={22} />, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10 border-[#D4AF37]/25', desc: 'Direct Network Connections' }
                    ].map((stat, i) => (
                        <div 
                            key={i} 
                            className="elite-obsidian-card elite-interactive-hud p-6 rounded-[2.5rem] transition-all duration-300 flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3.5 rounded-xl border flex items-center justify-center ${stat.bg} ${stat.color} shadow-lg shadow-[#D4AF37]/5`}>
                                    {stat.icon}
                                </div>
                                <Gem size={14} className="text-[#D4AF37] opacity-30 animate-pulse" />
                            </div>
                            <div>
                                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 italic">{stat.label}</div>
                                <div className="text-3xl font-black italic tracking-tighter uppercase text-white mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-[8px] font-bold text-white/50 uppercase tracking-tighter">{stat.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- VIP QUICK COMMAND HUD --- */}
                <div className="elite-obsidian-card p-8 rounded-[3rem] space-y-6">
                    <div className="flex items-center gap-3">
                        <Cpu size={18} className="text-[#D4AF37]" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#F5E5AB]">Elite Priority Shortcuts</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { title: 'Secure Hot Leads', path: '/user/leads/available', desc: 'Priority Inventory', icon: <Target size={16} /> },
                            { title: 'Design Ad Posters', path: '/user/posters', desc: 'Marketing Studio', icon: <ImageIcon size={16} /> },
                            { title: 'Recharge Credits', path: '/user/subscriptions', desc: 'Vault Topup', icon: <CreditCard size={16} /> },
                            { title: 'Invite Network', path: '/user/referrals', desc: 'Generate Code', icon: <UserPlus size={16} /> }
                        ].map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(btn.path)}
                                className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 text-left transition-all group flex flex-col justify-between h-28"
                            >
                                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {btn.icon}
                                </div>
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-tight text-white group-hover:text-[#D4AF37] transition-colors">{btn.title}</div>
                                    <div className="text-[8px] font-bold text-white/40 uppercase tracking-wider mt-0.5">{btn.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- NETWORK IDENTITY GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="elite-obsidian-card p-6 rounded-[2.5rem] flex items-center justify-between group transition-all elite-interactive-hud">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#F5E5AB] via-[#D4AF37] to-[#C59B27] text-black shadow-lg shadow-[#D4AF37]/15">
                                <Share2 size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Affiliate Reference Key</div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-black text-white tracking-widest uppercase">{stats.referralCode || 'N/A'}</span>
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-[#D4AF37]/15 text-[#F5E5AB] border border-[#D4AF37]/30">Elite Link Active</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(stats.referralCode);
                            }}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/45 flex items-center justify-center text-white/60 transition-all shadow-sm active:scale-90"
                        >
                            <Layers size={16} />
                        </button>
                    </div>

                    <div className="elite-obsidian-card p-6 rounded-[2.5rem] flex items-center justify-between group transition-all elite-interactive-hud">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                                <ShieldCheck size={22} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Connected Infrastructure Node</div>
                                <div className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    {stats.parentName || 'ROOT CORE INFRA'}
                                    <ChevronRight size={14} className="text-[#D4AF37]" />
                                </div>
                                <div className="text-[9px] font-bold italic uppercase flex items-center gap-1.5 text-[#D4AF37]/80">
                                    <Star size={9} fill="currentColor" /> {stats.parentRole || 'System Organic Direct Connection'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- DOUBLE-COLUMN SECURE DATABASE GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Leads Engine */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="elite-obsidian-card overflow-hidden rounded-[2.5rem]">
                            <div className="flex items-center justify-between p-8 border-b border-[#D4AF37]/15 bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/25">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight text-white">Elite Acquired Leads</h3>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Real-time Priority Reserves</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/user/leads/my')}
                                    className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] hover:text-black bg-[#D4AF37]/10 hover:bg-[#D4AF37] transition-all active:scale-95"
                                >
                                    View Full Vault
                                </button>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.03] text-[10px] uppercase font-black tracking-[0.2em] text-white/40">
                                        <tr>
                                            <th className="px-8 py-5">Prospect Identity Signature</th>
                                            <th className="px-8 py-5 text-center">Quality Lock</th>
                                            <th className="px-8 py-5 text-right">Acquire Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentPurchases && stats.recentPurchases.length > 0 ? (
                                            stats.recentPurchases.map((lead, idx) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-[#D4AF37]/5 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center font-black text-[10px] border border-[#D4AF37]/20">
                                                                {lead.lead_name?.[0] || 'L'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-white group-hover:text-[#D4AF37] transition-colors">{lead.lead_name || 'Anonymous Lead'}</div>
                                                                <div className="text-[9px] text-white/40 font-black italic uppercase tracking-tighter">UID: {lead.lead_uid || lead.lead_id} • {new Date(lead.purchase_date).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex justify-center">
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                                                                <ShieldCheck size={11} /> {lead.status || 'PREMIUM LOCK'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right font-black text-xs tabular-nums text-[#D4AF37] group-hover:scale-105 transition-transform">
                                                        {lead.credits_used || 10} CR
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-16 text-center text-xs font-bold text-white/30 uppercase tracking-[0.3em] italic">
                                                    No leads acquired yet. Tap "Acquire Hot Leads" above to begin.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* --- Empire Referral Engine Banner --- */}
                        <div className="relative group overflow-hidden rounded-[3rem] bg-gradient-to-r from-[#D4AF37] via-[#F5E5AB] to-[#C59B27] p-[1.5px] shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <div className="relative bg-[#0c0c0c] rounded-[2.9rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#D4AF37]/10 rounded-full blur-[60px] opacity-30"></div>
                                <div className="relative z-10 flex-1 text-center md:text-left">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#D4AF37] italic flex items-center justify-center md:justify-start gap-2">
                                        <Award size={14} className="animate-spin" style={{ animationDuration: '4s' }} /> Exclusive Referral Program
                                    </div>
                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-4">
                                        Expand Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5E5AB] via-[#D4AF37] to-[#F5E5AB]">Empire</span>
                                    </h3>
                                    <p className="text-white/50 text-sm font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                                        Invite your colleagues to our premium network and secure 50 loyalty credits directly into your liquid reserve on every active license.
                                    </p>
                                </div>
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <div className="flex -space-x-3 mb-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0c0c0c] bg-gradient-to-br from-[#D4AF37] to-black flex items-center justify-center text-[9px] font-black text-black shadow-lg">
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                        ))}
                                        <div className="w-9 h-9 rounded-full border-2 border-[#0c0c0c] bg-white/5 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-[#F5E5AB]">
                                            +100
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/user/referrals')}
                                        className="bg-gradient-to-r from-[#F5E5AB] to-[#D4AF37] text-black px-8 py-4 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                                    >
                                        Copy Secret Key
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ledger & Studio */}
                    <div className="space-y-8">
                        {/* Elite Live Ledger */}
                        <div className="elite-obsidian-card overflow-hidden rounded-[2.5rem]">
                            <div className="p-8 border-b border-[#D4AF37]/15 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/25">
                                        <HistoryIcon size={18} />
                                    </div>
                                    <h4 className="text-[14px] font-black uppercase tracking-tight text-white">Secure Audit Ledger</h4>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400 animate-pulse">
                                    Live
                                </div>
                            </div>
                            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                                    stats.recentTransactions.map((tx, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all cursor-default group hover:border-[#D4AF37]/30 hover:bg-black">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-white uppercase truncate max-w-[120px] group-hover:text-[#D4AF37] transition-colors">
                                                        {tx.remarks || tx.type.replace(/_/g, ' ')}
                                                    </div>
                                                    <div className="text-[9px] text-white/40 font-bold italic uppercase flex items-center gap-1 mt-0.5">
                                                        <Calendar size={10} />
                                                        {new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`text-sm font-black tabular-nums ${['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                {tx.credits ? (['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? `-${tx.credits}` : `+${tx.credits}`) : tx.amount}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 opacity-30 grayscale">
                                        <HistoryIcon size={40} className="mx-auto mb-4 text-[#D4AF37]" />
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white">Ledger Cleared</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Elite Visual Studio Mini-App */}
                        <div className="group relative">
                            <div className="absolute -inset-1 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 bg-gradient-to-r from-[#D4AF37]/30 to-[#F5E5AB]/30"></div>
                            <div className="relative elite-obsidian-card p-10 rounded-[3rem] overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.09] group-hover:-translate-x-4 group-hover:-translate-y-4 transition-all duration-700">
                                    <ImageIcon size={220} className="text-[#D4AF37]" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-2xl mb-8 transform group-hover:rotate-12 transition-transform bg-[#D4AF37] text-black shadow-[#D4AF37]/30">
                                        <ImageIcon size={28} />
                                    </div>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-3 italic text-white">Elite Visual Studio</h4>
                                    <p className="text-xs font-medium text-white/60 mb-8 leading-relaxed">
                                        Generate high-end marketing campaigns and lead posters instantly with your custom elite credentials embedded in real time.
                                    </p>
                                    <div className="flex items-center gap-3 mb-8 text-[11px] font-black uppercase tracking-widest text-[#D4AF37] italic bg-[#D4AF37]/10 w-fit px-4 py-2 rounded-full border border-[#D4AF37]/20">
                                        <Star size={14} fill="currentColor" className="animate-pulse" /> Free Priority Generation Active
                                    </div>
                                    <button
                                        onClick={() => navigate('/user/posters')}
                                        className="w-full py-5 bg-gradient-to-r from-[#F5E5AB] to-[#D4AF37] text-black rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 hover:shadow-[#D4AF37]/20"
                                    >
                                        Launch Studio <Zap size={14} fill="currentColor" className="text-black" />
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
    }

    // ==========================================
    // 2. STANDARD USER DASHBOARD VIEW
    // ==========================================
    return (
        <div className="page-content animate-fade-in space-y-8 pb-10">
            {/* --- Welcome Section --- */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-black transition-all duration-700">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 bg-indigo-500/10"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-md text-indigo-400">
                            <Sparkles size={12} fill="currentColor" /> Welcome Back, Partner
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-4 leading-tight">
                            Master Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                                Lead Pipeline
                            </span>
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
                                <Zap size={14} fill="currentColor" className="text-indigo-400" /> Upgrade Plan
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="w-64 h-64 relative">
                            <div className="absolute inset-0 rounded-full animate-pulse blur-3xl bg-indigo-500/20"></div>
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

            {/* --- Core Statistics Engine --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Asset Credits', value: `₹${stats.creditBalance}`, icon: <Wallet size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Leads Secured', value: stats.totalPurchasedLeads, icon: <Package size={24} />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Available Inventory', value: stats.availableLeads, icon: <Activity size={24} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Referral Force', value: stats.totalReferrals, icon: <TrendingUp size={24} />, color: 'text-royal-blue', bg: 'bg-royal-blue/10' }
                ].map((stat, i) => (
                    <div key={i} className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] shadow-lg transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 italic opacity-70">{stat.label}</div>
                        <div className="text-3xl font-black italic tracking-tighter uppercase leading-none text-[var(--text-dark)]">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Network & Identity Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 hover:border-indigo-500/30 rounded-[2rem] flex items-center justify-between group transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Affiliate Identity</div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-[var(--text-dark)] tracking-widest uppercase">{stats.referralCode || 'N/A'}</span>
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-500">Active</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(stats.referralCode);
                        }}
                        className="w-10 h-10 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] transition-all shadow-sm active:scale-90 hover:text-indigo-500 hover:border-indigo-500/30"
                    >
                        <Layers size={16} />
                    </button>
                </div>

                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
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
                        <div className="text-[10px] font-bold italic uppercase flex items-center gap-2 text-amber-500/80">
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
                                className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border border-indigo-500/10 text-indigo-500 hover:text-white bg-indigo-500/5 hover:bg-indigo-500 transition-all active:scale-95"
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
                                            <tr key={idx} className="border-b border-[var(--border-color)] group transition-all hover:bg-indigo-500/[0.03]">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] bg-indigo-500/10 text-indigo-500">
                                                            {lead.lead_name?.[0] || 'L'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-[var(--text-dark)] transition-colors group-hover:text-indigo-600">{lead.lead_name || 'Anonymous Lead'}</div>
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
                                                <td className="px-8 py-6 text-right font-black text-xs tabular-nums group-hover:scale-110 transition-transform text-indigo-500">
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
                    <div className="relative group overflow-hidden rounded-[3rem] bg-gradient-to-r from-indigo-500 to-indigo-600 p-[1.5px]">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="relative bg-[#121212] rounded-[2.9rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[60px] opacity-30"></div>
                            <div className="relative z-10 flex-1 text-center md:text-left">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic flex items-center justify-center md:justify-start gap-2 text-indigo-400">
                                    <Gem size={14} fill="currentColor" /> Premium Program
                                </div>
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-4">
                                    Expand Your Network
                                </h3>
                                <p className="text-white/50 text-sm font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                                    Invite your network and earn 50 credits for every active subscription your friends secure.
                                </p>
                            </div>
                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="flex -space-x-4 mb-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#121212] bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-[#121212] bg-white/5 backdrop-blur-md flex items-center justify-center text-[9px] font-black text-indigo-400">
                                        +12
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/user/referrals')}
                                    className="bg-white text-black px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95"
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
                                    <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-[var(--bg-color)]/30 border border-transparent transition-all cursor-default group hover:border-indigo-500/20 hover:bg-white">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? 'bg-rose-500/5 text-rose-500' : 'bg-emerald-500/5 text-emerald-500'}`}>
                                                {['PURCHASE', 'PAYOUT', 'EXTRA_POSTER'].includes(tx.type) ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-[var(--text-dark)] uppercase truncate max-w-[120px] transition-colors group-hover:text-indigo-600">
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
                        <div className="absolute -inset-1 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20"></div>
                        <div className="relative card p-10 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:-translate-x-4 group-hover:-translate-y-4 transition-all duration-700">
                                <ImageIcon size={220} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-2xl mb-8 transform group-hover:rotate-12 transition-transform bg-indigo-500 text-white shadow-indigo-500/30">
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
                                    className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-black/10 transition-all flex items-center justify-center gap-3 active:scale-95 hover:bg-indigo-600"
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
