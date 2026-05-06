import React from 'react';
import {
    Activity,
    AlertTriangle,
    ShieldAlert,
    Star,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const AnalyticsProductivityPanel = ({ analytics }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl relative overflow-hidden group">
                    <Activity size={80} className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3">Avg Conversion Rate</p>
                        <h3 className="text-4xl font-black text-emerald-500 tracking-tighter leading-none">
                            {(analytics.vendorProductivity.reduce((acc, vendor) => acc + parseFloat(vendor.conversion_rate), 0) / (analytics.vendorProductivity.length || 1)).toFixed(1)}%
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-emerald-600 font-black italic text-[9px] uppercase">
                            <TrendingUp size={10} /> Good Performance Range
                        </div>
                    </div>
                </div>
                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl relative overflow-hidden group border-l-4 border-l-indigo-600">
                    <Users size={80} className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3">Active Vendors</p>
                        <h3 className="text-4xl font-black text-[var(--text-dark)] tracking-tighter leading-none">
                            {analytics.vendorProductivity.length} <span className="text-xs opacity-30 font-black uppercase tracking-widest">Vendors</span>
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-indigo-600 font-black text-[9px] uppercase tracking-widest leading-none">
                            <ShieldAlert size={10} /> Total Registered
                        </div>
                    </div>
                </div>
                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl relative overflow-hidden group">
                    <Target size={80} className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3">Top Performers</p>
                        <h3 className="text-4xl font-black text-rose-500 tracking-tighter leading-none">
                            {analytics.vendorProductivity.reduce((acc, vendor) => acc + (Number(vendor.leads_uploaded) >= 10 ? 1 : 0), 0)} <span className="text-xs opacity-50 uppercase tracking-widest">High Vol</span>
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-rose-600 font-black text-[9px] uppercase tracking-widest leading-none">
                            <ShieldAlert size={10} /> Active Growth Nodes
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm">
                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-10 flex items-center gap-3">
                        <TrendingUp size={18} className="text-indigo-600" /> Vendor Upload vs Sales (Trends)
                    </h4>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.vendorTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }} />
                                <Bar dataKey="leads_uploaded" name="Uploaded" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="leads_sold" name="Purchased" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm">
                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-10 flex items-center gap-3">
                        <Activity size={18} className="text-indigo-600" /> Top Performer Productivity
                    </h4>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.vendorProductivity.slice(0, 7)}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="vendor_name" tick={{ fontSize: 8, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 8, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '10px' }} />
                                <Area type="monotone" dataKey="leads_uploaded" stroke="#6366f1" fillOpacity={1} fill="url(#colorLeads)" />
                                <Area type="monotone" dataKey="conversion_rate" stroke="#10b981" fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] rounded-[2.5rem]">
                <div className="table-responsive">
                    <table className="table hover-highlight mb-0 text-left">
                        <thead className="bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-6 text-[var(--text-muted)]">Vendor Details</th>
                                <th className="py-6 text-[var(--text-muted)]">Activity Data</th>
                                <th className="py-6 text-[var(--text-muted)]">Conversion Rate</th>
                                <th className="py-6 text-[var(--text-muted)] text-center">User Rating</th>
                                <th className="py-6 text-[var(--text-muted)] text-right px-8">Overall Health</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.vendorProductivity.map((vendor) => (
                                <tr key={vendor.id} className="group border-b border-[var(--border-color)]/30 hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black group-hover:scale-110 transition-all text-xs border border-indigo-500/20 shadow-sm leading-none pt-0.5 italic">
                                                {(vendor.vendor_name || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-black text-sm text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">{vendor.vendor_name || 'Anonymous Vendor'}</div>
                                                <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest italic leading-none">{vendor.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 leading-none">Uploaded</span>
                                                <span className="text-xs font-black text-[var(--text-dark)] leading-none">{vendor.leads_uploaded} <span className="opacity-30 font-black uppercase text-[8px]">PKTS</span></span>
                                            </div>
                                            <div className="flex flex-col border-l border-[var(--border-color)] pl-4">
                                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 leading-none">Purchased</span>
                                                <span className="text-xs font-black text-emerald-500 leading-none">{vendor.leads_purchased} <span className="opacity-50 font-black uppercase text-[8px]">LEADS</span></span>
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
                                                    <Star key={idx} size={10} fill={idx < Math.round(vendor.vendor_rating || 0) ? 'currentColor' : 'none'} className={idx < Math.round(vendor.vendor_rating || 0) ? '' : 'opacity-20'} />
                                                ))}
                                            </div>
                                            {vendor.reports_count > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[8px] font-black uppercase tracking-widest italic leading-none">
                                                    Reports: {vendor.reports_count}
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
                                            {vendor.conversion_rate >= 50 ? 'GOOD' :
                                                vendor.conversion_rate >= 20 ? 'AVERAGE' :
                                                'LOW'}
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
    );
};

export default AnalyticsProductivityPanel;
