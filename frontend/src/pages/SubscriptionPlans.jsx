import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, MoreVertical, Package, Search, Check, X, Layers, Clock, Zap, Sparkles, Activity, Wallet } from 'lucide-react';
import api from '../utils/api';

const categoryColors = {
    LEADS: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    POSTER: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    BOTH: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const SubscriptionPlans = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);
    const [search, setSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/subscription-plans');
            if (res.data.success) {
                setPlans(res.data.data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await api.delete(`/admin/subscription-plans/${id}`);
            if (res.data.success) {
                setPlans(prev => prev.filter(p => p.id !== id));
            }
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setDeleteConfirm(null);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const filtered = plans.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Subscription Plans
                        <Package className="text-indigo-500" size={24} />
                    </h2>
                    <p>Manage subscription tiers, pricing, and resource limits</p>
                </div>
                <div className="pageHeaderActions">
                    <button 
                        className="btn btn-primary flex items-center gap-2 font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/20" 
                        onClick={() => navigate('/subscriptions/plan/create')}
                    >
                        <Plus size={16} /> Create New Plan
                    </button>
                </div>
            </div>

            {/* List Section */}
            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 p-8 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <Activity size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block leading-none mb-1">Available Plans</span>
                            <span className="text-sm font-black uppercase tracking-tight">{filtered.length} Plans Registered</span>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold shadow-inner focus:border-indigo-500 focus:bg-[var(--surface-color)] outline-none transition-all placeholder:text-[var(--text-muted)]/50"
                            placeholder="Search plans by name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="w-20 text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest py-6">ID</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Plan Details</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Pricing</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Duration</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Credits</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Resource Limits</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Status</th>
                                <th className="text-right px-8 text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] animate-pulse">Loading Plans...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-24 text-[var(--text-muted)]">
                                        <div className="flex flex-col items-center gap-6 opacity-40">
                                            <Package size={80} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No Plans Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((plan) => (
                                <tr key={plan.id} className="transition-all hover:bg-indigo-500/[0.02] group">
                                    <td className="text-center">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] opacity-30">#{plan.id}</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center border transition-all group-hover:scale-110 ${categoryColors[plan.category] || categoryColors.BOTH}`}>
                                                <Layers size={22} />
                                            </div>
                                             <div>
                                                <div className="font-black uppercase tracking-tight text-sm text-indigo-500">{plan.name}</div>
                                                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{plan.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-black text-base text-[var(--text-dark)] tabular-nums">
                                            ₹{Number(plan.price).toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest opacity-50">Base Price</div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 font-black text-sm tabular-nums">
                                            <Clock size={16} className="text-amber-500" />
                                            {plan.duration} Days
                                        </div>
                                        <div className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest opacity-50">Validity</div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 font-black text-sm tabular-nums text-amber-500">
                                            <Wallet size={16} />
                                            {plan.credits || 0}
                                        </div>
                                        <div className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest opacity-50">Credits</div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-8">
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm text-indigo-500 flex items-center gap-2 tabular-nums">
                                                    <Zap size={14} /> {plan.leads_limit || 0}
                                                </span>
                                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Leads</span>
                                            </div>
                                            <div className="w-px h-8 bg-[var(--border-color)]"></div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm text-emerald-500 flex items-center gap-2 tabular-nums">
                                                    <Sparkles size={14} /> {plan.poster_limit || 0}
                                                </span>
                                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Posters</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            plan.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${plan.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse'}`}></div>
                                            {plan.status}
                                        </span>
                                    </td>
                                    <td className="text-right px-8">
                                        <div className="relative inline-block text-left">
                                            <button 
                                                className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer border-none bg-transparent" 
                                                onClick={() => setOpenActionId(openActionId === plan.id ? null : plan.id)}
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            {openActionId === plan.id && (
                                                <>
                                                    <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                    <div className="absolute right-0 top-12 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[200px] py-3 overflow-hidden animate-zoom-in origin-top-right">
                                                         <button 
                                                            className="w-full text-left px-5 py-3 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                            onClick={() => navigate(`/subscriptions/plan/edit/${plan.id}`)}
                                                        >
                                                            <Edit2 size={16} /> Edit Plan
                                                        </button>
                                                        <div className="h-px bg-[var(--border-color)] my-2 opacity-50"></div>
                                                        <button 
                                                            className="w-full text-left px-5 py-3 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                            onClick={() => { setDeleteConfirm(plan); setOpenActionId(null); }}
                                                        >
                                                            <Trash2 size={16} /> Delete Plan
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-[var(--bg-color)]/80 backdrop-blur-2xl z-[9500] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface-color)] rounded-[3rem] shadow-2xl w-full max-w-sm p-10 text-center animate-zoom-in border border-[var(--border-color)]">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-inner">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tight">Delete Plan?</h3>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-4 italic leading-relaxed px-4 opacity-70">
                            Deleting <span className="text-red-500 font-black">"{deleteConfirm.name}"</span> will prevent new users from subscribing to this plan.
                        </p>
                        <div className="flex flex-col gap-3 mt-10">
                            <button 
                                className="w-full py-5 bg-red-600 text-white hover:bg-red-700 font-black uppercase text-xs tracking-widest rounded-3xl transition-all shadow-xl shadow-red-500/20 border-none cursor-pointer active:scale-95" 
                                onClick={() => handleDelete(deleteConfirm.id)}
                            >
                                Confirm Delete
                            </button>
                            <button 
                                className="w-full py-5 bg-[var(--bg-color)] text-[var(--text-muted)] hover:bg-[var(--border-color)] font-black uppercase text-xs tracking-widest rounded-3xl transition-all border-none cursor-pointer active:scale-95" 
                                onClick={() => setDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlans;
