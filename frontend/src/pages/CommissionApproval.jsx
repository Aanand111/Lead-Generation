import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, IndianRupee, User, Calendar, Search, RefreshCcw, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';

const CommissionApproval = () => {
    const { confirm } = useConfirm();
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('REQUESTED');
    const [counts, setCounts] = useState({ PENDING: 0, REQUESTED: 0, COMPLETED: 0, FAILED: 0 });
    const [processingId, setProcessingId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('vendor'); // 'vendor' or 'sub-vendor'

    const fetchCommissions = async (status = filterStatus) => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/commissions', {
                params: { status }
            });
            if (data.success) {
                setCommissions(data.data);
                // Also fetch all counts for the tabs
                const allRes = await api.get('/admin/commissions'); // fetch all to count
                if (allRes.data.success) {
                    const allData = allRes.data.data;
                    setCounts({
                        PENDING: allData.filter(c => c.status === 'PENDING').length,
                        REQUESTED: allData.filter(c => c.status === 'REQUESTED').length,
                        COMPLETED: allData.filter(c => c.status === 'COMPLETED').length,
                        FAILED: allData.filter(c => c.status === 'FAILED').length
                    });
                }
            }
        } catch (err) {
            toast.error('Failed to fetch commissions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [filterStatus]);

    const handleApprove = async (id) => {
        const confirmed = await confirm(
            'Are you sure you want to approve this payout? The amount will be added to the vendor\'s balance immediately.',
            'Approve Payout'
        );
        if (!confirmed) return;
        
        setProcessingId(id);
        try {
            const { data } = await api.put(`/admin/commissions/${id}/approve`);
            if (data.success) {
                toast.success('Payout approved. Vendor balance updated.');
                setCommissions(prev => prev.filter(c => c.id !== id));
            }
        } catch (err) {
            toast.error('Failed to approve payout.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        const confirmed = await confirm(
            'Are you sure you want to reject this request? This will mark it as Rejected and it will not be paid.',
            'Reject Request'
        );
        if (!confirmed) return;
        
        setProcessingId(id);
        try {
            const { data } = await api.put(`/admin/commissions/${id}/reject`);
            if (data.success) {
                toast.success('Request rejected.');
                setCommissions(prev => prev.filter(c => c.id !== id));
            }
        } catch (err) {
            toast.error('Failed to reject request.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="page-content animate-fade-in">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="text-2xl font-black text-[var(--text-dark)] tracking-tight uppercase flex items-center gap-3">
                        <IndianRupee className="text-indigo-500" /> Commission Payouts
                    </h2>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">
                        Review and approve commission payout requests from vendors.
                    </p>
                </div>
            </div>


            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex gap-3 bg-[var(--bg-color)] p-1.5 rounded-2xl border border-[var(--border-color)]">
                    <button 
                        onClick={() => setSelectedRole('vendor')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedRole === 'vendor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-indigo-500'
                        }`}
                    >
                        Primary Vendors
                    </button>
                    <button 
                        onClick={() => setSelectedRole('sub-vendor')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedRole === 'sub-vendor' ? 'bg-amber-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-amber-600'
                        }`}
                    >
                        Sub-Vendors
                    </button>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setFilterStatus('REQUESTED')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filterStatus === 'REQUESTED' ? 'bg-[var(--surface-color)] text-indigo-500 border border-indigo-500 shadow-md shadow-indigo-500/10' : 'bg-[var(--surface-color)] text-[var(--text-muted)] border border-[var(--border-color)]'
                        }`}
                    >
                        Payout Requested ({counts.REQUESTED})
                    </button>
                    <button 
                        onClick={() => setFilterStatus('PENDING')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filterStatus === 'PENDING' ? 'bg-[var(--surface-color)] text-amber-600 border border-amber-600 shadow-md shadow-amber-600/10' : 'bg-[var(--surface-color)] text-[var(--text-muted)] border border-[var(--border-color)]'
                        }`}
                    >
                        In Queue ({counts.PENDING})
                    </button>
                    <button 
                        onClick={() => setFilterStatus('COMPLETED')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filterStatus === 'COMPLETED' ? 'bg-[var(--surface-color)] text-emerald-600 border border-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-[var(--surface-color)] text-[var(--text-muted)] border border-[var(--border-color)]'
                        }`}
                    >
                        Settled ({counts.COMPLETED})
                    </button>
                    <button 
                        onClick={() => setFilterStatus('FAILED')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filterStatus === 'FAILED' ? 'bg-[var(--surface-color)] text-rose-600 border border-rose-500 shadow-md shadow-rose-500/10' : 'bg-[var(--surface-color)] text-[var(--text-muted)] border border-[var(--border-color)]'
                        }`}
                    >
                        Rejected ({counts.FAILED})
                    </button>
                </div>
            </div>

            <div className="card border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden rounded-3xl">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest p-5">Vendor</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest p-5">Amount</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest p-5">Context</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest p-5">Timestamp</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest text-right p-5">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-24">
                                        <RefreshCcw className="animate-spin inline-block text-indigo-500 mb-4" size={32} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Loading Payout Requests...</p>
                                    </td>
                                </tr>
                            ) : commissions.filter(c => {
                                const isSub = !!c.referred_by;
                                return selectedRole === 'sub-vendor' ? isSub : !isSub;
                            }).length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-24">
                                        <div className="opacity-30 flex flex-col items-center gap-4">
                                            <Clock size={48} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No {selectedRole} payout requests found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                commissions.filter(c => {
                                    const isSub = !!c.referred_by;
                                    return selectedRole === 'sub-vendor' ? isSub : !isSub;
                                }).map(commission => (
                                    <tr key={commission.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-indigo-500/5 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-2xl ${!!commission.referred_by ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'} flex items-center justify-center`}>
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[11px] font-black uppercase text-[var(--text-dark)]">{commission.vendor_name}</div>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${!!commission.referred_by ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                                            {!!commission.referred_by ? 'SUB' : 'MAIN'}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-[var(--text-muted)] italic">{commission.vendor_phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-sm font-black text-emerald-500 tracking-tight">₹{parseFloat(commission.amount).toFixed(2)}</div>
                                            <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Amount</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-tight">{commission.remarks}</div>
                                            <div className="text-[9px] font-bold text-[var(--text-muted)] italic">TYPE: {commission.type}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-dark)]">
                                                <Calendar size={12} className="text-indigo-400" />
                                                {new Date(commission.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            {['PENDING', 'REQUESTED'].includes(commission.status) ? (
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        disabled={processingId === commission.id}
                                                        onClick={() => handleReject(commission.id)}
                                                        className="inline-flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                                    >
                                                        {processingId === commission.id ? <RefreshCcw size={12} className="animate-spin" /> : <XCircle size={12} />}
                                                        Reject
                                                    </button>
                                                    <button 
                                                        disabled={processingId === commission.id}
                                                        onClick={() => handleApprove(commission.id)}
                                                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-100"
                                                    >
                                                        {processingId === commission.id ? <RefreshCcw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                                        {filterStatus === 'REQUESTED' ? 'Approve Request' : 'Approve Payout'}
                                                    </button>
                                                </div>
                                            ) : commission.status === 'COMPLETED' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    <CheckCircle size={10} /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                                                    <XCircle size={10} /> Rejected
                                                </span>
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
    );
};

export default CommissionApproval;
