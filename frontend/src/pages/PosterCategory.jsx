import React, { useState, useEffect } from 'react';
import { MoreVertical, Plus, Search, Check, X, Layers, Calendar, Trash2, Edit2, Palette, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';

const PosterCategory = () => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/poster-categories');
            if (data.success && data.data) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch poster categories", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm(
            'Are you sure you want to delete this category? This action cannot be undone.',
            'Delete Category'
        );
        if (confirmed) {
            try {
                const { data } = await api.delete(`/admin/poster-categories/${id}`);
                if (data.success) {
                    setCategories(categories.filter(c => c.id !== id));
                    toast.success('Category deleted successfully.');
                }
            } catch (err) {
                toast.error('Failed to delete category.');
                console.error("Failed to delete", err);
            } finally {
                setOpenActionId(null);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Poster Categories
                        <Palette className="text-indigo-500" size={24} />
                    </h2>
                    <p>Manage and organize categories for poster templates</p>
                </div>
                <div className="pageHeaderActions">
                    <button 
                        className="btn btn-primary flex items-center gap-2 font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/20" 
                        onClick={() => navigate('/posters/category/create')}
                    >
                        <Plus size={16} /> New Category
                    </button>
                </div>
            </div>

            {/* List Section */}
            <div className="max-w-6xl mx-auto">
                <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                    <div className="p-8 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <Activity size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] block leading-none mb-1">Status Overview</span>
                                <span className="text-sm font-black uppercase tracking-tight italic">{filtered.length} Categories active</span>
                            </div>
                        </div>

                        <div className="relative w-full md:w-80 group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-3 text-xs font-bold shadow-inner focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/50"
                                placeholder="SEARCH CATEGORIES..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr className="bg-[var(--bg-color)]/20 border-b border-[var(--border-color)]">
                                    <th className="ps-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">ID</th>
                                    <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Category Name</th>
                                    <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Status</th>
                                    <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Date Created</th>
                                    <th className="py-5 text-right pe-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-24">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length > 0 ? (
                                    filtered.map((category, index) => (
                                        <tr key={category.id} className="transition-all hover:bg-indigo-500/[0.01] group">
                                            <td className="ps-8 py-5 text-[10px] font-black text-[var(--text-muted)] opacity-30">#{(index + 1).toString().padStart(3, '0')}</td>
                                            <td className="py-5">
                                                <div className="font-black text-sm uppercase tracking-tight text-indigo-500 group-hover:translate-x-1 transition-transform">{category.name}</div>
                                            </td>
                                            <td className="py-5 text-center">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    category.status ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${category.status ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                                                    {category.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-5">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)]">
                                                    <Calendar size={14} className="opacity-50" />
                                                    {formatDate(category.created_at)}
                                                </div>
                                            </td>
                                            <td className="py-5 text-right pe-8">
                                                <div className="relative inline-block text-left">
                                                    <button 
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all border-none bg-transparent cursor-pointer" 
                                                        onClick={() => setOpenActionId(openActionId === category.id ? null : category.id)}
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>
                                                    {openActionId === category.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                            <div className="absolute right-0 top-12 bg-[var(--surface-color)] shadow-xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[180px] py-3 overflow-hidden animate-zoom-in origin-top-right">
                                                                <button 
                                                                    className="w-full text-left px-5 py-3 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                                    onClick={() => navigate(`/posters/category/edit/${category.id}`)}
                                                                >
                                                                    <Edit2 size={16} /> Edit Category
                                                                </button>
                                                                <div className="h-px bg-[var(--border-color)] my-2 opacity-50"></div>
                                                                <button 
                                                                    className="w-full text-left px-5 py-3 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                                    onClick={() => handleDelete(category.id)}
                                                                >
                                                                    <Trash2 size={16} /> Delete Category
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
                                        <td colSpan="5" className="text-center py-32 text-[var(--text-muted)]">
                                            <div className="flex flex-col items-center gap-6 opacity-30">
                                                <Palette size={80} strokeWidth={1} />
                                                <p className="font-black uppercase tracking-[0.2em] text-[10px]">No Categories found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PosterCategory;
