import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Plus } from 'lucide-react';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';
import DeferredSectionLoader from '../components/DeferredSectionLoader';

const NewsTableSection = lazy(() => import('../components/news/NewsTableSection'));

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
        } catch (error) {
            console.error('Failed to fetch news', error);
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
                setNewsList((prev) => prev.filter((news) => news.id !== id));
                toast.success('Article deleted successfully.');
            }
        } catch (error) {
            toast.error('Failed to delete the article.');
        } finally {
            setOpenActionId(null);
        }
    };

    const formatDate = (dateString, includeTime = true) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'INVALID';

        const options = includeTime
            ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }
            : { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };

        return date.toLocaleDateString('en-US', options).toUpperCase();
    };

    const filteredNews = newsList.filter((news) =>
        (news.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (news.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredNews.length / entries) || 1;
    const paginatedNews = filteredNews.slice((currentPage - 1) * entries, currentPage * entries);

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
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

            <Suspense fallback={<DeferredSectionLoader label="Loading article workspace..." />}>
                <NewsTableSection
                    currentPage={currentPage}
                    entries={entries}
                    filteredNews={filteredNews}
                    formatDate={formatDate}
                    handleDelete={handleDelete}
                    loading={loading}
                    navigate={navigate}
                    newsList={newsList}
                    openActionId={openActionId}
                    paginatedNews={paginatedNews}
                    searchTerm={searchTerm}
                    setCurrentPage={setCurrentPage}
                    setEntries={setEntries}
                    setOpenActionId={setOpenActionId}
                    setSearchTerm={setSearchTerm}
                    totalPages={totalPages}
                />
            </Suspense>
        </div>
    );
};

export default News;
