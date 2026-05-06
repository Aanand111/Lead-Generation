import React, { useState, useEffect } from 'react';
import {  
    Search, MapPin, Smartphone, Mail, Download, History as HistoryIcon, 
    MoreVertical, Info, Activity, MessageSquare, Clipboard, 
    Zap, Gem, Target, TrendingUp, CheckCircle, ExternalLink, X,
    Filter, RefreshCcw, Share2, ClipboardCheck, PhoneCall,
    FileDown, CalendarCheck, ShieldCheck, Copy, ArrowUpRight,
    Printer, Database, Layers, User
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const UserMyLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);

    const fetchMyLeads = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/user/my-leads');
            if (data.success) {
                setLeads(Array.isArray(data.data) ? data.data : []);
                return;
            }

            setLeads([]);
            setError(data.message || 'Unable to load acquired leads.');
        } catch (err) {
            console.error("Failed to fetch acquired leads", err);
            setLeads([]);
            setError(
                err.response?.status === 429
                    ? 'Too many requests. Please wait a moment and try again.'
                    : (err.response?.data?.message || 'Unable to connect to the lead service.')
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyLeads();
    }, []);

    const filteredLeads = leads.filter(l => 
        (l.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (l.phone || '').includes(searchTerm) ||
        (l.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (l.pincode || '').includes(searchTerm)
    );

    const handleCopy = (text, label) => {
        if(!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const handleWhatsApp = (phone, name) => {
        const message = `Hello ${name}, connecting with you via LeadGen Network regarding business opportunities.`;
        const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const exportToCSV = () => {
        if (leads.length === 0) return;
        const headers = ["ID", "Customer Name", "Phone", "Email", "City", "State", "Pincode", "Status", "Purchase Date"];
        const rows = leads.map(l => [
            l.id, l.name, l.phone, l.email || 'N/A', l.city, l.state, l.pincode || 'N/A',
            l.status || 'PURCHASED', new Date(l.purchase_date || Date.now()).toLocaleDateString()
        ]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Asset_Portfolio_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="page-content animate-fade-in space-y-12 pb-20">
            {/* --- Premium Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-indigo-600/20">
                            Inventory Control
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">
                            <ShieldCheck size={12} /> Decrypted & Secured
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-[0.9]">
                        My Acquired <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Assets</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-[var(--surface-color)] p-1.5 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl flex items-center overflow-hidden">
                        <button onClick={exportToCSV} className="px-8 py-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                            <FileDown size={18} /> CSV
                        </button>
                        <div className="w-px h-8 bg-[var(--border-color)]"></div>
                        <button onClick={() => window.print()} className="px-8 py-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                            <Printer size={18} /> Print
                        </button>
                        <div className="w-px h-8 bg-[var(--border-color)]"></div>
                        <button onClick={fetchMyLeads} className="px-6 py-5 hover:bg-indigo-500 hover:text-white transition-all">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Search Console --- */}
            <div className="relative group max-w-2xl">
                <div className="absolute inset-y-0 left-6 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Search size={20} />
                </div>
                <input 
                    type="text"
                    className="w-full pl-16 pr-8 py-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest focus:border-indigo-500/30 focus:shadow-2xl transition-all placeholder:text-slate-300 shadow-sm outline-none"
                    placeholder="Search by Identity, Phone or City..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {error && (
                <div className="max-w-2xl px-6 py-4 rounded-[2rem] border border-rose-500/20 bg-rose-500/5 text-rose-600">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em]">{error}</p>
                </div>
            )}

            {/* --- Asset Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {loading ? (
                    [1,2,3,4].map(i => (
                        <div key={i} className="bg-[var(--surface-color)] rounded-[3.5rem] p-10 h-72 border border-[var(--border-color)] animate-pulse flex gap-8">
                            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem]"></div>
                            <div className="flex-1 space-y-4">
                                <div className="h-6 bg-slate-50 rounded-full w-3/4"></div>
                                <div className="h-20 bg-slate-50 rounded-3xl w-full"></div>
                            </div>
                        </div>
                    ))
                ) : filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                        <div key={lead.id} className="group relative">
                            {/* Animated Glow Backdrop */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-emerald-500/5 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10"></div>
                            
                            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-12 rounded-[4rem] shadow-sm group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] group-hover:border-indigo-500/20 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                                
                                {/* Background Watermark */}
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-indigo-500 group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
                                    <Database size={240} strokeWidth={1} />
                                </div>

                                {/* Top Bar: Identity & Actions */}
                                <div className="flex items-center justify-between mb-12 relative z-[1]">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[2rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                                            <Target size={36} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1.5 italic">Verified Asset</div>
                                            <h3 className="text-4xl font-black text-indigo-900 uppercase tracking-tighter leading-none italic">{lead.name}</h3>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        
                                        
                                        {openMenuId === lead.id && (
                                            <>
                                                <div className="fixed inset-0 z-[100]" onClick={() => setOpenMenuId(null)} />
                                             
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Data Grid: Mobile & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-0">
                                    <div className="p-8 bg-slate-50/70 rounded-[2rem] border border-transparent hover:border-indigo-500/10 transition-all group/box relative overflow-hidden">
                                        <div className="flex items-center gap-3 mb-3 opacity-50">
                                            <Smartphone size={16} className="text-indigo-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Mobile Contact</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-black tabular-nums tracking-widest text-indigo-950">{lead.phone}</span>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-slate-50/70 rounded-[2rem] border border-transparent hover:border-indigo-500/10 transition-all group/box relative overflow-hidden">
                                        <div className="flex items-center gap-3 mb-3 opacity-50">
                                            <Mail size={16} className="text-rose-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Email Node</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black lowercase text-indigo-950 truncate max-w-[150px]">{lead.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Strip */}
                                <div className="p-8 bg-slate-50/70 rounded-[2rem] border border-transparent hover:border-indigo-500/10 transition-all relative z-0 flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-slate-100">
                                            <MapPin size={22} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Geolocation Data</div>
                                            <div className="text-sm font-black uppercase tracking-widest italic text-indigo-900">{lead.city}, {lead.state}</div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-white rounded-2xl text-[11px] font-black text-indigo-600 uppercase tracking-widest shadow-sm border border-slate-50 tabular-nums">
                                        {lead.pincode || '452001'}
                                    </div>
                                </div>

                                {/* --- CENTERED ACTION BUTTONS --- */}
                                <div className="flex items-center justify-center gap-6 mb-10 relative z-10">
                                    <button 
                                        onClick={() => handleCall(lead.phone)}
                                        className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-600/20 hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                                    >
                                        <PhoneCall size={20} /> Call Now
                                    </button>
                                    <button 
                                        onClick={() => handleWhatsApp(lead.phone, lead.name)}
                                        className="flex-1 py-5 bg-emerald-500 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-emerald-500/20 hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                                    >
                                        <MessageSquare size={20} /> WhatsApp
                                    </button>
                                </div>

                                {/* Footer Bar */}
                                <div className="mt-auto pt-8 border-t border-dashed border-slate-200 flex items-center justify-between relative z-0">
                                    <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">
                                        <HistoryIcon size={16} /> Acquired: {new Date(lead.purchase_date || Date.now()).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">
                                        <ShieldCheck size={18} /> Secured Asset
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center rounded-[4rem] bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col items-center gap-10 opacity-30 grayscale">
                         <Layers size={64} strokeWidth={1} />
                         <div className="space-y-4">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Portfolio Empty</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest">Ready to acquire your first high-value lead?</p>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserMyLeads;
