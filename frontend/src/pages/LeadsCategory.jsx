import React, { useState, useEffect } from 'react';
import { MoreVertical, Plus, X, Search, Check, AlertCircle, Trash2, Edit2, Layers, Calendar, Clock, Activity, ShieldPlus, Sparkles, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';

const LeadsCategory = () => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentCategory, setCurrentCategory] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        status: 'Active'
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/lead-categories');
            if (data.success && data.data) {
                setCategories(data.data);
            } else {
                setCategories([]);
            }
        } catch (err) {
            console.error('Error fetching lead categories:', err);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const toggleAction = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    const handleOpenAddModal = () => {
        setModalMode('add');
        setFormData({ name: '', status: 'Active' });
        setCurrentCategory(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category) => {
        setModalMode('edit');
        setCurrentCategory(category);
        setFormData({
            name: category.name || '',
            status: category.status || 'Active'
        });
        setOpenActionId(null);
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const promise = modalMode === 'add'
                ? api.post('/admin/lead-categories', formData)
                : api.put(`/admin/lead-categories/${currentCategory.id}`, formData);

            const { data } = await promise;
            if (data.success) {
                setIsModalOpen(false);
                fetchCategories();
                toast.success(`Category successfully ${modalMode === 'add' ? 'created' : 'updated'}.`);
            } else {
                toast.error(data.message || `Failed to ${modalMode} category.`);
            }
        } catch (error) {
            toast.error('Failed to save category. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm(
            'Are you sure you want to delete this category? This action cannot be undone.',
            'Delete Category'
        );
        if (confirmed) {
            try {
                const { data } = await api.delete(`/admin/lead-categories/${id}`);
                if (data.success) {
                    setCategories(prev => prev.filter(c => c.id !== id));
                    toast.success('Category deleted successfully.');
                } else {
                    toast.error(data.message || 'Failed to delete category.');
                }
            } catch (err) {
                toast.error('Could not delete category. Server error.');
            } finally {
                setOpenActionId(null);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Lead Categories
                        <Layers className="text-indigo-500" size={24} />
                    </h2>
                    <p>Manage and organize different service categories for leads</p>
                </div>
                <div className="pageHeaderActions">
                    <button className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-4 rounded-2xl transition-all active:scale-95" onClick={handleOpenAddModal}>
                        <Plus size={16} /> Add Category
                    </button>
                </div>
            </div>

            {/* List Card */}
            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] mt-8">
                <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/30">
                    <div className="text-xs font-black text-[var(--text-dark)] uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                             <ShieldPlus size={16} />
                        </div>
                        Active Categories
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-[var(--bg-color)]/50">
                            <tr>
                                <th className="w-16 text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">#</th>
                                <th className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">Category Name</th>
                                <th className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">Status</th>
                                <th className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">Created At</th>
                                <th className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">Last Updated</th>
                                <th className="text-right text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest px-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-32">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="spinner w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] animate-pulse">Loading categories...</span>
                                    </div>
                                </td></tr>
                            ) : categories.length > 0 ? (
                                categories.map((category, index) => (
                                <tr key={category.id} className="transition-all hover:bg-indigo-500/[0.02] group border-b border-[var(--border-color)] last:border-0 text-[var(--text-dark)]">
                                    <td className="text-center text-[var(--text-muted)]/50 text-xs font-black font-mono">{(index + 1).toString().padStart(3, '0')}</td>
                                    <td>
                                        <div className="font-black text-[var(--text-dark)] group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{category.name}</div>
                                        <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-black opacity-40 mt-0.5">ID: {category.id}</div>
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            category.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 italic opacity-60'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${category.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                            {category.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase italic">
                                            <Calendar size={12} className="opacity-30" /> {formatDate(category.created_at)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase italic">
                                            <Clock size={12} className="opacity-30" /> {formatDate(category.updated_at)}
                                        </div>
                                    </td>
                                    <td className="text-right px-8">
                                        <div className="relative inline-block text-left">
                                            <button 
                                                className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-indigo-600/10 hover:text-indigo-600 transition-all active:scale-90 border-none bg-transparent outline-none cursor-pointer text-[var(--text-muted)]" 
                                                onClick={() => toggleAction(category.id)}
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            {openActionId === category.id && (
                                                <>
                                                    <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                    <div className="absolute right-0 mt-2 w-48 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] overflow-hidden animate-zoom-in origin-top-right">
                                                        <button className="flex items-center gap-3 w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-dark)] hover:bg-indigo-50 transition-colors border-none bg-transparent cursor-pointer" onClick={() => handleOpenEditModal(category)}>
                                                            <Edit2 size={14} className="text-indigo-500" /> Edit Category
                                                        </button>
                                                        <div className="h-[1px] bg-gray-50 mx-2" />
                                                        <button className="flex items-center gap-3 w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer" onClick={() => handleDelete(category.id)}>
                                                            <Trash2 size={14} /> Delete Category
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
                                    <td colSpan="6" className="text-center py-32 text-[var(--text-muted)] italic">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                             <Layers size={64} strokeWidth={1} />
                                             <p className="font-black uppercase tracking-[0.3em] text-[10px]">No categories found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9000] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface-color)] shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in border border-indigo-500/10 text-[var(--text-dark)] rounded-[3rem]">
                        <div className="p-10 border-b border-indigo-500/10 flex justify-between items-center bg-[var(--surface-color)]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                                    <ShieldPlus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">{modalMode === 'add' ? 'Add New Category' : 'Edit Category'}</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1 opacity-70">Category Management</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer text-[var(--text-muted)]">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-10">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1 block italic opacity-70 border-l-2 border-indigo-500 pl-2">Category Name *</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full p-5 rounded-[1.5rem] font-black uppercase tracking-tight text-sm bg-indigo-500/5 border border-indigo-500/10 text-[var(--text-dark)] focus:bg-indigo-500/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-inner" 
                                        placeholder="EX: BUSINESS_LOANS"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1 block italic opacity-70 border-l-2 border-indigo-500 pl-2">Category Status</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                                            formData.status === 'Active'
                                            ? 'bg-emerald-500/5 border-emerald-500 text-emerald-500 shadow-xl shadow-emerald-500/10' 
                                            : 'bg-white/5 border-indigo-500/10 text-[var(--text-muted)] hover:border-indigo-500/20 opacity-50 grayscale'
                                        }`}>
                                            <input type="radio" name="status" value="Active" checked={formData.status === 'Active'} onChange={handleInputChange} className="hidden" />
                                            <Activity size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                        </label>
                                        <label className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                                            formData.status === 'Inactive'
                                            ? 'bg-red-500/5 border-red-500 text-red-500 shadow-xl shadow-red-500/10' 
                                            : 'bg-white/5 border-indigo-500/10 text-[var(--text-muted)] hover:border-indigo-500/20 opacity-50 grayscale'
                                        }`}>
                                            <input type="radio" name="status" value="Inactive" checked={formData.status === 'Inactive'} onChange={handleInputChange} className="hidden" />
                                            <X size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Inactive</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-10 border-t border-indigo-500/10">
                                <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50" disabled={saving}>
                                    {saving ? <RefreshCcw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                    {saving ? 'Saving...' : (modalMode === 'add' ? 'Add Category' : 'Save Changes')}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 bg-transparent text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-gray-50 transition-all border-none cursor-pointer">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsCategory;
