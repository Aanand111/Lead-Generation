import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, MoreVertical, CreditCard, User, Package, Calendar, Search, AlertCircle, Check, RefreshCcw, Layers, Zap, Sparkles, Activity, Shield, Hash, Phone, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';

const Subscriptions = () => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [subscriptions, setSubscriptions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, userRes] = await Promise.all([
                api.get('/admin/subscriptions'),
                api.get('/admin/customers')
            ]);

            if (subRes.data.success) setSubscriptions(subRes.data.data);
            if (userRes.data.success) setUsers(userRes.data.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = subscriptions.filter(s => {
        const user = users.find(u => u.id === s.user_id);
        const userName = user?.name || s.user_name || s.customer_name || '';
        const userPhone = user?.phone || s.customer_phone || '';
        const planName = s.plan_name || '';
        return userName.toLowerCase().includes(search.toLowerCase()) ||
            userPhone.includes(search) ||
            planName.toLowerCase().includes(search.toLowerCase());
    });

    const handleDelete = async (id) => {
        const confirmed = await confirm(
            'Are you sure you want to delete this subscription? This action cannot be undone.',
            'Delete Subscription'
        );
        if (confirmed) {
            try {
                const res = await api.delete(`/admin/subscriptions/${id}`);
                if (res.data.success) {
                    setSubscriptions(prev => prev.filter(s => s.id !== id));
                    toast.success('Subscription deleted successfully.');
                }
            } catch (err) {
                toast.error('Failed to delete subscription.');
                console.error("Delete error:", err);
            } finally {
                setOpenActionId(null);
            }
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
            case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3 font-black tracking-tight">
                        Subscriptions
                        <CreditCard className="text-indigo-500" size={24} />
                    </h2>
                    <p className="text-sm opacity-60">Manage and view user subscription history and status</p>
                </div>
                <div className="pageHeaderActions">
                    <button 
                        className="btn btn-primary px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        onClick={() => navigate('/subscriptions/create')}
                    >
                        <Plus size={16} /> Add Subscription
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] mt-8">
                <div className="p-8 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-6 bg-[var(--bg-color)]/20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shadow-sm border border-indigo-500/10">
                                <Activity size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Status Overview</div>
                                <div className="text-sm font-black uppercase tracking-tight">{filtered.length} Subscriptions Found</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold shadow-inner focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/50 uppercase tracking-widest"
                            placeholder="Search subscriptions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr className="bg-[var(--bg-color)]/40 border-b border-[var(--border-color)]">
                                <th className="ps-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">ID</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Customer</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Plan Details</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Validity Period</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Status</th>
                                <th className="py-5 text-right pe-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-28">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] animate-pulse">Loading subscriptions...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((sub) => {
                                    const user = users.find(u => u.id === sub.user_id);
                                    return (
                                        <tr key={sub.id} className="transition-all hover:bg-indigo-500/[0.01] group border-b border-[var(--border-color)] last:border-0">
                                            <td className="ps-8 py-6 text-[10px] font-black text-[var(--text-muted)] opacity-30">#{sub.id}</td>
                                            <td className="py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-sm border border-indigo-500/10 shadow-sm group-hover:scale-110 transition-transform">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-sm uppercase tracking-tight text-indigo-500 group-hover:translate-x-1 transition-transform">{user?.name || sub.user_name || sub.customer_name || 'Anonymous User'}</div>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] opacity-60">
                                                            <Phone size={10} /> {user?.phone || sub.user_phone || sub.customer_phone || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--text-dark)]">
                                                        <Package size={14} className="text-indigo-500" />
                                                        {sub.plan_name || 'Basic Plan'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit border border-emerald-500/10">
                                                        {sub.plan_price ? `₹${sub.plan_price}` : 'Free'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex flex-col gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)]">
                                                        <Clock size={12} className="text-indigo-500" />
                                                        <span className="uppercase tracking-widest">Start:</span> {new Date(sub.start_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)]">
                                                        <Calendar size={12} className="text-red-500" />
                                                        <span className="uppercase tracking-widest text-red-500/70">Expire:</span> {new Date(sub.expire_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 text-center">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    getStatusStyle(sub.status)
                                                }`}>
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        sub.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 
                                                        sub.status?.toLowerCase() === 'expired' ? 'bg-red-500' : 'bg-amber-500'
                                                    }`}></div>
                                                    {sub.status || 'UNKNOWN'}
                                                </span>
                                            </td>
                                            <td className="py-6 text-right pe-8">
                                                <div className="relative inline-block text-left">
                                                    <button 
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all border-none bg-transparent cursor-pointer" 
                                                        onClick={() => setOpenActionId(openActionId === sub.id ? null : sub.id)}
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>
                                                    {openActionId === sub.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                            <div className="absolute right-0 top-12 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[200px] py-3 overflow-hidden animate-zoom-in origin-top-right backdrop-blur-xl">
                                                                <button 
                                                                    className="w-full text-left px-5 py-3.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                                    onClick={() => navigate(`/subscriptions/edit/${sub.id}`)}
                                                                >
                                                                    <Edit2 size={16} /> Edit Subscription
                                                                </button>
                                                                <div className="h-px bg-[var(--border-color)] my-2 opacity-30"></div>
                                                                <button 
                                                                    className="w-full text-left px-5 py-3.5 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                                    onClick={() => handleDelete(sub.id)}
                                                                >
                                                                    <Trash2 size={16} /> Delete Subscription
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-40 text-[var(--text-muted)]">
                                        <div className="flex flex-col items-center gap-8 opacity-20">
                                            <CreditCard size={100} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-widest text-xs">No subscriptions found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
