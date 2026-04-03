import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Plus, X, UserSearch, UserPlus, Search, Check, AlertCircle, Trash2, Edit2, Activity, User, Phone, Mail, MapPin, Share2, RefreshCcw, Layers, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [paginationProps, setPaginationProps] = useState({ total: 0, pages: 1 });

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditCustomer, setCurrentEditCustomer] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        referral: '',
        pincode: '',
        status: 'Active'
    });

    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [rechargeData, setRechargeData] = useState({ amount: 0, remarks: 'Admin Recharge' });
    const [rechargeCustomer, setRechargeCustomer] = useState(null);

    const fetchCustomers = async (currentPage = page, currentLimit = limit, currentSearch = searchQuery) => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/customers', {
                params: { page: currentPage, limit: currentLimit, search: currentSearch }
            });

            if (data.success && data.data) {
                const mappedData = data.data.map((user) => ({
                    id: user.id,
                    name: user.name || 'Anonymous Node',
                    username: user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : 'member_anon',
                    email: user.email || 'void@protocol.sys',
                    phone: user.phone || '000-000-0000',
                    whatsapp: user.whatsapp || '',
                    referral: user.referral || 'NONE',
                    pincode: user.pincode || 'REG_GLOBAL',
                    status: user.status === 'Inactive' ? 'Inactive' : 'Active'
                }));
                setCustomers(mappedData);
                if (data.pagination) {
                    setPaginationProps({ total: data.pagination.total, pages: data.pagination.pages });
                }
            } else {
                setCustomers([]);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setPage(1);
            fetchCustomers(1, limit, searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, limit]);

    // Regular fetch when page changes
    useEffect(() => {
        fetchCustomers(page, limit, searchQuery);
    }, [page]);

    const toggleAction = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    const handleEditClick = (customer) => {
        setOpenActionId(null);
        setCurrentEditCustomer(customer);
        setFormData({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            whatsapp: customer.whatsapp || '',
            referral: customer.referral || '',
            pincode: customer.pincode || '',
            status: customer.status || 'Active'
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
            const { data } = await api.put(`/admin/customers/${currentEditCustomer.id}`, formData);
            if (data.success || data.message === "Customer updated successfully") {
                setIsEditModalOpen(false);
                fetchCustomers();
                setMessage({ type: 'success', text: 'Subscriber identity profile synchronized.' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Update sequence rejected.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Communication failure during synchronization.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleRechargeClick = (customer) => {
        setOpenActionId(null);
        setRechargeCustomer(customer);
        setRechargeData({ amount: 100, remarks: 'Manual Admin Recharge' });
        setIsRechargeModalOpen(true);
    };

    const handleRechargeSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put(`/admin/users/${rechargeCustomer.id}/wallet`, {
                amount: Number(rechargeData.amount),
                actionType: 'CREDIT',
                remarks: rechargeData.remarks
            });
            if (data.success) {
                setIsRechargeModalOpen(false);
                setMessage({ type: 'success', text: `Wallet for ${rechargeCustomer.name} recharged successfully!` });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Wallet enrichment protocol failed.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        setCustomers(customers.map(c => c.id === id ? { ...c, status: newStatus } : c));
        setOpenActionId(null);

        try {
            await api.put(`/admin/customers/${id}/status`, { status: newStatus });
            setMessage({ type: 'success', text: `Subscriber node status: ${newStatus}.` });
        } catch (err) {
            setCustomers(customers.map(c => c.id === id ? { ...c, status: currentStatus } : c));
            setMessage({ type: 'error', text: 'Status protocol enforcment failed.' });
        } finally {
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;
        try {
            const { data } = await api.delete(`/admin/customers/${id}`);
            if (data.success) {
                setCustomers(prev => prev.filter(c => c.id !== id));
                setMessage({ type: 'success', text: 'Subscriber node purged from global clusters.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Purge sequence aborted by server.' });
        } finally {
            setOpenActionId(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Subscriber Community Matrix</h2>
                    <p>Orchestrate global community interaction and entitlement profiles</p>
                </div>
                <div className="pageHeaderActions">
                    <button className="btn btn-primary flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100" onClick={() => navigate('/customers/create')}>
                        <UserPlus size={16} /> Mint New Subscriber
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 transition-all animate-slide-up border ${message.type === 'error' ? 'bg-red-50/10 text-red-500 border-red-500/20' : 'bg-emerald-50/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="card shadow-sm border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)]">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">
                            Active Nodes: <span className="text-[var(--text-dark)] not-italic font-black">{paginationProps.total} Members</span>
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Trace member by identity, contact or digital protocol..."
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="w-16 text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Index</th>
                                <th className="text-[var(--text-muted)]">Subscriber Persona</th>
                                <th className="text-[var(--text-muted)]">Contact Protocol</th>
                                <th className="text-[var(--text-muted)]">Allocation Origin</th>
                                <th className="text-[var(--text-muted)]">Digital Node</th>
                                <th className="text-[var(--text-muted)]">Operational State</th>
                                <th className="text-right text-[var(--text-muted)]">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="spinner mb-2"></div>
                                            <span className="text-[10px] uppercase font-black tracking-[0.2em] animate-pulse text-[var(--text-muted)]">Syncing Subscriber Mesh...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length > 0 ? (
                                customers.map((customer, index) => (
                                    <tr key={customer.id} className="transition-all hover:bg-[var(--primary)]/[0.02] group border-b border-[var(--border-color)] last:border-0 text-xs text-[var(--text-dark)]">
                                        <td className="text-center font-black text-[var(--text-muted)]/40 text-[10px]">
                                            #{((page - 1) * limit + index + 1).toString().padStart(3, '0')}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-[var(--text-dark)] tracking-tight text-[11px] group-hover:text-indigo-500 transition-colors uppercase">{customer.name}</div>
                                                    <div className="text-[10px] text-[var(--text-muted)] font-bold italic tracking-tighter">@{customer.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-dark)]/80">
                                                    <Phone size={10} className="text-indigo-400" /> {customer.phone}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] italic">
                                                    <Mail size={10} className="text-[var(--text-muted)]/50" /> {customer.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/5 text-indigo-500 text-[10px] font-black uppercase tracking-tight border border-indigo-500/10">
                                                <Share2 size={10} /> {customer.referral || 'ORGANIC'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-tight text-[var(--text-dark)]">
                                                <MapPin size={10} className="text-rose-400" /> {customer.pincode}
                                            </div>
                                            <div className="text-[9px] font-black text-[var(--text-muted)]/60 ml-4 italic">Z_REGION_IN</div>
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${customer.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 italic opacity-60'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${customer.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 opacity-40'}`}></div>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    className="bg-transparent border-none p-2 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer active:scale-90"
                                                    onClick={() => toggleAction(customer.id)}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {openActionId === customer.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                        <div className="absolute right-10 top-0 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[150px] py-2 overflow-hidden animate-zoom-in origin-right">
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-3 border-none cursor-pointer"
                                                                onClick={() => handleEditClick(customer)}
                                                            >
                                                                <Edit2 size={14} className="text-indigo-500" /> Refine Profile
                                                            </button>
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-emerald-500/10 hover:text-emerald-500 transition-all flex items-center gap-3 border-none cursor-pointer"
                                                                onClick={() => handleRechargeClick(customer)}
                                                            >
                                                                <Plus size={14} className="text-emerald-500" /> Recharge Wallet
                                                            </button>
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 transition-all flex items-center gap-3 border-none cursor-pointer"
                                                                onClick={() => handleStatusToggle(customer.id, customer.status)}
                                                            >
                                                                <Activity size={14} className={customer.status === 'Active' ? 'text-rose-500' : 'text-emerald-500'} />
                                                                {customer.status === 'Active' ? 'Suspend Node' : 'Enforce Active'}
                                                            </button>
                                                            <div className="h-px bg-[var(--border-color)] my-1 mx-2"></div>
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-3 border-none cursor-pointer"
                                                                onClick={() => handleDelete(customer.id)}
                                                            >
                                                                <Trash2 size={14} /> Purge Node
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
                                            <p className="font-black uppercase tracking-widest text-[10px]">No Subscriber Nodes Detected in Spectrum</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-[var(--border-color)] bg-[var(--bg-color)]/30">
                    <div className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">
                        Mesh Density: <span className="text-[var(--text-dark)] not-italic font-black">{customers.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, paginationProps.total)}</span> of {paginationProps.total} Total
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

            {/* Edit Customer Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-[var(--bg-color)]/70 backdrop-blur-md z-[9000] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface-color)] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in border border-[var(--border-color)]">
                        <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/30">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--text-dark)] tracking-tight uppercase">
                                    Member Profile Sync
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">Synchronization of community identity and interaction parameters</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] shadow-sm border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-color)] transition-colors cursor-pointer outline-none">
                                <X size={20} className="text-[var(--text-muted)]" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Identity Designation <span>*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleEditChange} required className="form-control !py-4 font-black tracking-tight text-sm uppercase bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Protocol Handle (Email)</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleEditChange} className="form-control !py-4 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Contact Sequence</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleEditChange} required className="form-control !py-4 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Encrypted Chat (WA)</label>
                                        <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleEditChange} className="form-control !py-4 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Referral Path</label>
                                        <input type="text" name="referral" value={formData.referral} onChange={handleEditChange} className="form-control !py-4 font-black text-sm uppercase bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Regiment Mask (Pin)</label>
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleEditChange} className="form-control !py-4 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-10 pt-6">
                                <button type="submit" className="btn btn-primary flex-1 py-4 flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-500/10" disabled={saving}>
                                    {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Layers size={16} />}
                                    {saving ? 'Syncing Mesh...' : 'Update Subscriber Node'}
                                </button>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 py-4 bg-[var(--bg-color)] text-[var(--text-muted)] hover:bg-[var(--border-color)] font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all border-none cursor-pointer">Abort</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Recharge Wallet Modal */}
            {isRechargeModalOpen && (
                <div className="fixed inset-0 bg-[var(--bg-color)]/70 backdrop-blur-md z-[9000] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface-color)] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in border border-[var(--border-color)]">
                        <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/30">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--text-dark)] tracking-tight uppercase">
                                    Wallet Enrichment
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">Allocating digital credits to subscriber account</p>
                            </div>
                            <button onClick={() => setIsRechargeModalOpen(false)} className="w-10 h-10 rounded-2xl bg-[var(--surface-color)] shadow-sm border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-color)] transition-colors cursor-pointer outline-none">
                                <X size={20} className="text-[var(--text-muted)]" />
                            </button>
                        </div>
                        <form onSubmit={handleRechargeSubmit} className="p-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Credit Quantity <span>*</span></label>
                                    <input 
                                        type="number" 
                                        value={rechargeData.amount} 
                                        onChange={(e) => setRechargeData({ ...rechargeData, amount: e.target.value })} 
                                        required 
                                        className="form-control !py-4 font-black tracking-tight text-xl uppercase bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 outline-none text-center" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Transaction Remarks</label>
                                    <input 
                                        type="text" 
                                        value={rechargeData.remarks} 
                                        onChange={(e) => setRechargeData({ ...rechargeData, remarks: e.target.value })} 
                                        className="form-control !py-4 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 outline-none" 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-10 pt-6">
                                <button type="submit" className="btn btn-primary flex-1 py-4 flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-500/10" disabled={saving}>
                                    {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Plus size={16} />}
                                    {saving ? 'Transmitting...' : 'Enrich Wallet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
