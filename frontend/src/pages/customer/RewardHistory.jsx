import React, { useState, useEffect } from 'react';
import { 
    Gift, ArrowUpRight, TrendingUp, Sparkles, History as HistoryIcon,
    Users, Wallet, Calendar, Filter, ArrowUpDown, Download, 
    CheckCircle, Clock, AlertCircle, Search, RefreshCw, Star, Info
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const RewardHistory = () => {
    const [rewardData, setRewardData] = useState({
        totalRewards: 0,
        referralHistory: [],
        transactionHistory: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'referrals'
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest'

    const fetchRewardHistory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/user/reward-history');
            if (data.success) {
                setRewardData({
                    totalRewards: data.data.totalRewards || 0,
                    referralHistory: data.data.referralHistory || [],
                    transactionHistory: data.data.transactionHistory || []
                });
            }
        } catch (err) {
            console.error("Failed to fetch reward history data", err);
            toast.error("Failed to load rewards ledger.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewardHistory();
    }, []);

    // Filter and sort transactions
    const getFilteredTransactions = () => {
        let list = [...rewardData.transactionHistory];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter(t => 
                (t.remarks && t.remarks.toLowerCase().includes(query)) ||
                (t.type && t.type.toLowerCase().includes(query))
            );
        }

        if (statusFilter !== 'ALL') {
            list = list.filter(t => t.status === statusFilter);
        }

        if (sortBy === 'newest') {
            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortBy === 'oldest') {
            list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortBy === 'highest') {
            list.sort((a, b) => (b.credits || 0) - (a.credits || 0));
        }

        return list;
    };

    // Filter and sort referrals
    const getFilteredReferrals = () => {
        let list = [...rewardData.referralHistory];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter(r => 
                (r.name && r.name.toLowerCase().includes(query)) ||
                (r.phone && r.phone.includes(query))
            );
        }

        if (statusFilter !== 'ALL') {
            list = list.filter(r => r.status === statusFilter);
        }

        if (sortBy === 'newest') {
            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortBy === 'oldest') {
            list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortBy === 'highest') {
            list.sort((a, b) => parseFloat(b.reward || 0) - parseFloat(a.reward || 0));
        }

        return list;
    };

    const handleExport = () => {
        const listToExport = activeTab === 'transactions' ? getFilteredTransactions() : getFilteredReferrals();
        if (listToExport.length === 0) {
            toast.error("No entries to export.");
            return;
        }

        // Simulating highly styled CSV generation
        const headers = activeTab === 'transactions' 
            ? ['Transaction ID', 'Type', 'Credits Awarded', 'Status', 'Remarks', 'Timestamp']
            : ['Referred Name', 'Phone', 'Status', 'Commission Earned', 'Created At'];
        
        const rows = listToExport.map(item => {
            if (activeTab === 'transactions') {
                return [item.id, item.type, item.credits, item.status, item.remarks, item.created_at];
            } else {
                return [item.name, item.phone, item.status, item.reward, item.created_at];
            }
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `LGN_Reward_Ledger_${activeTab}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Ledger exported successfully!");
    };

    const totalActiveReferrals = rewardData.referralHistory.filter(r => r.status === 'ACTIVE').length;
    const avgRewardPerReferral = rewardData.referralHistory.length > 0 
        ? (rewardData.totalRewards / rewardData.referralHistory.length).toFixed(1) 
        : 0;

    return (
        <div className="page-content animate-fade-in space-y-10 pb-20">
            {/* --- Premium Futuristic Header --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-amber-500/20">
                            Ledger Console
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">
                            <Sparkles size={12} className="animate-pulse text-indigo-500" /> Decentralized Earnings
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-[0.9]">
                        Reward <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-royal-blue">Ledger History</span>
                    </h1>
                    <p className="mt-4 text-xs md:text-sm text-[var(--text-muted)] font-semibold max-w-lg leading-relaxed italic opacity-80">
                        Audit, analyze and verify all incentives generated from expanding the nodes in the system.
                    </p>
                </div>

                {/* Refresh and Actions */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchRewardHistory}
                        className="p-3 bg-[var(--surface-color)] hover:bg-slate-100 border border-[var(--border-color)] rounded-2xl text-[var(--text-muted)] hover:text-black transition-all"
                        title="Reload Ledger"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleExport}
                        className="px-6 py-3.5 bg-black text-white hover:bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all flex items-center gap-2 shadow-xl shadow-black/10"
                    >
                        <Download size={14} /> Export Console
                    </button>
                </div>
            </div>

            {/* --- Interactive Statistics Panels --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Panel 1: Accumulated Yield */}
                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                        <Wallet size={100} strokeWidth={1} />
                    </div>
                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 italic">Accumulated Yield</div>
                    <div className="text-3xl font-black text-[var(--text-dark)] tracking-tighter uppercase italic flex items-baseline gap-2">
                        {rewardData.totalRewards} 
                        <span className="text-xs font-black text-[var(--text-muted)] not-italic uppercase opacity-60">Credits</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                        <TrendingUp size={12} /> Direct wallet injects
                    </div>
                </div>

                {/* Panel 2: Total Connected Nodes */}
                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-amber-500 group-hover:scale-110 transition-transform duration-500">
                        <Users size={100} strokeWidth={1} />
                    </div>
                    <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1 italic">Connected Nodes</div>
                    <div className="text-3xl font-black text-[var(--text-dark)] tracking-tighter uppercase italic flex items-baseline gap-2">
                        {rewardData.referralHistory.length}
                        <span className="text-xs font-black text-[var(--text-muted)] not-italic uppercase opacity-60">Members</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        <CheckCircle size={10} className="text-emerald-500" /> {totalActiveReferrals} active conversions
                    </div>
                </div>

                {/* Panel 3: Yield Velocity */}
                <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                        <Gift size={100} strokeWidth={1} />
                    </div>
                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 italic">Average Yield</div>
                    <div className="text-3xl font-black text-[var(--text-dark)] tracking-tighter uppercase italic flex items-baseline gap-2">
                        {avgRewardPerReferral}
                        <span className="text-xs font-black text-[var(--text-muted)] not-italic uppercase opacity-60">Credits/Node</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                        <Sparkles size={10} /> Yield per referral node
                    </div>
                </div>
            </div>

            {/* --- Control Deck: Tabs & Filters --- */}
            <div className="card p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-xl">
                <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
                    {/* Tab Selectors */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100/50 self-start">
                        <button
                            onClick={() => { setActiveTab('transactions'); setStatusFilter('ALL'); }}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'transactions' ? 'bg-black text-white shadow-md' : 'text-[var(--text-muted)] hover:text-black'}`}
                        >
                            <span className="flex items-center gap-2">
                                <HistoryIcon size={12} /> Injected Ledger ({rewardData.transactionHistory.length})
                            </span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('referrals'); setStatusFilter('ALL'); }}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'referrals' ? 'bg-black text-white shadow-md' : 'text-[var(--text-muted)] hover:text-black'}`}
                        >
                            <span className="flex items-center gap-2">
                                <Users size={12} /> Referrals Ledger ({rewardData.referralHistory.length})
                            </span>
                        </button>
                    </div>

                    {/* Filters Console */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 xl:max-w-3xl">
                        {/* Search Input */}
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={activeTab === 'transactions' ? "Search ledger remarks..." : "Search referred name..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-8 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest italic focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer text-[var(--text-dark)]"
                            >
                                <option value="ALL">All Status</option>
                                {activeTab === 'transactions' ? (
                                    <>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="FAILED">Failed</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="ACTIVE">Active</option>
                                        <option value="PENDING">Pending</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div className="relative">
                            <ArrowUpDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full pl-10 pr-8 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest italic focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer text-[var(--text-dark)]"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Yield</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Table Console --- */}
            <div className="card bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === 'transactions' ? (
                        /* Transactions Table */
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="px-10 py-6">Transaction Remarks</th>
                                    <th className="px-10 py-6 text-center">Type</th>
                                    <th className="px-10 py-6 text-center">Status</th>
                                    <th className="px-10 py-6 text-center">Incentive Credits</th>
                                    <th className="px-10 py-6 text-right">Credited Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-24 opacity-30">
                                            <RefreshCw size={48} className="animate-spin mx-auto mb-4 text-indigo-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing Ledger...</span>
                                        </td>
                                    </tr>
                                ) : getFilteredTransactions().length > 0 ? (
                                    getFilteredTransactions().map((tx) => (
                                        <tr key={tx.id} className="group border-b border-slate-50 last:border-0 hover:bg-indigo-50/20 transition-all">
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-sm">
                                                        <Wallet size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-[var(--text-dark)] leading-tight">{tx.remarks || 'Referral Commission'}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">ID: {tx.id.slice(0, 8).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-black uppercase tracking-wider">
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                    tx.status === 'COMPLETED' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' : 
                                                    tx.status === 'PENDING' ? 'bg-amber-500/5 text-amber-600 border-amber-500/10' : 
                                                    'bg-rose-500/5 text-rose-600 border-rose-500/10'
                                                }`}>
                                                    <div className={`w-1 h-1 rounded-full ${tx.status === 'COMPLETED' ? 'bg-emerald-600' : tx.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-rose-600'}`}></div>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <div className="text-lg font-black text-indigo-600 tabular-nums italic">+{tx.credits || 0}</div>
                                                <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Credits Injected</div>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <div className="text-[11px] font-black text-[var(--text-dark)] opacity-80 tabular-nums italic">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 mt-1">
                                                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-32 opacity-20">
                                            <HistoryIcon size={64} strokeWidth={1} className="mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">No credit transactions discovered</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        /* Referrals Table */
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="px-10 py-6">Partner Identity</th>
                                    <th className="px-10 py-6 text-center">Status</th>
                                    <th className="px-10 py-6 text-center">Incentive Yield</th>
                                    <th className="px-10 py-6 text-right">Synchronization</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-24 opacity-30">
                                            <RefreshCw size={48} className="animate-spin mx-auto mb-4 text-indigo-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing Ledger...</span>
                                        </td>
                                    </tr>
                                ) : getFilteredReferrals().length > 0 ? (
                                    getFilteredReferrals().map((ref, idx) => (
                                        <tr key={idx} className="group border-b border-slate-50 last:border-0 hover:bg-indigo-50/20 transition-all">
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-sm">
                                                        <Users size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-[var(--text-dark)] uppercase italic leading-none">{ref.name}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Node ID: {ref.phone ? `${ref.phone.slice(-4)}-LGN` : 'UNKNOWN'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                    ref.status === 'ACTIVE' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' : 'bg-amber-500/5 text-amber-600 border-amber-500/10'
                                                }`}>
                                                    <div className={`w-1 h-1 rounded-full ${ref.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`}></div>
                                                    {ref.status || 'AUTHENTICATED'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <div className="text-lg font-black text-indigo-600 tabular-nums italic">+{ref.reward || '25'}</div>
                                                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5 italic opacity-60">Credits Injected</div>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <div className="text-[11px] font-black text-[var(--text-dark)] opacity-80 tabular-nums italic">
                                                    {new Date(ref.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 mt-1">
                                                    {new Date(ref.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-32 opacity-20">
                                            <Users size={64} strokeWidth={1} className="mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">The network awaits your first referral node</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RewardHistory;
