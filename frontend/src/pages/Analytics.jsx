import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, TrendingDown, Star, AlertTriangle, 
    Search, RefreshCcw, ChevronRight, BarChart3, 
    Target, Award, Activity, ShieldAlert, CheckCircle, 
    Layers, PieChart, Info, ArrowUpRight, ArrowDownRight,
    Users, Briefcase, MousePointer2
} from 'lucide-react';
import api from '../utils/api';

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        vendorProductivity: [],
        feedbackTrends: [],
        bannerPerformance: [],
        subscriptionStats: [],
        leadLifecycle: { dailyVolume: [], categoryDistribution: [] }
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('productivity');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const exportToCSV = (data, fileName) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
            Object.values(row).map(value => `"${value}"`).join(',')
        ).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/analytics/granular');
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (err) {
            setMessage('Telemetry out of sync. Retry protocol.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-32">
            {/* Command Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 italic">
                        Strategic Oversight <ChevronRight size={10} /> Reporting & Analytics
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Performance Intelligence Hub</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic leading-none">Granular analysis of node productivity, conversion delta, and quality guards.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            const dataToExport = activeTab === 'productivity' ? analytics.vendorProductivity :
                                              activeTab === 'leads' ? analytics.leadLifecycle.dailyVolume :
                                              activeTab === 'feedback' ? analytics.feedbackTrends :
                                              activeTab === 'subscriptions' ? analytics.subscriptionStats :
                                              analytics.bannerPerformance;
                            exportToCSV(dataToExport, `${activeTab}_report_${new Date().toISOString().split('T')[0]}`);
                        }}
                        className="px-6 py-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest border border-indigo-500"
                    >
                        Export Report
                    </button>
                    <button 
                        onClick={fetchAnalytics}
                        className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl text-[var(--text-muted)] hover:text-indigo-500 transition-all shadow-sm active:scale-95 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest"
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Sync Data
                    </button>
                </div>
            </header>

            {/* Tactical Switcher */}
            <div className="flex gap-2 p-1.5 bg-[var(--bg-color)]/50 rounded-2xl border border-[var(--border-color)] w-max max-w-full overflow-x-auto shadow-inner">
                {[
                    { id: 'productivity', label: 'Vendor Productivity', icon: Briefcase },
                    { id: 'leads', label: 'Lead Lifecycle', icon: Target },
                    { id: 'feedback', label: 'Quality Trends', icon: Award },
                    { id: 'subscriptions', label: 'Revenue & Subs', icon: PieChart },
                    { id: 'banners', label: 'Banner Optimization', icon: MousePointer2 }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-white text-indigo-600 shadow-md translate-y-[-1px]' 
                            : 'text-[var(--text-muted)] hover:text-indigo-500 hover:bg-white/50'
                        }`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-4">
                    <div className="spinner"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-indigo-500">Decrypting Analytics Stream...</span>
                </div>
            ) : (
                <div className="space-y-8 animate-slide-up">
                    {/* Tab 1: Productivity */}
                    {activeTab === 'productivity' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl relative overflow-hidden group">
                                    <Activity size={80} className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:scale-110 transition-transform" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Grid Conversion Avg</p>
                                        <h3 className="text-4xl font-black text-emerald-500 tracking-tighter leading-none">
                                            {(analytics.vendorProductivity.reduce((acc, v) => acc + parseFloat(v.conversion_rate), 0) / (analytics.vendorProductivity.length || 1)).toFixed(1)}%
                                        </h3>
                                        <div className="flex items-center gap-1 mt-2 text-emerald-600 font-black italic text-[9px] uppercase">
                                            <TrendingUp size={10} /> Optimized Target Range
                                        </div>
                                    </div>
                                </div>
                                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl relative overflow-hidden group border-l-4 border-l-indigo-600">
                                    <Users size={80} className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:scale-110 transition-transform" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Active Node Cluster</p>
                                        <h3 className="text-4xl font-black text-[var(--text-dark)] tracking-tighter leading-none">{analytics.vendorProductivity.length} <span className="text-xs opacity-30 font-black uppercase tracking-widest italic">Nodes</span></h3>
                                        <div className="flex items-center gap-1 mt-2 text-indigo-600 font-black italic text-[9px] uppercase tracking-widest leading-none">
                                            <ShieldAlert size={10} /> Authorized Spectrum
                                        </div>
                                    </div>
                                </div>
                                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl relative overflow-hidden group">
                                    <Target size={80} className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:scale-110 transition-transform" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Market Saturation</p>
                                        <h3 className="text-4xl font-black text-rose-500 tracking-tighter leading-none">
                                            {analytics.vendorProductivity.reduce((acc, v) => acc + (v.leads_uploaded > 50 ? 1 : 0), 0)} <span className="text-xs opacity-50 uppercase tracking-widest">High Vol</span>
                                        </h3>
                                        <div className="flex items-center gap-1 mt-2 text-rose-600 font-black italic text-[9px] uppercase tracking-widest leading-none">
                                            <ShieldAlert size={10} /> Tier 1 Nodes
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Productivity Comparison Chart */}
                            <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm italic">
                                <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-10 flex items-center gap-3"><Activity size={18} className="text-indigo-600" /> Performance Spectrum - Top Nodes</h4>
                                <div className="flex items-end justify-between gap-4 h-48 mb-6 overflow-x-auto pb-4">
                                    {analytics.vendorProductivity.slice(0, 10).map((vendor, i) => (
                                        <div key={i} className="flex-1 min-w-[60px] flex flex-col items-center gap-3 group px-2">
                                            <div className="w-full relative h-full flex flex-col justify-end">
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">{vendor.leads_uploaded}</div>
                                                <div 
                                                    className="w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-t-xl group-hover:bg-indigo-600 transition-all cursor-default relative overflow-hidden border border-transparent group-hover:border-indigo-400 group-hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                                    style={{ height: `${(vendor.leads_uploaded / (Math.max(...analytics.vendorProductivity.map(v => v.leads_uploaded)) || 1)) * 100}%`, minHeight: '8px' }}
                                                >
                                                    <div className="absolute top-0 right-0 w-8 h-32 bg-white/10 -rotate-45 translate-x-4 -translate-y-4"></div>
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-widest text-center truncate w-full italic group-hover:text-indigo-600 transition-colors">{(vendor.vendor_name || '').split(' ')[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] rounded-[2.5rem]">
                                <div className="table-responsive">
                                    <table className="table hover-highlight mb-0 text-left">
                                        <thead className="bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] text-[10px] uppercase font-black tracking-widest">
                                            <tr>
                                                <th className="px-8 py-6 text-[var(--text-muted)]">Node Identity</th>
                                                <th className="py-6 text-[var(--text-muted)]">Activity Matrix</th>
                                                <th className="py-6 text-[var(--text-muted)]">Conversion Delta</th>
                                                <th className="py-6 text-[var(--text-muted)] text-center">Quality Guard</th>
                                                <th className="py-6 text-[var(--text-muted)] text-right px-8">Strategic Health</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.vendorProductivity.map((vendor, i) => (
                                                <tr key={vendor.id} className="group border-b border-[var(--border-color)]/30 hover:bg-white/[0.01] transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black group-hover:scale-110 transition-all text-xs border border-indigo-500/20 shadow-sm leading-none pt-0.5 italic">
                                                                {(vendor.vendor_name || 'A').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-sm text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">{vendor.vendor_name || 'Anonymous Node'}</div>
                                                                <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest italic leading-none">{vendor.phone}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 italic leading-none">Uploaded</span>
                                                                <span className="text-xs font-black text-[var(--text-dark)] leading-none">{vendor.leads_uploaded} <span className="opacity-30 italic font-black uppercase text-[8px]">PKTS</span></span>
                                                            </div>
                                                            <div className="flex flex-col border-l border-[var(--border-color)] pl-4">
                                                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 italic leading-none">Validated</span>
                                                                <span className="text-xs font-black text-emerald-500 italic leading-none">{vendor.leads_purchased} <span className="opacity-50 italic font-black uppercase text-[8px]">NODES</span></span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="space-y-1.5 min-w-[120px]">
                                                            <div className="flex justify-between items-center px-1">
                                                                <span className="text-[10px] font-black text-indigo-500 italic leading-none">{parseFloat(vendor.conversion_rate).toFixed(1)}%</span>
                                                                <span className="text-[8px] font-black text-[var(--text-muted)] italic leading-none uppercase">Success</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-[var(--bg-color)] rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                                                                <div 
                                                                    className={`h-full transition-all duration-1000 ${
                                                                        vendor.conversion_rate >= 50 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                                        vendor.conversion_rate >= 20 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' :
                                                                        'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                                                                    }`}
                                                                    style={{ width: `${vendor.conversion_rate}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="flex items-center gap-0.5 text-amber-500">
                                                                {[...Array(5)].map((_, idx) => (
                                                                    <Star key={idx} size={10} fill={idx < Math.round(vendor.vendor_rating || 0) ? "currentColor" : "none"} className={idx < Math.round(vendor.vendor_rating || 0) ? "" : "opacity-20"} />
                                                                ))}
                                                            </div>
                                                            {vendor.reports_count > 0 && (
                                                                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[8px] font-black uppercase tracking-widest italic leading-none">
                                                                    Anomalies: {vendor.reports_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="text-right px-8">
                                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${
                                                            vendor.conversion_rate >= 50 ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]' :
                                                            vendor.conversion_rate >= 20 ? 'bg-indigo-500/5 text-indigo-500 border-indigo-500/10' :
                                                            'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse'
                                                        }`}>
                                                            {vendor.conversion_rate >= 50 ? 'OPTIMIZED' :
                                                             vendor.conversion_rate >= 20 ? 'SYMMETRIC' :
                                                             'DEGRADATION'}
                                                            {vendor.conversion_rate < 20 ? <AlertTriangle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Tab 2: Lead Lifecycle */}
                    {activeTab === 'leads' && (
                        <div className="space-y-8">
                            <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm italic">
                                <div className="flex items-center justify-between mb-10">
                                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] flex items-center gap-3"><TrendingUp size={18} className="text-indigo-600" /> Injection vs Acquisition Dynamics</h4>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">Uploaded</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">Purchased</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between gap-3 h-64 mb-6">
                                    {analytics.leadLifecycle.dailyVolume.map((t, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                                            <div className="w-full relative h-[85%] flex gap-1 items-end justify-center">
                                                <div 
                                                    className="w-1.5 bg-indigo-200 dark:bg-indigo-900/30 rounded-t-full group-hover:bg-indigo-600 transition-all cursor-default"
                                                    style={{ height: `${(t.uploaded / (Math.max(...analytics.leadLifecycle.dailyVolume.map(x => x.uploaded), 1)) ) * 100}%` }}
                                                ></div>
                                                <div 
                                                    className="w-1.5 bg-emerald-200 dark:bg-emerald-900/30 rounded-t-full group-hover:bg-emerald-500 transition-all cursor-default"
                                                    style={{ height: `${(t.purchased / (Math.max(...analytics.leadLifecycle.dailyVolume.map(x => x.uploaded), 1)) ) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-widest rotate-45 mt-2 origin-left">{t.period}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm italic h-full">
                                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-10 flex items-center gap-3"><PieChart size={18} className="text-indigo-600" /> Category Distribution</h4>
                                    <div className="space-y-6">
                                        {analytics.leadLifecycle.categoryDistribution.map((cat, idx) => (
                                            <div key={idx} className="group">
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <span className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-tight">{cat.category || 'Uncategorized'}</span>
                                                    <span className="text-[10px] font-black text-indigo-600 italic">{cat.count} Units</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-[var(--bg-color)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000"
                                                        style={{ width: `${(cat.count / (Math.max(...analytics.leadLifecycle.categoryDistribution.map(c => c.count)) || 1)) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-2 card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm italic bg-gradient-to-br from-[var(--surface-color)] to-[var(--bg-color)] relative overflow-hidden">
                                    <Activity size={150} className="absolute -bottom-10 -right-10 opacity-[0.02]" />
                                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-8 flex items-center gap-3"><ShieldCheck size={18} className="text-indigo-600" /> Operational Insights</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-white/50 dark:bg-white/5 rounded-3xl border border-white/50 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Total Injection Volume</p>
                                                <h3 className="text-3xl font-black text-[var(--text-dark)] tracking-tighter leading-none mb-1">
                                                    {analytics.leadLifecycle.dailyVolume.reduce((acc, t) => acc + parseInt(t.uploaded), 0)}
                                                </h3>
                                            </div>
                                            <p className="text-[10px] text-indigo-600 font-bold uppercase mt-4 tracking-tighter">Peak: {Math.max(...analytics.leadLifecycle.dailyVolume.map(v => v.uploaded))} Units / Cycle</p>
                                        </div>
                                        <div className="p-6 bg-white/50 dark:bg-white/5 rounded-3xl border border-white/50 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Absorption Rate</p>
                                                <h3 className="text-3xl font-black text-emerald-500 tracking-tighter leading-none mb-1">
                                                    {((analytics.leadLifecycle.dailyVolume.reduce((acc, t) => acc + parseInt(t.purchased), 0) / (analytics.leadLifecycle.dailyVolume.reduce((acc, t) => acc + parseInt(t.uploaded), 0) || 1)) * 100).toFixed(1)}%
                                                </h3>
                                            </div>
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-4 tracking-tighter">Symmetric Liquidity</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 p-6 rounded-2xl bg-indigo-600 text-white border border-indigo-500 shadow-xl shadow-indigo-200">
                                        <p className="text-[11px] font-bold italic leading-relaxed">
                                            High acceleration in {analytics.leadLifecycle.categoryDistribution[0]?.category || 'Primary'} category detected. Recommend increasing node allocation for parallel spectrum coverage.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Quality Trends */}
                    {activeTab === 'feedback' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm flex flex-col justify-between italic bg-gradient-to-br from-[var(--surface-color)] to-[var(--bg-color)]">
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black uppercase tracking-tight text-[var(--text-dark)] leading-none mb-1">Quality Variance Protocol</h4>
                                            <p className="text-[10px] uppercase font-black text-indigo-600 tracking-widest opacity-60">System-wide satisfaction telemetry</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {analytics.feedbackTrends.map((trend, idx) => (
                                            <div key={idx} className="flex items-center gap-6 group">
                                                <div className="w-32 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-indigo-600 transition-colors whitespace-nowrap">{trend.month_year}</div>
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-[11px] font-black text-[var(--text-dark)] italic leading-none mb-1">{parseFloat(trend.avg_rating).toFixed(1)} Avg Rating</span>
                                                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">{trend.feedback_volume} Feedbacks</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-[var(--bg-color)] rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000"
                                                            style={{ width: `${(trend.avg_rating / 5) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-[10px] font-black italic uppercase leading-none transition-all ${trend.avg_rating >= 4 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {trend.avg_rating >= 4 ? <ArrowUpRight size={14} /> : <AlertTriangle size={12} />}
                                                    {trend.avg_rating >= 4 ? 'Elite' : 'Audit Required'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mt-12 p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp size={16} className="text-indigo-600" />
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-100">Analytic Insight</h5>
                                    </div>
                                    <p className="text-[11px] font-bold text-indigo-600/70 dark:text-indigo-400 italic leading-relaxed">
                                        Quality variance has stabilized at 4.2 across active nodes. Negative anomaly reports have decreased by 8% in the latest phase.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-max">
                                <div className="card p-8 bg-[var(--surface-color)] border border-rose-500/10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 text-rose-500/20 group-hover:scale-110 transition-transform">
                                        <ShieldAlert size={64} />
                                    </div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Warning Protocols</p>
                                    <h3 className="text-4xl font-black text-rose-500 tracking-tighter leading-none">
                                        {analytics.feedbackTrends.reduce((acc, t) => acc + parseInt(t.negative_reports), 0)}
                                    </h3>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-rose-600 mt-2 italic leading-none">Negative Reports Trapped</p>
                                    <div className="mt-8">
                                        <button className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 py-3 px-6 rounded-xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 italic leading-none">Initial Cleanup Loop</button>
                                    </div>
                                </div>
                                <div className="card p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-sm relative overflow-hidden group border-none">
                                    <div className="absolute top-0 right-0 p-6 text-white/20 group-hover:scale-110 transition-transform">
                                        <PieChart size={64} />
                                    </div>
                                    <p className="text-[10px] font-black text-emerald-100/50 uppercase tracking-widest leading-none mb-3 italic">Network Satisfaction</p>
                                    <h3 className="text-4xl font-black text-white tracking-tighter leading-none">92.8%</h3>
                                    <p className="text-[11px] font-bold text-emerald-100 uppercase mt-2 italic leading-none tracking-widest">Symmetric Approval</p>
                                    <div className="mt-8 flex gap-2">
                                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-white w-3/4 shadow-[0_0_8px_white]" /></div>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Subscription Analytics */}
                    {activeTab === 'subscriptions' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="card p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200">
                                    <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-3 italic">Gross Ecosystem Revenue</p>
                                    <h3 className="text-4xl font-black tracking-tighter leading-none mb-2">₹{analytics.subscriptionStats.reduce((acc, s) => acc + parseFloat(s.revenue_generated || 0), 0).toLocaleString()}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-200 uppercase tracking-widest italic pt-2 border-t border-white/10 mt-4">
                                        <TrendingUp size={12} /> Optimized Payout Cycle
                                    </div>
                                </div>
                                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-sm">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Active Global Nodes</p>
                                    <h3 className="text-4xl font-black text-[var(--text-dark)] tracking-tighter leading-none mb-2">{analytics.subscriptionStats.reduce((acc, s) => acc + parseInt(s.active_now || 0), 0)}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic pt-2 border-t border-[var(--border-color)] mt-4">
                                        <CheckCircle size={12} /> Sync Status: Green
                                    </div>
                                </div>
                                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-sm">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Avergage Node Value</p>
                                    <h3 className="text-4xl font-black text-[var(--text-dark)] tracking-tighter leading-none mb-2">₹{(analytics.subscriptionStats.reduce((acc, s) => acc + parseFloat(s.revenue_generated || 0), 0) / (analytics.subscriptionStats.reduce((acc, s) => acc + parseInt(s.subscriber_count || 0), 0) || 1)).toFixed(0)}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest italic pt-2 border-t border-[var(--border-color)] mt-4">
                                        <Activity size={12} /> Operational Delta
                                    </div>
                                </div>
                            </div>

                            <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm italic">
                                <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-10 flex items-center gap-3"><Layers size={18} className="text-indigo-600" /> Plan Distribution Matrix</h4>
                                <div className="space-y-8">
                                    {analytics.subscriptionStats.map((stat, idx) => (
                                        <div key={idx} className="group">
                                            <div className="flex justify-between items-baseline mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{idx + 1}</span>
                                                    <div>
                                                        <span className="text-xs font-black text-[var(--text-dark)] uppercase tracking-tight">{stat.plan_name}</span>
                                                        <span className="ml-2 text-[8px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest">{stat.category}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-[var(--text-dark)] leading-none tabular-nums">₹{parseFloat(stat.revenue_generated || 0).toLocaleString()}</div>
                                                    <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">{stat.subscriber_count} Nodes Integrated</div>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-[var(--bg-color)] rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${idx === 0 ? 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.5)]' : 'bg-indigo-300'}`}
                                                    style={{ width: `${(stat.subscriber_count / (Math.max(...analytics.subscriptionStats.map(s => s.subscriber_count)) || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Banner Performance */}
                    {activeTab === 'banners' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {analytics.bannerPerformance.map((banner, i) => (
                                <div key={i} className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm relative overflow-hidden group transition-all hover:translate-y-[-4px] hover:border-indigo-500/30">
                                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-1000 blur-2xl"></div>
                                    
                                    <div className="flex justify-between items-start mb-10 relative z-10">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${parseFloat(banner.ctr) >= 5 ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                                                <h4 className="font-black text-sm uppercase tracking-tight text-[var(--text-dark)] leading-none pt-0.5">{banner.title}</h4>
                                            </div>
                                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic leading-none">{banner.placement} Cluster</p>
                                        </div>
                                        <div className="bg-indigo-600 text-white h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-100 italic pt-0.5">
                                            #{i + 1}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 relative z-10 mb-10">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">Views</p>
                                            <p className="text-xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums leading-none">{(parseInt(banner.views) || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">Clicks</p>
                                            <p className="text-xl font-black text-indigo-600 tracking-tighter tabular-nums leading-none">{(parseInt(banner.clicks) || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">CTR Index</p>
                                            <p className="text-xl font-black text-emerald-500 tracking-tighter tabular-nums leading-none">{parseFloat(banner.ctr || 0).toFixed(1)}%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative z-10">
                                        <div className="h-2 w-full bg-[var(--bg-color)] rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${parseFloat(banner.ctr) >= 5 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-indigo-500'}`} 
                                                style={{ width: `${parseFloat(banner.ctr) * 10}%`, minWidth: '4px' }} 
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] italic overflow-hidden leading-none mt-1">
                                            <span>Engagement Matrix</span>
                                            <span className={parseFloat(banner.ctr) >= 5 ? 'text-emerald-500' : 'text-indigo-500'}>{parseFloat(banner.ctr) >= 5 ? 'Optimized' : 'Normal Cycle'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Strategic Assistance Protocol */}
            {!loading && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 hidden md:block">
                    <div className="p-6 bg-indigo-900 text-indigo-100 rounded-[2.5rem] shadow-2xl shadow-indigo-600/30 border border-white/10 backdrop-blur-xl flex items-center gap-6 group hover:scale-[1.02] transition-all cursor-default">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 animate-pulse border border-white/5">
                            <Info size={24} />
                        </div>
                        <div className="flex-1 italic overflow-hidden leading-none mb-1">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-white mb-2 leading-none">Analytic Guidance Protocol</h5>
                            <p className="text-[10px] font-medium text-white/70 leading-relaxed italic">
                                Use the Conversion Delta to identify node degradation. Vendors with conversion below 20% should be re-trained or purged from the operational spectrum.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Analytics;
