import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Package, Zap, Activity, Info, AlertCircle, Calendar, Crown } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const PLAN_NAMES = [
    { value: 'MONTHLY', label: 'MONTHLY' },
    { value: 'QUARTERLY', label: 'QUARTERLY' },
    { value: 'HALF YEARLY', label: 'HALF YEARLY' },
    { value: 'YEARLY', label: 'YEARLY' }
];

const CATEGORIES = [
    { value: 'LEADS', label: 'LEADS ONLY' },
    { value: 'POSTER', label: 'POSTER ONLY' },
    { value: 'BOTH', label: 'LEADS & POSTER' },
    { value: 'PREMIUM', label: 'ELITE PREMIUM' }
];

const STATUSES = [
    { value: 'Active', label: 'ACTIVE' },
    { value: 'Inactive', label: 'INACTIVE' }
];

const SubscriptionPlanCreate = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isElite, setIsElite] = useState(false);
    const [formData, setFormData] = useState({
        name: 'MONTHLY',
        category: 'LEADS',
        leads_limit: '',
        poster_limit: '',
        credits: 0,
        price: '',
        duration: 30,
        description: '',
        status: 'Active',
    });

    const handleEliteToggle = (checked) => {
        setIsElite(checked);
        setFormData(prev => ({
            ...prev,
            category: checked ? 'PREMIUM' : 'LEADS'
        }));
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
            const res = await api.post('/admin/subscription-plans', formData);
            if (res.data.success) {
                navigate('/subscriptions/plan');
            } else {
                setError(res.data.message || 'Failed to create plan');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server error occurred');
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
                        Mint New Plan
                        <Sparkles className="text-amber-500 animate-pulse" size={24} />
                    </h2>
                    <p>Create a new subscription tier with specific resource quotas</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={() => navigate('/subscriptions/plan')} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl transition-all shadow-sm">
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

                    {/* Elite Toggle Header */}
                    <div className={`p-6 rounded-[2rem] border transition-all duration-500 flex items-center justify-between ${isElite ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30' : 'bg-[var(--surface-color)] border-[var(--border-color)]'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isElite ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 rotate-12' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                <Crown size={28} fill={isElite ? "currentColor" : "none"} />
                            </div>
                            <div>
                                <h4 className={`text-sm font-black uppercase tracking-widest ${isElite ? 'text-amber-600' : 'text-[var(--text-dark)]'}`}>Plan Designation</h4>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] italic leading-none mt-1">
                                    {isElite ? 'Creating an exclusive high-tier VIP subscription' : 'Creating a standard utility subscription'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${!isElite ? 'text-indigo-600' : 'text-[var(--text-muted)] opacity-50'}`}>Standard</span>
                            <button
                                type="button"
                                onClick={() => handleEliteToggle(!isElite)}
                                className={`relative w-20 h-10 rounded-full transition-all duration-500 p-1 flex items-center ${isElite ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-slate-200'}`}
                            >
                                <div className={`w-8 h-8 rounded-full bg-white shadow-md transform transition-all duration-500 flex items-center justify-center ${isElite ? 'translate-x-10' : 'translate-x-0'}`}>
                                    {isElite && <Sparkles size={14} className="text-amber-500" />}
                                </div>
                            </button>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isElite ? 'text-amber-600' : 'text-[var(--text-muted)] opacity-50'}`}>Elite VIP</span>
                        </div>
                    </div>

                    {/* Section 1: Plan Identity */}
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                            <div className={`p-8 border-b border-[var(--border-color)] transition-all duration-500 ${isElite ? 'bg-amber-500/5' : 'bg-[var(--bg-color)]/30'}`}>
                                <h3 className={`text-lg font-black uppercase tracking-tight flex items-center gap-3 ${isElite ? 'text-amber-600' : ''}`}>
                                    <div className={`p-2 rounded-xl transition-all ${isElite ? 'bg-amber-500 text-black shadow-md' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                        <Package size={20} />
                                    </div>
                                    Plan Configuration {isElite && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-md ml-2 animate-pulse">Elite Mode</span>}
                                </h3>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <CustomSelect
                                    label="Plan Designation"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    options={PLAN_NAMES}
                                    required
                                />

                                <div className="relative">
                                    <CustomSelect
                                        label="Service Category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        options={CATEGORIES}
                                        disabled={isElite}
                                        required
                                    />
                                    {isElite && <div className="absolute top-0 right-0 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md">Locked to Premium</div>}
                                </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Price (₹)</label>
                                <input
                                    type="number" name="price" value={formData.price} onChange={handleChange} step="0.01"
                                    placeholder="0.00"
                                    className="w-full px-6 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Duration (Days)</label>
                                <input
                                    type="number" name="duration" value={formData.duration} onChange={handleChange}
                                    placeholder="30"
                                    className="w-full px-6 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                    required
                                />
                            </div>

                            <CustomSelect
                                label="Plan Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={STATUSES}
                                required
                            />

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    name="description" value={formData.description} onChange={handleChange}
                                    placeholder="Detail the benefits and features of this plan..."
                                    className="w-full px-6 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none min-h-[120px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Quota Allocation */}
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                        <div className={`p-8 border-b border-[var(--border-color)] transition-all duration-500 ${isElite ? 'bg-amber-500/5' : 'bg-[var(--bg-color)]/30'}`}>
                            <h3 className={`text-lg font-black uppercase tracking-tight flex items-center gap-3 ${isElite ? 'text-amber-600' : ''}`}>
                                <div className={`p-2 rounded-xl transition-all ${isElite ? 'bg-amber-500 text-black shadow-md' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    <Activity size={20} />
                                </div>
                                Quota Constraints
                            </h3>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 p-6 bg-[var(--bg-color)]/50 rounded-[2rem] border border-[var(--border-color)]">
                                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                    <Zap size={16} /> Leads Capacity
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Monthly Limit</label>
                                    <input type="number" name="leads_limit" value={formData.leads_limit} onChange={handleChange} placeholder="0" className="w-full p-4 rounded-xl font-bold text-sm bg-[var(--surface-color)] border border-[var(--border-color)] outline-none focus:border-indigo-500" />
                                </div>
                            </div>

                            <div className="space-y-4 p-6 bg-[var(--bg-color)]/50 rounded-[2rem] border border-[var(--border-color)]">
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    <Zap size={16} /> Poster Capacity
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Monthly Limit</label>
                                    <input type="number" name="poster_limit" value={formData.poster_limit} onChange={handleChange} placeholder="0" className="w-full p-4 rounded-xl font-bold text-sm bg-[var(--surface-color)] border border-[var(--border-color)] outline-none focus:border-emerald-500" />
                                </div>
                            </div>

                            <div className="space-y-4 p-6 bg-[var(--bg-color)]/50 rounded-[2rem] border border-[var(--border-color)] md:col-span-2">
                                <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                    <Sparkles size={16} /> Digital Credits (Wallet Balance)
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Awarded Credits per Activation</label>
                                    <input type="number" name="credits" value={formData.credits} onChange={handleChange} placeholder="0" className="w-full p-4 rounded-xl font-bold text-sm bg-[var(--surface-color)] border border-[var(--border-color)] outline-none focus:border-amber-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-col md:flex-row gap-4 pt-6 pb-12">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 py-5 font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 ${
                                isElite 
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black shadow-amber-500/30' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                            }`}
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Commit Plan Data
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/subscriptions/plan')}
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

export default SubscriptionPlanCreate;
