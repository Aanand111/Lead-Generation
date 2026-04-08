import React, { useState, useEffect } from 'react';
import { 
    UserPlus, ShieldCheck, Mail, Phone, Lock, ChevronRight, 
    Activity, Zap, Sparkles, Clock, Briefcase, Layers, Bell, TrendingUp, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const VendorReferMember = ({ mode = 'user' }) => {
    const [formData, setFormData] = useState({ phone: '', email: '', password: '', full_name: '' });
    const [loading, setLoading] = useState(false);
    const [referrals, setReferrals] = useState([]);
    const [tableLoading, setTableLoading] = useState(true);
    const [stats, setStats] = useState({ referral_code: '' });
    const navigate = useNavigate();

    const isVendorMode = mode === 'vendor';

    useEffect(() => {
        fetchStats();
        fetchReferrals();
    }, [mode]);

    const fetchStats = async () => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/vendor/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setStats(data.data);
        } catch (err) { console.error(err); }
    };

    const fetchReferrals = async () => {
        setTableLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/vendor/referrals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setReferrals(data.data.filter(r => r.role === mode));
            }
        } catch (err) { console.error(err); }
        finally { setTableLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');
            const endpoint = isVendorMode ? '/vendor/refer-vendor' : '/vendor/refer-user';
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`${mode.toUpperCase()} Node Authorized Successfully!`);
                setFormData({ phone: '', email: '', password: '', full_name: '' });
                fetchReferrals();
            } else {
                toast.error(data.message || 'Authorization failed');
            }
        } catch (err) {
            toast.error('Sync Error');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const suffix = isVendorMode ? '-V' : '-U';
        const link = `${window.location.origin}/register?ref=${stats.referral_code || 'CODE'}${suffix}`;
        navigator.clipboard.writeText(link);
        toast.success('Referral Link Copied!');
    };

    return (
        <div className="animate-fade-in space-y-12 pb-20">
            {/* Header Module - Matching Doc */}
            <header className="text-center space-y-4 max-w-2xl mx-auto pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
                    <Sparkles size={12} /> Network Expansion
                </div>
                <h2 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tight">Refer New {mode} Node</h2>
                <p className="text-xs font-bold text-[var(--text-muted)] italic leading-relaxed">
                    Introduce a new {mode} partner following the decentralized growth protocols defined in the network manual.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                
                {/* Left: Registration Form - Exact Doc Mapping */}
                <section className="space-y-6">
                    <div className="card shadow-2xl p-8 border border-[var(--border-color)] bg-[var(--surface-elevated)] rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-focus-within:text-indigo-500/10 transition-colors pointer-events-none">
                            <Zap size={150} />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Identity Designation *</label>
                               <div className="relative group/field">
                                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50 group-focus-within/field:text-indigo-500 transition-colors" size={18} />
                                  <input type="text" className="form-control !pl-12 !py-4 font-black tracking-tight text-sm uppercase bg-[var(--bg-color)]/30 border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all outline-none rounded-2xl w-full" placeholder="FULL NAME PROTOCOL" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Account Interface Email *</label>
                               <div className="relative group/field">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50 group-focus-within/field:text-indigo-500 transition-colors" size={18} />
                                  <input type="email" className="form-control !pl-12 !py-4 font-black tracking-tight text-sm bg-[var(--bg-color)]/30 border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all outline-none rounded-2xl w-full" placeholder="PROTOCOL_SIGNAL@ENTITY.SYS" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Contact Sequence (Phone) *</label>
                               <div className="relative group/field">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50 group-focus-within/field:text-indigo-500 transition-colors" size={18} />
                                  <input 
                                    type="text" 
                                    className="form-control !pl-12 !py-4 font-black tracking-tight text-sm bg-[var(--bg-color)]/30 border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all outline-none rounded-2xl w-full" 
                                    placeholder="10 DIGIT PHONE" 
                                    value={formData.phone} 
                                    maxLength={10}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setFormData({ ...formData, phone: val });
                                    }} 
                                    required 
                                  />
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Security Key (Password) *</label>
                               <div className="relative group/field">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50 group-focus-within/field:text-indigo-500 transition-colors" size={18} />
                                  <input type="password" className="form-control !pl-12 !py-4 font-black tracking-tight text-sm bg-[var(--bg-color)]/30 border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] transition-all outline-none rounded-2xl w-full" placeholder="........" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                               </div>
                            </div>

                            <button type="submit" className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-600/20 rounded-2xl group active:scale-95 transition-all" disabled={loading}>
                                {loading ? <Activity size={18} className="animate-spin" /> : <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                {loading ? 'Syncing Node Data...' : `Authorize ${mode} Member`}
                            </button>
                        </form>
                    </div>

                    {/* Viral Expansion Module (Professional Code Sharing) */}
                    <div className="card bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/10">
                         <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none group-hover:scale-150 transition-transform duration-1000 rotate-12">
                             <Sparkles size={180} />
                         </div>
                         <div className="relative z-10 space-y-6">
                             <div className="flex items-center gap-3 text-indigo-100/60 font-black uppercase tracking-[0.2em] text-[10px]">
                                 <Zap size={14} className="animate-pulse text-yellow-400" /> Authorized Growth Protocol
                             </div>
                             
                             <div className="space-y-1">
                                <h4 className="text-2xl font-black text-white uppercase tracking-tight">Access Token</h4>
                                <p className="text-[10px] font-bold text-indigo-100/50 uppercase tracking-widest italic leading-relaxed">
                                    Distribute this unique {mode} identifier for manual input or zero-touch onboarding.
                                </p>
                             </div>

                             {/* Professional Code Box (Voucher Aesthetic) */}
                             <div className="relative mt-8">
                                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
                                <div className="relative flex bg-black/40 backdrop-blur-3xl border border-white/20 rounded-2xl p-6 items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[9px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1 opacity-70">Unique {mode} Code</div>
                                        <div className="text-3xl font-black text-white tracking-[0.1em] tabular-nums select-all">
                                            {stats.referral_code ? `${stats.referral_code}${isVendorMode ? '-V' : '-U'}` : 'GEN-CODE'}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const code = `${stats.referral_code}${isVendorMode ? '-V' : '-U'}`;
                                            navigator.clipboard.writeText(code);
                                            toast.success(`Professional code ${code} copied to clipboard!`);
                                        }} 
                                        className="h-14 w-14 bg-white text-indigo-700 rounded-xl shadow-[0_10px_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
                                        title="Copy Professional Code"
                                    >
                                        <Layers size={22} />
                                    </button>
                                </div>
                             </div>

                             <div className="flex items-center gap-2 pt-4">
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Direct Link Alternative</span>
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                             </div>

                             <button 
                                onClick={handleCopyLink}
                                className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-indigo-200 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-center flex items-center justify-center gap-3"
                             >
                                <Bell size={12} /> Copy Onboarding URL
                             </button>
                         </div>
                    </div>
                </section>

                {/* Right: History Tracking - Matching Doc "My Users" */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div>
                             <h3 className="text-xl font-black text-[var(--text-dark)] tracking-tight uppercase">My Referred {mode}s</h3>
                             <p className="text-[10px] font-bold text-[var(--text-muted)] italic">Tracking live linkages in your cluster</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 font-black text-xs">
                             {referrals.length}
                        </div>
                    </div>

                    <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-elevated)] rounded-[2.5rem]">
                        <div className="table-responsive">
                            <table className="table hover-highlight mb-0">
                                <thead className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-widest">Node Identity</th>
                                        <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-widest">Status</th>
                                        <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-widest">Join Seq</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableLoading ? (
                                        <tr><td colSpan="3" className="py-24 text-center text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.2em] animate-pulse">Scanning network nodes...</td></tr>
                                    ) : referrals.length === 0 ? (
                                        <tr><td colSpan="3" className="py-24 text-center text-xs font-bold text-[var(--text-muted)] italic px-12 leading-relaxed">No direct {mode} linkages detected. Start expansion using the tools on the left.</td></tr>
                                    ) : (
                                        referrals.map(member => (
                                            <tr key={member.id} className="group border-b border-[var(--border-color)]/30 last:border-0 hover:bg-white/[0.01]">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6">
                                                            {isVendorMode ? <Briefcase size={16} /> : <Users size={16} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-[11px] text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">{member.full_name || 'Anonymous Node'}</div>
                                                            <div className="flex items-center gap-2">
                                                               <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                                               <span className="text-[9px] font-black text-[var(--text-muted)] tracking-tight">{member.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                        member.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>
                                                        <div className={`w-1 h-1 rounded-full ${member.status.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="text-[10px] font-black text-[var(--text-dark)]/40 tracking-tighter tabular-nums px-4">
                                                    {new Date(member.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-600/10 flex items-center justify-between gap-6 group hover:border-indigo-600/30 transition-all">
                         <div className="space-y-1">
                             <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest">
                                 <TrendingUp size={14} /> Expansion Analytics
                             </div>
                             <p className="text-[10px] font-bold text-[var(--text-muted)] italic">Track your commission bandwidth and network density.</p>
                         </div>
                         <div className="flex items-center gap-2 font-black text-2xl text-[var(--text-dark)] tracking-tighter">
                             {referrals.length}<span className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest ml-1">Nodes</span>
                         </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default VendorReferMember;
