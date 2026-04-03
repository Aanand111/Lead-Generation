import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Save, Sparkles, User, Package, Calendar, Zap, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const STATUSES = [
    { value: 'Active', label: 'Active' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Cancelled', label: 'Cancelled' }
];

const SubscriptionCreate = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [users, setUsers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        user_id: '',
        plan_id: '',
        total_leads: 0,
        used_leads: 0,
        total_posters: 0,
        used_posters: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active',
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [planRes, userRes] = await Promise.all([
                api.get('/admin/subscription-plans'),
                api.get('/admin/customers')
            ]);
            if (planRes.data.success) setPlans(planRes.data.data);
            if (userRes.data.success) setUsers(userRes.data.data);
        } catch (err) {
            console.error("Fetch data error:", err);
        }
    };

    const handlePlanChange = (planId) => {
        const selectedPlan = plans.find(p => p.id == planId);
        if (selectedPlan) {
            setFormData(prev => ({
                ...prev,
                plan_id: planId,
                total_leads: selectedPlan.leads_limit,
                total_posters: selectedPlan.poster_limit,
                used_leads: 0,
                used_posters: 0,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }));
        } else {
            setFormData(prev => ({ ...prev, plan_id: planId }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await api.post('/admin/subscriptions', formData);
            if (res.data.success) {
                navigate('/subscriptions');
            } else {
                setError(res.data.message || 'Error assigning subscription');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Connection error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Mint New Subscription
                        <Sparkles className="text-amber-500 animate-pulse" size={24} />
                    </h2>
                    <p>Initialize a new subscription plan and allocate resource parameters</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={() => navigate('/subscriptions')} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={16} /> Abort Operation
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-4 text-xs font-black uppercase tracking-widest italic animate-shake">
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    {/* Section 1: Customer & Plan */}
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <User size={20} />
                                </div>
                                Subscription Profile
                            </h3>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <CustomSelect
                                label="Target Customer"
                                name="user_id"
                                value={formData.user_id}
                                onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                options={users.map(u => ({ value: u.id, label: `${u.name || 'ANON'} (${u.phone})` }))}
                                placeholder="SELECT CUSTOMER NODE"
                                required
                            />

                            <CustomSelect
                                label="Entitlement Plan"
                                name="plan_id"
                                value={formData.plan_id}
                                onChange={e => handlePlanChange(e.target.value)}
                                options={plans.map(p => ({ value: p.id, label: `${p.name} (₹${p.price})` }))}
                                placeholder="SELECT SERVICE TIER"
                                required
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Start Horizon</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input 
                                        type="date" name="start_date" value={formData.start_date} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none uppercase"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">End Horizon</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input 
                                        type="date" name="end_date" value={formData.end_date} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none uppercase"
                                        required 
                                    />
                                </div>
                            </div>

                            <CustomSelect
                                label="Status Protocol"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={STATUSES.map(s => ({ value: s.value, label: s.label.toUpperCase() + ' PROTOCOL' }))}
                                required
                            />
                        </div>
                    </div>

                    {/* Section 2: Quota Allocation */}
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <Activity size={20} />
                                </div>
                                Resource Quotas
                            </h3>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 p-6 bg-[var(--bg-color)]/50 rounded-[2rem] border border-[var(--border-color)]">
                                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                    <Zap size={16} /> Leads Allocation
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Limit</label>
                                        <input type="number" name="total_leads" value={formData.total_leads} onChange={handleChange} className="w-full p-4 rounded-xl font-bold text-sm bg-[var(--surface-color)] border border-[var(--border-color)] outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Used Nodes</label>
                                        <input type="number" name="used_leads" value={formData.used_leads} onChange={handleChange} className="w-full p-4 rounded-xl font-bold text-sm bg-[var(--surface-color)] border border-[var(--border-color)] outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-6 bg-[var(--bg-color)]/50 rounded-[2rem] border border-[var(--border-color)]">
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    <Package size={16} /> Asset Allocation
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Limit</label>
                                        <input type="number" name="total_posters" value={formData.total_posters} onChange={handleChange} className="w-full p-4 rounded-xl font-bold text-sm bg-[var(--surface-color)] border border-[var(--border-color)] outline-none focus:border-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Used Nodes</label>
                                        <input type="number" name="used_posters" value={formData.used_posters} onChange={handleChange} className="w-full p-4 rounded-xl font-bold text-sm bg-[var(--surface-color)] border border-[var(--border-color)] outline-none focus:border-emerald-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-col md:flex-row gap-4 pt-6 pb-12">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Commit Subscription Data
                                </>
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/subscriptions')}
                            className="px-10 py-5 bg-[var(--bg-color)] text-[var(--text-muted)] font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                        >
                            Abort
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubscriptionCreate;
