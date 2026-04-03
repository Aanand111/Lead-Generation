import React, { useState, useEffect } from 'react';
import { 
    UserPlus, ShieldCheck, Mail, Phone, Lock, ChevronRight, 
    Activity, Zap, Sparkles, Clock, Briefcase, Users, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendorReferrals = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('user'); // 'user' or 'vendor'
    const [formData, setFormData] = useState({ phone: '', password: '', full_name: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
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
                setMsg({ text: `${activeTab.toUpperCase()} node authorized successfully!`, type: 'success' });
                setFormData({ phone: '', password: '', full_name: '' });
                fetchReferrals();
            } else {
                setMsg({ text: data.message || 'Authorization failed', type: 'error' });
            }
        } catch (err) {
            setMsg({ text: 'Sync Error', type: 'error' });
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
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Referral Matrix</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic">Command and Control your decentralized network expansion.</p>
                </div>
                
                <div className="flex p-1 bg-[var(--bg-color)]/50 border border-[var(--border-color)] rounded-2xl backdrop-blur-xl">
                    <button 
                        onClick={() => setActiveTab('user')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'user' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-indigo-400'}`}
                    >
                        <Users size={14} /> Network Users
                    </button>
                    {isPrimaryVendor && (
                        <button 
                            onClick={() => setActiveTab('vendor')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'vendor' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-indigo-400'}`}
                        >
                            <Briefcase size={14} /> Business Partners
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Manual Referral Form - Matching Doc Aesthetic */}
                <div className="lg:col-span-5 space-y-8">
                    <header className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
                            <Sparkles size={12} /> Network Expansion
                        </div>
                        <h2 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tight">Refer New {activeTab} Node</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] italic leading-relaxed">
                            Introduce a new {activeTab} partner following the decentralized growth protocols.
                        </p>
                    </header>

                    <div className="card p-8 border border-[var(--border-color)] bg-[var(--surface-elevated)] rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-focus-within:text-indigo-500/10 transition-colors duration-700 pointer-events-none">
                            <Zap size={100} />
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
                            {msg.text && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 animate-slide-up border ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                    <Activity size={16} className={msg.type === 'success' ? 'animate-pulse' : ''} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{msg.text}</span>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Identity Designation *</label>
                               <div className="relative group">
                                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                  <input type="text" className="form-control !pl-12 !py-3.5 font-black tracking-tight text-xs uppercase bg-[var(--bg-color)]/30 border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all shadow-inner outline-none rounded-xl w-full" placeholder="FULL NAME PROTOCOL" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Contact Sequence (Phone) *</label>
                               <div className="relative group">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                  <input type="text" className="form-control !pl-12 !py-3.5 font-black tracking-tight text-xs bg-[var(--bg-color)]/30 border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all shadow-inner outline-none rounded-xl w-full" placeholder="9666966767" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Security Key (Password) *</label>
                               <div className="relative group">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                  <input type="password" className="form-control !pl-12 !py-3.5 font-black tracking-tight text-xs bg-[var(--bg-color)]/30 border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all shadow-inner outline-none rounded-xl w-full" placeholder="........" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                               </div>
                            </div>

                            <button type="submit" className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 rounded-xl group active:scale-95 transition-all" disabled={formLoading}>
                                {formLoading ? <Activity size={18} className="animate-spin" /> : <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                {formLoading ? 'Synchronizing Node...' : `Authorize ${activeTab} Member`}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Tracking Table Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <h3 className="text-sm font-black text-[var(--text-dark)] uppercase tracking-widest opacity-70">Active Linkages</h3>
                        </div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] tracking-widest">{filteredReferrals.length} Nodes Detected</div>
                    </div>

                    <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-elevated)] rounded-[2.5rem]">
                        <div className="table-responsive">
                            <table className="table hover-highlight mb-0">
                                <thead className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Identity Designation</th>
                                        <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Usage State</th>
                                        <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Revenue (₹)</th>
                                        <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Last Sync</th>
                                        <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Join Seq</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-indigo-500/50 italic animate-pulse">Decrypting node data...</td></tr>
                                    ) : filteredReferrals.length === 0 ? (
                                        <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-[var(--text-muted)] italic">No linkage detected in this sector.</td></tr>
                                    ) : (
                                        filteredReferrals.map(member => (
                                            <tr key={member.id} className="group border-b border-[var(--border-color)]/30 last:border-0 hover:bg-white/[0.01]">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition-all ${
                                                            parseFloat(member.total_revenue) > 500 ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-indigo-500/10 text-indigo-500'
                                                        }`}>
                                                            {parseFloat(member.total_revenue) > 500 ? <Gem size={16} /> : <ShieldCheck size={16} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-[11px] text-[var(--text-dark)] uppercase tracking-tight flex items-center gap-2">
                                                                {member.full_name || 'Anonymous Node'}
                                                                {parseFloat(member.total_revenue) > 500 && <span className="text-[7px] bg-amber-500 text-white px-1.5 py-0.5 rounded italic">VIP Contribution</span>}
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
                                                        <div className={`w-1 h-1 rounded-full ${member.status.toLowerCase() === 'active' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></div>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="font-black text-[11px] text-slate-700 italic tracking-tighter">
                                                    ₹{parseFloat(member.total_revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorReferrals;
