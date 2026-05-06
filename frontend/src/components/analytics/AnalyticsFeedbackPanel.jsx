import React from 'react';
import { AlertTriangle, ArrowUpRight, Award, PieChart, ShieldAlert, TrendingUp } from 'lucide-react';

const AnalyticsFeedbackPanel = ({ analytics }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm flex flex-col justify-between italic bg-gradient-to-br from-[var(--surface-color)] to-[var(--bg-color)]">
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Award size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black uppercase tracking-tight text-[var(--text-dark)] leading-none mb-1">Quality Satisfaction Analytics</h4>
                            <p className="text-[10px] uppercase font-black text-indigo-600 tracking-widest opacity-60">System-wide customer feedback data</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {analytics.feedbackTrends.map((trend, index) => (
                            <div key={index} className="flex items-center gap-6 group">
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
                        {analytics.feedbackTrends.reduce((acc, trend) => acc + parseInt(trend.negative_reports, 10), 0)}
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
                    <p className="text-[11px] font-bold text-emerald-100 uppercase mt-2 italic leading-none tracking-widest">Happy Users</p>
                    <div className="mt-8 flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-white w-3/4 shadow-[0_0_8px_white]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsFeedbackPanel;
