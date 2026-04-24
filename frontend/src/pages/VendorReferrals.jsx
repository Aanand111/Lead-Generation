import React, { useState, useEffect } from 'react';
import { 
    UserPlus, ShieldCheck, Mail, Phone, Lock, ChevronRight, 
    Activity, Zap, Sparkles, Clock, Briefcase, Users, Search, Gem
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendorReferrals = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('user'); // 'user' or 'vendor'
    const [formData, setFormData] = useState({ phone: '', password: '', full_name: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isPrimaryVendor = !user.referred_by;

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        setLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/vendor/referrals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setReferrals(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (subVendorId, action) => {
        setActionLoading(subVendorId);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/vendor/approve-sub-vendor/${subVendorId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                setMsg({ text: `Sub-vendor ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully!`, type: 'success' });
                fetchReferrals();
            } else {
                setMsg({ text: data.message || 'Operation failed', type: 'error' });
            }
        } catch (err) {
            setMsg({ text: 'Connection Error', type: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setMsg({ text: '', type: '' });
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'vendor' ? '/vendor/refer-vendor' : '/vendor/refer-user';
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setMsg({ text: `${activeTab.toUpperCase()} added successfully!`, type: 'success' });
                setFormData({ phone: '', password: '', full_name: '' });
                fetchReferrals();
            } else {
                setMsg({ text: data.message || 'Authorization failed', type: 'error' });
            }
        } catch (err) {
            setMsg({ text: 'Connection Error', type: 'error' });
        } finally {
            setFormLoading(false);
        }
    };

    const filteredReferrals = referrals.filter(ref => ref.role === activeTab);

    return (
        <div className="animate-fade-in space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">My Referrals</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic">View and manage your referred customers and sub-vendors.</p>
                </div>
                
                <div className="flex p-1 bg-[var(--bg-color)]/50 border border-[var(--border-color)] rounded-2xl backdrop-blur-xl">
                    <button 
                        onClick={() => setActiveTab('user')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'user' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-indigo-400'}`}
                    >
                        <Users size={14} /> Customers
                    </button>
                    {isPrimaryVendor && (
                        <button 
                            onClick={() => setActiveTab('vendor')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'vendor' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-indigo-400'}`}
                        >
                            <Briefcase size={14} /> Sub-Vendors
                        </button>
                    )}
                </div>
            </div>
                {/* Tracking Table Section */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <h3 className="text-sm font-black text-[var(--text-dark)] uppercase tracking-widest opacity-70">Referral List</h3>
                        </div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] tracking-widest">{filteredReferrals.length} Members Found</div>
                    </div>

                    <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-elevated)] rounded-[2.5rem]">
                        <div className="table-responsive">
                            <table className="table hover-highlight mb-0">
                                <thead className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Full Name</th>
                                        <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Status</th>
                                        <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Earnings (₹)</th>
                                        <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Last Active</th>
                                        <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Joined On</th>
                                        <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Verification Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="py-20 text-center text-xs font-bold text-indigo-500/50 italic animate-pulse">Loading network data...</td></tr>
                                    ) : filteredReferrals.length === 0 ? (
                                        <tr><td colSpan="6" className="py-20 text-center text-xs font-bold text-[var(--text-muted)] italic">No {activeTab}s found.</td></tr>
                                    ) : (
                                        filteredReferrals.map(member => (
                                            <tr key={member.id} className="group border-b border-[var(--border-color)]/30 last:border-0 hover:bg-white/[0.01]">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition-all ${
                                                            parseFloat(member.total_revenue || 0) > 500 ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-indigo-500/10 text-indigo-500'
                                                        }`}>
                                                            {parseFloat(member.total_revenue || 0) > 500 ? <Gem size={16} /> : <ShieldCheck size={16} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-[11px] text-[var(--text-dark)] uppercase tracking-tight flex items-center gap-2">
                                                                {member.full_name || member.name || member.phone || `New ${activeTab}`}
                                                                {parseFloat(member.total_revenue || 0) > 500 && <span className="text-[7px] bg-amber-500 text-white px-1.5 py-0.5 rounded italic">VIP Contribution</span>}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                               <Phone size={10} className="text-indigo-400" />
                                                               <span className="text-[9px] font-bold text-[var(--text-muted)] italic">{member.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
                                                        member.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>
                                                        <div className={`w-1 h-1 rounded-full ${member.status.toLowerCase() === 'active' ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`}></div>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="font-black text-[11px] text-slate-700 italic tracking-tighter">
                                                    ₹{parseFloat(member.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </td>
                                                <td className="text-[9px] font-bold text-slate-500 italic">
                                                    {member.last_activity ? (
                                                        <span className="flex items-center gap-1 text-emerald-600">
                                                            <Zap size={10} /> {new Date(member.last_activity).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">No activity</span>
                                                    )}
                                                </td>
                                                <td className="px-8 text-[9px] font-bold text-[var(--text-muted)] opacity-60">
                                                    {new Date(member.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-8 py-5">
                                                    {member.status.toLowerCase() === 'pending' ? (
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => handleApproval(member.id, 'REJECT')}
                                                                disabled={actionLoading === member.id}
                                                                className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                            <button 
                                                                onClick={() => handleApproval(member.id, 'APPROVE')}
                                                                disabled={actionLoading === member.id}
                                                                className="px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                                                            >
                                                                {actionLoading === member.id ? '...' : 'Accept'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                                                                <ShieldCheck size={12} className="text-emerald-500 shadow-sm" />
                                                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-600 whitespace-nowrap">Verified node</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default VendorReferrals;
