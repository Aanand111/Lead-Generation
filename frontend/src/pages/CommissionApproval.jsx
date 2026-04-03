import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, DollarSign, User, Calendar, Search, RefreshCcw, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const CommissionApproval = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('PENDING');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [processingId, setProcessingId] = useState(null);

    const fetchCommissions = async (status = filterStatus) => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/commissions', {
                params: { status }
            });
            if (data.success) {
                setCommissions(data.data);
            }
        } catch (err) {
            console.error('Error fetching commissions:', err);
            setMessage({ type: 'error', text: 'System grid failure: Protocol "FETCH_COMMISSION" rejected.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [filterStatus]);

    const handleApprove = async (id) => {
        if (!window.confirm('Execute core settlement protocol for this commission node?')) return;
        
        setProcessingId(id);
        try {
            const { data } = await api.put(`/admin/commissions/${id}/approve`);
            if (data.success) {
                setMessage({ type: 'success', text: 'Settlement synchronized. Vendor wallet enriched.' });
                setCommissions(prev => prev.filter(c => c.id !== id));
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Authorization failure: Settlement node rejected.' });
        } finally {
            setProcessingId(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="page-content animate-fade-in">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="text-2xl font-black text-[var(--text-dark)] tracking-tight uppercase flex items-center gap-3">
                        <DollarSign className="text-indigo-500" /> Revenue Settlement Hub
                    </h2>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">
                        Audit and authorize peripheral revenue streams for partner nodes
                    </p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 border animate-slide-up ${
                    message.type === 'error' ? 'bg-red-50/10 text-red-500 border-red-500/20' : 'bg-emerald-50/10 text-emerald-500 border-emerald-500/20'
                }`}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => setFilterStatus('PENDING')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        filterStatus === 'PENDING' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-[var(--surface-color)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}
                >
                    In Queue ({commissions.filter(c => c.status === 'PENDING').length})
                </button>
                <button 
                    onClick={() => setFilterStatus('COMPLETED')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        filterStatus === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-[var(--surface-color)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}
                >
                    Settled
                </button>
            </div>

            <div className="card border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden rounded-3xl">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest p-5">Origin Node</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest p-5">Quantum (Amt)</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest p-5">Context</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest p-5">Timestamp</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest text-right p-5">Protocol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-24">
                                        <RefreshCcw className="animate-spin inline-block text-indigo-500 mb-4" size={32} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Syncing Settlement Matrix...</p>
                                    </td>
                                </tr>
                            ) : commissions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-24">
                                        <div className="opacity-30 flex flex-col items-center gap-4">
                                            <Clock size={48} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No peripheral nodes requiring authorization</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                commissions.map(commission => (
                                    <tr key={commission.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-indigo-500/5 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-black uppercase text-[var(--text-dark)]">{commission.vendor_name}</div>
                                                    <div className="text-[10px] font-bold text-[var(--text-muted)] italic">{commission.vendor_phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-sm font-black text-emerald-500 tracking-tight">₹{parseFloat(commission.amount).toFixed(2)}</div>
                                            <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Settlement Value</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-tight">{commission.remarks}</div>
                                            <div className="text-[9px] font-bold text-[var(--text-muted)] italic">REF_CODE: {commission.type}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-dark)]">
                                                <Calendar size={12} className="text-indigo-400" />
                                                {new Date(commission.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            {commission.status === 'PENDING' ? (
                                                <button 
                                                    disabled={processingId === commission.id}
                                                    onClick={() => handleApprove(commission.id)}
                                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-100"
                                                >
                                                    {processingId === commission.id ? <RefreshCcw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                                    Authorize
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    <CheckCircle size={10} /> Synchronized
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
