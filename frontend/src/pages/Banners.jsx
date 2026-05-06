import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Layout, Plus } from 'lucide-react';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';
import DeferredSectionLoader from '../components/DeferredSectionLoader';

const BannerListSection = lazy(() => import('../components/banners/BannerListSection'));
const BannerFormModal = lazy(() => import('../components/banners/BannerFormModal'));

const createInitialFormData = () => ({
    title: '',
    image: '',
    link: '',
    type: 'promotional',
    placement: 'home',
    start_date: '',
    end_date: '',
    is_active: true
});

const Banners = () => {
    const { confirm } = useConfirm();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentBanner, setCurrentBanner] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(createInitialFormData());

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/banners');
            if (data.success && Array.isArray(data.data)) {
                setBanners(data.data);
            } else {
                setBanners([]);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleOpenAddModal = () => {
        setModalMode('add');
        setFormData(createInitialFormData());
        setCurrentBanner(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (banner) => {
        setModalMode('edit');
        setCurrentBanner(banner);

        const formatDateForInput = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
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
        const confirmed = await confirm(
            'Are you sure you want to permanently delete this banner?',
            'Delete Banner'
        );
        if (!confirmed) return;

        try {
            const { data } = await api.delete(`/admin/banners/${id}`);
            if (data.success) {
                fetchBanners();
                toast.success('Banner deleted successfully.');
            } else {
                toast.error(data.message || 'Error deleting banner.');
            }
        } catch (error) {
            console.error('Delete banner error:', error);
            toast.error('Failed to delete banner. Please try again.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            const payload = { ...formData };
            if (!payload.start_date) payload.start_date = null;
            if (!payload.end_date) payload.end_date = null;

            const request = modalMode === 'add'
                ? api.post('/admin/banners', payload)
                : api.put(`/admin/banners/${currentBanner.id}`, payload);

            const { data } = await request;
            if (data.success) {
                setIsModalOpen(false);
                fetchBanners();
                toast.success(`Banner ${modalMode === 'add' ? 'added' : 'updated'} successfully.`);
            } else {
                toast.error(data.message || `Failed to ${modalMode} banner.`);
            }
        } catch (error) {
            console.error('Banner form submission error:', error);
            toast.error('Error: Could not save banner. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3 font-black uppercase tracking-tight">
                        Marketing Banners
                        <Layout className="text-indigo-600" size={24} />
                    </h2>
                    <p>Manage and track promotional banners across the platform</p>
                </div>
                <div className="pageHeaderActions">
                    <button className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center gap-3 font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl transition-all active:scale-95 border-none cursor-pointer" onClick={handleOpenAddModal}>
                        <Plus size={18} /> Add New Banner
                    </button>
                </div>
            </div>

            <Suspense fallback={<DeferredSectionLoader label="Loading banner dashboard..." />}>
                <BannerListSection
                    banners={banners}
                    loading={loading}
                    onDelete={handleDelete}
                    onEdit={handleOpenEditModal}
                />
            </Suspense>

            {isModalOpen && (
                <Suspense fallback={<div className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[9000] flex items-center justify-center p-6"><DeferredSectionLoader label="Loading banner editor..." /></div>}>
                    <BannerFormModal
                        formData={formData}
                        modalMode={modalMode}
                        onChange={handleInputChange}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleSubmit}
                        saving={saving}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default Banners;
