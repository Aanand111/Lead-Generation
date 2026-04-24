import React, { useState, useEffect } from 'react';
import { 
    UserPlus, ShieldCheck, Mail, Phone, Lock, ChevronRight, 
    Activity, Zap, Sparkles, Clock, Briefcase, Users, Search, Gem
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SubVendorReferrals = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        setLoading(true);
        try {
            const res = await api.get('/sub-vendor/referrals');
            if (res.data.success) {
                setReferrals(res.data.data);
            }
        } catch (err) {
            console.error("Failed to sync sub-vendor referrals");
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (referralId, action) => {
        try {
            const res = await api.post(`/sub-vendor/approve-referral/${referralId}`, { action });
            if (res.data.success) {
                fetchReferrals();
            }
        } catch (err) {
            console.error("Approval error:", err);
        }
    };

    return (
        <div className="animate-fade-in space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 italic">
                        Node Network <Users size={10} /> User Graph
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">My Network</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic">A list of all users identified and synchronized through your referral node.</p>
                </div>
                
                <button 
                    onClick={() => navigate('/sub-vendor/refer-user')}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-3"
                >
                    <UserPlus size={16} /> Inject New Node
                </button>
            </div>

            {/* Tracking Table Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h3 className="text-sm font-black text-[var(--text-dark)] uppercase tracking-widest opacity-70">Referral Index</h3>
                    </div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] tracking-widest">{referrals.length} Nodes Synchronized</div>
                </div>

                <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] rounded-[2.5rem]">
                    <div className="table-responsive">
                        <table className="table hover-highlight mb-0">
                            <thead className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                                <tr>
                                    <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Full Identity</th>
                                    <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Status Code</th>
                                    <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Contact Node</th>
                                    <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Injection Stamp</th>
                                    <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-indigo-500/50 italic animate-pulse">Scanning network spectrum...</td></tr>
                                ) : referrals.length === 0 ? (
                                    <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-[var(--text-muted)] italic">No referral nodes detected in current spectrum.</td></tr>
                                ) : (
                                    referrals.map((member, idx) => (
                                        <tr key={idx} className="group border-b border-[var(--border-color)]/30 last:border-0 hover:bg-indigo-500/[0.01]">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">
                                                        <ShieldCheck size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-[11px] text-[var(--text-dark)] uppercase tracking-tight">
                                                            {member.full_name || member.name || member.phone || 'Network Node'}
                                                        </div>
                                                        <div className="text-[9px] font-bold text-[var(--text-muted)] italic opacity-60">
                                                            {member.email || 'NO_DIGITAL_MAIL'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
                                                    member.status?.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                    <div className={`w-1 h-1 rounded-full ${member.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></div>
                                                    {member.status || 'OFFLINE'}
                                                </span>
                                            </td>
                                            <td className="font-black text-[11px] text-[var(--text-muted)] italic tracking-tighter">
                                                {member.phone}
                                            </td>
                                            <td className="px-8 text-[9px] font-bold text-[var(--text-muted)] opacity-60">
                                                {new Date(member.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {member.status?.toLowerCase() === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleApproval(member.id, 'REJECT')}
                                                            className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button 
                                                            onClick={() => handleApproval(member.id, 'APPROVE')}
                                                            className="px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
                                                        >
                                                            Accept
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-xl flex items-center gap-2">
                                                            <ShieldCheck size={12} className="text-emerald-500" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 whitespace-nowrap">Verified</span>
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

export default SubVendorReferrals;
