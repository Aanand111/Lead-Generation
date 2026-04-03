import React, { useState, useEffect } from 'react';
import { Plus, X, Image as ImageIcon, Search, Check, AlertCircle, Trash2, Edit2, TrendingUp, Eye, MousePointer2, Settings2, Sparkles, RefreshCcw, Layout, Share2, Calendar, Activity, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const Banners = () => {
    console.log("Banners component rendering");
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentBanner, setCurrentBanner] = useState(null);
    const [saving, setSaving] = useState(false);

    const initialFormData = {
        title: '',
        image: '',
        link: '',
        type: 'promotional',
        placement: 'home',
        start_date: '',
        end_date: '',
        is_active: true
    };
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/banners');
            console.log("Banners fetched:", data);
            if (data.success && Array.isArray(data.data)) {
                setBanners(data.data);
            } else {
                console.warn("Banners data is not an array:", data.data);
                setBanners([]);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleOpenAddModal = () => {
        setModalMode('add');
        setFormData(initialFormData);
        setCurrentBanner(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (banner) => {
        setModalMode('edit');
        setCurrentBanner(banner);
        const formatDateForInput = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
        };

        setFormData({
            title: banner.title || '',
            image: banner.image || '',
            link: banner.link || '',
            type: banner.type || 'promotional',
            placement: banner.placement || 'home',
            start_date: formatDateForInput(banner.start_date),
            end_date: formatDateForInput(banner.end_date),
            is_active: !!banner.is_active
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            const { data } = await api.delete(`/admin/banners/${id}`);
            if (data.success) {
                fetchBanners();
            } else {
                alert(data.message || 'Failed to delete banner');
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            alert('Error deleting banner.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData };
            if (!payload.start_date) payload.start_date = null;
            if (!payload.end_date) payload.end_date = null;

            const promise = modalMode === 'add'
                ? api.post('/admin/banners', payload)
                : api.put(`/admin/banners/${currentBanner.id}`, payload);

            const { data } = await promise;
            if (data.success) {
                setIsModalOpen(false);
                fetchBanners();
            } else {
                alert(data.message || `Failed to ${modalMode} banner`);
            }
        } catch (error) {
            console.error(`Error saving banner:`, error);
            alert(`An error occurred while saving the banner.`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3 italic font-black uppercase tracking-tight">
                        Marketing Banners Matrix
                        <Layout className="text-indigo-600" size={24} />
                    </h2>
                    <p>Orchestrate and monitor high-impact visual campaigns across the platform spectrum</p>
                </div>
                <div className="pageHeaderActions">
                    <button className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center gap-3 font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl transition-all active:scale-95 border-none cursor-pointer" onClick={handleOpenAddModal}>
                        <Plus size={18} /> Compose Asset
                    </button>
                </div>
            </div>

            {/* Banner List Card */}
            <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] mt-10">
                <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/30">
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                            <TrendingUp size={16} />
                        </div>
                        Deployment Status: <span className="text-white not-italic font-black ml-1">{(banners?.length || 0)} Active Nodes</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-indigo-400 cursor-help shadow-inner">
                        <Settings2 size={18} />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="w-16 text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Node</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Visual Asset</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Identity & Spectrum</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Placement</th>
                                <th className="text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Engagement</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Visibility</th>
                                <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Flux Window</th>
                                <th className="text-right text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest px-10">Ops</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-32">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Creative Assets...</span>
                                    </div>
                                </td></tr>
                            ) : banners.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-32 text-[var(--text-muted)] italic">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <Layout size={64} strokeWidth={1} />
                                        <p className="font-black uppercase tracking-[0.3em] text-[10px]">No banner signals detected</p>
                                    </div>
                                </td></tr>
                            ) : (
                                (Array.isArray(banners) ? banners : []).map((banner, index) => {
                                    if (!banner) return null;
                                    return (
                                        <tr key={banner.id} className="transition-all hover:bg-white/[0.03] group border-b border-white/5 last:border-0 text-xs text-indigo-100/90">
                                            <td className="text-center text-indigo-400/50 font-mono font-black italic">#{(index + 1).toString().padStart(3, '0')}</td>
                                            <td>
                                                <div className="w-24 h-14 rounded-2xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center group/preview relative shadow-2xl transition-all group-hover:rotate-2">
                                                    {banner.image ? (
                                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform group-hover/preview:scale-110" />
                                                    ) : (
                                                        <ImageIcon size={20} className="text-gray-300 opacity-50" />
                                                    )}
                                                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Eye size={16} className="text-white" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="font-black text-[var(--text-dark)] uppercase tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1 max-w-[180px]">{banner.title}</div>
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-[0.1em] mt-1.5 border border-indigo-500/5 shadow-inner">
                                                    <Sparkles size={10} /> {banner.type}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-[10px] text-indigo-300/60 font-black uppercase italic tracking-tighter">
                                                    <Share2 size={12} className="opacity-30" />
                                                    <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{banner.placement}</span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-6">
                                                    <div className="text-center">
                                                        <div className="flex items-center gap-1.5 text-[var(--text-dark)] font-black text-sm">
                                                            <Eye size={12} className="text-blue-500" /> {banner.views || 0}
                                                        </div>
                                                        <div className="text-[8px] uppercase font-black text-gray-400 tracking-widest mt-0.5 opacity-60 italic">Views</div>
                                                    </div>
                                                    <div className="h-6 w-px bg-gray-100"></div>
                                                    <div className="text-center">
                                                        <div className="flex items-center gap-1.5 text-[var(--text-dark)] font-black text-sm">
                                                            <MousePointer2 size={12} className="text-emerald-500" /> {banner.clicks || 0}
                                                        </div>
                                                        <div className="text-[8px] uppercase font-black text-gray-400 tracking-widest mt-0.5 opacity-60 italic">Clicks</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${banner.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 italic opacity-50'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? 'bg-emerald-500 animate-pulse outline outline-2 outline-emerald-500/20' : 'bg-red-500'}`}></div>
                                                    {banner.is_active ? 'LIVE_SPECTRUM' : 'OFFLINE'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="text-[9px] text-[var(--text-muted)] space-y-1 font-black uppercase tracking-tighter italic">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></div>
                                                        {(() => {
                                                            const d = new Date(banner.start_date);
                                                            return !banner.start_date || isNaN(d.getTime()) ? 'IMMEDIATE' : d.toLocaleDateString();
                                                        })()}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/40"></div>
                                                        {(() => {
                                                            const d = new Date(banner.end_date);
                                                            return !banner.end_date || isNaN(d.getTime()) ? 'INDEFINITE' : d.toLocaleDateString();
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right px-10">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => handleOpenEditModal(banner)} className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-indigo-600/10 text-indigo-500 transition-all border-none bg-transparent cursor-pointer active:scale-90" title="Edit">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(banner.id)} className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-red-600/10 text-red-500 transition-all border-none bg-transparent cursor-pointer active:scale-90" title="Delete">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[9000] flex items-center justify-center p-6 overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-6xl relative animate-zoom-in">
                        {/* Header Section */}
                        <div className="flex items-center justify-between mb-10 px-2">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-[1.5rem] bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-none">
                                        {modalMode === 'add' ? 'Forge New Campaign' : 'Refine Marketing Unit'}
                                    </h2>
                                    <p className="text-indigo-400/60 font-medium text-sm mt-3 italic tracking-wide">Allocate a fresh visual asset to the global distribution spectrum</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] hover:bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[2px] transition-all flex items-center gap-4 group cursor-pointer">
                                <Plus size={16} className="rotate-45 group-hover:rotate-0 transition-transform" /> Abort Operation
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Primary Parameters */}
                            <div className="lg:col-span-2 bg-[var(--surface-color)] rounded-[3rem] p-12 border border-[var(--border-color)] backdrop-blur-xl space-y-12 shadow-2xl">
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                                        <Layout size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tighter">Primary Parameters</h3>
                                        <p className="text-[10px] text-indigo-400/50 font-black uppercase tracking-widest mt-1">Configure asset core identity and category nodes</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-[0.3em] ml-1 block">Campaign Label (Unique)</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-7 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[2rem] font-black uppercase tracking-tight text-sm text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all placeholder-[var(--text-muted)] shadow-inner" placeholder="EX: SUMMER_GALA_2024" required />
                                    </div>

                                    <CustomSelect
                                        label="Category Protocol"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        options={[
                                            { value: 'promotional', label: 'PROMOTIONAL SYNC' },
                                            { value: 'informational', label: 'INFORMATIONAL FEED' },
                                            { value: 'event', label: 'TEMPORAL EVENT' },
                                            { value: 'other', label: 'GENERIC SIGNAL' }
                                        ]}
                                    />

                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-[0.3em] ml-1 block">Interface Asset URL (CDN)</label>
                                        <div className="flex gap-6">
                                            <input type="text" name="image" value={formData.image} onChange={handleInputChange} className="flex-1 p-7 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[2rem] font-black uppercase tracking-tight text-xs text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all placeholder-[var(--text-muted)]" placeholder="HTTPS://SPECTRUM.CDN/CAMPAIGN.WEBP" required />
                                            <div className="w-24 h-24 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-color)] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xl">
                                                {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-indigo-500/20" />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-[0.3em] ml-1 block">Operational Destination</label>
                                        <input type="text" name="link" value={formData.link} onChange={handleInputChange} className="w-full p-7 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[2rem] font-black uppercase tracking-tight text-xs text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all placeholder-[var(--text-muted)]" placeholder="HTTPS://TARGET.PORTAL/ACTION" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Deployment Spectrum */}
                            <div className="space-y-8">
                                <div className="bg-[var(--surface-color)] rounded-[3rem] p-10 border border-[var(--border-color)] backdrop-blur-xl shadow-2xl">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg--500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                            <Share2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight">Deployment</h4>
                                            <p className="text-[9px] text-indigo-400/40 font-black uppercase tracking-widest mt-0.5">Coordinate Logic</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <CustomSelect
                                            label="Surface Node"
                                            name="placement"
                                            value={formData.placement}
                                            onChange={handleInputChange}
                                            options={[
                                                { value: 'home', label: 'PRIMARY_MAINFRAME' },
                                                { value: 'sidebar', label: 'LATERAL_SIDEBAR' },
                                                { value: 'footer', label: 'TERMINAL_FOOTER' },
                                                { value: 'popup', label: 'ENGAGEMENT_POPUP' }
                                            ]}
                                        />

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-widest ml-1 block">Activation Flux</label>
                                            <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.5rem] font-black uppercase tracking-tight text-[10px] text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all" />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-widest ml-1 block">Termination Cycle</label>
                                            <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleInputChange} className="w-full p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.5rem] font-black uppercase tracking-tight text-[10px] text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all" />
                                        </div>

                                        <div className="p-6 bg-[var(--bg-color)]/50 rounded-[2rem] border border-[var(--border-color)]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                                        <Activity size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-widest">Live State</div>
                                                        <div className="text-[8px] text-indigo-400/60 font-black uppercase mt-0.5 tracking-tight">Signal Broadcast</div>
                                                    </div>
                                                </div>
                                                <div className="relative inline-block w-14 h-7 rounded-full bg-[var(--border-color)] cursor-pointer overflow-hidden transition-all has-[:checked]:bg-emerald-500">
                                                    <input type="checkbox" id="is_active_modal" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="peer hidden" />
                                                    <label htmlFor="is_active_modal" className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-xl transition-all peer-checked:translate-x-7 cursor-pointer"></label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-sm tracking-[0.3em] rounded-[2.5rem] shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 mt-4 border-none cursor-pointer" disabled={saving}>
                                    {saving ? <RefreshCcw size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                                    {saving ? 'TRANSMITTING...' : (modalMode === 'add' ? 'Deploy Signal' : 'Commit Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banners;
