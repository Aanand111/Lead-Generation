import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Plus, Calendar, Image as ImageIcon, Search, Activity, Layers, FileText, Globe, Tag, Clock, Share2, Newspaper, Sparkles, Trash2, Edit2 } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';

const News = () => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
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
        const confirmed = await confirm(
            'Are you sure you want to delete this article? This action cannot be undone.',
            'Delete Article'
        );
        if (!confirmed) return;
        try {
            const { data } = await api.delete(`/admin/news/${id}`);
            if (data.success) {
                setNewsList(prev => prev.filter(n => n.id !== id));
                toast.success('Article deleted successfully.');
            }
        } catch (err) {
            toast.error('Failed to delete the article.');
        } finally {
            setOpenActionId(null);
        }
    };

    const formatDate = (dateString, includeTime = true) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'INVALID';

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
                        Platform News
                        <Newspaper className="text-indigo-500" size={24} />
                    </h2>
                    <p className="text-sm opacity-60">Manage platform-wide news articles and updates for users</p>
                </div>
                <div className="pageHeaderActions">
                    <button 
                        className="btn btn-primary px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/20"
                        onClick={() => navigate('/news/create')}
                    >
                        <Plus size={16} /> Create Article
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] mt-8">
                <div className="p-8 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-6 bg-[var(--bg-color)]/20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-white border border-[var(--border-color)] shadow-xl shadow-indigo-100/10">
                              <Newspaper className="text-indigo-600" size={24} />
                         </div>
                         <div>
                              <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Platform Updates Monitor</div>
                              <div className="text-xs font-black text-indigo-600 uppercase tracking-tight leading-none mt-1">{newsList.length} Articles Total</div>
                         </div>
                     </div>
                        
                        <div className="h-10 w-px bg-[var(--border-color)] opacity-50 hidden md:block"></div>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Display Entries</span>
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
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr className="bg-[var(--bg-color)]/40 border-b border-[var(--border-color)]">
                                <th className="ps-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">#</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Thumbnail</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Article Title</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Category</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Status</th>
                                <th className="py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Dates</th>
                                <th className="py-5 text-right pe-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {loading ? (
                                <tr>
                                     <td colSpan="7" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] animate-pulse">Loading news...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedNews.length > 0 ? (
                                paginatedNews.map((news, index) => (
                                     <tr key={news.id} className="transition-all hover:bg-indigo-500/[0.01] group border-b border-[var(--border-color)] last:border-0 uppercase tracking-tight">
                                        <td className="ps-8 py-6 text-[10px] font-black text-[var(--text-muted)] opacity-30">#{((currentPage - 1) * entries + index + 1).toString().padStart(3, '0')}</td>
                                        <td className="py-6">
                                            <div className="w-16 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 overflow-hidden shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md flex items-center justify-center">
                                                 {news.image ? (
                                                    <img 
                                                        src={news.image.startsWith('http') ? news.image : `${import.meta.env.VITE_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000'}/${news.image?.replace(/^\//, '') || ''}`} 
                                                        alt={news.title} 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => { e.target.src = 'https://placehold.co/150?text=NO+THUMBNAIL'; }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={14} className="text-indigo-500 opacity-50" />
                                                )}
                                            </div>
                                        </td>
                                         <td className="py-6">
                                            <div className="font-black text-xs text-[var(--text-dark)] group-hover:text-indigo-500 transition-colors uppercase max-w-[240px] line-clamp-1">{news.title}</div>
                                            <div className="text-[9px] text-indigo-400 font-bold tracking-widest mt-0.5 opacity-60">ID: {news.id.toString().substring(0, 8)}</div>
                                        </td>
                                        <td className="py-6">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-tight border border-indigo-500/20">
                                                <Tag size={10} /> {news.category_name || 'UNCATEGORIZED'}
                                            </div>
                                        </td>
                                        <td className="py-6 text-center">
                                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                news.status === 'Publish' || news.status === true ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 opacity-50'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${news.status === 'Publish' || news.status === true ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                {news.status === 'Publish' || news.status === true ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                         <td className="py-6">
                                            <div className="space-y-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                 <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter">
                                                    <Globe size={10} className="text-indigo-500" /> Published: {formatDate(news.publish_date, false)}
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-muted)] opacity-50 tracking-tighter">
                                                    <Clock size={10} /> Created: {formatDate(news.created_at, true)}
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
                                                                <Edit2 size={16} /> Edit Article
                                                            </button>
                                                            <div className="h-px bg-[var(--border-color)] my-2 opacity-30"></div>
                                                             <button 
                                                                className="w-full text-left px-5 py-3.5 text-[11px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-4 border-none bg-transparent cursor-pointer"
                                                                onClick={() => handleDelete(news.id)}
                                                            >
                                                                <Trash2 size={16} /> Delete Article
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
                                            <p className="font-black uppercase tracking-[0.4em] text-xs">No news articles found</p>
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
                            Showing <span className="text-indigo-500">{Math.min(currentPage * entries, filteredNews.length)}</span> of {filteredNews.length} articles
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className={`px-4 py-2 border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-indigo-500 hover:text-white hover:border-indigo-500 shadow-sm'}`}
                                disabled={currentPage === 1}
                                 onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
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
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
