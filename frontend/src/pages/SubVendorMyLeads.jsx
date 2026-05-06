import React, { useState, useEffect } from 'react';
import {  
    Search, MapPin, Database, Activity, Target, TrendingUp, CheckCircle, 
    RefreshCcw, Layers, Clock, Users, ShoppingCart, Eye, BarChart3,
    ArrowUpRight, AlertCircle, FileText
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const SubVendorMyLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMyUploadedLeads = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/user/my-uploaded-leads');
            if (data.success) {
                setLeads(Array.isArray(data.data) ? data.data : []);
                return;
            }
            setError(data.message || 'Unable to load your leads.');
        } catch (err) {
            console.error("Failed to fetch uploaded leads", err);
            setError(err.response?.data?.message || 'Unable to connect to the service.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyUploadedLeads();
    }, []);

    const filteredLeads = leads.filter(l => 
        (l.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (l.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (l.lead_uid?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'PENDING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'REJECTED': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="page-content animate-fade-in space-y-12 pb-20">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-amber-500/20">
                            Asset Monitoring
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest italic">
                            <Activity size={12} /> Performance Analytics
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-[0.9]">
                        My Uploaded <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Leads</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={fetchMyUploadedLeads}
                        className="p-5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl hover:bg-amber-500 hover:text-white transition-all shadow-xl"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* --- Stats Overview --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--surface-color)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-sm group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Database size={24} />
                        </div>
                        <TrendingUp size={20} className="text-emerald-500" />
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Uploads</div>
                    <div className="text-4xl font-black text-indigo-900 tracking-tighter">{leads.length}</div>
                </div>

                <div className="bg-[var(--surface-color)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-sm group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <ShoppingCart size={24} />
                        </div>
                        <CheckCircle size={20} className="text-emerald-500" />
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Purchases</div>
                    <div className="text-4xl font-black text-indigo-900 tracking-tighter">
                        {leads.reduce((sum, l) => sum + (l.purchase_count || 0), 0)}
                    </div>
                </div>

                <div className="bg-[var(--surface-color)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-sm group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Eye size={24} />
                        </div>
                        <BarChart3 size={20} className="text-indigo-500" />
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interest Level</div>
                    <div className="text-4xl font-black text-indigo-900 tracking-tighter">
                        {leads.reduce((sum, l) => sum + (l.interest_count || 0), 0)}
                    </div>
                </div>
            </div>

            {/* --- Search Console --- */}
            <div className="relative group max-w-2xl">
                <div className="absolute inset-y-0 left-6 flex items-center text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Search size={20} />
                </div>
                <input 
                    type="text"
                    className="w-full pl-16 pr-8 py-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest focus:border-amber-500/30 focus:shadow-2xl transition-all placeholder:text-slate-300 shadow-sm outline-none"
                    placeholder="Filter leads by name, city or UID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* --- Leads Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    [1,2,3,4].map(i => (
                        <div key={i} className="bg-[var(--surface-color)] rounded-[3.5rem] p-10 h-64 border border-[var(--border-color)] animate-pulse" />
                    ))
                ) : filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                        <div key={lead.id} className="group relative">
                            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-10 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden h-full">
                                
                                {/* Status Badge */}
                                <div className="absolute top-10 right-10">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(lead.status)}`}>
                                        {lead.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-sm">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{lead.lead_uid}</div>
                                        <h3 className="text-2xl font-black text-indigo-900 uppercase tracking-tighter leading-none">{lead.customer_name}</h3>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-transparent group-hover:border-amber-500/10 transition-all">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                                            <MapPin size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Location</span>
                                        </div>
                                        <div className="text-xs font-black uppercase tracking-widest text-indigo-950 truncate">
                                            {lead.city || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-transparent group-hover:border-amber-500/10 transition-all">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                                            <Layers size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Category</span>
                                        </div>
                                        <div className="text-xs font-black uppercase tracking-widest text-indigo-950 truncate">
                                            {lead.category || 'General'}
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Stats Strip */}
                                <div className="p-6 bg-indigo-900 text-white rounded-3xl flex items-center justify-around mb-8 group-hover:bg-amber-600 transition-colors shadow-lg">
                                    <div className="text-center">
                                        <div className="text-[18px] font-black tracking-tighter leading-none">{lead.purchase_count}</div>
                                        <div className="text-[8px] font-bold uppercase tracking-widest opacity-60 mt-1">Sold</div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="text-center">
                                        <div className="text-[18px] font-black tracking-tighter leading-none">{lead.interest_count}</div>
                                        <div className="text-[8px] font-bold uppercase tracking-widest opacity-60 mt-1">Interests</div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="text-center">
                                        <div className="text-[18px] font-black tracking-tighter leading-none">
                                            {lead.purchase_count > 0 ? Math.round((lead.purchase_count / (lead.purchase_count + lead.interest_count || 1)) * 100) : 0}%
                                        </div>
                                        <div className="text-[8px] font-bold uppercase tracking-widest opacity-60 mt-1">Conv.</div>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} /> {new Date(lead.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        Active <ArrowUpRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center rounded-[4rem] bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col items-center gap-6 opacity-30 grayscale">
                         <Layers size={64} strokeWidth={1} />
                         <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase tracking-tighter">No Leads Found</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest italic">Upload your first lead to start tracking performance</p>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubVendorMyLeads;
