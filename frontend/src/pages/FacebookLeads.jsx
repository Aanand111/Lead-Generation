import React, { useState } from 'react';
import { Download, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Facebook, Search, Filter, RefreshCcw, Activity, Layers, ExternalLink } from 'lucide-react';

const FacebookLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            {/* Header Section */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        <Facebook className="text-blue-500" size={24} />
                        Facebook Lead Spectrum
                    </h2>
                    <p>Interface for monitoring and harvesting leads captured via Meta Advertising protocols</p>
                </div>
                <div className="pageHeaderActions flex items-center gap-3">
                    <button className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-5 py-3 rounded-xl transition-all shadow-sm">
                        <Download size={16} /> Export CSV
                    </button>
                    <button className="btn btn-primary flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/20">
                        <Plus size={16} /> Inject Lead
                    </button>
                </div>
            </div>

            {/* Stats Overview (Optional but adds premium feel) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-6">
                {[
                    { label: 'Total Sync', value: '0', icon: Activity, color: 'text-indigo-500' },
                    { label: 'Active Ads', value: '0', icon: Layers, color: 'text-blue-500' },
                ].map((stat, i) => (
                    <div key={i} className="card p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--surface-color)] flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-[var(--bg-color)] ${stat.color} shadow-sm border border-[var(--border-color)]`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{stat.label}</div>
                            <div className="text-xl font-black text-[var(--text-dark)]">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="card shadow-sm border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)]">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">
                            Meta Sync Status: <span className="text-emerald-500 not-italic font-black">Operational</span>
                        </span>
                        <div className="h-4 w-px bg-[var(--border-color)]"></div>
                        <button className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2 border-none bg-transparent cursor-pointer hover:underline">
                            <RefreshCcw size={12} /> Force Resync
                        </button>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium shadow-sm focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/50 text-[var(--text-dark)]" 
                            placeholder="Search meta nodes..." 
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="text-[var(--text-muted)]">Lead Identifier</th>
                                <th className="text-[var(--text-muted)]">Origin Protocol (Form)</th>
                                <th className="text-[var(--text-muted)]">Identity Matrix</th>
                                <th className="text-[var(--text-muted)]">Interface Nodes</th>
                                <th className="text-[var(--text-muted)]">Sync Created</th>
                                <th className="text-right text-[var(--text-muted)]">Payload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-24">
                                        <div className="spinner mb-2"></div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] animate-pulse">Hydrating Meta Data...</p>
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-24 text-[var(--text-muted)] italic">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Facebook size={64} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No recent Facebook nodes detected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead, index) => (
                                    <tr key={index} className="transition-all hover:bg-[var(--primary)]/[0.02] border-b border-[var(--border-color)] text-xs text-[var(--text-dark)]">
                                        <td>
                                            <div className="font-black text-[var(--text-dark)] tracking-tighter uppercase">{lead.lead_id}</div>
                                        </td>
                                        <td>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-tight border border-blue-500/20">
                                                <Layers size={10} /> {lead.form_id}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-black text-[var(--text-dark)] uppercase">{lead.name}</div>
                                            <div className="text-[10px] text-[var(--text-muted)] font-medium">{lead.email}</div>
                                        </td>
                                        <td>
                                            <div className="font-bold text-indigo-500 tabular-nums">{lead.phone}</div>
                                        </td>
                                        <td>
                                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase">
                                                {lead.created_at}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <button className="bg-transparent border border-[var(--border-color)] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-indigo-500 hover:border-indigo-500/50 transition-all cursor-pointer">
                                                <ExternalLink size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Section */}
            <div className="mt-8 flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Mesh Page <span className="text-[var(--text-dark)]">1</span> of <span className="text-[var(--text-dark)]">1</span>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] cursor-not-allowed opacity-40">
                        <ChevronsLeft size={16} />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-500/30">
                        1
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] cursor-not-allowed opacity-40">
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacebookLeads;
