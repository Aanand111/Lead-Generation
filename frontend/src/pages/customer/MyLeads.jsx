import React, { useState, useEffect } from 'react';
import {  
    Search, MapPin, Smartphone, Mail, Download,History as HistoryIcon, 
    MoreVertical, Info, Activity, MessageSquare, Clipboard, 
    Zap, Gem, Target, TrendingUp, CheckCircle, ExternalLink,
    Filter, RefreshCcw
 } from 'lucide-react';
import api from '../../utils/api';

const UserMyLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);

    const fetchMyLeads = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/user/my-leads');
            if (data.success) {
                setLeads(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch acquired leads", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyLeads();
    }, []);

    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.phone.includes(searchTerm) ||
        l.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // Toast or message logic could go here
    };

    const exportToCSV = () => {
        if (leads.length === 0) return;
        
        const headers = ["ID", "Customer Name", "Phone", "Email", "City", "State", "Acquisition Status", "Purchase Date"];
        const rows = leads.map(l => [
            l.id,
            l.name,
            l.phone,
            l.email || 'N/A',
            l.city,
            l.state,
            l.status || 'ACQUIRED',
            new Date(l.purchase_date || Date.now()).toLocaleDateString()
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Acquired_Intelligence_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printReport = () => {
        window.print();
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            <style>
                {`
                @media print {
                    .no-print, .pageHeaderActions, .pageHeader p, .mb-10 { display: none !important; }
                    .page-content { padding: 0 !important; color: black !important; }
                    .grid { display: block !important; }
                    .card { break-inside: avoid; border: 1px solid #eee !important; margin-bottom: 2rem !important; page-break-after: auto; }
                    body { background: white !important; }
                }
                `}
            </style>
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Acquired Intelligence</h2>
                    <p>Access full identity protocols and contact details for your decrypted leads</p>
                </div>
                <div className="pageHeaderActions flex items-center gap-3">
                    <div className="flex bg-[var(--surface-color)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
                        <button 
                            onClick={exportToCSV}
                            disabled={leads.length === 0}
                            className="px-6 py-3.5 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
                        >
                            <Download size={14} /> CSV
                        </button>
                        <div className="w-[1px] bg-[var(--border-color)]"></div>
                        <button 
                            onClick={printReport}
                            disabled={leads.length === 0}
                            className="px-6 py-3.5 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
                        >
                            <ExternalLink size={14} /> PDF/PRINT
                        </button>
                    </div>
                    <button onClick={fetchMyLeads} className="btn bg-[var(--surface-color)] p-3 rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 transition-all">
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="mb-10 relative group max-w-2xl">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search Acquired Nodes (Name, Phone, Location)..." 
                    className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl pl-14 pr-6 py-4 text-xs font-bold shadow-sm focus:border-indigo-500 transition-all outline-none italic placeholder:font-medium placeholder:text-[var(--text-muted)]/50" 
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center">
                        <div className="spinner mb-4 mx-auto"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Decrypting Identity Servers...</span>
                    </div>
                ) : filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                        <div key={lead.id} className="card shadow-md border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] hover:-translate-y-2 transition-all p-8 group flex flex-col h-full relative">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                <CheckCircle size={100} strokeWidth={1} className="text-emerald-500" />
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm shadow-emerald-500/10 transition-transform group-hover:scale-110">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-[var(--text-dark)] leading-none uppercase tracking-tight">{lead.name}</h3>
                                        <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic">Decryption Success</div>
                                    </div>
                                </div>
                                <button className="p-2.5 rounded-xl hover:bg-indigo-500/5 text-[var(--text-muted)] hover:text-indigo-500 transition-all bg-transparent border-none cursor-pointer">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                <div onClick={() => handleCopy(lead.phone)} className="flex items-center gap-4 bg-[var(--bg-color)] p-4 rounded-2xl border border-[var(--border-color)] hover:border-indigo-400/30 transition-all cursor-pointer group/row">
                                    <Smartphone size={18} className="text-indigo-400" />
                                    <div className="flex-1">
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Contact Sync</div>
                                        <div className="text-xs font-black text-[var(--text-dark)] uppercase italic tracking-wider">{lead.phone}</div>
                                    </div>
                                    <Clipboard size={14} className="opacity-0 group-hover/row:opacity-20 transition-opacity" />
                                </div>

                                <div onClick={() => handleCopy(lead.email)} className="flex items-center gap-4 bg-[var(--bg-color)] p-4 rounded-2xl border border-[var(--border-color)] hover:border-indigo-400/30 transition-all cursor-pointer group/row">
                                    <Mail size={18} className="text-rose-400" />
                                    <div className="flex-1">
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Identity Index</div>
                                        <div className="text-xs font-black text-[var(--text-dark)] uppercase italic tracking-wider truncate max-w-[150px]">{lead.email || 'N/A'}</div>
                                    </div>
                                    <Clipboard size={14} className="opacity-0 group-hover/row:opacity-20 transition-opacity" />
                                </div>

                                <div className="flex items-center gap-4 bg-[var(--bg-color)] p-4 rounded-2xl border border-[var(--border-color)]">
                                    <MapPin size={18} className="text-amber-400" />
                                    <div className="flex-1">
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Geolocation Hub</div>
                                        <div className="text-xs font-black text-[var(--text-dark)] uppercase italic tracking-wider">{lead.city}, {lead.state}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-dashed border-[var(--border-color)] flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Acquired At</div>
                                    <div className="text-[10px] font-bold text-[var(--text-muted)] italic tabular-nums">Mar 27, 2026</div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-10 h-10 rounded-xl bg-indigo-500/5 text-indigo-500 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/10">
                                        <MessageSquare size={16} />
                                    </button>
                                    <button className="w-10 h-10 rounded-xl bg-indigo-500/5 text-indigo-500 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/10">
                                        <Info size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center opacity-30">
                        <div className="flex flex-col items-center gap-6">
                            <HistoryIcon size={84} strokeWidth={1} />
                            <p className="font-black uppercase tracking-[0.4em] text-xs italic">Decryption history is currently void</p>
                            <button className="btn btn-primary px-8 py-3.5 font-black uppercase tracking-[0.2em] text-[10px] mt-4 shadow-xl shadow-indigo-500/10">Browse Spectrum</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserMyLeads;
