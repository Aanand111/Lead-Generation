import React, { useState, useEffect } from 'react';
import { MoreVertical, X, Plus, Search, Check, AlertCircle, Trash2, Edit2, Newspaper, Calendar, Clock, Activity, Sparkles, RefreshCcw, Layers, Globe } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const NewsCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', status: true, created_at: '' });
    const [saving, setSaving] = useState(false);

    // Pagination and search
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/news-categories');
            if (data.success && data.data) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch news categories", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAction = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setIsEditMode(true);
            setCurrentCategory({
                ...category,
                status: category.status === true || category.status === 'Active' || category.status === 1
            });
        } else {
            setIsEditMode(false);
            setCurrentCategory({ id: null, name: '', status: true, created_at: '' });
        }
        setIsModalOpen(true);
        setOpenActionId(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCategory({ id: null, name: '', status: true, created_at: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: currentCategory.name,
                status: currentCategory.status,
                created_at: currentCategory.created_at || undefined
            };

            const promise = isEditMode
                ? api.put(`/admin/news-categories/${currentCategory.id}`, payload)
                : api.post('/admin/news-categories', payload);

            const { data } = await promise;
            if (data.success) {
                fetchCategories();
                handleCloseModal();
            } else {
                alert(data.message || 'Error saving category');
            }
        } catch (err) {
            console.error("Failed to save", err);
            alert("Error saving category");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const { data } = await api.delete(`/admin/news-categories/${id}`);
                if (data.success) {
                    setCategories(categories.filter(c => c.id !== id));
                    setOpenActionId(null);
                }
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Failed to delete category.");
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

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / entries) || 1;
    const paginatedCategories = filteredCategories.slice((currentPage - 1) * entries, currentPage * entries);

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3 italic font-black uppercase tracking-tight">
                        Editorial Taxonomy Matrix
                        <Newspaper size={24} className="text-indigo-600 animate-pulse" />
                    </h2>
                    <p>Orchestrate global media flow and classify editorial signals across platform segments</p>
                </div>
                <div className="pageHeaderActions">
                    <button className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl transition-all active:scale-95" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Initialize Segment
                    </button>
                </div>
            </div>

            {/* Matrix View Container */}
            <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] mt-10">
                <div className="p-8 border-b border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--bg-color)]/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-600">
                            <Globe size={18} />
                        </div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Signal Density: <span className="text-[var(--text-dark)] not-italic font-black ml-2 px-3 py-1 bg-[var(--surface-color)] rounded-lg shadow-inner">{filteredCategories.length} Units</span></div>
                        <div className="h-4 w-px bg-[var(--border-color)] mx-2"></div>
                        <CustomSelect
                            className="min-w-[120px]"
                            value={entries}
                            onChange={(e) => { setEntries(parseInt(e.target.value)); setCurrentPage(1); }}
                            variant="compact"
                            options={[
                                { value: 10, label: '10 SPECTRA' },
                                { value: 25, label: '25 SPECTRA' },
                                { value: 50, label: '50 SPECTRA' }
                            ]}
                        />
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-tight shadow-inner focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-[var(--text-muted)]/40"
                            placeholder="TRACE TAXONOMY BY LABEL..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-[#f9fafb]">
                            <tr>
                                <th className="w-20 text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">RANK</th>
                                <th className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">DOMAIN SEGMENT</th>
                                <th className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">EDITORIAL PROTOCOL</th>
                                <th className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">INITIALIZED</th>
                                <th className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">SYNC STATUS</th>
                                <th className="text-right text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest px-10">OPS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-32">
                                    <div className="flex flex-col items-center gap-5">
                                        <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] animate-pulse italic">Synchronizing Media Taxonomies...</span>
                                    </div>
                                </td></tr>
                            ) : paginatedCategories.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-32 text-[var(--text-muted)] italic">
                                    <div className="flex flex-col items-center gap-5 opacity-20">
                                        <Newspaper size={64} strokeWidth={1} />
                                        <p className="font-black uppercase tracking-[0.4em] text-[10px]">No news signals detected in current spectrum</p>
                                    </div>
                                </td></tr>
                            ) : (
                                paginatedCategories.map((category, index) => (
                                    <tr key={category.id} className="transition-all hover:bg-indigo-600/[0.02] group border-b border-[var(--border-color)] last:border-0 text-xs text-[var(--text-dark)]">
                                        <td className="text-center text-[var(--text-muted)] font-mono font-black italic">#{((currentPage - 1) * entries + index + 1).toString().padStart(3, '0')}</td>
                                        <td>
                                            <div className="font-black text-[var(--text-dark)] uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{category.name}</div>
                                            <div className="text-[9px] text-indigo-500 font-bold uppercase tracking-[0.2em] mt-1 italic flex items-center gap-2">
                                                <Sparkles size={10} /> Editorial Feed Class
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${category.status ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 italic opacity-50'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${category.status ? 'bg-emerald-500 animate-pulse outline outline-2 outline-emerald-500/20' : 'bg-red-500 opacity-40'}`}></div>
                                                {category.status ? 'BROADCAST_LIVE' : 'SUSPENDED'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black italic uppercase">
                                                <Calendar size={12} className="opacity-30" /> {formatDate(category.created_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black italic uppercase">
                                                <Clock size={12} className="opacity-30" /> {formatDate(category.updated_at || category.created_at)}
                                            </div>
                                        </td>
                                        <td className="text-right px-10">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-indigo-600/10 hover:text-indigo-600 transition-all active:scale-90 border-none bg-transparent outline-none cursor-pointer text-[var(--text-muted)]"
                                                    onClick={() => toggleAction(category.id)}
                                                >
                                                    <MoreVertical size={20} />
                                                </button>
                                                {openActionId === category.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                        <div className="absolute right-0 mt-3 w-48 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] overflow-hidden animate-zoom-in origin-top-right ring-1 ring-black/5">
                                                            <button className="flex items-center gap-3 w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-dark)] hover:bg-indigo-500 hover:text-white transition-all border-none bg-transparent cursor-pointer" onClick={() => handleOpenModal(category)}>
                                                                <Edit2 size={16} /> Reconfigure
                                                            </button>
                                                            <div className="h-[1px] bg-[var(--border-color)] mx-2" />
                                                            <button className="flex items-center gap-3 w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border-none bg-transparent cursor-pointer" onClick={() => handleDelete(category.id)}>
                                                                <Trash2 size={16} /> Purge Segment
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Integration Statistics */}
                <div className="p-8 flex flex-wrap items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-color)]/20 shadow-inner">
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">
                        Classification Matrix: <span className="text-[var(--text-dark)] not-italic font-black">{(currentPage - 1) * entries + 1} - {Math.min(currentPage * entries, filteredCategories.length)}</span> of {filteredCategories.length} Intervals
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className={`px-5 py-3 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]' : 'hover:bg-indigo-500 hover:text-white active:scale-95 cursor-pointer shadow-sm'}`}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            Phase Back
                        </button>
                        <div className="px-5 py-3 font-black text-indigo-600 bg-[var(--surface-color)] rounded-xl text-xs shadow-xl shadow-indigo-100 ring-1 ring-indigo-100 scale-110 mx-2">
                            {currentPage}
                        </div>
                        <button
                            className={`px-5 py-3 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]' : 'hover:bg-indigo-500 hover:text-white active:scale-95 cursor-pointer shadow-sm'}`}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Phase Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Matrix Logic Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[9000] flex items-center justify-center p-4">
                    <div className="bg-[var(--surface-color)] shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in border border-[var(--border-color)] text-[var(--text-dark)] ring-1 ring-[var(--border-color)]">
                        <div className="p-10 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--surface-color)]">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-[1.5rem] bg-indigo-600 text-[var(--text-dark)] shadow-2xl shadow-indigo-200">
                                    <Layers size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-dark)] tracking-tight uppercase leading-none">{isEditMode ? 'Modify Content Cell' : 'Initialize Domain'}</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-2 italic opacity-60">Media Taxonomy Configuration Terminal</p>
                                </div>
                            </div>
                            <button onClick={handleCloseModal} className="w-14 h-14 rounded-3xl bg-[var(--surface-color)] shadow-sm border border-[var(--border-color)] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer text-gray-400 group">
                                <X size={24} className="group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-10">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-1 block border-l-4 border-indigo-600 pl-3">Subject Designation Protocol *</label>
                                    <input
                                        type="text"
                                        className="w-full p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] font-black uppercase tracking-tight text-sm text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-600/5 outline-none transition-all shadow-inner"
                                        value={currentCategory.name}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                        placeholder="EX: TECH_METRIC_FLUX"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-1 block border-l-4 border-indigo-600 pl-3">Broadcast Protocol</label>
                                        <CustomSelect
                                            value={currentCategory.status ? 'true' : 'false'}
                                            onChange={(e) => setCurrentCategory({ ...currentCategory, status: e.target.value === 'true' })}
                                            options={[
                                                { value: 'true', label: 'ENABLE_FEED' },
                                                { value: 'false', label: 'RESTRICT_SIGNAL' }
                                            ]}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-1 block border-l-4 border-indigo-600 pl-3">Initialization Clock</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] font-black uppercase tracking-tight text-[10px] text-[var(--text-dark)] focus:bg-[var(--surface-color)] focus:border-indigo-600 outline-none transition-all shadow-inner"
                                            value={currentCategory.created_at ? new Date(new Date(currentCategory.created_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                            onChange={(e) => setCurrentCategory({ ...currentCategory, created_at: new Date(e.target.value).toISOString() })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-5 pt-10 border-t border-gray-100">
                                <button type="submit" className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.3em] rounded-[2.5rem] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-5 transition-all active:scale-95 disabled:opacity-50" disabled={saving}>
                                    {saving ? <RefreshCcw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                    {saving ? 'SYNCHRONIZING FEED...' : (isEditMode ? 'COMMIT SEGMENT' : 'AUTHORIZE DOMAIN')}
                                </button>
                                <button type="button" onClick={handleCloseModal} className="w-full py-4 bg-transparent text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-gray-50 transition-all border-none cursor-pointer">Abort Operation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsCategory;
