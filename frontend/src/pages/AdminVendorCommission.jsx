import React, { useState, useEffect } from 'react';
import { 
    Users, Percent, Save, Search, RefreshCcw, 
    CheckCircle, AlertCircle, ArrowLeft, Zap, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminVendorCommission = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [globalRate, setGlobalRate] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGlobalRate();
        fetchVendors();
    }, []);

    const fetchGlobalRate = async () => {
        try {
            const { data } = await api.get('/admin/settings/referral_vendor_commission_rate');
            if (data.success) {
                setGlobalRate(data.data.setting_value);
            }
        } catch (err) { console.error(err); }
    };

    const fetchVendors = async () => {
        setLoading(true);
        try {
            // Fetch all users with role 'vendor'
            const { data } = await api.get(`/admin/users?role=vendor&search=${search}&limit=100`);
            if (data.success) {
                setVendors(data.data);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network synchronization failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRate = async (vendorId, rate) => {
        setSaving(vendorId);
        console.log(`[DEBUG] Syncing commission for ${vendorId} -> ${rate}%`);
        try {
            const { data } = await api.put(`/admin/vendor-commission/${vendorId}`, { 
                commission_rate: rate === '' ? null : parseFloat(rate) 
            });
            if (data.success) {
                setMessage({ type: 'success', text: 'Vendor override synchronized.' });
                fetchVendors();
                setTimeout(() => setMessage({ type: '', text: '' }), 2000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update commission node.' });
        } finally {
            setSaving(null);
        }
    };

    const handleRateChange = (id, value) => {
        setVendors(vendors.map(v => v.id === id ? { ...v, custom_commission_rate: value } : v));
    };

    return (
        <div className="animate-fade-in space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <button 
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:gap-3 transition-all mb-2"
                    >
                        <ArrowLeft size={14} /> Back to Global Settings
                    </button>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Vendor Commissions</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic">Set custom commission rates for specific vendors.</p>
                </div>
                <div className="bg-indigo-600/10 border border-indigo-600/20 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <Percent size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Default Global Rate</p>
                        <h4 className="text-xl font-black text-[var(--text-dark)] tracking-tighter">{globalRate}%</h4>
                    </div>
                </div>
            </header>

            {/* Status Message */}
            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-4 border animate-slide-up ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search Vendor Phone/Name..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchVendors()}
                        className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:border-indigo-500 transition-all placeholder:text-[var(--text-muted)]/30"
                    />
                </div>
                <button 
                    onClick={fetchVendors}
                    className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl text-[var(--text-muted)] hover:text-indigo-500 transition-all"
                >
                    <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Table Matrix */}
            <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] rounded-[2.5rem]">
                <div className="table-responsive">
                    <table className="table hover-highlight mb-0">
                        <thead className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                            <tr>
                                <th className="px-8 py-6 text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest leading-none">Vendor Details</th>
                                <th className="py-6 text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest leading-none">Rate Type</th>
                                <th className="py-6 text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest leading-none">Custom Commission (%)</th>
                                <th className="py-6 text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest leading-none text-right px-8">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="py-32 text-center text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.5em] animate-pulse">Loading Vendors...</td></tr>
                            ) : vendors.length === 0 ? (
                                <tr><td colSpan="4" className="py-32 text-center text-xs font-bold text-[var(--text-muted)] italic leading-relaxed">No vendors found matching your search.</td></tr>
                            ) : (
                                vendors.map(vendor => (
                                    <tr key={vendor.id} className="group border-b border-[var(--border-color)]/30 last:border-0 hover:bg-white/[0.01]">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12">
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-sm text-[var(--text-dark)] uppercase tracking-tight mb-0.5">{vendor.full_name || 'Generic Vendor'}</div>
                                                    <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest opacity-60 italic">{vendor.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {vendor.custom_commission_rate !== null ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest">
                                                    <Zap size={10} className="animate-pulse" /> Custom Rate
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[8px] font-black uppercase tracking-widest">
                                                    Global Rate
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="relative w-32">
                                                <input 
                                                    type="number"
                                                    step="0.1"
                                                    value={vendor.custom_commission_rate ?? ''}
                                                    onChange={(e) => handleRateChange(vendor.id, e.target.value)}
                                                    placeholder={globalRate}
                                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl py-2 px-4 pr-9 text-xs font-black outline-none focus:border-indigo-500 transition-all text-[var(--text-dark)]"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-500">%</span>
                                            </div>
                                        </td>
                                        <td className="px-8">
                                            <button 
                                                onClick={() => handleUpdateRate(vendor.id, vendor.custom_commission_rate)}
                                                disabled={saving === vendor.id}
                                                className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-[9px] tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {saving === vendor.id ? <RefreshCcw size={12} className="animate-spin" /> : <Save size={12} />}
                                                Save Changes
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminVendorCommission;
