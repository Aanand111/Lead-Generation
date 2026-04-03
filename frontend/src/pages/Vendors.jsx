import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, X, UserPlus, Search, Check, AlertCircle, Trash2, Edit2, Activity, User, Mail, Phone, RefreshCcw, Layers, CheckCircle, Award, CreditCard, TrendingUp, Target } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const Vendors = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [paginationProps, setPaginationProps] = useState({ total: 0, pages: 1 });
    const [globalStats, setGlobalStats] = useState({ totalVendors: 0, totalReferrals: 0, totalEarnings: 0 });

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditVendor, setCurrentEditVendor] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'Active',
        referral_code: ''
    });

    // Stats Modal State
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [vendorStats, setVendorStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    const fetchVendors = async (currentPage = page, currentLimit = limit, currentSearch = searchQuery) => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/vendors', {
                params: { page: currentPage, limit: currentLimit, search: currentSearch }
            });
            if (data.success && data.data) {
                const mappedData = data.data.map((vendor) => ({
                    id: vendor.id,
                    name: vendor.name || 'Anonymous Node',
                    username: vendor.name ? vendor.name.toLowerCase().replace(/\s+/g, '_') : 'node_anon',
                    email: vendor.email || 'void@protocol.sys',
                    phone: vendor.phone || '000-000-0000',
                    status: vendor.status || 'Active',
                    total_referrals: vendor.total_referrals || 0,
                    total_earnings: vendor.total_earnings || 0,
                    commission_balance: vendor.commission_balance || 0,
                    referral_code: vendor.referral_code
                }));
                setVendors(mappedData);
                if (data.pagination) {
                    setPaginationProps({ total: data.pagination.total, pages: data.pagination.pages });
                }
                if (data.globalStats) {
                    setGlobalStats(data.globalStats);
                }
            }
        } catch (err) {
            console.error('Error fetching vendors:', err);
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setPage(1);
            fetchVendors(1, limit, searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, limit]);

    // Fetch on page change
    useEffect(() => {
        fetchVendors(page, limit, searchQuery);
    }, [page]);

    const toggleAction = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    const handleEditClick = (vendor) => {
        setOpenActionId(null);
        setCurrentEditVendor(vendor);
        setFormData({
            name: vendor.name || '',
            email: vendor.email || '',
            phone: vendor.phone || '',
            status: vendor.status || 'Active',
            referral_code: vendor.referral_code || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put(`/admin/vendors/${currentEditVendor.id}`, formData);
            if (data.success || data.message === "Vendor updated successfully") {
                setIsEditModalOpen(false);
                fetchVendors();
                setMessage({ type: 'success', text: 'Vendor identity matrix updated.' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Error updating vendor' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Synchronization failure detected.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        let newStatus = '';
        if (currentStatus === 'Pending') {
            newStatus = 'Active';
        } else {
            newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        }
        setVendors(vendors.map(v => v.id === id ? { ...v, status: newStatus } : v));
        setOpenActionId(null);
        try {
            await api.put(`/admin/vendors/${id}/status`, { status: newStatus });
            setMessage({ type: 'success', text: `Vendor status toggled to ${newStatus}.` });
        } catch (err) {
            setVendors(vendors.map(v => v.id === id ? { ...v, status: currentStatus } : v));
            setMessage({ type: 'error', text: 'Protocol rejection: status update failed.' });
        } finally {
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleViewStats = async (id) => {
        setOpenActionId(null);
        setLoadingStats(true);
        setIsStatsModalOpen(true);
        try {
            const { data } = await api.get(`/admin/vendors/${id}/stats`);
            if (data.success) {
                setVendorStats(data.data);
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
            setMessage({ type: 'error', text: 'Failed to access diagnostic data.' });
        } finally {
            setLoadingStats(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vendor?')) return;
        try {
            const { data } = await api.delete(`/admin/vendors/${id}`);
            if (data.success) {
                setVendors(prev => prev.filter(v => v.id !== id));
                setMessage({ type: 'success', text: 'Vendor node purged from global clusters.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Purge sequence failure.' });
        } finally {
            setOpenActionId(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Vendor Management Matrix</h2>
                    <p>Onboard and orchestrate platform service provider protocols</p>
                </div>
                <div className="pageHeaderActions">
                    <button className="btn btn-primary flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100" onClick={() => navigate('/vendors/create')}>
                        <UserPlus size={16} /> New Provider Node
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 transition-all animate-slide-up border ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-indigo-500 transition-all group-hover:scale-110 group-hover:-rotate-12">
                        <User size={120} strokeWidth={1} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 italic">Total Providers</p>
                            <h3 className="text-3xl font-black text-[var(--text-dark)] tracking-tighter leading-none">{globalStats.totalVendors} <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] italic opacity-50 ml-1">Nodes</span></h3>
                        </div>
                    </div>
                </div>

                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-emerald-500 transition-all group-hover:scale-110 group-hover:-rotate-12">
                        <Award size={120} strokeWidth={1} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 italic">Global Payouts</p>
                            <h3 className="text-3xl font-black text-emerald-500 tracking-tighter leading-none">₹{globalStats.totalEarnings.toLocaleString()}<span className="text-[10px] uppercase font-black tracking-widest opacity-50 ml-1">INR</span></h3>
                        </div>
                    </div>
                </div>

                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-indigo-400 transition-all group-hover:scale-110 group-hover:-rotate-12">
                        <Layers size={120} strokeWidth={1} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                            <Layers size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 italic">Referral Density</p>
                            <h3 className="text-3xl font-black text-[var(--text-dark)] tracking-tighter leading-none">{globalStats.totalReferrals} <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] italic opacity-50 ml-1">Agents</span></h3>
                        </div>
                    </div>
                </div>

                <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] shadow-sm hover:shadow-md transition-all group overflow-hidden relative border-l-4 border-l-indigo-600">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-indigo-600 transition-all group-hover:scale-110 group-hover:-rotate-12">
                        <Activity size={120} strokeWidth={1} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-600/20 shadow-inner">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 italic">Operational Health</p>
                            <h3 className="text-3xl font-black text-indigo-600 tracking-tighter leading-none">98.4<span className="text-sm font-black italic ml-0.5">%</span></h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)]">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">
                            Active Providers: <span className="text-[var(--text-dark)] not-italic font-black">{paginationProps.total} Nodes</span>
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
                            placeholder="Trace provider by identity or email protocol..."
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
                                <th className="text-[var(--text-muted)]">Provider Persona</th>
                                <th className="text-[var(--text-muted)]">Performance Analytics</th>
                                <th className="text-[var(--text-muted)]">Contact Parameters</th>
                                <th className="text-[var(--text-muted)]">Operational State</th>
                                <th className="text-right text-[var(--text-muted)]">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="spinner mb-2"></div>
                                            <span className="text-[10px] uppercase font-black tracking-[0.2em] animate-pulse text-[var(--text-muted)]">Syncing Provider Grid...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : vendors.length > 0 ? (
                                vendors.map((vendor, index) => (
                                    <tr key={vendor.id} className="transition-all hover:bg-[var(--primary)]/[0.02] group border-b border-[var(--border-color)] last:border-0 text-xs text-[var(--text-dark)]">
                                        <td className="text-center font-black text-[var(--text-muted)]/40 text-[10px]">
                                            #{((page - 1) * limit + index + 1).toString().padStart(3, '0')}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-[var(--text-dark)] tracking-tight text-[11px] group-hover:text-indigo-600 transition-colors uppercase">{vendor.name}</div>
                                                    <div className="text-[10px] text-[var(--text-muted)] font-bold italic tracking-tighter">@{vendor.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Total Earnings</span>
                                                    <span className="text-[12px] font-black text-emerald-500 tracking-tight leading-none italic">₹{Number(vendor.total_earnings).toLocaleString()}</span>
                                                </div>
                                                <div className="flex flex-col border-l border-[var(--border-color)] pl-4">
                                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Referral Code</span>
                                                    <div className="flex items-center gap-1 group/code">
                                                        <Activity size={10} className="text-amber-500" />
                                                        <span className="text-[11px] font-black text-amber-500 tracking-tight leading-none uppercase">{vendor.referral_code || '---'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col border-l border-[var(--border-color)] pl-4">
                                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Referrals</span>
                                                    <div className="flex items-center gap-1">
                                                        <Layers size={10} className="text-indigo-400" />
                                                        <span className="text-[11px] font-black text-indigo-500 tracking-tight leading-none uppercase">{vendor.total_referrals} Nodes</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-dark)]/80">
                                                    <Phone size={10} className="text-indigo-400" /> {vendor.phone}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] italic">
                                                    <Mail size={10} className="text-[var(--text-muted)]/50" /> {vendor.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                vendor.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                vendor.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                                                'bg-red-500/10 text-red-500 border-red-500/20 italic opacity-60'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    vendor.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 
                                                    vendor.status === 'Pending' ? 'bg-amber-500' :
                                                    'bg-red-500 opacity-40'}`}></div>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="relative inline-block text-left">
                                                <button className="bg-transparent border-none p-2 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer active:scale-90 shadow-none outline-none" onClick={() => toggleAction(vendor.id)}>
                                                    <MoreVertical size={18} />
                                                </button>
                                                {openActionId === vendor.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                        <div className="absolute right-full top-0 mr-2 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[200px] py-3 overflow-hidden animate-zoom-in origin-right backdrop-blur-md">
                                                            <div className="px-4 py-2 mb-1 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                                                                <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-[0.2em]">Node Operations</p>
                                                            </div>
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-emerald-500/10 hover:text-emerald-500 transition-all flex items-center gap-3 border-none bg-transparent cursor-pointer"
                                                                onClick={() => handleViewStats(vendor.id)}
                                                            >
                                                                <Activity size={14} className="text-emerald-500" /> View Performance
                                                            </button>
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-3 border-none bg-transparent cursor-pointer"
                                                                onClick={() => handleEditClick(vendor)}
                                                            >
                                                                <Edit2 size={14} className="text-indigo-500" /> Refine Node
                                                            </button>
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-amber-500/10 transition-all flex items-center gap-3 border-none bg-transparent cursor-pointer"
                                                                onClick={() => handleStatusToggle(vendor.id, vendor.status)}
                                                            >
                                                                <Activity size={14} className={vendor.status === 'Active' ? 'text-rose-500' : 'text-emerald-500'} />
                                                                {vendor.status === 'Active' ? 'Suspend Node' : vendor.status === 'Pending' ? 'Approve Node' : 'Enforce Active'}
                                                            </button>
                                                            <div className="h-px bg-[var(--border-color)] my-2 mx-3"></div>
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-3 border-none bg-transparent cursor-pointer font-bold"
                                                                onClick={() => handleDelete(vendor.id)}
                                                            >
                                                                <Trash2 size={14} /> Purge Provider
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
                                    <td colSpan="5" className="text-center py-24 text-[var(--text-muted)] italic">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Layers size={64} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No Provider Nodes Detected in Spectrum</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-[var(--border-color)] bg-[var(--bg-color)]/30">
                    <div className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">
                        Viewing <span className="text-[var(--text-dark)] not-italic font-black">{vendors.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, paginationProps.total)}</span> of {paginationProps.total} Nodes
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            className={`px-4 py-2 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${page === 1 ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]' : 'hover:bg-[var(--bg-color)] active:scale-95 cursor-pointer shadow-sm text-indigo-500'}`}
                            disabled={page === 1}
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        >
                            Previous Phase
                        </button>
                        <div className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100">
                            {page}
                        </div>
                        <button
                            className={`px-4 py-2 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${page >= paginationProps.pages ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]' : 'hover:bg-[var(--bg-color)] active:scale-95 cursor-pointer shadow-sm text-indigo-500'}`}
                            disabled={page >= paginationProps.pages}
                            onClick={() => setPage(prev => Math.min(paginationProps.pages, prev + 1))}
                        >
                            Next Phase
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Vendor Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-[var(--bg-color)]/70 backdrop-blur-md z-[9000] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface-color)] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in border border-[var(--border-color)]">
                        <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/30">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--text-dark)] tracking-tight uppercase">
                                    Identity Refinement
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">Synchronization of provider metadata and service handles</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] shadow-sm border border-[var(--border-color)] flex items-center justify-center hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all cursor-pointer outline-none border-none">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Provider Designation <span>*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleEditChange} required className="form-control !py-4 font-black tracking-tight text-sm uppercase bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all shadow-inner outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Protocol Handle (Email)</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleEditChange} className="form-control !py-4 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all shadow-inner outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Contact Sequence <span>*</span></label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleEditChange} required className="form-control !py-4 font-black tracking-tight text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all shadow-inner outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Referral Link Protocol (Unguessable Code)</label>
                                    <input type="text" name="referral_code" value={formData.referral_code} onChange={handleEditChange} className="form-control !py-4 font-black tracking-tight text-sm uppercase bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-amber-500 focus:bg-[var(--surface-color)] transition-all shadow-inner outline-none" placeholder="EX: VND-XXXXXX" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-8">
                                <button type="submit" className="btn btn-primary flex-1 py-4 flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-500/10" disabled={saving}>
                                    {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Layers size={16} />}
                                    {saving ? 'Synchronizing Node...' : 'Commit Adjustments'}
                                </button>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 py-4 bg-[var(--bg-color)] text-[var(--text-muted)] hover:bg-[var(--border-color)] font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all border-none cursor-pointer">Abort</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Performance Hub Modal */}
            {isStatsModalOpen && (
                <div className="fixed inset-0 bg-[var(--bg-color)]/80 backdrop-blur-xl z-[9500] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface-color)] rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-zoom-in border border-[var(--border-color)] flex flex-col">
                        <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/30">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--text-dark)] tracking-tight uppercase flex items-center gap-3">
                                    <Activity className="text-emerald-500" />
                                    Performance Intelligence Hub
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">Deep-dive into node productivity and synchronization history</p>
                            </div>
                            <button onClick={() => { setIsStatsModalOpen(false); setVendorStats(null); }} className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] shadow-sm border border-[var(--border-color)] flex items-center justify-center hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all cursor-pointer outline-none">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {loadingStats ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="spinner"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Scanning Data Clusters...</span>
                                </div>
                            ) : vendorStats ? (
                                <div className="space-y-10">
                                    {/* Stats Header */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/10">
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Cumulative Payouts</p>
                                            <h4 className="text-3xl font-black text-indigo-500 tracking-tighter italic">₹{vendorStats.stats.total_earnings.toLocaleString()}</h4>
                                            <div className="h-1 w-full bg-indigo-500/10 rounded-full mt-4 overflow-hidden">
                                                <div className="h-full bg-indigo-500 w-[70%]" />
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10">
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Referral Success</p>
                                            <h4 className="text-3xl font-black text-emerald-500 tracking-tighter leading-none">{vendorStats.stats.total_referrals} <span className="text-[10px] uppercase opacity-50 not-italic">Nodes</span></h4>
                                            <p className="text-[10px] font-bold text-emerald-500/60 mt-3">{vendorStats.stats.active_referrals} Phase-Active agents detected</p>
                                        </div>
                                        <div className="p-6 rounded-[1.5rem] bg-amber-500/5 border border-amber-500/10">
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Operational Health</p>
                                            <h4 className="text-3xl font-black text-amber-500 tracking-tighter leading-none">A+ <span className="text-[10px] uppercase opacity-50 not-italic ml-2">Rating</span></h4>
                                            <div className="flex gap-1 mt-4">
                                                {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-amber-500' : 'bg-amber-500/20'}`} />)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Referrals Section */}
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-dark)] mb-5 flex items-center gap-2">
                                            <Layers size={14} className="text-indigo-400" />
                                            Synchronized Referral Network
                                        </h5>
                                        <div className="bg-[var(--bg-color)]/30 rounded-3xl border border-[var(--border-color)] overflow-hidden">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-color)]/50">
                                                        <th className="p-4 font-black text-[var(--text-muted)] uppercase text-[9px] tracking-widest">Digital Persona</th>
                                                        <th className="p-4 font-black text-[var(--text-muted)] uppercase text-[9px] tracking-widest">Protocol Date</th>
                                                        <th className="p-4 font-black text-[var(--text-muted)] uppercase text-[9px] tracking-widest text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vendorStats.referrals.length > 0 ? vendorStats.referrals.map(ref => (
                                                        <tr key={ref.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-white/[0.02]">
                                                            <td className="p-4">
                                                                <div className="font-black text-[var(--text-dark)] uppercase text-[10px] tracking-tight">{ref.name}</div>
                                                                <div className="text-[9px] text-[var(--text-muted)] font-bold">{ref.phone}</div>
                                                            </td>
                                                            <td className="p-4 font-bold text-[var(--text-muted)] text-[10px] uppercase">
                                                                {new Date(ref.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                                    ref.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                                }`}>
                                                                    {ref.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="3" className="p-10 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40 italic">No node synchronization detected</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Earnings Log */}
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-dark)] mb-5 flex items-center gap-2">
                                            <RefreshCcw size={14} className="text-emerald-400" />
                                            Financial Payout Ledger
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {vendorStats.earnings.length > 0 ? vendorStats.earnings.map(earn => (
                                                <div key={earn.id} className="p-4 rounded-2xl bg-[var(--bg-color)]/30 border border-[var(--border-color)] flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                            <span className="text-[10px] font-black italic">₹</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-[var(--text-dark)] uppercase">Commission Influx</p>
                                                            <p className="text-[8px] font-bold text-[var(--text-muted)] tracking-wider">{new Date(earn.created_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[12px] font-black text-emerald-500 italic">+₹{earn.amount}</p>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/50">Verified</span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="col-span-2 p-10 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40 italic border-2 border-dashed border-[var(--border-color)] rounded-3xl">Earnings grid waiting for initialization</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        
                        <div className="p-8 border-t border-[var(--border-color)] bg-[var(--bg-color)]/30 flex justify-end">
                            <button onClick={() => { setIsStatsModalOpen(false); setVendorStats(null); }} className="px-8 py-3 bg-[var(--text-dark)] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/10 cursor-pointer border-none outline-none">Close Intelligence Hub</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendors;
