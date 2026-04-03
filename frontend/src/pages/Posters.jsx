import React, { useState, useEffect } from 'react';
import { MoreVertical, Plus, Search, Layers, Trash2, Edit2, Zap, Sparkles, Palette, Share2, Activity, Globe, Shield, Calendar, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Posters = () => {
    const navigate = useNavigate();
    const [posters, setPosters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [catRes, posterRes] = await Promise.all([
                    api.get('/admin/poster-categories'),
                    api.get('/admin/poster-management')
                ]);
                if (catRes.data.success) setCategories(Array.isArray(catRes.data.data) ? catRes.data.data : []);
                if (posterRes.data.success) setPosters(Array.isArray(posterRes.data.data) ? posterRes.data.data : []);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to retire this visual asset?')) {
            try {
                const { data } = await api.delete(`/admin/poster-management/${id}`);
                if (data.success) {
                    setPosters(posters.filter(p => p.id !== id));
                    setOpenActionId(null);
                }
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    };

    const filtered = (Array.isArray(posters) ? posters : []).filter(p =>
        (p?.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        ((Array.isArray(categories) ? categories : []).find(c => c.id === p?.category_id)?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Visual Assets
                        <Palette className="text-indigo-500" size={24} />
                    </h2>
                    <p>Manage and broadcast visual creative artifacts across the ecosystem</p>
                </div>
                <div className="pageHeaderActions">
                    <button
                        className="btn btn-primary flex items-center gap-2 font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/20"
                        onClick={() => navigate('/posters/create')}
                    >
                        <Plus size={16} /> Mint New Poster
                    </button>
                </div>
            </div>

            {/* List Section */}
            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                <div className="p-8 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <Activity size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] block leading-none mb-1">Asset Inventory</span>
                            <span className="text-sm font-black uppercase tracking-tight italic">{filtered.length} Artifacts Synchronized</span>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold shadow-inner focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/50"
                            placeholder="SCAN BY TITLE OR CATEGORY..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr className="bg-[var(--bg-color)]/20 border-b border-[var(--border-color)]">
                                <th className="ps-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Rank</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Visual Identity</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tier/Lang</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Protocols</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                                <th className="py-5 text-right pe-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Syncing Assets...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((poster) => (
                                    <tr key={poster.id} className="transition-all hover:bg-indigo-500/[0.01] group">
                                        <td className="ps-8 py-5 text-[10px] font-black text-[var(--text-muted)] opacity-30">#{poster.id}</td>
                                        <td className="py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl border-2 border-[var(--border-color)] overflow-hidden bg-[var(--bg-color)] shadow-sm group-hover:scale-110 transition-transform">
                                                    <img
                                                        src={poster.thumbnail?.startsWith('http') ? poster.thumbnail : `${api.defaults?.baseURL?.replace('/api', '') || ''}${poster.thumbnail || ''}`}
                                                        alt={poster.title || 'Asset'}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = 'https://placehold.co/150?text=ASSET'; }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-black text-sm uppercase tracking-tight text-indigo-500">{poster.title || 'Untitled'}</div>
                                                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest italic">{categories.find(c => c.id === poster.category_id)?.name || 'UNKNOWN TIER'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${poster.is_premium ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {poster.is_premium ? <Zap size={10} /> : <CheckCircle size={10} />}
                                                    {poster.is_premium ? 'PREMIUM' : 'COMPLIMENTARY'}
                                                </span>
                                                <span className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] opacity-60">
                                                    <Globe size={10} /> {poster.language || 'ENGLISH'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-xs font-bold text-[var(--text-muted)]">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="opacity-40" />
                                                    {poster.created_at ? new Date(poster.created_at).toLocaleDateString() : '—'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Share2 size={12} className="opacity-40" />
                                                    PROMPTED
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${poster.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${poster.status === 'Published' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                                                {poster.status}
                                            </span>
                                        </td>
                                        <td className="py-5 text-right pe-8">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all border-none bg-transparent cursor-pointer"
                                                    onClick={() => setOpenActionId(openActionId === poster.id ? null : poster.id)}
                                                >
                                                    <MoreVertical size={20} />
                                                </button>
                                                {openActionId === poster.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                        <div className="absolute right-0 top-12 bg-[var(--surface-color)] shadow-xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[180px] py-3 overflow-hidden animate-zoom-in origin-top-right">
                                                            <button
                                                                className="w-full text-left px-5 py-3 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                                onClick={() => navigate(`/posters/edit/${poster.id}`)}
                                                            >
                                                                <Edit2 size={16} /> Modify Asset
                                                            </button>
                                                            <div className="h-px bg-[var(--border-color)] my-2 opacity-50"></div>
                                                            <button
                                                                className="w-full text-left px-5 py-3 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                                onClick={() => handleDelete(poster.id)}
                                                            >
                                                                <Trash2 size={16} /> Retire Artifact
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
                                    <td colSpan="6" className="text-center py-32 text-[var(--text-muted)]">
                                        <div className="flex flex-col items-center gap-6 opacity-30">
                                            <Palette size={80} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">No Artifacts Synchronized</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Posters;
