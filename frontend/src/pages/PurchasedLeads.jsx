import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Filter, ArrowLeft, RefreshCcw, Download, Calendar, Tag, User, Package, Layers, Sparkles, Activity, ShieldCheck, Plus, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const PurchasedLeads = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({ leads: 0, total_remaining_leads: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            console.log("Stats API Response:", data);
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const fetchPurchasedLeads = async () => {
        setLoading(true);
        fetchStats();
        try {
            const { data } = await api.get('/admin/leads-purchased');
            console.log("Purchased Leads API Response:", data);

            if (data.success && data.data && data.data.length > 0) {
                const mappedData = data.data.map((lead, index) => ({
                    id: index + 1,
                    customerName: lead.customer_name || 'N/A',
                    leadId: lead.lead_id ? `L-${index + 1000}` : 'N/A',
                    packageName: lead.package_name || 'INDIVIDUAL',
                    leadName: lead.lead_name || 'N/A',
                    totalLeads: lead.total_leads != null ? lead.total_leads : '1',
                    remainingLeads: lead.remaining_leads != null ? lead.remaining_leads : '1',
                    price: lead.price ? parseFloat(lead.price).toFixed(2) : '0.00',
                    purchaseStatus: lead.purchase_status || 'ACQUIRED',
                    statingDate: lead.starting_date ? new Date(lead.starting_date).toLocaleDateString('en-GB') : 'N/A',
                    endDate: lead.end_date ? new Date(lead.end_date).toLocaleDateString('en-GB') : 'N/A'
                }));
                setLeads(mappedData);
             } else {
                setLeads([]);
            }
        } catch (err) {
            console.error("Error fetching purchased leads:", err);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchasedLeads();
    }, []);

    const filteredLeads = leads.filter(l => 
        l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.leadId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3 font-black uppercase tracking-tight">
                        Purchased Leads History
                        <ShoppingCart className="text-indigo-600" size={24} />
                    </h2>
                    <p>Track customer lead purchases and active distributions</p>
                </div>
                <div className="pageHeaderActions">
                    <button className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-600 hover:bg-indigo-600/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-4 rounded-2xl transition-all shadow-sm">
                         <Download size={16} /> Export CSV
                    </button>
                     <button className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl transition-all active:scale-95">
                        <Plus size={18} /> New Purchase
                    </button>
                </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
                 <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="relative z-10">
                         <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Active Purchases</div>
                         <div className="text-4xl font-black">{leads.length} Records</div>
                         <div className="mt-4 flex items-center gap-2 text-[10px] uppercase font-black tracking-widest bg-white/20 px-3 py-1 rounded-full w-fit">
                             <TrendingUp size={12} /> Sync Active
                         </div>
                    </div>
                    <Sparkles className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-125 transition-transform duration-700" size={120} />
                </div>
                 <div className="p-8 rounded-[3rem] bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                         <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Remaining Leads</div>
                            <div className="text-4xl font-black">
                                {stats.total_remaining_leads || 0} <span className="text-xl font-normal opacity-60">Units</span>
                            </div>
                         </div>
                         <div className="mt-8 flex items-center gap-2 text-[10px] uppercase font-black tracking-widest bg-black/10 px-4 py-2 rounded-2xl w-fit backdrop-blur-sm border border-white/10">
                             <Activity size={14} className="text-emerald-200" /> Lead Balance
                         </div>
                    </div>
                    <Activity className="absolute -left-6 -bottom-6 text-white/10 group-hover:rotate-12 transition-transform duration-700" size={140} />
                </div>

                 <div className="p-8 rounded-[3rem] bg-[var(--surface-color)] text-[var(--text-dark)] shadow-2xl shadow-indigo-900/10 relative overflow-hidden group border border-[var(--border-color)]">
                    <div className="relative z-10">
                         <div className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-3 ml-1">Total Purchases</div>
                         <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-dark)] to-indigo-400">
                             {stats.leads} <span className="text-2xl font-black">Total</span>
                         </div>
                         <div className="mt-6 flex items-center gap-3 text-[9px] uppercase font-black tracking-[0.2em] text-indigo-300">
                             <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                                <ShieldCheck size={12} />
                             </div>
                             Verified Lead System
                         </div>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layers size={80} />
                    </div>
                </div>
            </div>

            {/* Main Data Container */}
            <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] mt-10">
                <div className="p-8 border-b border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--bg-color)]/30">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-600">
                                <Filter size={18} />
                            </div>
                            <CustomSelect
                                variant="compact"
                                value={entries}
                                onChange={(e) => { setEntries(parseInt(e.target.value)); setCurrentPage(1); }}
                                 options={[
                                    { value: 10, label: '10 RECORDS' },
                                    { value: 25, label: '25 RECORDS' },
                                    { value: 50, label: '50 RECORDS' }
                                ]}
                                className="min-w-[140px]"
                            />
                        </div>
                         <div className="h-8 w-px bg-[var(--border-color)] hidden md:block"></div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60 hidden lg:block">Monitor lead acquisition and delivery</div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                         <input
                            type="text"
                            className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-tight shadow-inner focus:border-indigo-500 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-[var(--text-muted)]/40"
                            placeholder="Search by customer or lead name..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-[#f9fafb]">
                            <tr>
                                 <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">ID</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Customer Name</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Lead Category</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Plan Package</th>
                                <th className="text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Leads Status</th>
                                <th className="text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Purchase Price</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Duration</th>
                                <th className="text-right text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest px-10">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                             {loading ? (
                                <tr><td colSpan="8" className="text-center py-40">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-2xl"></div>
                                        <span className="text-[11px] font-black uppercase tracking-widest animate-pulse text-indigo-600/60">Fetching Purchase History...</span>
                                    </div>
                                </td></tr>
                             ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-40 text-[var(--text-muted)]">
                                     <div className="flex flex-col items-center gap-5 opacity-20">
                                         <ShoppingCart size={80} strokeWidth={1} />
                                         <p className="font-black uppercase tracking-widest text-[10px]">No purchase records found</p>
                                     </div>
                                </td></tr>
                             ) : filteredLeads.map((lead) => (
                                <tr key={lead.id} className="transition-all hover:bg-indigo-600/[0.02] group border-b border-[var(--border-color)] last:border-0 text-xs text-[var(--text-dark)]">
                                    <td className="text-center font-black text-[var(--text-muted)]/40 text-[10px]">#{lead.id.toString().padStart(3, '0')}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                                {lead.customerName.charAt(0)}
                                            </div>
                                             <div>
                                                <div className="font-black text-[var(--text-dark)] uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{lead.customerName}</div>
                                                <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 mt-0.5">Verified Customer</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-black text-[var(--text-dark)] uppercase tracking-tight line-clamp-1 max-w-[150px]">{lead.leadName}</div>
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-400 text-[9px] font-black uppercase tracking-[0.1em] mt-1 border border-indigo-100 shadow-inner">
                                            <Tag size={10} /> {lead.leadId}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Package size={14} className="text-indigo-400 opacity-60" />
                                            <span className="font-black text-[var(--text-dark)] uppercase tracking-tight text-[11px]">{lead.packageName}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="text-xs font-black text-[var(--text-dark)]">{lead.remainingLeads} / {lead.totalLeads}</div>
                                             <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                                    style={{ width: `${(parseInt(lead.remainingLeads) / parseInt(lead.totalLeads)) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-[8px] font-black uppercase text-gray-400 mt-1 tracking-widest">Leads Remaining</div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="text-[13px] font-black text-emerald-600 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm w-fit mx-auto">
                                            ₹{lead.price}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-dark)]">
                                                <Calendar size={12} className="text-indigo-400" /> {lead.statingDate}
                                            </div>
                                             <div className="flex items-center gap-2 text-[10px] font-black text-orange-500 opacity-60">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> EXPIRES: {lead.endDate}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right px-10">
                                         <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            parseInt(lead.remainingLeads) > 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-red-50 text-red-500 border-red-100 opacity-60'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${parseInt(lead.remainingLeads) > 0 ? 'bg-indigo-500 animate-pulse' : 'bg-red-500'}`}></div>
                                            {parseInt(lead.remainingLeads) > 0 ? 'ACTIVE' : 'EXPIRED'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-10 flex flex-wrap items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-color)]/20 shadow-inner">
                     <div className="flex items-center gap-4">
                         <div className="p-3 rounded-[1.5rem] bg-white border border-gray-100 shadow-xl group">
                              <ShieldCheck className="text-indigo-600 group-hover:rotate-180 transition-transform duration-1000" size={24} />
                         </div>
                         <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                              Lead Purchase Monitoring: <span className="text-indigo-600 font-black ml-1">{leads.length} Active Records</span>
                         </div>
                     </div>
                      <div className="flex items-center gap-2">
                         <button className="px-6 py-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-indigo-100/10">Refresh Leads</button>
                      </div>
                </div>
            </div>
        </div>
    );
};

export default PurchasedLeads;
