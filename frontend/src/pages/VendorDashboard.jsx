import React, { useState, useEffect, useMemo } from 'react';
import { 
    Users, UserCheck,Clock,TrendingUp, Wallet, ArrowRight,
    Sparkles, ShieldCheck, Activity, Bell, Zap, Layers, Plus, Briefcase
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const VendorDashboard = () => {
    const [stats, setStats] = useState({ 
        total_users: 0, 
        referred_vendors: 0, 
        total_earnings: 0, 
        pending_earnings: 0 
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/vendor/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const isPrimaryVendor = !user.referred_by;

    const handleCopyCode = (target) => {
        const suffix = target === 'vendor' ? '-V' : '-U';
        const code = `${stats.referral_code || 'CODE'}${suffix}`;
        navigator.clipboard.writeText(code);
        toast.success(`Professional ${target.toUpperCase()} Access Token copied!`);
    };

    const handleCopyLink = (target) => {
        const suffix = target === 'vendor' ? '-V' : '-U';
        const referralLink = `${window.location.origin}/register?ref=${stats.referral_code || 'JOIN'}${suffix}`;
        navigator.clipboard.writeText(referralLink);
        toast.success(`${target.toUpperCase()} invitation URL copied!`);
    };

    const handleWhatsAppShare = (target) => {
        const isVendor = target === 'vendor';
        const suffix = isVendor ? '-V' : '-U';
        const referralLink = `${window.location.origin}/register?ref=${stats.referral_code || 'JOIN'}${suffix}`;
        const message = `🚀 Join our elite Lead Generation Network as a ${isVendor ? 'Partner Vendor' : 'Customer'}! 🌐

Secure your access here: ${referralLink}

Protocol Token: ${stats.referral_code || 'JOIN'}${suffix}`;
        
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const InvitationCard = ({ target }) => {
        const isVendor = target === 'vendor';
        const currentCode = `${stats.referral_code || '... '}${isVendor ? '-V' : '-U'}`;
        
        return (
            <div className={`rounded-[2.5rem] p-[1px] shadow-2xl overflow-hidden group mb-8 ${isVendor ? 'bg-gradient-to-r from-amber-500/50 to-orange-600/50 hover:to-orange-500' : 'bg-gradient-to-r from-indigo-500/50 to-indigo-700/50 hover:to-indigo-600'} transition-all duration-500`}>
                <div className="bg-[var(--surface-elevated)] rounded-[2.45rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden backdrop-blur-3xl">
                    <div className="absolute top-0 right-0 p-12 text-indigo-500/5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
                        {isVendor ? <Briefcase size={260} /> : <Users size={260} />}
                    </div>
                    
                    <div className="space-y-4 relative z-10 text-center lg:text-left flex-1">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isVendor ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}`}>
                            {isVendor ? <ShieldCheck size={12} /> : <Sparkles size={12} />} 
                            {isVendor ? 'Grow Your Team' : 'Invite New Customers'}
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-dark)] uppercase tracking-tight leading-tight">
                            Refer a <span className={isVendor ? 'text-amber-500' : 'text-indigo-600'}>{isVendor ? 'Sub-Vendor' : 'New Client'}</span>
                        </h2>
                        <p className="text-xs font-bold text-[var(--text-muted)] italic max-w-md leading-relaxed opacity-70">
                            {isVendor ? 'Build your own team of vendors and earn commissions from their performance.' : 'Invite customers to the platform and earn rewards on every subscription they purchase.'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto relative z-10 items-center">
                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                           <div className="bg-black/10 dark:bg-white/5 border border-[var(--border-color)] rounded-2xl p-5 flex items-center justify-between gap-8 group/voucher shadow-inner min-w-[320px]">
                               <div>
                                   <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-60">YOUR REFERRAL CODE</p>
                                   <div className="text-2xl font-black text-[var(--text-dark)] tracking-[0.05em] tabular-nums">
                                       {currentCode}
                                   </div>
                               </div>
                               <button 
                                   onClick={() => handleCopyCode(target)} 
                                   className={`p-3.5 rounded-xl text-white shadow-xl transition-all active:scale-90 hover:scale-110 ${isVendor ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-700'}`}
                                   title="Copy Referral Code"
                               >
                                   <Layers size={18} />
                               </button>
                           </div>
                           <button 
                                onClick={() => handleCopyLink(target)}
                                className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-indigo-500 transition-colors text-center block w-full opacity-60 hover:opacity-100"
                           >
                               Or copy invitation link
                           </button>
                        </div>

                        <button 
                            onClick={() => handleWhatsAppShare(target)} 
                            className={`h-14 px-8 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl hover:-translate-y-1 w-full sm:w-auto ${isVendor ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                        >
                            <Bell size={18} /> Share on WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const statCards = [
        { title: 'My Customers', value: stats.total_users || 0, icon: Users, color: 'indigo', trend: '+12.5%' },
        { title: 'Team Size', value: stats.referred_vendors || 0, icon: UserCheck, color: 'indigo', trend: '+8.2%' },
        { title: 'Gross Earnings', value: `₹${(Number(stats.total_earnings) || 0).toLocaleString()}`, icon: TrendingUp, color: 'indigo', trend: '+12.5%' },
        { title: 'Available Balance', value: `₹${(Number(stats.wallet_balance) || 0).toLocaleString()}`, icon: Wallet, color: 'indigo', trend: '+15.9%' },
        { title: 'Pending Payout', value: `₹${(Number(stats.pending_earnings) || 0).toLocaleString()}`, icon: Clock, color: 'indigo', trend: '+0.0%' },
    ];

    return (
        <div className="animate-fade-in space-y-8">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 p-8 md:p-12 shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-400 rounded-full opacity-10 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4 backdrop-blur-md border border-white/10">
                            <Sparkles size={12} /> Vendor Overview
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 to-white/70">{user.full_name || user.name || 'User'}</span>
                        </h1>
                        <p className="text-indigo-100/70 font-medium text-lg leading-relaxed w-full">
                            Welcome back! Track your business growth, manage your team, and monitor your earnings in real-time.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center gap-3 text-white transition-all hover:bg-white/20 cursor-pointer" onClick={() => handleCopyLink('user')}>
                            <Zap size={18} className="text-yellow-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{stats.referral_code || 'GEN-CODE'}</span>
                        </div>
                        <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center gap-3 text-white">
                            <ShieldCheck size={18} className="text-indigo-200" />
                            <span className="text-xs font-black uppercase tracking-widest">Verified Vendor</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="card group hover:translate-y-[-4px] transition-all duration-300 border border-[var(--border-color)] shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 bg-[var(--surface-elevated)] p-6 rounded-[2rem]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                <stat.icon size={24} />
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black italic">
                                <TrendingUp size={10} /> {stat.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums">
                                {loading ? '---' : stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Invitation Sections */}
            <InvitationCard target="user" />
            {isPrimaryVendor && <InvitationCard target="vendor" />}

            {/* Growth Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-dark)] tracking-tight">Quick Actions</h2>
                            <p className="text-xs font-medium text-[var(--text-muted)]">Scale and manage your network effectively</p>
                        </div>
                        <Activity size={18} className="text-[var(--text-muted)]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Refer New User', desc: 'Invite a customer to join your network', path: '/vendor/refer-user', icon: Plus },
                            { title: 'Refer Sub-Vendor', desc: 'Onboard a partner to expand your reach', path: '/vendor/refer-vendor', icon: Briefcase },
                            { title: 'My Referrals', desc: 'Track and manage your referral list', path: '/vendor/referrals', icon: Users },
                            { title: 'Earnings & Payouts', desc: 'Monitor your rewards and commissions', path: '/vendor/earnings', icon: Wallet }
                        ].map((action, i) => (
                            <Link
                                key={i}
                                to={action.path}
                                className="group p-5 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center gap-4 transition-all hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm">
                                    {React.createElement(action.icon, { size: 20 })}
                                </div>
                                <div className="flex-1">
                                    <div className="font-black text-sm text-[var(--text-dark)] mb-0.5 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{action.title}</div>
                                    <div className="text-[10px] font-medium text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors italic">{action.desc}</div>
                                </div>
                                <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-dark)] tracking-tight">Network Activity</h2>
                            <p className="text-xs font-medium text-[var(--text-muted)]">Real-time business highlights</p>
                        </div>
                        <Bell size={18} className="text-[var(--text-muted)]" />
                    </div>

                    <div className="card space-y-4 p-8 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-[2.5rem]">
                        {[
                            { title: 'Commission Tracking', desc: 'Automatic commission tracking is active', icon: Zap },
                            { title: 'Verified Tracking', desc: 'Your referrals are being tracked accurately', icon: ShieldCheck },
                            { title: 'Active Growth', desc: 'Your network is expanding with new users', icon: Sparkles }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 flex-shrink-0 flex items-center justify-center transition-all group-hover:rotate-12">
                                    <item.icon size={18} />
                                </div>
                                <div>
                                    <div className="font-black text-[11px] text-[var(--text-dark)] uppercase tracking-widest">{item.title}</div>
                                    <p className="text-[10px] font-medium text-[var(--text-muted)] italic leading-snug mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 p-8 border border-indigo-100 dark:border-indigo-800 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 text-indigo-200 dark:text-indigo-800/50 group-hover:scale-150 transition-transform duration-700">
                            <Activity size={48} />
                        </div>
                        <h4 className="font-black text-indigo-900 dark:text-indigo-100 text-sm uppercase tracking-widest mb-1 relative z-10">Account Status</h4>
                        <p className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 italic relative z-10">Your account is active and verified.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
