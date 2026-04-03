import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
    Users,
    Briefcase,
    FileDigit,
    Calendar,
    Sparkles,
    ShieldCheck,
    Zap,
    Plus,
    ArrowRight,
    Activity,
    Bell,
    TrendingUp,
    Clock,
    Layers,
    Star
} from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState({
        summary: [],
        topVendors: [],
        recentActivity: [],
        leadsTrend: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
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

    const renderIcon = (iconName, color = 'indigo') => {
        const icons = { Users, Briefcase, FileDigit, Calendar };
        const IconComponent = icons[iconName] || Activity;
        return <IconComponent size={24} />;
    };

    return (
        <div className="page-content animate-fade-in space-y-8 pb-20">
            {/* Elegant Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 md:p-12 shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-400 rounded-full opacity-10 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4 backdrop-blur-md border border-white/10">
                            <Sparkles size={12} /> Command Center
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight uppercase">
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 to-white/70 italic">Admin</span>
                        </h1>
                        <p className="text-indigo-100/70 font-medium text-lg leading-relaxed max-w-xl italic">
                            The ecosystem is operating at peak efficiency. All nodes are synchronized across the 5G spectrum.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center gap-3 text-white">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]"></div>
                            <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">Network Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [1,2,3,4].map(i => <div key={i} className="h-32 rounded-3xl bg-[var(--surface-color)] animate-pulse border border-[var(--border-color)]"></div>)
                ) : (
                    data.summary.map((stat, i) => (
                        <div key={i} className="card group hover:translate-y-[-4px] transition-all duration-300 border border-[var(--border-color)] shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 bg-[var(--surface-color)] p-6 rounded-[2rem] relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className={`p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white`}>
                                    {renderIcon(stat.icon)}
                                </div>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black italic">
                                    <TrendingUp size={10} /> {stat.trend}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 italic">{stat.label}</p>
                                <h3 className="text-3xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums leading-none">
                                    {stat.value.toLocaleString()}
                                </h3>
                            </div>
                            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                                {renderIcon(stat.icon)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Intelligence Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Trends / Chart Placeholder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-sm overflow-hidden h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">Growth Spectrum</h3>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">Leads injection trend (7 Days)</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-indigo-600 hover:bg-white transition-all"><Activity size={16} /></button>
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-2 h-48 mb-6">
                            {data.leadsTrend.map((t, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                    <div className="w-full relative h-full flex flex-col justify-end">
                                        <div 
                                            className="w-full bg-indigo-100 dark:bg-indigo-900/20 rounded-t-xl group-hover:bg-indigo-600 transition-all cursor-default relative overflow-hidden"
                                            style={{ height: `${(t.leads / (Math.max(...data.leadsTrend.map(x => x.leads)) || 1)) * 100}%`, minHeight: '4px' }}
                                        >
                                            <div className="absolute top-0 right-0 w-8 h-32 bg-white/10 -rotate-45 translate-x-4 -translate-y-4"></div>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-widest">{t.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Performers (Vendor Productivity) */}
                <div className="space-y-6 flex flex-col h-full">
                    <div className="card flex-1 p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-sm font-black text-[var(--text-dark)] uppercase tracking-tight">Elite Nodes</h3>
                            <Link to="/analytics" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-all flex items-center gap-1">Full Telmetry <ArrowRight size={10} /></Link>
                        </div>

                        <div className="space-y-8 relative z-10">
                            {data.topVendors.length > 0 ? (
                                <>
                                    <div className="flex items-end justify-between gap-2 h-32 px-2">
                                        {data.topVendors.map((v, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div 
                                                    className="w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-t-lg group-hover:bg-emerald-500 transition-all cursor-default relative overflow-hidden"
                                                    style={{ height: `${(v.leads_uploaded / (Math.max(...data.topVendors.map(x => x.leads_uploaded)) || 1)) * 100}%`, minHeight: '4px' }}
                                                ></div>
                                                <span className="text-[7px] font-black uppercase text-[var(--text-muted)] tracking-tighter truncate w-full text-center">{v.name.split(' ')[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        {data.topVendors.slice(0, 3).map((vendor, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-color)]/30 border border-[var(--border-color)] group hover:border-indigo-500 transition-all">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black text-[10px] italic">#{i+1}</div>
                                                <div className="flex-1">
                                                    <div className="text-[11px] font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">{vendor.name}</div>
                                                    <div className="text-[8px] font-bold text-[var(--text-muted)] italic leading-none">{vendor.leads_uploaded} Leads</div>
                                                </div>
                                                <div className="flex items-center gap-0.5 text-amber-500">
                                                    <Star size={8} fill="currentColor" />
                                                    <span className="text-[10px] font-black">{parseFloat(vendor.rating || 0).toFixed(1)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-[var(--text-muted)] italic text-[10px] font-bold uppercase tracking-widest">No active nodes detected</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Operational Tier */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Feed */}
                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-sm">
                    <h3 className="text-sm font-black text-[var(--text-dark)] uppercase tracking-tight mb-8 flex items-center gap-3">
                        <Activity size={18} className="text-indigo-600" /> System Pulse Feed
                    </h3>
                    <div className="space-y-6">
                        {data.recentActivity.map((activity, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="w-1 h-10 bg-indigo-600/10 rounded-full group-hover:bg-indigo-600 transition-all overflow-hidden">
                                    <div className="w-full h-1/2 bg-indigo-600"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[11px] font-black text-[var(--text-dark)] uppercase tracking-tight">{activity.activity}</span>
                                        <span className="text-[8px] font-bold text-[var(--text-muted)] italic">{new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-[var(--text-muted)] italic">{activity.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Configuration Matrix (Previously Rapid Actions) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: 'New Lead', path: '/leads/create', icon: Plus, color: 'indigo' },
                        { title: 'Audit Nodes', path: '/vendors', icon: ShieldCheck, color: 'emerald' },
                        { title: 'Analytics', path: '/analytics', icon: Activity, color: 'indigo' },
                        { title: 'Pricing', path: '/subscriptions', icon: Layers, color: 'rose' }
                    ].map((action, i) => (
                        <Link
                            key={i}
                            to={action.path}
                            className="group p-6 rounded-[2rem] bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col justify-between h-32 transition-all hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm`}>
                                <action.icon size={20} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="font-black text-xs text-[var(--text-dark)] uppercase tracking-[0.2em]">{action.title}</div>
                                <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;