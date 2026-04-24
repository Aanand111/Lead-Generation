import React, { useState, useEffect } from 'react';
import { Search, Calendar, CreditCard, Clock, CheckCircle, XCircle, RefreshCcw, IndianRupee, Activity, FileText, Filter } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, count: 0 });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/transactions');
            if (data.success) {
                setTransactions(data.data || []);
                
                const s = (data.data || []).reduce((acc, t) => {
                    const amt = Number(t.amount) || 0;
                    acc.total += amt;
                    if (t.status === 'COMPLETED' || t.status === 'SUCCESS') acc.completed += amt;
                    if (t.status === 'PENDING') acc.pending += amt;
                    return acc;
                }, { total: 0, completed: 0, pending: 0, count: (data.data || []).length });
                setStats(s);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filtered = transactions.filter(t => {
        const name = (t.display_name || '').toLowerCase();
        const tid = (t.transaction_id || '').toLowerCase();
        const matchesSearch = name.includes(search.toLowerCase()) || tid.includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            COMPLETED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            SUCCESS: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            FAILED: 'bg-red-500/10 text-red-500 border-red-500/20'
        };
        const icons = {
            COMPLETED: <CheckCircle size={10} />,
            SUCCESS: <CheckCircle size={10} />,
            PENDING: <Clock size={10} />,
            FAILED: <XCircle size={10} />
        };
        
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                {icons[status] || <Activity size={10} />}
                {status === 'SUCCESS' ? 'COMPLETED' : (status || 'Unknown')}
            </span>
        );
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Transaction History</h2>
                    <p>Track subscription payments and financial records</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={fetchTransactions} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 p-3 rounded-xl transition-all shadow-sm">
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
                 {[
                    { label: 'Total Transactions', value: stats.count, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Total Revenue', value: `₹${stats.completed.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Pending Payments', value: `₹${stats.pending.toLocaleString('en-IN')}`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Success Rate', value: `${stats.count > 0 ? Math.round((transactions.filter(t => t.status === 'COMPLETED' || t.status === 'SUCCESS').length / stats.count) * 100) : 0}%`, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="card !p-6 flex items-center gap-5 group hover:border-indigo-500 transition-all cursor-default bg-[var(--surface-color)] border-[var(--border-color)]">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-all shadow-inner border border-[var(--border-color)]/50`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-xl font-black text-[var(--text-dark)]">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Data Table */}
            <div className="card shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)]">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-4">
                        <div className="relative w-full md:w-80 group">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium shadow-sm focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/50 text-[var(--text-dark)]" 
                                placeholder="Search by name or ID..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter size={14} className="text-[var(--text-muted)]" />
                        <CustomSelect
                            variant="compact"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: 'All', label: 'ALL TRANSACTIONS' },
                                { value: 'COMPLETED', label: 'COMPLETED' },
                                { value: 'PENDING', label: 'PENDING' },
                                { value: 'FAILED', label: 'FAILED' }
                            ]}
                            className="min-w-[160px]"
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="w-16 text-center text-[10px] uppercase font-bold text-[var(--text-muted)]">Order #</th>
                                <th className="text-[var(--text-muted)]">Customer Name</th>
                                <th className="text-[var(--text-muted)]">Plan</th>
                                <th className="text-[var(--text-muted)]">Transaction ID</th>
                                <th className="text-[var(--text-muted)]">Amount</th>
                                <th className="text-[var(--text-muted)]">Date</th>
                                <th className="text-[var(--text-muted)]">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-32">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="spinner"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] animate-pulse">Loading transaction history...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-32">
                                        <div className="flex flex-col items-center gap-4 opacity-30 italic">
                                            <CreditCard size={64} strokeWidth={1} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((t, index) => (
                                <tr key={t.id} className="transition-all hover:bg-[var(--primary)]/[0.02] border-b border-[var(--border-color)] last:border-0 text-xs">
                                    <td className="text-center font-black text-[var(--text-muted)]/30 tabular-nums">
                                        {index + 1}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3 text-[var(--text-dark)]">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-black text-[10px] shadow-sm uppercase">
                                                {(t.display_name || 'U')[0]}
                                            </div>
                                            <div>
                                                <div className="font-black tracking-tight text-[11px] uppercase">{t.display_name}</div>
                                                <div className="text-[10px] text-[var(--text-muted)] font-bold italic tabular-nums tracking-wider">{t.customer_phone || t.user_phone || 'External Account'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-black text-indigo-500 uppercase tracking-tighter truncate max-w-[120px]">{t.plan_name || t.package_name || 'Legacy Plan'}</div>
                                    </td>
                                    <td>
                                        <code className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 shadow-sm transition-all hover:bg-indigo-500/10">
                                            {t.transaction_id || `TRX-${t.id.toString().substring(0,8)}`}
                                        </code>
                                    </td>
                                    <td>
                                        <div className="font-black text-xs text-[var(--text-dark)] tabular-nums">
                                            ₹{Number(t.amount).toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-[10px] font-black text-[var(--text-muted)] flex items-center gap-2 tabular-nums">
                                            <Calendar size={12} className="text-indigo-400" />
                                            {formatDate(t.created_at)}
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={t.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
