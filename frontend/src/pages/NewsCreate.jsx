import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    ArrowLeft, 
    Save, 
    Image as ImageIcon, 
    FileText, 
    Share2, 
    Globe, 
    Activity, 
    Calendar,
    ChevronRight,
    Sparkles,
    Newspaper
} from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const NewsCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category_id: '',
        publish_date: '',
        status: 'Publish',
        is_push_notification: false,
        imageFile: null
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/admin/news-categories');
                if (data.success) {
                    const activeCats = data.data.filter(c => c.status);
                    setCategories(activeCats);
                    if (activeCats.length > 0) {
                        setFormData(prev => ({ ...prev, category_id: activeCats[0].id }));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, imageFile: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('category_id', formData.category_id);
            if (formData.publish_date) data.append('publish_date', new Date(formData.publish_date).toISOString());
            data.append('status', formData.status);
            data.append('is_push_notification', formData.is_push_notification);
            if (formData.imageFile) {
                data.append('image', formData.imageFile);
            }

            const res = await api.post('/admin/news', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Article broadcasted successfully to the digital grid.' });
                setTimeout(() => navigate('/news'), 1500);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Broadcast failed. Check matrix connectivity.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content animate-fade-in pb-20">
            {/* Breadcrumbs / Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => navigate('/news')}
                        className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-dark)] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all shadow-sm active:scale-95 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-1">
                            Bulletin Matrix <ChevronRight size={10} /> Compose Node
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-dark)] tracking-tight flex items-center gap-3">
                            New Bulletin <Sparkles className="text-indigo-500" size={24} />
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/news')}
                        className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-all bg-transparent border-none cursor-pointer"
                    >
                        Discard Draft
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn btn-primary px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Transmitting...' : <><Save size={16} /> Authorize Broadcast</>}
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`mb-8 p-5 rounded-2.5xl flex items-center gap-4 animate-slide-up border ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.type === 'error' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                        <Activity size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column - Core Content */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-10">
                        <div className="flex items-center gap-5 mb-10 border-b border-[var(--border-color)] pb-8">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/10 shadow-inner">
                                <FileText size={26} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">Primary Parameters</h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">Specify the core identity of the news bulletin</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Visual Asset Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2 italic">Featured Visual Identity</label>
                                <div 
                                    onClick={() => document.getElementById('news-image-input').click()}
                                    className="relative group cursor-pointer w-full aspect-[21/9] rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-color)]/30 hover:bg-indigo-500/[0.02] hover:border-indigo-500/50 transition-all overflow-hidden flex flex-col items-center justify-center gap-4 group shadow-inner"
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <div className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                                                    <Plus size={16} /> Replace Asset
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 rounded-2.5xl bg-indigo-500/5 text-indigo-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-all border border-indigo-500/5 shadow-sm">
                                                <ImageIcon size={32} />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-dark)] group-hover:text-indigo-500 transition-colors">Select Bulletin Image</div>
                                                <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-60 italic">Recommended Aspect Ratio: 21:9</div>
                                            </div>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        id="news-image-input" 
                                        hidden 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5 md:col-span-2">
                                    <input 
                                        className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[13px] font-bold text-[var(--text-dark)] focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/30 uppercase tracking-tight shadow-sm"
                                        placeholder="ENTER ARTICLE HEADLINE..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2 italic">Bulletin Content</label>
                                    <textarea 
                                        className="w-full px-6 py-4 rounded-3xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[13px] font-bold text-[var(--text-dark)] focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-muted)]/30 min-h-[200px] resize-none shadow-sm"
                                        placeholder="COMPOSE BULLETIN CONTENT HERE..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        required
                                    />
                                </div>

                                <CustomSelect 
                                    label="Classification Matrix"
                                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="md:col-span-1"
                                    required
                                />

                                <div className="space-y-1.5 md:col-span-1">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2 italic">Temporal Schedule</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[12px] font-bold text-[var(--text-dark)] focus:border-indigo-500 outline-none transition-all uppercase tracking-widest shadow-sm"
                                        value={formData.publish_date}
                                        onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Secondary Controls */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-8">
                        <div className="flex items-center gap-4 mb-8 border-b border-[var(--border-color)] pb-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/10">
                                <Share2 size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">Deployment</h3>
                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">Broadcast configuration</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <CustomSelect 
                                label="Broadcast Protocol"
                                options={[
                                    { value: 'Publish', label: 'LIVE_BROADCAST' },
                                    { value: 'Draft', label: 'DRAFT_NODE' }
                                ]}
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                required
                            />

                            <div className="p-6 bg-indigo-500/[0.03] rounded-3xl border border-indigo-500/10 relative group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center border border-indigo-500/10">
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-0.5 leading-none">Global Pulse</div>
                                            <div className="text-[11px] font-black uppercase text-[var(--text-dark)]">Live State</div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${formData.status === 'Publish' ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                         onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'Publish' ? 'Draft' : 'Publish' }))}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.status === 'Publish' ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed opacity-60 italic">
                                    Enabling live state will synchronize this bulletin across all platform interfaces immediately upon authorization.
                                </p>
                            </div>

                            <div className="p-6 bg-emerald-500/[0.03] rounded-3xl border border-emerald-500/10 relative group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center border border-emerald-500/10">
                                            <Newspaper size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-0.5 leading-none">Broadcast</div>
                                            <div className="text-[11px] font-black uppercase text-[var(--text-dark)]">Push Alert</div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${formData.is_push_notification ? 'bg-emerald-600' : 'bg-gray-200'}`}
                                         onClick={() => setFormData(prev => ({ ...prev, is_push_notification: !prev.is_push_notification }))}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.is_push_notification ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed opacity-60 italic">
                                    Trigger a direct push notification alert to all active service providers (Vendors) upon deployment.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] px-2 italic">
                                    <span>Signal Integrity</span>
                                    <span className="text-emerald-500 flex items-center gap-1"><Activity size={10} /> Optimal</span>
                                </div>
                                <div className="w-full bg-[var(--bg-color)] h-1.5 rounded-full overflow-hidden shadow-inner">
                                    <div className="w-full bg-emerald-500 h-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-8 relative group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
                        <div className="relative">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-4 flex items-center gap-2 italic">
                                <Calendar size={14} /> Historical Context
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <div className="text-[10px] font-black uppercase tracking-tight text-[var(--text-dark)]">Protocol Initialized</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-30"></div>
                                    <div className="text-[10px] font-black uppercase tracking-tight text-[var(--text-muted)] line-through">Signal Broadcasted</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-30"></div>
                                    <div className="text-[10px] font-black uppercase tracking-tight text-[var(--text-muted)] line-through">Matrix Synchronized</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewsCreate;
