import React from 'react';
import { Activity, PieChart, ShieldCheck, TrendingUp } from 'lucide-react';

const AnalyticsLeadsPanel = ({ analytics }) => {
    return (
        <div className="space-y-8">
            <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] flex items-center gap-3">
                        <TrendingUp size={18} className="text-indigo-600" /> Upload vs Purchase Trends
                    </h4>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Uploaded</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Purchased</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-end justify-between gap-1 h-64 mb-14 px-2">
                    {analytics.leadLifecycle.dailyVolume.map((trend, index) => {
                        const maxVal = Math.max(...analytics.leadLifecycle.dailyVolume.map((item) => item.uploaded), ...analytics.leadLifecycle.dailyVolume.map((item) => item.purchased), 1);
                        const upHeight = Math.min((trend.uploaded / maxVal) * 100, 100);
                        const purHeight = Math.min((trend.purchased / maxVal) * 100, 100);

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center group h-full">
                                <div className="w-full relative h-[75%] flex gap-0.5 items-end justify-center overflow-hidden rounded-t-lg">
                                    <div
                                        className="w-1.5 bg-indigo-500/20 dark:bg-indigo-900/40 rounded-t-full group-hover:bg-indigo-600 transition-all duration-500 cursor-pointer relative"
                                        style={{ height: `${upHeight}%` }}
                                    >
                                        {upHeight > 0 && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity text-[7px] font-black p-0.5 bg-indigo-600 text-white rounded mb-0.5 z-20">{trend.uploaded}</div>}
                                    </div>
                                    <div
                                        className="w-1.5 bg-emerald-500/20 dark:bg-emerald-900/40 rounded-t-full group-hover:bg-emerald-500 transition-all duration-500 cursor-pointer relative"
                                        style={{ height: `${purHeight}%` }}
                                    >
                                        {purHeight > 0 && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity text-[7px] font-black p-0.5 bg-emerald-500 text-white rounded mb-0.5 z-20">{trend.purchased}</div>}
                                    </div>
                                </div>
                                <div className="h-[25%] flex items-start justify-center pt-4">
                                    <span className="text-[7px] font-black uppercase text-[var(--text-muted)] tracking-tighter rotate-[-45deg] whitespace-nowrap origin-top-right">
                                        {trend.period}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm h-full">
                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-10 flex items-center gap-3">
                        <PieChart size={18} className="text-indigo-600" /> Category Distribution
                    </h4>
                    <div className="space-y-6">
                        {analytics.leadLifecycle.categoryDistribution.map((category, index) => (
                            <div key={index} className="group">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-tight">{category.category || 'Uncategorized'}</span>
                                    <span className="text-[10px] font-black text-indigo-600 italic">{category.count} Units</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--bg-color)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000"
                                        style={{ width: `${(category.count / (Math.max(...analytics.leadLifecycle.categoryDistribution.map((item) => item.count)) || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm bg-gradient-to-br from-[var(--surface-color)] to-[var(--bg-color)] relative overflow-hidden">
                    <Activity size={150} className="absolute -bottom-10 -right-10 opacity-[0.02]" />
                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-8 flex items-center gap-3">
                        <ShieldCheck size={18} className="text-indigo-600" /> Operational Insights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white/50 dark:bg-white/5 rounded-3xl border border-white/50 flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3">Total Upload Volume</p>
                                <h3 className="text-3xl font-black text-[var(--text-dark)] tracking-tighter leading-none mb-1">
                                    {analytics.leadLifecycle.dailyVolume.reduce((acc, trend) => acc + parseInt(trend.uploaded, 10), 0)}
                                </h3>
                            </div>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase mt-4 tracking-tighter">
                                Peak: {Math.max(...analytics.leadLifecycle.dailyVolume.map((item) => item.uploaded))} Units
                            </p>
                        </div>
                        <div className="p-6 bg-white/50 dark:bg-white/5 rounded-3xl border border-white/50 flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3">Purchase Rate</p>
                                <h3 className="text-3xl font-black text-emerald-500 tracking-tighter leading-none mb-1">
                                    {((analytics.leadLifecycle.dailyVolume.reduce((acc, trend) => acc + parseInt(trend.purchased, 10), 0) / (analytics.leadLifecycle.dailyVolume.reduce((acc, trend) => acc + parseInt(trend.uploaded, 10), 0) || 1)) * 100).toFixed(1)}%
                                </h3>
                            </div>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-4 tracking-tighter">Active Lead Flow</p>
                        </div>
                    </div>
                    <div className="mt-8 p-6 rounded-2xl bg-indigo-600 text-white border border-indigo-500 shadow-xl shadow-indigo-200">
                        <p className="text-[11px] font-bold leading-relaxed">
                            Growth in {analytics.leadLifecycle.categoryDistribution[0]?.category || 'Primary'} category detected. Consider optimizing vendor assignments for this area.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsLeadsPanel;
