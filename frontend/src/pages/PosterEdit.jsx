import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, Save, Sparkles, Globe, Palette, Upload, Shield, Camera, AlertCircle, Info, Calendar } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const POSTER_STATUSES = [
    { value: 'Published', label: 'PUBLISHED' },
    { value: 'Draft', label: 'DRAFT' },
    { value: 'Archived', label: 'ARCHIVED' }
];

const LANGUAGES = [
    { value: 'English', label: 'ENGLISH' },
    { value: 'Hindi', label: 'HINDI' },
    { value: 'Both', label: 'MULTILINGUAL' }
];

const ACCESS_TYPES = [
    { value: false, label: 'COMPLIMENTARY' },
    { value: true, label: 'PREMIUM TIER' }
];

const PosterEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category_id: '',
        language: 'English',
        is_premium: false,
        status: 'Published',
        thumbnailFile: null,
        duration_days: 30
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoryRes, posterRes] = await Promise.all([
                    api.get('/admin/poster-categories'),
                    api.get('/admin/poster-management')
                ]);

                if (categoryRes.data.success) {
                    setCategories(categoryRes.data.data.filter(c => c.status).map(c => ({ value: c.id, label: c.name.toUpperCase() })));
                }

                if (posterRes.data.success) {
                    const poster = posterRes.data.data.find(p => p.id === parseInt(id));
                    if (poster) {
                        setFormData({
                            title: poster.title,
                            category_id: poster.category_id,
                            language: poster.language || 'English',
                            is_premium: poster.is_premium,
                            status: poster.status,
                            duration_days: poster.duration_days || 30,
                            thumbnailFile: null
                        });
                        if (poster.thumbnail) {
                            const thumbUrl = poster.thumbnail.startsWith('http') 
                                ? poster.thumbnail 
                                : `${api.defaults.baseURL.replace('/api', '')}${poster.thumbnail}`;
                            setPreviewUrl(thumbUrl);
                        }
                    } else {
                        setError('Visual asset not found');
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError('Failed to synchronize data');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (value === 'true' || value === 'false' ? value === 'true' : value)
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, thumbnailFile: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'thumbnailFile') {
                if (formData[key]) data.append('thumbnail', formData[key]);
            } else {
                data.append(key, formData[key]);
            }
        });

        setSubmitting(true);
        setError('');
        try {
            const res = await api.put(`/admin/poster-management/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                navigate('/posters');
            } else {
                setError(res.data.message || 'Transmission failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server connection error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Refine Visual Asset
                        <Sparkles className="text-amber-500 animate-pulse" size={24} />
                    </h2>
                    <p>Modify configuration parameters for asset #{id}</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={() => navigate('/posters')} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={16} /> Abort Operation
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-4 text-xs font-black uppercase tracking-widest italic animate-shake">
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Asset Preview / Upload */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                                <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                                    <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-3 text-indigo-500">
                                        <Camera size={18} /> Visual Output
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative aspect-[3/4] rounded-3xl bg-[var(--bg-color)] border-2 border-dashed border-[var(--border-color)] overflow-hidden group cursor-pointer hover:border-indigo-500 transition-all shadow-inner"
                                    >
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600 px-4 py-2 rounded-xl">Replace Asset</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
                                                <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                                                    <Upload size={32} />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-center px-6 leading-relaxed">Drop Visual Artifact Or Click To Browse</p>
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </div>
                                    <div className="mt-4 flex items-center gap-3 px-2 py-3 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                                        <Info size={14} className="text-amber-500" />
                                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Dimensions: 1080x1440 Recommended</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden h-full">
                                <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                                    <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-3 text-indigo-500">
                                        <Layers size={20} /> Matrix Configuration
                                    </h3>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Asset Identity (Title)</label>
                                        <input 
                                            type="text" name="title" value={formData.title} onChange={handleChange}
                                            placeholder="Enter descriptive title..."
                                            className="w-full px-6 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                            required 
                                        />
                                    </div>

                                    <CustomSelect
                                        label="Classification Tier"
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        options={categories}
                                        required
                                    />

                                    <CustomSelect
                                        label="Linguistic Node"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        options={LANGUAGES}
                                        required
                                    />

                                    <CustomSelect
                                        label="Access Protocol"
                                        name="is_premium"
                                        value={formData.is_premium}
                                        onChange={handleChange}
                                        options={ACCESS_TYPES}
                                        required
                                    />

                                    <CustomSelect
                                        label="Broadcast Status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        options={POSTER_STATUSES}
                                        required
                                    />

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 flex items-center gap-2">
                                            Validity Duration (Days)
                                            <Calendar size={12} className="text-indigo-500" />
                                        </label>
                                        <input 
                                            type="number" name="duration_days" value={formData.duration_days} onChange={handleChange}
                                            placeholder="30"
                                            className="w-full px-6 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                            required 
                                        />
                                        <p className="text-[9px] text-[var(--text-muted)] font-medium mt-1 px-1 italic">Generated posters will be archived after this duration.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-col md:flex-row gap-4 pt-6 pb-12">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Push Modifications
                                </>
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/posters')}
                            className="px-10 py-5 bg-[var(--bg-color)] text-[var(--text-muted)] font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                        >
                            Abort
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PosterEdit;
