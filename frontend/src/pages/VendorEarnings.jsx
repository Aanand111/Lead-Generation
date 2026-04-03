import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, Clock, CheckCircle, AlertCircle, 
    ArrowUpRight, Download, Filter, Search, Activity, Zap
} from 'lucide-react';

const VendorEarnings = () => {
    const [stats, setStats] = useState({ 
        total_earnings: 0, 
        pending_earnings: 0 
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const token = localStorage.getItem('token');
                
                // Fetch Stats
                const statsRes = await fetch(`${API_BASE_URL}/vendor/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statsData = await statsRes.json();
                if (statsData.success) setStats(statsData.data);

                // Fetch Transactions
                const transRes = await fetch(`${API_BASE_URL}/vendor/earnings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const transData = await transRes.json();
                if (transData.success) setTransactions(transData.data);
                
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTransactions = transactions.filter(t => {
        if (activeTab === 'all') return true;
        return t.status.toLowerCase() === activeTab.toLowerCase();
    });

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            {/* Premium Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Commission Ledger</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic">Monitor your financial performance and payout benchmarks.</p>
                </div>
                <button className="btn btn-primary px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-3">
                    <ArrowUpRight size={16} /> Request Settlement
                </button>
            </header>

            {/* Financial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Total Revenue', value: stats.total_earnings, icon: TrendingUp, color: 'indigo', subtitle: 'Lifetime Earnings' },
                    { title: 'Processing Node', value: stats.pending_earnings, icon: Clock, color: 'amber', subtitle: 'Awaiting Settlement' },
                    { title: 'Settled Credit', value: Number(stats.total_earnings) - Number(stats.pending_earnings), icon: CheckCircle, color: 'emerald', subtitle: 'Successfully Paid' }
                ].map((card, i) => (
                    <div key={i} className="card p-8 border border-[var(--border-color)] bg-[var(--surface-elevated)] rounded-[2.5rem] relative overflow-hidden group shadow-lg">
                        <div className={`absolute top-0 right-0 p-8 text-${card.color}-500/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none`}>
                            <card.icon size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-${card.color}-500/10 text-${card.color}-500 flex items-center justify-center`}>
                                <card.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{card.title}</p>
                                <h3 className="text-3xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums">
                                    ₹{Number(card.value || 0).toLocaleString()}
                                </h3>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] italic mt-2 opacity-60">{card.subtitle}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity Matrix */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-black text-[var(--text-dark)] uppercase tracking-tight">Financial Stream</h2>
                        <div className="flex bg-[var(--bg-color)]/50 p-1 rounded-xl border border-[var(--border-color)]">
                            {['all', 'completed', 'pending', 'failed'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-indigo-500'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={12} />
                            <input type="text" placeholder="Search Matrix..." className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold outline-none focus:border-indigo-500 transition-all w-64" />
                        </div>
                        <button className="p-2.5 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl text-[var(--text-muted)] hover:text-indigo-500 transition-all">
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                <div className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-elevated)] rounded-[2.5rem]">
                    <div className="table-responsive">
                        <table className="table hover-highlight mb-0">
                            <thead className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                                <tr>
                                    <th className="px-8 py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-widest leading-none">Reference Node</th>
                                    <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-widest leading-none">Operational Value</th>
                                    <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-widest leading-none">Sync Date</th>
                                    <th className="py-5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-widest leading-none text-right px-8">Audit State</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="py-24 text-center text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.2em] animate-pulse">Decrypting financial stream...</td></tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr><td colSpan="4" className="py-24 text-center text-xs font-bold text-[var(--text-muted)] italic px-12 leading-relaxed">No financial linkages detected in this sector. Commission bandwidth is currently idle.</td></tr>
                                ) : (
                                    filteredTransactions.map(item => (
                                        <tr key={item.id} className="group border-b border-[var(--border-color)]/30 last:border-0 hover:bg-white/[0.01]">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center transition-all group-hover:rotate-6">
                                                        <Activity size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-[11px] text-[var(--text-dark)] uppercase tracking-tight mb-1">{item.description || 'System Commission'}</div>
                                                        <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">ID: {item.id.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                        <Zap size={12} />
                                                    </div>
                                                    <span className="font-black text-sm text-[var(--text-dark)] tracking-tighter tabular-nums">
                                                        +₹{Number(item.amount).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-[10px] font-black text-[var(--text-muted)] tracking-tighter opacity-70">
                                                {new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="text-right px-8">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
                                                    item.status.toLowerCase() === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                    item.status.toLowerCase() === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                    <div className={`w-1 h-1 rounded-full ${item.status.toLowerCase() === 'completed' ? 'bg-emerald-500' : item.status.toLowerCase() === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                    {item.status}
                                                </span>
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

export default VendorEarnings;
