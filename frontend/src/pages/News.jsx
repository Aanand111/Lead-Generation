import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MoreVertical, 
    Plus, 
    Calendar, 
    Image as ImageIcon, 
    Search, 
    Activity, 
    Layers, 
    FileText, 
    Globe, 
    Tag, 
    Clock, 
    Share2, 
    Newspaper,
    Sparkles,
    Trash2,
    Edit2
} from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const News = () => {
    const navigate = useNavigate();
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/news');
            if (data.success && data.data) {
                setNewsList(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch news", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to purge this article node from the digital archives?')) return;
        try {
            const { data } = await api.delete(`/admin/news/${id}`);
            if (data.success) {
                setNewsList(prev => prev.filter(n => n.id !== id));
            }
        } catch (err) {
            console.error("Deletion sequence aborted.", err);
        } finally {
            setOpenActionId(null);
        }
    };

    const formatDate = (dateString, includeTime = true) => {
        if (!dateString) return 'IMMEDIATE';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'INVALID_TS';

        const options = includeTime
            ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }
            : { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };

        return date.toLocaleDateString('en-US', options).toUpperCase();
    };

    const filteredNews = newsList.filter(n =>
        (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredNews.length / entries) || 1;
    const paginatedNews = filteredNews.slice((currentPage - 1) * entries, currentPage * entries);

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3 font-black tracking-tight">
                        Global News Matrix
                        <Newspaper className="text-indigo-500" size={24} />
                    </h2>
                    <p className="text-sm opacity-60">Architecting platform-wide information broadcasts and spectral bulletins</p>
                </div>
                <div className="pageHeaderActions">
                    <button 
                        className="btn btn-primary px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/20"
                        onClick={() => navigate('/news/create')}
                    >
                        <Plus size={16} /> Compose Bulletin
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] mt-8">
                <div className="p-8 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-6 bg-[var(--bg-color)]/20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shadow-sm border border-indigo-500/10">
                                <Activity size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] leading-none mb-1">Information Flow</div>
                                <div className="text-sm font-black uppercase tracking-tight italic">{filteredNews.length} Signals Validated</div>
                            </div>
                        </div>
                        
                        <div className="h-10 w-px bg-[var(--border-color)] opacity-50 hidden md:block"></div>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Spectral Density</span>
                            <CustomSelect
                                variant="compact"
                                value={entries}
                                onChange={(e) => { setEntries(parseInt(e.target.value)); setCurrentPage(1); }}
                                options={[
                                    { value: 10, label: '10' },
                                    { value: 20, label: '20' },
                                    { value: 50, label: '50' }
                                ]}
                                className="min-w-[80px]"
                            />
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold shadow-inner focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/50 uppercase tracking-widest"
                            placeholder="TRACE SIGNAL BY TITLE OR CLASS..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr className="bg-[var(--bg-color)]/40 border-b border-[var(--border-color)]">
                                <th className="ps-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Protocol ID</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Visual Persona</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Bulletin Identification</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Classification</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] text-center">Broadcast State</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Spectral Cycle</th>
                                <th className="py-5 text-right pe-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] animate-pulse">Syncing Grid...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedNews.length > 0 ? (
                                paginatedNews.map((news, index) => (
                                    <tr key={news.id} className="transition-all hover:bg-indigo-500/[0.01] group border-b border-[var(--border-color)] last:border-0 uppercase tracking-tight">
                                        <td className="ps-8 py-6 text-[10px] font-black text-[var(--text-muted)] opacity-30 italic">#{((currentPage - 1) * entries + index + 1).toString().padStart(3, '0')}</td>
                                        <td className="py-6">
                                            <div className="w-16 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 overflow-hidden shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md flex items-center justify-center">
                                                {news.image ? (
                                                    <img 
                                                        src={news.image.startsWith('http') ? news.image : `${api.defaults.baseURL.replace('/api', '')}${news.image}`} 
                                                        alt={news.title} 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => { e.target.src = 'https://placehold.co/150?text=SIGNAL'; }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={14} className="text-indigo-500 opacity-50" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="font-black text-xs text-[var(--text-dark)] group-hover:text-indigo-500 transition-colors uppercase max-w-[240px] line-clamp-1">{news.title}</div>
                                            <div className="text-[9px] text-indigo-400 font-bold tracking-widest mt-0.5 opacity-60">X-ID: {news.id.toString().substring(0, 8)}</div>
                                        </td>
                                        <td className="py-6">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-tight border border-indigo-500/20">
                                                <Tag size={10} /> {news.category_name || 'UNCATEGORIZED'}
                                            </div>
                                        </td>
                                        <td className="py-6 text-center">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                news.status === 'Publish' || news.status === true ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 italic opacity-50'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${news.status === 'Publish' || news.status === true ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                {news.status === 'Publish' || news.status === true ? 'LIVE_SPECTRUM' : 'DRAFT_NODE'}
                                            </span>
                                        </td>
                                        <td className="py-6">
                                            <div className="space-y-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter">
                                                    <Globe size={10} className="text-indigo-500" /> {formatDate(news.publish_date, false)}
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-muted)] italic opacity-50 tracking-tighter">
                                                    <Clock size={10} /> RECD: {formatDate(news.created_at, true)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 text-right pe-8">
                                            <div className="relative inline-block text-left">
                                                <button 
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all border-none bg-transparent cursor-pointer" 
                                                    onClick={() => setOpenActionId(openActionId === news.id ? null : news.id)}
                                                >
                                                    <MoreVertical size={20} />
                                                </button>
                                                {openActionId === news.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-[100]" onClick={() => setOpenActionId(null)} />
                                                        <div className="absolute right-0 top-12 bg-[var(--surface-color)] shadow-2xl rounded-2xl border border-[var(--border-color)] z-[110] min-w-[200px] py-3 overflow-hidden animate-zoom-in origin-top-right backdrop-blur-xl">
                                                            <button 
                                                                className="w-full text-left px-5 py-3.5 text-[11px] font-black uppercase text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                                onClick={() => navigate(`/news/edit/${news.id}`)}
                                                            >
                                                                <Edit2 size={16} /> Refine Bulletin
                                                            </button>
                                                            <div className="h-px bg-[var(--border-color)] my-2 opacity-30"></div>
                                                            <button 
                                                                className="w-full text-left px-5 py-3.5 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                                onClick={() => handleDelete(news.id)}
                                                            >
                                                                <Trash2 size={16} /> Purge Article
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
                                    <td colSpan="7" className="text-center py-40 text-[var(--text-muted)]">
                                        <div className="flex flex-col items-center gap-8 opacity-20">
                                            <Newspaper size={100} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-[0.4em] text-xs">No Signal Emissions Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Matrix */}
                {filteredNews.length > entries && (
                    <div className="flex flex-wrap items-center justify-between gap-6 p-8 border-t border-[var(--border-color)] bg-[var(--bg-color)]/20">
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">
                            Showing <span className="text-indigo-500">{Math.min(currentPage * entries, filteredNews.length)}</span> of {filteredNews.length} signals
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className={`px-4 py-2 border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-indigo-500 hover:text-white hover:border-indigo-500 shadow-sm'}`}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Prev Phase
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={() => setCurrentPage(num)}
                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === num ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-transparent text-[var(--text-muted)] hover:text-indigo-500'}`}
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                className={`px-4 py-2 border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-indigo-500 hover:text-white hover:border-indigo-500 shadow-sm'}`}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next Phase
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
