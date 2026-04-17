import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, ArrowLeft, Save, Sparkles, Globe, Palette, Upload, Shield, Camera, AlertCircle, Info, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const PosterCreate = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [categories, setCategories] = useState([]);
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
        duration_days: 30,
        layout_config: {
            fields: [
                { id: 'logo', label: 'LOGO', x: 10, y: 10, width: 80, height: 80, type: 'image' },
                { id: 'business_name', label: 'BUSINESS NAME', x: 100, y: 30, fontSize: 24, type: 'text', color: '#000000' },
                { id: 'phone', label: 'CONTACT INFO', x: 100, y: 65, fontSize: 16, type: 'text', color: '#666666' }
            ]
        }
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/admin/poster-categories');
                if (data.success && data.data) {
                    setCategories(data.data.filter(c => c.status).map(c => ({ value: c.id, label: c.name.toUpperCase() })));
                }
            } catch (err) {
                console.error("Failed to fetch poster categories", err);
            }
        };
        fetchCategories();
    }, []);

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
        if (!formData.thumbnailFile) {
            setError('Visual asset is required');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'thumbnailFile') {
                data.append('thumbnail', formData[key]);
            } else if (key === 'layout_config') {
                data.append('layout_config', JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        setSubmitting(true);
        setError('');
        try {
            const res = await api.post('/admin/poster-management', data, {
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

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Create New Poster
                        <Sparkles className="text-amber-500 animate-pulse" size={24} />
                    </h2>
                    <p>Add a new marketing poster to the system</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={() => navigate('/posters')} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={16} /> Cancel Operation
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
                                        <Camera size={18} /> Poster Template Layout
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div 
                                        onClick={() => !previewUrl && fileInputRef.current?.click()}
                                        className="relative aspect-[3/4] rounded-3xl bg-[var(--bg-color)] border-2 border-dashed border-[var(--border-color)] overflow-hidden group cursor-pointer hover:border-indigo-500 transition-all shadow-inner"
                                    >
                                        {previewUrl ? (
                                            <div className="relative w-full h-full">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                
                                                {/* Field Overlays for Mapping */}
                                                {formData.layout_config.fields.map((field, idx) => (
                                                    <div 
                                                        key={field.id}
                                                        className="absolute border-2 border-indigo-500 bg-indigo-500/20 rounded flex items-center justify-center text-[8px] font-black text-white shadow-lg cursor-move"
                                                        style={{ 
                                                            left: `${field.x}%`, 
                                                            top: `${field.y}%`,
                                                            width: field.type === 'image' ? '15%' : 'auto',
                                                            padding: '2px 6px',
                                                            zIndex: 10
                                                        }}
                                                    >
                                                        {field.label}
                                                    </div>
                                                ))}

                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-[20]">
                                                    <button 
                                                        type="button" 
                                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                                                        className="text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600 px-4 py-2 rounded-xl"
                                                    >
                                                        Change Asset
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
                                                <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                                                    <Upload size={32} />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-center px-6 leading-relaxed">Upload Background To Start Layering</p>
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </div>
                                    <div className="mt-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                        <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 block">Position Elements (%)</label>
                                        <div className="space-y-4">
                                            {formData.layout_config.fields.map((field, index) => (
                                                <div key={field.id} className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase">{field.label} X</span>
                                                        <input 
                                                            type="number" 
                                                            value={field.x} 
                                                            onChange={(e) => {
                                                                const newFields = [...formData.layout_config.fields];
                                                                newFields[index].x = parseInt(e.target.value);
                                                                setFormData(prev => ({ ...prev, layout_config: { ...prev.layout_config, fields: newFields } }));
                                                            }}
                                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-1.5 text-[10px] font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase">{field.label} Y</span>
                                                        <input 
                                                            type="number" 
                                                            value={field.y} 
                                                            onChange={(e) => {
                                                                const newFields = [...formData.layout_config.fields];
                                                                newFields[index].y = parseInt(e.target.value);
                                                                setFormData(prev => ({ ...prev, layout_config: { ...prev.layout_config, fields: newFields } }));
                                                            }}
                                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-1.5 text-[10px] font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden h-full">
                                <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                                    <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-3 text-indigo-500">
                                        <Layers size={20} /> Poster Configuration
                                    </h3>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Poster Title</label>
                                        <input 
                                            type="text" name="title" value={formData.title} onChange={handleChange}
                                            placeholder="Enter descriptive title..."
                                            className="w-full px-6 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                            required 
                                        />
                                    </div>

                                    <CustomSelect
                                        label="Category"
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        options={categories}
                                        required
                                    />

                                    <CustomSelect
                                        label="Language"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        options={LANGUAGES}
                                        required
                                    />

                                    <CustomSelect
                                        label="Access Type"
                                        name="is_premium"
                                        value={formData.is_premium}
                                        onChange={handleChange}
                                        options={ACCESS_TYPES}
                                        required
                                    />

                                    <CustomSelect
                                        label="Publishing Status"
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
                                    Create Poster
                                </>
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/posters')}
                            className="px-10 py-5 bg-[var(--bg-color)] text-[var(--text-muted)] font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PosterCreate;
