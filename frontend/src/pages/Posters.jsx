import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Palette, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';
import DeferredSectionLoader from '../components/DeferredSectionLoader';

const PosterListSection = lazy(() => import('../components/posters/PosterListSection'));

const Posters = () => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [posters, setPosters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openActionId, setOpenActionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [categoryResponse, posterResponse] = await Promise.all([
                    api.get('/admin/poster-categories'),
                    api.get('/admin/poster-management')
                ]);
                if (categoryResponse.data.success) setCategories(Array.isArray(categoryResponse.data.data) ? categoryResponse.data.data : []);
                if (posterResponse.data.success) setPosters(Array.isArray(posterResponse.data.data) ? posterResponse.data.data : []);
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = await confirm(
            'Are you sure you want to delete this poster? This action cannot be undone.',
            'Delete Poster'
        );

        if (!confirmed) return;

        try {
            const { data } = await api.delete(`/admin/poster-management/${id}`);
            if (data.success) {
                setPosters((prev) => prev.filter((poster) => poster.id !== id));
                toast.success('Poster deleted successfully.');
            }
        } catch (error) {
            toast.error('Failed to delete poster.');
            console.error('Delete error:', error);
        } finally {
            setOpenActionId(null);
        }
    };

    const filtered = (Array.isArray(posters) ? posters : []).filter((poster) =>
        (poster?.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        ((Array.isArray(categories) ? categories : []).find((category) => category.id === poster?.category_id)?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Posters
                        <Palette className="text-indigo-500" size={24} />
                    </h2>
                    <p>Manage and organize visual posters for the application</p>
                </div>
                <div className="pageHeaderActions">
                    <button
                        className="btn btn-primary flex items-center gap-2 font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/20"
                        onClick={() => navigate('/posters/create')}
                    >
                        <Plus size={16} /> Add Poster
                    </button>
                </div>
            </div>

            <Suspense fallback={<DeferredSectionLoader label="Loading poster workspace..." />}>
                <PosterListSection
                    categories={categories}
                    filtered={filtered}
                    handleDelete={handleDelete}
                    loading={loading}
                    navigate={navigate}
                    openActionId={openActionId}
                    posters={posters}
                    searchTerm={searchTerm}
                    setOpenActionId={setOpenActionId}
                    setSearchTerm={setSearchTerm}
                />
            </Suspense>
        </div>
    );
};

export default Posters;
