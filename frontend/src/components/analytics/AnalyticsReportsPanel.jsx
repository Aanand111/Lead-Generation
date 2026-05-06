import React from 'react';

const AnalyticsReportsPanel = ({ analytics, leadReports, reportFilters, setReportFilters }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                    value={reportFilters.status}
                    className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500"
                    onChange={(event) => setReportFilters({ ...reportFilters, status: event.target.value })}
                >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SOLD">Sold</option>
                    <option value="EXPIRED">Expired</option>
                </select>
                <select
                    value={reportFilters.category}
                    className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500"
                    onChange={(event) => setReportFilters({ ...reportFilters, category: event.target.value })}
                >
                    <option value="">All Categories</option>
                    {analytics.leadLifecycle.categoryDistribution.map((category) => (
                        <option key={category.category} value={category.category}>{category.category}</option>
                    ))}
                </select>
                <button className="md:col-span-2 p-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                    Apply Filter Protocol
                </button>
            </div>

            <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] rounded-[2.5rem]">
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] text-[9px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Lead ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leadReports.map((lead, index) => (
                                <tr key={`${lead.lead_id || 'lead'}-${index}`} className="border-b border-[var(--border-color)]/30 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-[10px] font-black text-indigo-500 italic">{lead.lead_id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-black text-[var(--text-dark)] uppercase">{lead.customer_name}</div>
                                        <div className="text-[9px] text-[var(--text-muted)] font-bold">{lead.city}, {lead.state}</div>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)]">{lead.created_by_vendor}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest leading-none ${lead.purchase_date ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                            {lead.purchase_date ? 'SOLD' : 'AVAILABLE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] italic">
                                        {new Date(lead.upload_date).toLocaleDateString()}
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

export default AnalyticsReportsPanel;
