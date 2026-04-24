import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, 
    Clock, Activity, Sparkles, DollarSign, Calendar,
    CreditCard, ReceiptText, RefreshCcw
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const SubVendorEarnings = () => {
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const { data } = await api.get('/sub-vendor/earnings');
                const { data: statsData } = await api.get('/sub-vendor/stats');
                if (data.success) {
                    setEarnings(data.earnings);
                }
                if (statsData.success) {
                    setBalance(statsData.stats.walletBalance);
                }
            } catch (err) {
                console.error("Failed to sync earnings telemetry");
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    const handleRequestPayout = async () => {
        if (balance <= 0) {
            toast.error("Protocol error: No liquid assets available for extraction.");
            return;
        }

        setRequesting(true);
        try {
            const { data } = await api.post('/sub-vendor/request-settlement');
            if (data.success) {
                toast.success(data.message || "Payout request successfully relayed to administration.");
                // Update local status of pending earnings to REQUESTED if possible or just refresh
                const { data: eData } = await api.get('/sub-vendor/earnings');
                if (eData.success) setEarnings(eData.earnings);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Transmission failed. Secure node offline.");
        } finally {
            setRequesting(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-10 pb-20">
            {/* Header / Balance Card */}
            <header className="flex flex-col lg:flex-row gap-10 items-start">
                <div className="lg:w-1/2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 italic">
                        Financial Stream <Wallet size={10} /> Liquidity Audit
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-4">Earnings Hub</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic leading-relaxed max-w-lg">Monitor your accumulated commissions and transaction footprint verified across the protocol.</p>
                </div>

                <div className="lg:w-1/2 w-full">
                    <div className="card p-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform">
                            <Wallet size={160} />
                        </div>
                        <div className="relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 italic">Verified Liquid Assets</span>
                            <div className="flex items-end gap-3 mt-4 mb-8">
                                <span className="text-5xl font-black tracking-tighter tabular-nums">₹{balance.toLocaleString('en-IN')}</span>
                                <span className="text-xs font-bold opacity-60 mb-2 italic">INR</span>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={handleRequestPayout}
                                    disabled={requesting || balance <= 0}
                                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {requesting ? <RefreshCcw size={14} className="animate-spin" /> : <CreditCard size={14} />}
                                    {requesting ? 'Relaying...' : 'Request Payout'}
                                </button>
                                <div className="px-4 py-2 bg-emerald-400/20 rounded-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                                    <Sparkles size={12} /> Sync Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Transaction Ledger */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <h3 className="text-sm font-black text-[var(--text-dark)] uppercase tracking-widest opacity-70">Financial Ledger</h3>
                    </div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] tracking-widest uppercase italic border-b border-indigo-500/20 pb-1">Historical Audit</div>
                </div>

                <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] rounded-[2.5rem]">
                    <div className="table-responsive">
                        <table className="table mb-0">
                            <thead className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                                <tr>
                                    <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Transaction</th>
                                    <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Amount (₹)</th>
                                    <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Type Code</th>
                                    <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-emerald-500/50 italic animate-pulse">Syncing ledger telemetry...</td></tr>
                                ) : earnings.length === 0 ? (
                                    <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-[var(--text-muted)] italic">No financial footprints detected.</td></tr>
                                ) : (
                                    earnings.map((tx, idx) => (
                                        <tr key={idx} className="group border-b border-[var(--border-color)]/30 last:border-0 hover:bg-emerald-500/[0.01]">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-xl ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {tx.amount > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                                    </div>
                                                    <div className="font-black text-[11px] text-[var(--text-dark)] uppercase tracking-[0.05em]">{tx.remarks || 'CRYPTO_HASH_SYNC'}</div>
                                                </div>
                                            </td>
                                            <td className={`font-black text-[13px] tabular-nums ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                            </td>
                                            <td>
                                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">{tx.type}</span>
                                            </td>
                                            <td>
                                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-8 text-[9px] font-bold text-[var(--text-muted)] opacity-60 tabular-nums">
                                                {new Date(tx.created_at).toLocaleString()}
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

export default SubVendorEarnings;
