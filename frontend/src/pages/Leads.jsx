import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, Trash2, X, Search, Plus, MapPin, Phone, Mail, FileText, CheckCircle, AlertCircle, RefreshCcw, Layers, Filter } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';

const Leads = () => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditLead, setCurrentEditLead] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        lead_id: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        category: '',
        city: '',
        state: '',
        pincode: '',
        lead_value: '',
        expiry_date: ''
    });

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/leads');
            if (data.success && data.data) {
                setLeads(data.data);
            } else {
                setLeads([]);
            }
        } catch (err) {
            console.error("Error fetching leads:", err);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Function to delete a lead with confirmation
    const handleDelete = async (id) => {
        const confirmed = await confirm(
            'Are you sure you want to permanently delete this lead record?',
            'Delete Lead'
        );
        if (!confirmed) return;
        
        try {
            const { data } = await api.delete(`/admin/leads/${id}`);
            if (data.success) {
                setLeads(prev => prev.filter(l => l.id !== id));
                toast.success('Lead deleted successfully.');
            } else {
                toast.error(data.message || 'Error deleting lead');
            }
        } catch (err) {
            console.error("Delete lead error:", err);
            toast.error('Failed to delete lead. Server error.');
        } finally {
            setOpenMenuId(null);
        }
    };

    const handleEditClick = (lead) => {
        setOpenMenuId(null);
        setCurrentEditLead(lead);
        setFormData({
            lead_id: lead.lead_id || '',
            customer_name: lead.customer_name || '',
            customer_phone: lead.customer_phone || '',
            customer_email: lead.customer_email || '',
            category: lead['category '] || lead.category || '',
            city: lead.city || '',
            state: lead.state || '',
            pincode: lead.pincode || '',
            lead_value: lead.lead_value || '',
            expiry_date: lead.expiry_date ? lead.expiry_date.substring(0, 10) : ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name === 'customer_phone') {
            const val = value.replace(/\D/g, '');
            if (val.length <= 10) {
                setFormData({ ...formData, [name]: val });
            }
        } else if (name === 'pincode') {
            const val = value.replace(/\D/g, '');
            if (val.length <= 6) {
                setFormData({ ...formData, [name]: val });
            }
        } else if (name === 'lead_value') {
            if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put(`/admin/leads/${currentEditLead.id}`, formData);
            if (data.success) {
                setIsEditModalOpen(false);
                fetchLeads();
                toast.success('Lead updated successfully.');
            } else {
                toast.error(data.message || 'Failed to update lead.');
            }
        } catch (err) {
            toast.error('Failed to update lead. Server error.');
        } finally {
            setSaving(false);
        }
    };

    const filteredLeads = leads.filter(l =>
        (l.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.customer_phone?.includes(searchTerm)) ||
        (l.lead_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.city?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredLeads.length / entries) || 1;
    const paginatedLeads = filteredLeads.slice((currentPage - 1) * entries, currentPage * entries);

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            {/* Table Header Section */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-2">
                        All Leads
                        <Layers className="text-indigo-500" size={24} />
                    </h2>
                    <p>Manage and track all customer leads in the database</p>
                </div>
                <div className="pageHeaderActions">
                    <button className="btn btn-primary shadow-lg shadow-indigo-500/20 px-6 py-4 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all" onClick={() => navigate('/leads/create')}>
                        <Plus size={16} /> Create New Lead
                    </button>
                </div>
            </div>


            <div className="card shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)]">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">
                            Total Count: <span className="text-[var(--text-dark)] font-black">{filteredLeads.length} Leads</span>
                        </span>
                        <div className="h-4 w-px bg-[var(--border-color)]"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2">Show</span>
                            <CustomSelect
                                variant="compact"
                                value={entries}
                                onChange={(e) => { setEntries(parseInt(e.target.value)); setCurrentPage(1); }}
                                options={[
                                    { value: 10, label: '10' },
                                    { value: 25, label: '25' },
                                    { value: 50, label: '50' }
                                ]}
                                className="min-w-[80px]"
                            />
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-[var(--text-muted)]/50 text-[var(--text-dark)]"
                            placeholder="Search by ID, name, city or phone..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="w-16 text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">#</th>
                                <th className="text-[var(--text-muted)]">Customer Name</th>
                                <th className="text-[var(--text-muted)]">Contact Info</th>
                                <th className="text-[var(--text-muted)]">Category</th>
                                <th className="text-[var(--text-muted)]">Location</th>
                                <th className="text-[var(--text-muted)]">Value</th>
                                <th className="text-center text-[var(--text-muted)]">Status</th>
                                <th className="text-right text-[var(--text-muted)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="spinner mb-2"></div>
                                            <span className="text-[10px] uppercase font-black tracking-[0.2em] animate-pulse text-[var(--text-muted)]">Loading Leads...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-4 opacity-30 text-[var(--text-muted)]">
                                            <Layers size={64} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No leads found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedLeads.map((lead, idx) => (
                                <tr key={lead.id} className="transition-all hover:bg-[var(--primary)]/[0.02] group border-b border-[var(--border-color)] last:border-0 text-xs text-[var(--text-dark)]">
                                    <td className="text-center font-black text-[var(--text-muted)]/40 text-[10px]">
                                        #{((currentPage - 1) * entries + idx + 1).toString().padStart(3, '0')}
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">{lead.lead_id || 'ID-TEMP'}</span>
                                            <span className="font-black text-[var(--text-dark)] uppercase tracking-tight text-[11px] group-hover:text-indigo-600 transition-colors uppercase">{lead.customer_name || 'Anonymous'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-dark)]/80">
                                                <Phone size={10} className="text-indigo-400" /> {lead.customer_phone}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] italic">
                                                <Mail size={10} className="text-[var(--text-muted)]/40" /> {lead.customer_email || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/5 text-indigo-500 text-[10px] font-black uppercase tracking-tight border border-indigo-500/10">
                                            <FileText size={10} /> {lead['category '] || lead.category || 'Regular'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-tight text-[var(--text-dark)]/80">
                                            <MapPin size={10} className="text-rose-400" /> {lead.city || 'India'}, {lead.state || ''}
                                        </div>
                                        <span className="text-[9px] font-black text-[var(--text-muted)]/40 ml-4 italic">{lead.pincode}</span>
                                    </td>
                                    <td>
                                        <div className="font-black text-[var(--text-dark)] text-sm group-hover:text-emerald-500 transition-colors tabular-nums">
                                            ₹{Number(lead.lead_value || 0).toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[9px] font-black text-[var(--text-muted)]/40 uppercase tracking-widest italic leading-tight">VALUE</div>
                                    </td>
                                    <td className="text-center">
                                        {lead.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                <CheckCircle size={10} /> ACTIVE
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20 animate-pulse">
                                                <AlertCircle size={10} /> PENDING
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right text-[var(--text-muted)]">
                                        <div className="relative inline-block text-left">
                                            <button
                                                className="bg-transparent border-none p-2 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer active:scale-90 outline-none"
                                                onClick={() => toggleMenu(lead.id)}
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            {openMenuId === lead.id && (
                                                <>
                                                    <div className="fixed inset-0 z-[100]" onClick={() => setOpenMenuId(null)} />
                                                    <div className="absolute right-10 top-0 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[150px] py-2 overflow-hidden animate-zoom-in origin-right">
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-3 border-none bg-transparent cursor-pointer"
                                                            onClick={() => handleEditClick(lead)}
                                                        >
                                                            <Edit2 size={14} /> Edit Lead
                                                        </button>
                                                        <div className="h-px bg-[var(--border-color)] my-1 mx-2"></div>
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-3 border-none bg-transparent cursor-pointer"
                                                            onClick={() => handleDelete(lead.id)}
                                                        >
                                                            <Trash2 size={14} /> Delete Lead
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-[var(--border-color)] bg-[var(--bg-color)]/30">
                    <div className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">
                        Viewing: <span className="text-[var(--text-dark)] not-italic font-black">{(currentPage - 1) * entries + 1} - {Math.min(currentPage * entries, filteredLeads.length)}</span> of {filteredLeads.length} Total
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            className={`px-4 py-2 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]' : 'hover:bg-[var(--bg-color)] active:scale-95 cursor-pointer shadow-sm text-indigo-500'}`}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-[11px] font-black transition-all border-none cursor-pointer ${currentPage === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105' : 'bg-[var(--surface-color)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-indigo-500/50 hover:text-indigo-500 shadow-sm'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            className={`px-4 py-2 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]' : 'hover:bg-[var(--bg-color)] active:scale-95 cursor-pointer shadow-sm text-indigo-600'}`}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Lead Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-[var(--bg-color)]/70 backdrop-blur-md z-[9000] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface-color)] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-zoom-in border border-[var(--border-color)]">
                        <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/30">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--text-dark)] tracking-tight uppercase">
                                    Edit Lead Details
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Update lead information and details</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] shadow-sm border border-[var(--border-color)] flex items-center justify-center hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all cursor-pointer outline-none border-none">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Lead ID <span>*</span></label>
                                    <input type="text" name="lead_id" value={formData.lead_id} onChange={handleEditChange} required className="form-control !py-3 font-black text-sm uppercase tracking-tight bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 transition-all shadow-inner outline-none rounded-xl w-full px-4" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Category</label>
                                    <input type="text" name="category" value={formData.category} onChange={handleEditChange} className="form-control !py-3 font-black text-sm uppercase tracking-tight bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 transition-all shadow-inner outline-none rounded-xl w-full px-4" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Customer Name</label>
                                    <input type="text" name="customer_name" value={formData.customer_name} onChange={handleEditChange} className="form-control !py-3 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 transition-all shadow-inner outline-none rounded-xl w-full px-4" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Contact Sequence <span>*</span></label>
                                    <input type="text" name="customer_phone" value={formData.customer_phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) handleEditChange({ target: { name: 'customer_phone', value: val } }); }} required maxLength={10} className="form-control !py-3 font-black text-sm bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 transition-all shadow-inner outline-none rounded-xl w-full px-4" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Email Address</label>
                                <input type="email" name="customer_email" value={formData.customer_email} onChange={handleEditChange} className="form-control !py-3 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] focus:border-indigo-500 transition-all shadow-inner outline-none rounded-xl w-full px-4" />
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2 col-span-1">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">City <span>*</span></label>
                                    <input type="text" name="city" value={formData.city} onChange={handleEditChange} required className="form-control !py-3 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] outline-none rounded-xl w-full px-4" />
                                </div>
                                <div className="space-y-2 col-span-1">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleEditChange} className="form-control !py-3 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] outline-none rounded-xl w-full px-4" />
                                </div>
                                <div className="space-y-2 col-span-1">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Region Mask</label>
                                    <input type="text" name="pincode" value={formData.pincode} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 6) handleEditChange({ target: { name: 'pincode', value: val } }); }} maxLength={6} className="form-control !py-3 font-black text-sm bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-dark)] outline-none rounded-xl w-full px-4" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Lead Value (₹)</label>
                                    <input type="number" step="0.01" name="lead_value" value={formData.lead_value} onChange={handleEditChange} className="form-control !py-3 font-black text-sm text-emerald-500 bg-[var(--bg-color)] border-[var(--border-color)] shadow-inner outline-none rounded-xl w-full px-4" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Expiry Date</label>
                                    <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleEditChange} className="form-control !py-3 font-black text-sm bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-dark)] outline-none rounded-xl w-full px-4" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button type="submit" className="btn btn-primary flex-1 py-4 flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-500/10" disabled={saving}>
                                    {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Layers size={16} />}
                                    {saving ? 'Updating...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 bg-[var(--bg-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all border-none bg-transparent cursor-pointer">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
