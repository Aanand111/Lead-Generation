import React from 'react';
import { Activity, CheckCircle, Layers, TrendingUp } from 'lucide-react';

const AnalyticsSubscriptionsPanel = ({ analytics }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200">
                    <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-3 italic">Total Revenue Generated</p>
                    <h3 className="text-4xl font-black tracking-tighter leading-none mb-2">
                        Rs {analytics.subscriptionStats.reduce((acc, stat) => acc + parseFloat(stat.revenue_generated || 0), 0).toLocaleString()}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-200 uppercase tracking-widest italic pt-2 border-t border-white/10 mt-4">
                        <TrendingUp size={12} /> Revenue Growth Tracked
                    </div>
                </div>
                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-sm">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Active Subscriptions</p>
                    <h3 className="text-4xl font-black text-[var(--text-dark)] tracking-tighter leading-none mb-2">
                        {analytics.subscriptionStats.reduce((acc, stat) => acc + parseInt(stat.active_now || 0, 10), 0)}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic pt-2 border-t border-[var(--border-color)] mt-4">
                        <CheckCircle size={12} /> Sync Status: Green
                    </div>
                </div>
                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-sm">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3 italic">Average Node Value</p>
                    <h3 className="text-4xl font-black text-[var(--text-dark)] tracking-tighter leading-none mb-2">
                        Rs {(analytics.subscriptionStats.reduce((acc, stat) => acc + parseFloat(stat.revenue_generated || 0), 0) / (analytics.subscriptionStats.reduce((acc, stat) => acc + parseInt(stat.subscriber_count || 0, 10), 0) || 1)).toFixed(0)}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest italic pt-2 border-t border-[var(--border-color)] mt-4">
                        <Activity size={12} /> Operational Delta
                    </div>
                </div>
            </div>

            <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm italic">
                <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-10 flex items-center gap-3">
                    <Layers size={18} className="text-indigo-600" /> Subscription Plan Breakdown
                </h4>
                <div className="space-y-8">
                    {analytics.subscriptionStats.map((stat, index) => (
                        <div key={index} className="group">
                            <div className="flex justify-between items-baseline mb-3">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{index + 1}</span>
                                    <div>
                                        <span className="text-xs font-black text-[var(--text-dark)] uppercase tracking-tight">{stat.plan_name}</span>
                                        <span className="ml-2 text-[8px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest">{stat.category}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-[var(--text-dark)] leading-none tabular-nums">Rs {parseFloat(stat.revenue_generated || 0).toLocaleString()}</div>
                                    <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">{stat.subscriber_count} Nodes Integrated</div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-[var(--bg-color)] rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                                <div
                                    className={`h-full transition-all duration-1000 ${index === 0 ? 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.5)]' : 'bg-indigo-300'}`}
                                    style={{ width: `${(stat.subscriber_count / (Math.max(...analytics.subscriptionStats.map((item) => item.subscriber_count)) || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsSubscriptionsPanel;
