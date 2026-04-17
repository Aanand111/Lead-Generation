import React, { useState, useEffect } from 'react';
import { MoreVertical, X, Layers, Briefcase, MapPin, Search, CheckCircle, Smartphone, Mail, User, ShieldCheck, Activity, Trash2, Edit2, RotateCcw, Filter, ExternalLink } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';
import { useConfirm } from '../context/ConfirmContext';

const AvailableLeads = () => {
    const { confirm } = useConfirm();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [openActionId, setOpenActionId] = useState(null);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditLead, setCurrentEditLead] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const [assignType, setAssignType] = useState('');
    const [assignees, setAssignees] = useState([]);
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastSync, setLastSync] = useState(new Date());

    const fetchLeads = async (isQuiet = false) => {
        if (!isQuiet) setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/admin/available-leads');
            if (data.success && data.data) {
                // Get user city from localStorage
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const userCity = (user?.city || '').toLowerCase().trim();

                // Sort leads: Priority to matching city
                const sortedLeads = [...data.data].sort((a, b) => {
                    const cityA = (a.city || '').toLowerCase().trim();
                    const cityB = (b.city || '').toLowerCase().trim();
                    
                    if (cityA === userCity && cityB !== userCity) return -1;
                    if (cityA !== userCity && cityB === userCity) return 1;
                    return 0;
                });

                setLeads(sortedLeads);
                setLastSync(new Date());
            } else {
                setError(data.message || "Failed to fetch data");
            }

        } catch (err) {
            console.error("Failed to fetch available leads", err);
            setError("Network Error: Could not connect to backend");
        } finally {
            if (!isQuiet) setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchLeads(true);
            }, 30000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh]);

    useEffect(() => {
        const fetchAssigneeName = async () => {
            if (isEditModalOpen && currentEditLead && currentEditLead.assigned_to && !editFormData.assignee_name) {
                try {
                    const [resVendors, resSubVendors] = await Promise.all([
                        api.get('/admin/vendors'),
                        api.get('/admin/subvendors')
                    ]);

                    const vendorsData = resVendors.data;
                    const subVendorsData = resSubVendors.data;

                    let foundName = '';
                    let foundDesignation = '';

                    if (vendorsData.success && vendorsData.data) {
                        const vendor = vendorsData.data.find(v => v.id == currentEditLead.assigned_to);
                        if (vendor) {
                            foundName = vendor.name;
                            foundDesignation = 'Vendor';
                        }
                    }

                    if (!foundName && subVendorsData.success && subVendorsData.data) {
                        const sub = subVendorsData.data.find(s => s.id == currentEditLead.assigned_to);
                        if (sub) {
                            foundName = sub.name;
                            foundDesignation = 'Subvendor';
                        }
                    }

                    if (foundName) {
                        setEditFormData(prev => ({
                            ...prev,
                            assignee_name: foundName,
                            assignee_designation: foundDesignation
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching assignee details:", err);
                }
            }
        };
        fetchAssigneeName();
    }, [isEditModalOpen, currentEditLead]);

    const toggleAction = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedLeads(leads.map(lead => lead.id));
            setSelectAll(true);
        } else {
            setSelectedLeads([]);
            setSelectAll(false);
        }
    };

    const handleSelectLead = (id) => {
        if (selectedLeads.includes(id)) {
            setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
            setSelectAll(false);
        } else {
            const newSelected = [...selectedLeads, id];
            setSelectedLeads(newSelected);
            if (newSelected.length === leads.length) {
                setSelectAll(true);
            }
        }
    };

    const handleEditClick = (lead) => {
        setCurrentEditLead(lead);
        setEditFormData({
            lead_id: lead.lead_uid || lead.lead_id || '',
            customer_name: lead.name || lead.customer_name || '',
            customer_email: lead.email || lead.av_email || lead.customer_email || '',
            customer_phone: lead.phone || lead.av_phone || lead.customer_phone || '',
            category: lead.category_name || lead.category || '',
            source: lead.source || '',
            status: lead.status || 'New',
            priority: lead.priority || 'Normal',
            address: lead.address || '',
            city: lead.city_display || lead.city || '',
            state: lead.state_display || lead.state || '',
            pincode: lead.pincode || '',
            notes: lead.notes || '',
            assignee_name: lead.assignee_name || '',
            assignee_designation: lead.assignee_designation || ''
        });
        setIsEditModalOpen(true);
        setOpenActionId(null);
    };

    // Handle lead deletion with confirmation
    const handleDeleteClick = async (leadId) => {
        const confirmed = await confirm(
            'Are you sure you want to delete this lead? This action cannot be undone.',
            'Delete Lead'
        );
        if (!confirmed) return;
        
        try {
            const { data } = await api.delete(`/admin/leads/${leadId}`);
            if (data.success) {
                setMessage({ type: 'success', text: 'Lead deleted successfully.' });
                fetchLeads();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to delete lead.' });
            }
        } catch (err) {
            console.error("Delete lead error:", err);
            setMessage({ type: 'error', text: 'Server error: Could not delete lead.' });
        }
        setOpenActionId(null);
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleAssignTypeChange = async (e) => {
        const type = e.target.value;
        setAssignType(type);
        setSelectedAssignee('');
        setAssignees([]);

        if (type) {
            try {
                const { data } = await api.get(`/admin/${type}s`);
                if (data.success && data.data) {
                    setAssignees(data.data);
                }
            } catch (err) {
                console.error(`Failed to fetch ${type}s`, err);
            }
        }
    };

    const handleAssignLeads = async () => {
        if (selectedLeads.length === 0) {
            setMessage({ type: 'error', text: 'Select at least one lead for allocation.' });
            return;
        }
        if (!assignType || !selectedAssignee) {
            setMessage({ type: 'error', text: 'Select assignment type and user.' });
            return;
        }

        try {
            const { data } = await api.post('/admin/assign-leads', {
                lead_ids: selectedLeads,
                assignee_type: assignType,
                assignee_id: selectedAssignee
            });

            if (data.success) {
                setMessage({ type: 'success', text: 'Leads successfully assigned.' });
                setSelectedLeads([]);
                setSelectAll(false);
                setAssignType('');
                setSelectedAssignee('');
                setAssignees([]);
                fetchLeads();
            } else {
                setMessage({ type: 'error', text: data.message || "Failed to assign leads." });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to assign leads. Please try again.' });
        } finally {
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/admin/leads/${currentEditLead.id}`, editFormData);

            if (data.success) {
                setIsEditModalOpen(false);
                fetchLeads();
                setMessage({ type: 'success', text: 'Lead updated successfully.' });
            } else {
                setMessage({ type: 'error', text: data.message || "Update rejected." });
            }
        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Failed to sync internal data.' 
            });
        } finally {
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        <Briefcase className="text-indigo-500" size={24} />
                        Available Leads
                    </h2>
                    <p>Track and manage active leads available for distribution</p>
                </div>
                <div className="pageHeaderActions flex items-center gap-3">
                    <CustomSelect
                        variant="compact"
                        value={assignType}
                        onChange={handleAssignTypeChange}
                        options={[
                            { value: 'vendor', label: 'VENDOR' },
                            { value: 'subvendor', label: 'SUBVENDOR' }
                        ]}
                        placeholder="Assign To"
                        className="min-w-[120px]"
                    />

                    {assignType && (
                        <div className="animate-fade-in flex items-center">
                            <CustomSelect
                                variant="compact"
                                value={selectedAssignee}
                                onChange={(e) => setSelectedAssignee(e.target.value)}
                                options={assignees.map(a => ({ value: a.id, label: a.name.toUpperCase() }))}
                                placeholder="Select Member"
                                className="min-w-[180px]"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleAssignLeads}
                        disabled={!selectedAssignee || selectedLeads.length === 0}
                        className="btn btn-primary flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/10 disabled:opacity-30"
                    >
                        <ShieldCheck size={16} /> Assign Leads
                    </button>

                    <div className="flex items-center gap-3 bg-[var(--surface-color)]/50 backdrop-blur-md p-1 pl-4 pr-1 rounded-[1.5rem] border border-[var(--border-color)]">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Auto Refresh</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${autoRefresh ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {autoRefresh ? 'ON' : 'OFF'}
                            </span>
                        </div>
                        <button 
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`w-10 h-6 rounded-xl relative transition-all duration-500 ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-lg shadow-sm transition-all duration-500 ${autoRefresh ? 'left-4.5' : 'left-0.5'}`}></div>
                        </button>
                    </div>
                    
                    <button onClick={() => fetchLeads(false)} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 p-2.5 rounded-xl transition-all shadow-sm">
                        <RotateCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-8 px-4">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">
                        Last Updated: {lastSync.toLocaleTimeString([])}
                    </span>
                </div>
            </div>

            {message.text && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 transition-all animate-slide-up border ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                    {message.type === 'error' ? <Activity size={20} /> : <CheckCircle size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="card shadow-sm border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)]">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">
                            Unassigned Leads: <span className="text-[var(--text-dark)] font-black">{leads.length} Remaining</span>
                        </span>
                        <div className="h-4 w-px bg-[var(--border-color)]"></div>
                        <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                            {selectedLeads.length} Selected
                        </div>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium shadow-sm focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/50 text-[var(--text-dark)]" 
                            placeholder="Search leads..." 
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectAll} 
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th className="w-12 text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">#</th>
                                <th className="text-[var(--text-muted)]">Lead Name</th>
                                <th className="text-[var(--text-muted)]">Source</th>
                                <th className="text-[var(--text-muted)]">Location</th>
                                <th className="text-[var(--text-muted)]">Status</th>
                                <th className="text-[var(--text-muted)]">Priority</th>
                                <th className="text-[var(--text-muted)]">Created Date</th>
                                <th className="text-right text-[var(--text-muted)]">Op</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="spinner mb-2"></div>
                                            <span className="text-[10px] uppercase font-black tracking-widest animate-pulse text-[var(--text-muted)]">Loading available leads...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : leads.length > 0 ? (
                                leads.map((lead, index) => (
                                    <tr key={lead.id} className="transition-all hover:bg-[var(--primary)]/[0.02] group border-b border-[var(--border-color)] last:border-0 text-xs text-[var(--text-dark)]">
                                        <td className="text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedLeads.includes(lead.id)} 
                                                onChange={() => handleSelectLead(lead.id)}
                                                className="w-4 h-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="text-center font-black text-[var(--text-muted)]/40 text-[10px]">
                                            #{ (index + 1).toString().padStart(3, '0') }
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                                                    <User size={18} />
                                                </div>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-[var(--text-dark)] uppercase tracking-tight text-[11px] group-hover:text-indigo-600 transition-colors uppercase">{lead.name || 'Anonymous'}</span>
                                                    </div>
                                                </td>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-tight border border-emerald-500/20">
                                                <ExternalLink size={10} /> {lead.source || 'ORGANIC'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-dark)]/80">
                                                    <MapPin size={10} className="text-indigo-400" /> {lead.city}, {lead.state}
                                                </div>
                                                {/* NEARBY HIGHLIGHT BADGE */}
                                                {(() => {
                                                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                    if (user.city && lead.city && user.city.toLowerCase().trim() === lead.city.toLowerCase().trim()) {
                                                        return (
                                                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[8px] font-black uppercase tracking-[0.1em] shadow-sm animate-pulse border border-white/20">
                                                                <ShieldCheck size={8} /> Near You
                                                            </div>
                                                        );
                                                    }
                                                    return <div className="text-[9px] font-black text-[var(--text-muted)]/60 ml-4 italic uppercase">{lead.category_name || 'GENERAL'}</div>;
                                                })()}
                                            </div>
                                        </td>

                                        <td>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                !lead.assigned_to ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${!lead.assigned_to ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                                {!lead.assigned_to ? 'Unassigned' : 'Assigned'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border transition-all ${
                                                lead.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                                                lead.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                            }`}>
                                                {lead.priority || 'Normal'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-[10px] font-black text-[var(--text-muted)] tabular-nums">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="relative inline-block text-left">
                                                <button 
                                                    className="bg-transparent border-none p-2 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer active:scale-90"
                                                    onClick={() => toggleAction(lead.id)}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {openActionId === lead.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                         <div className="absolute right-10 top-0 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[150px] py-2 overflow-hidden animate-zoom-in origin-right">
                                                            <button 
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-3 border-none cursor-pointer bg-transparent"
                                                                onClick={() => handleEditClick(lead)}
                                                            >
                                                                <Edit2 size={14} className="text-indigo-500" /> Edit Lead
                                                            </button>
                                                            <button 
                                                                className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-3 border-none cursor-pointer bg-transparent"
                                                                onClick={() => handleDeleteClick(lead.id)}
                                                            >
                                                                <Trash2 size={14} /> Delete Lead
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-24 text-[var(--text-muted)] italic">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Layers size={64} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No unassigned leads found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Lead Modal */}
            {isEditModalOpen && currentEditLead && (
                <div className="fixed inset-0 bg-[var(--bg-color)]/70 backdrop-blur-md z-[9000] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface-color)] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-zoom-in border border-[var(--border-color)]">
                        <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/30">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--text-dark)] tracking-tight uppercase">
                                    Edit Lead Details
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Update customer information and plan details</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] shadow-sm border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-color)] transition-colors cursor-pointer outline-none">
                                <X size={20} className="text-[var(--text-muted)]" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-8">
                            <div className="mb-8 p-6 rounded-3xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-[var(--text-dark)] tracking-tight uppercase">{editFormData.customer_name || 'No Name'}</h4>
                                        <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                                            {editFormData.assignee_name ? (
                                                <>Assigned: <span className="text-indigo-500">{editFormData.assignee_name}</span> ({editFormData.assignee_designation})</>
                                            ) : 'Status: Unassigned'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Contact Details</label>
                                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-dark)]">
                                            <Smartphone size={14} className="text-indigo-400" /> {editFormData.customer_phone || '-'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                                            <Mail size={14} className="opacity-40" /> {editFormData.customer_email || '-'}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Category Designation</label>
                                        <input 
                                            type="text" name="category" value={editFormData.category} onChange={handleEditChange} 
                                            className="form-control !py-3 font-black tracking-tight text-xs uppercase bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 outline-none" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Location</label>
                                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-dark)]">
                                            <MapPin size={14} className="text-rose-400" /> {editFormData.city}, {editFormData.state}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Priority Metric</label>
                                        <CustomSelect 
                                            variant="compact"
                                            name="priority" value={editFormData.priority} 
                                            onChange={handleEditChange} 
                                            options={[
                                                { value: 'Normal', label: 'NORMAL' },
                                                { value: 'Medium', label: 'MEDIUM' },
                                                { value: 'High', label: 'HIGH' }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Briefcase size={12} /> Remarks / Notes
                                </label>
                                <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[11px] font-medium text-[var(--text-dark)] leading-relaxed min-h-[80px]">
                                    {editFormData.notes || 'No remarks added for this lead.'}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
                                <button type="submit" className="btn btn-primary px-10 py-4 flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-500/10">
                                    <Activity size={16} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 py-4 bg-[var(--bg-color)] text-[var(--text-muted)] hover:bg-[var(--border-color)] font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all border-none cursor-pointer">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailableLeads;
