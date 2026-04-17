import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, XCircle, Search, RefreshCcw, MapPin, 
    Phone, Mail, FileText, Layers, AlertTriangle, 
    MoreVertical, IndianRupee, Activity, Sparkles,
    ShieldCheck, Timer
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { useConfirm } from '../context/ConfirmContext';

const LeadApproval = () => {
    const { confirm } = useConfirm();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [approvingId, setApprovingId] = useState(null);

    // Initial fetch for pending leads
    const fetchPendingLeads = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/leads/pending');
            if (data.success) {
                setLeads(data.data);
            }
        } catch (err) {
            // Log error for debugging
            console.error("Fetch pending leads error:", err);
            toast.error('Error: Could not load pending leads.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingLeads();
    }, []);

    // Handle lead approval or rejection
    const handleAction = async (id, status, price) => {
        setApprovingId(id);
        const actionText = status === 'ACTIVE' ? 'Approve' : 'Reject';
        const confirmed = await confirm(
            `Are you sure you want to ${actionText.toLowerCase()} this lead?`,
            `${actionText} Lead`
        );
        
        if (!confirmed) {
            setApprovingId(null);
            return;
        }

        try {
            const { data } = await api.put(`/admin/leads/${id}/approve`, { status, lead_value: price });
            if (data.success) {
                setLeads(prev => prev.filter(l => l.id !== id));
                toast.success(`Lead ${status === 'ACTIVE' ? 'Approved' : 'Rejected'} successfully.`);
            }
        } catch (err) {
            console.error("Approval action error:", err);
            toast.error('Failed to complete the action. Please try again.');
        } finally {
            setApprovingId(null);
        }
    };

    const filteredLeads = leads.filter(l =>
        (l.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.customer_phone?.includes(searchTerm)) ||
        (l.lead_id?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 italic">
                        Verification Required <Layers size={10} /> Pending Approvals
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Review Pending Leads</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic leading-none">Review and approve leads submitted by vendors before they go live.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchPendingLeads} className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl text-[var(--text-muted)] hover:text-indigo-500 transition-all shadow-sm active:scale-95">
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative group min-w-[300px]">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:border-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-4 text-amber-500">
                    <Activity size={48} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Loading pending leads...</span>
                </div>
            ) : filteredLeads.length === 0 ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-20">
                    <ShieldCheck size={100} strokeWidth={1} />
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-center">No pending leads to approve.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredLeads.map((lead) => (
                        <div key={lead.id} className="card group bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500">
                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-color)]">
                                {/* Name */}
                                <div className="p-8 lg:w-1/3 flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 animate-pulse border border-amber-500/20">
                                        <Activity size={32} />
                                    </div>
                                    <div className="flex-1 overflow-hidden leading-none">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[8px] font-black tracking-widest uppercase border border-indigo-500/20">
                                                {lead.lead_id}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black tracking-widest uppercase border border-amber-500/20">
                                                PENDING
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-[var(--text-dark)] uppercase tracking-tight truncate leading-none mb-2">{lead.customer_name}</h3>
                                        <div className="flex flex-col gap-3 mt-4">
                                            <div className="flex items-center gap-2 text-xs font-black text-indigo-500 tracking-tight bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10 w-fit lowercase">
                                                <Phone size={14} /> {lead.customer_phone}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-black text-rose-500 tracking-tight bg-rose-500/5 px-3 py-1.5 rounded-xl border border-rose-500/10 w-fit lowercase">
                                                <Mail size={14} /> {lead.customer_email?.toLowerCase() || 'N/A'}
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* Lead Location & Category */}
                                <div className="p-8 lg:w-1/3 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/10">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1.5">Location</p>
                                            <p className="text-[13px] font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">{lead.city}, {lead.state}</p>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] leading-none uppercase">PIN: {lead.pincode}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1.5">Category</p>
                                            <p className="text-[13px] font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">{lead.category}</p>
                                            <p className="text-[10px] font-bold text-indigo-500 leading-none uppercase tracking-tighter">Needs Review</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Price and Approval */}
                                <div className="p-8 lg:w-1/3 flex flex-col justify-between bg-gradient-to-br from-transparent to-indigo-500/[0.02]">
                                     <div className="mb-6 lg:mb-0">
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-3">Set Price</p>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white">
                                                <IndianRupee size={20} />
                                            </div>
                                            <div>
                                                <input 
                                                    type="number"
                                                    defaultValue={lead.lead_value}
                                                    onChange={(e) => lead.revised_value = e.target.value}
                                                    className="w-32 bg-[var(--bg-color)] border border-[var(--border-color)] px-4 py-2 rounded-xl font-black text-lg tabular-nums outline-none focus:border-emerald-500 transition-all text-emerald-500"
                                                />
                                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mt-1.5 ml-1 tracking-widest opacity-60">Adjust lead cost</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-auto">
                                        <button 
                                            disabled={approvingId === lead.id}
                                            onClick={() => handleAction(lead.id, 'ACTIVE', lead.revised_value || lead.lead_value)}
                                            className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group-hover:px-6"
                                        >
                                           {approvingId === lead.id ? <Timer size={16} className="animate-spin" /> : <CheckCircle size={16} />} APPROVE
                                        </button>
                                        <button 
                                            disabled={approvingId === lead.id}
                                            onClick={() => handleAction(lead.id, 'REJECTED', 0)}
                                            className="px-6 py-4 bg-[var(--bg-color)] text-rose-500 hover:bg-rose-500 hover:text-white border border-[var(--border-color)] font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} /> REJECT
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submission Details */}
                             <div className="px-8 py-4 bg-[var(--bg-color)]/30 border-t border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between text-[10px] font-black text-[var(--text-dark)] uppercase tracking-[0.2em] gap-4">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                    <span>Created On: {new Date(lead.created_at).toLocaleString()}</span>
                                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-indigo-500/30" />
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        <span className="text-indigo-600 font-black">Vendor: {lead.created_by_name || 'System Vendor'}</span>
                                        <div className="flex gap-4 lowercase tracking-tight font-black text-indigo-400/80 bg-indigo-500/5 px-3 py-1 rounded-lg border border-indigo-500/10">
                                            <span>{lead.created_by_phone || 'No phone'}</span>
                                            <span className="opacity-30">|</span>
                                            <span>{lead.created_by_email || 'No email'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <Sparkles size={14} /> Ready for verification
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeadApproval;
