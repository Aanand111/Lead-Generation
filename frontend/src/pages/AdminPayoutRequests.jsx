import React, { useState, useEffect } from 'react';
import { 
    Wallet, Search, RefreshCcw, CheckCircle, XCircle, 
    Clock, DollarSign, Filter, MoreHorizontal, ExternalLink,
    ChevronLeft, ChevronRight, MessageSquare, CreditCard,
    ArrowUpRight, AlertCircle, FileText, Send
} from 'lucide-react';
import api from '../utils/api';

const AdminPayoutRequests = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState({ status: '', remarks: '', payment_ref: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPayouts();
    }, [filterStatus]);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/payouts?status=${filterStatus}`);
            if (data.success) {
                setPayouts(data.data);
            }
        } catch (err) {
            console.error("Payout sync failed", err);
            setMessage({ type: 'error', text: 'Protocol Synchonization Error: 0x882' });
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (payout, status) => {
        setSelectedPayout(payout);
        setModalAction({ 
            status, 
            remarks: status === 'COMPLETED' ? 'Payout processed successfully via designated channel.' : 'Payout request declined due to policy reconciliation.',
            payment_ref: '' 
        });
        setIsModalOpen(true);
    };

    const handleProcessPayout = async () => {
        if (!modalAction.remarks) return alert('Remarks are required for audit trail.');
        setActionLoading(true);
        try {
            const { data } = await api.put(`/admin/payouts/${selectedPayout.id}`, {
                status: modalAction.status,
                remarks: modalAction.remarks,
                payment_reference: modalAction.payment_ref
            });
            if (data.success) {
                setMessage({ type: 'success', text: `Node ${selectedPayout.id.slice(0,8)} restructured to ${modalAction.status}.` });
                setIsModalOpen(false);
                fetchPayouts();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Modification rejected by core matrix.' });
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'FAILED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const filteredPayouts = payouts.filter(p => 
        p.vendor_name?.toLowerCase().includes(search.toLowerCase()) || 
        p.vendor_phone?.includes(search)
    );

    return (
        <div className="animate-fade-in space-y-8 pb-32">
            {/* Ultra Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 italic">
                        Financial Layer <ChevronRight size={10} className="not-italic" /> Settlement Matrix
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Payout Logistics</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic">Manage and authorize decentralized vendor commission withdrawals.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-[var(--surface-color)] p-4 rounded-3xl border border-[var(--border-color)] flex items-center gap-4 shadow-sm group hover:scale-105 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Clock size={20} className="group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Queue Size</p>
                            <h4 className="text-xl font-black text-[var(--text-dark)] tracking-tighter">{payouts.filter(p => p.status === 'PENDING').length} <span className="text-[9px]">PENDING</span></h4>
                        </div>
                    </div>
                </div>
            </header>

            {message.text && (
                <div className={`p-5 rounded-2.5xl flex items-center gap-4 border animate-slide-up shadow-xl ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5'
                }`}>
                    <div className="w-10 h-10 rounded-xl bg-current flex items-center justify-center bg-opacity-10">
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.1em]">{message.text}</span>
                </div>
            )}

            {/* Matrix Control Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {['', 'PENDING', 'COMPLETED', 'FAILED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                filterStatus === status 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' 
                                : 'bg-[var(--surface-color)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-indigo-500/50'
                            }`}
                        >
                            {status || 'ALL_NODES'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input 
                            type="text" 
                            placeholder="SEARCH VENDOR SIGNATURE..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-6 text-[11px] font-black uppercase outline-none focus:border-indigo-500 transition-all placeholder:text-[var(--text-muted)]/30 shadow-inner"
                        />
                    </div>
                    <button 
                        onClick={fetchPayouts}
                        className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl text-[var(--text-muted)] hover:text-indigo-500 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Data Mesh */}
            <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] rounded-[2.5rem]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                                <th className="px-10 py-8 text-left text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Transaction Trace</th>
                                <th className="py-8 text-left text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Vendor Identity</th>
                                <th className="py-8 text-left text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Quantum Amount</th>
                                <th className="py-8 text-left text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Node State</th>
                                <th className="py-8 text-right text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em] px-10">Protocols</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]/30">
                            {loading ? (
                                <tr><td colSpan="5" className="py-40 text-center text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] animate-pulse">Scanning Financial Sub-Matrix...</td></tr>
                            ) : filteredPayouts.length === 0 ? (
                                <tr><td colSpan="5" className="py-40 text-center text-xs font-bold text-[var(--text-muted)] italic leading-relaxed">No payout transmissions detected in this grid sector.</td></tr>
                            ) : (
                                filteredPayouts.map(payout => (
                                    <tr key={payout.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors">
                                                    <CreditCard size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-tighter mb-0.5 font-mono">#{payout.id.slice(0, 12)}</div>
                                                    <div className="text-[9px] font-bold text-[var(--text-muted)] flex items-center gap-2">
                                                        <Clock size={10} /> {new Date(payout.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                <div className="text-xs font-black text-[var(--text-dark)] uppercase tracking-tight">{payout.vendor_name || 'IDENT_UNKNOWN'}</div>
                                                <div className="text-[10px] font-bold text-[var(--text-muted)] italic flex items-center gap-2">
                                                    <Send size={10} className="rotate-45" /> {payout.vendor_phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-baseline gap-1 text-2xl font-black text-[var(--text-dark)] tracking-tighter">
                                                <span className="text-xs text-indigo-500 font-bold">₹</span>
                                                {parseFloat(payout.amount).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${getStatusStyle(payout.status)}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full bg-current ${payout.status === 'PENDING' ? 'animate-pulse' : ''}`}></div>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-10 text-right">
                                            {payout.status === 'PENDING' ? (
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleActionClick(payout, 'COMPLETED')}
                                                        className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                                                        title="Authorize Settlement"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleActionClick(payout, 'FAILED')}
                                                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                                        title="Decline Extraction"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => { setSelectedPayout(payout); setIsModalOpen(true); setModalAction({ status: 'VIEW', remarks: payout.remarks, payment_ref: payout.payment_reference }); }}
                                                    className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
                                                >
                                                    View Trace <ExternalLink size={12} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Authorization Terminal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-xl bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${
                                        modalAction.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                        modalAction.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                        'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                    }`}>
                                        <Wallet size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">
                                            {modalAction.status === 'VIEW' ? 'Transaction Audit' : 'Authorize Settlement'}
                                        </h3>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">
                                            Ref: #{selectedPayout?.id.slice(0, 12)}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-all active:scale-90">
                                    <XCircle size={22} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="p-6 bg-[var(--bg-color)] rounded-3xl border border-[var(--border-color)] flex items-center justify-between shadow-inner">
                                    <div>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">Withdrawal Quantum</p>
                                        <h4 className="text-3xl font-black text-[var(--text-dark)] tracking-tighter">₹{parseFloat(selectedPayout?.amount).toLocaleString()}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">Vendor</p>
                                        <h4 className="text-sm font-black text-indigo-500 uppercase tracking-tight">{selectedPayout?.vendor_name}</h4>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                                        <MessageSquare size={12} /> Audit Trail Remarks
                                    </label>
                                    <textarea 
                                        className="w-full px-6 py-4 rounded-3xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[12px] font-bold text-[var(--text-dark)] focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/30 min-h-[120px] resize-none shadow-sm"
                                        placeholder="Enter transaction remarks for the vendor..."
                                        value={modalAction.remarks}
                                        onChange={(e) => setModalAction({...modalAction, remarks: e.target.value})}
                                        disabled={modalAction.status === 'VIEW'}
                                    />
                                </div>

                                {modalAction.status !== 'FAILED' && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                                            <FileText size={12} /> External Payment Reference
                                        </label>
                                        <input 
                                            className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[12px] font-bold text-[var(--text-dark)] focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/30 uppercase tracking-widest shadow-sm"
                                            placeholder="UTR / Transaction ID / Invoice Ref..."
                                            value={modalAction.payment_ref}
                                            onChange={(e) => setModalAction({...modalAction, payment_ref: e.target.value})}
                                            disabled={modalAction.status === 'VIEW'}
                                        />
                                    </div>
                                )}

                                {modalAction.status !== 'VIEW' && (
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-all border border-[var(--border-color)] bg-[var(--surface-color)] active:scale-95 shadow-sm"
                                        >
                                            Abort
                                        </button>
                                        <button 
                                            onClick={handleProcessPayout}
                                            disabled={actionLoading}
                                            className={`flex-1 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 ${
                                                modalAction.status === 'COMPLETED' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-red-600 shadow-red-500/20'
                                            }`}
                                        >
                                            {actionLoading ? <RefreshCcw size={16} className="animate-spin" /> : <><DollarSign size={16} /> Finalize Request</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayoutRequests;
