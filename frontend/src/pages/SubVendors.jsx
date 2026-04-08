import React, { useState, useEffect } from 'react';
import { MoreVertical, User, Phone, Mail, Award, CheckCircle, XCircle, Search, Plus, Edit2, Trash2, Power, Layers, RefreshCcw, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';

const SubVendors = () => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [subvendors, setSubVendors] = useState([]);
    const [openActionId, setOpenActionId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [paginationProps, setPaginationProps] = useState({ total: 0, pages: 1 });

    const fetchSubVendors = async (currentPage = page, currentLimit = limit, currentSearch = searchQuery) => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/subvendors', {
                params: { page: currentPage, limit: currentLimit, search: currentSearch }
            });
            if (data.success && data.data) {
                setSubVendors(data.data);
                if (data.pagination) {
                    setPaginationProps({ total: data.pagination.total, pages: data.pagination.pages });
                }
            } else {
                setSubVendors([]);
            }
        } catch (err) {
            console.error('Error fetching subvendors:', err);
            setSubVendors([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setPage(1);
            fetchSubVendors(1, limit, searchQuery);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery, limit]);

    // Regular fetch on page change
    useEffect(() => {
        fetchSubVendors(page, limit, searchQuery);
    }, [page]);

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const originalData = [...subvendors];
        
        // Optimistic update
        setSubVendors(subvendors.map(s => s.id === id ? { ...s, status: newStatus } : s));
        setOpenActionId(null);
        
        try {
            await api.put(`/admin/subvendors/${id}`, { status: newStatus });
            toast.success(`Agent status updated to ${newStatus}.`);
        } catch (err) {
            console.error("Failed to update status", err);
            setSubVendors(originalData);
            toast.error('Failed to update status. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm(
            'Are you sure you want to delete this agent account?',
            'Confirm Delete'
        );
        if (!confirmed) return;
        try {
            const { data } = await api.delete(`/admin/subvendors/${id}`);
            if (data.success) {
                setSubVendors(prev => prev.filter(v => v.id !== id));
                setPaginationProps(prev => ({ ...prev, total: prev.total - 1 }));
                toast.success('Agent account deleted successfully.');
            }
        } catch (err) {
            toast.error('Error deleting agent account.');
        } finally {
            setOpenActionId(null);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Agent Management</h2>
                    <p>Manage and monitor sub-vendor/agent accounts and their performance</p>
                </div>
                <div className="pageHeaderActions">
                    <button 
                        className="btn btn-primary flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/10" 
                        onClick={() => navigate('/sub-vendors/create')}
                    >
                        <Plus size={16} /> Add New Agent
                    </button>
                </div>
            </div>


            <div className="card shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)]">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">
                            Active Agents: <span className="text-[var(--text-dark)] not-italic font-black">{paginationProps.total}</span>
                        </span>
                        <div className="h-4 w-px bg-[var(--border-color)]"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2">Density</span>
                            <CustomSelect
                                variant="compact"
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                options={[
                                    { value: 10, label: '10' },
                                    { value: 20, label: '20' },
                                    { value: 50, label: '50' }
                                ]}
                                className="min-w-[80px]"
                            />
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-[var(--text-muted)]/50 text-[var(--text-dark)]" 
                            placeholder="Search agents by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="w-16 text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Index</th>
                                <th className="text-[var(--text-muted)]">Agent Name</th>
                                <th className="text-[var(--text-muted)]">Vendor (Parent)</th>
                                <th className="text-[var(--text-muted)]">Contact Info</th>
                                <th className="text-[var(--text-muted)]">Referral Code</th>
                                <th className="text-[var(--text-muted)]">Status</th>
                                <th className="text-right text-[var(--text-muted)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="spinner mb-2"></div>
                                            <span className="text-[10px] uppercase font-black tracking-widest animate-pulse text-[var(--text-muted)]">Loading agents...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : subvendors.length > 0 ? (
                                subvendors.map((sub, index) => (
                                <tr key={sub.id} className="transition-all hover:bg-[var(--primary)]/[0.02] group border-b border-[var(--border-color)] last:border-0 text-xs text-[var(--text-dark)]">
                                    <td className="text-center font-black text-[var(--text-muted)]/40 text-[10px]">
                                        #{((page - 1) * limit + index + 1).toString().padStart(3, '0')}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <div className="font-black text-[var(--text-dark)] tracking-tight text-[11px] group-hover:text-indigo-600 transition-colors uppercase">{sub.name}</div>
                                                <div className="text-[10px] text-[var(--text-muted)] font-bold italic tracking-tighter">@{sub.name?.toLowerCase().replace(/\s+/g, '_')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-tight border border-amber-500/20">
                                            <Award size={10} /> {sub.vendor_name || 'Individual'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-dark)]/80">
                                                <Phone size={10} className="text-indigo-400" /> {sub.phone}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] italic">
                                                <Mail size={10} className="text-[var(--text-muted)]/50" /> {sub.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <code className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 shadow-sm transition-all hover:bg-indigo-500/10">
                                            {sub.referral_code || `AGENT-${sub.id.toString().substring(0,4)}`}
                                        </code>
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            sub.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 italic opacity-60'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 opacity-40'}`}></div>
                                            {sub.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="relative inline-block text-left">
                                            <button className="p-2 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-[var(--surface-elevated)] transition-all cursor-pointer active:scale-90 border-none bg-transparent outline-none" onClick={() => setOpenActionId(openActionId === sub.id ? null : sub.id)}>
                                                <MoreVertical size={18} />
                                            </button>
                                            {openActionId === sub.id && (
                                                <>
                                                    <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                    <div className="absolute right-10 top-0 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[150px] py-2 overflow-hidden animate-zoom-in origin-right">
                                                        <button 
                                                            className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-3 border-none bg-transparent cursor-pointer" 
                                                            onClick={() => { navigate(`/sub-vendors/edit/${sub.id}`); setOpenActionId(null); }}
                                                        >
                                                            <Edit2 size={14} className="text-indigo-500" /> Edit Agent
                                                        </button>
                                                        <button 
                                                            className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 transition-all flex items-center gap-3 border-none bg-transparent cursor-pointer" 
                                                            onClick={() => handleStatusToggle(sub.id, sub.status || 'Active')}
                                                        >
                                                            <Power size={14} className={sub.status === 'Active' ? 'text-rose-500' : 'text-emerald-500'} /> 
                                                            {sub.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                                                        </button>
                                                        <div className="h-px bg-[var(--border-color)] my-1 mx-2"></div>
                                                        <button 
                                                            className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-3 border-none bg-transparent cursor-pointer" 
                                                            onClick={() => handleDelete(sub.id)}
                                                        >
                                                            <Trash2 size={14} /> Delete Agent
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-24 text-[var(--text-muted)] italic">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Layers size={64} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No agents found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-[var(--border-color)] bg-[var(--bg-color)]/30">
                    <div className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">
                        Showing <span className="text-[var(--text-dark)] not-italic font-black">{subvendors.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, paginationProps.total)}</span> of {paginationProps.total} agents
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button 
                            className={`px-4 py-2 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${page === 1 ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]' : 'hover:bg-[var(--bg-color)] active:scale-95 cursor-pointer shadow-sm text-indigo-600'}`}
                            disabled={page === 1}
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        >
                            Previous
                        </button>
                        <div className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100">
                            {page}
                        </div>
                        <button 
                            className={`px-4 py-2 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${page >= paginationProps.pages ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]' : 'hover:bg-[var(--bg-color)] active:scale-95 cursor-pointer shadow-sm text-indigo-600'}`}
                            disabled={page >= paginationProps.pages}
                            onClick={() => setPage(prev => Math.min(paginationProps.pages, prev + 1))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubVendors;
