import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowLeft, Save, Image as ImageIcon, FileText, Share2, Globe, Activity, Calendar, ChevronRight, Sparkles, Trash2, MonitorIcon, TerminalIcon
} from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';

const NewsEdit = () => {
    const { confirm } = useConfirm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);

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
        const fetchData = async () => {
            try {
                const [catRes, newsRes] = await Promise.all([
                    api.get('/admin/news-categories'),
                    api.get(`/admin/news`) // Backend provides list, we filter for ID if single fetch isn't available
                ]);

                if (catRes.data.success) {
                    setCategories(catRes.data.data.filter(c => c.status));
                }

                if (newsRes.data.success) {
                    const article = newsRes.data.data.find(n => String(n.id) === String(id));
                    if (article) {
                        setFormData({
                            title: article.title || '',
                            content: article.content || '',
                            category_id: article.category_id || '',
                            publish_date: article.publish_date ? new Date(article.publish_date).toISOString().slice(0, 16) : '',
                            status: article.status === 'Publish' || article.status === true ? 'Publish' : 'Draft',
                            is_push_notification: article.is_push_notification || false,
                            imageFile: null
                        });
                        
                        // Handle image URL resolution
                        if (article.image) {
                            const imgPath = article.image.startsWith('http') 
                                ? article.image 
                                : `${api.defaults.baseURL.replace('/api', '')}${article.image}`;
                            setPreviewUrl(imgPath);
                        }
                    } else {
                        toast.error('Article node not found in archives.');
                    }
                }
            } catch (err) {
                toast.error('Synchronization failure.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, imageFile: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

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

            const res = await api.put(`/admin/news/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success('Article updated and synchronized successfully.');
                setTimeout(() => navigate('/news'), 1000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Sync update failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm(
            'This action will permanently purge this article node from the archives.',
            'Purge Article node'
        );
        if (!confirmed) return;
        try {
            const res = await api.delete(`/admin/news/${id}`);
            if (res.data.success) {
                toast.success('Article node purged.');
                navigate('/news');
            }
        } catch (err) {
            toast.error('Purge sequence failure.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] animate-pulse shadow-sm">Recalibrating Archives...</span>
            </div>
        );
    }

    return (
        <div className="page-content animate-fade-in pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => navigate('/news')}
                        className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-dark)] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all shadow-sm active:scale-95 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-1 italic">
                            Bulletin Matrix <ChevronRight size={10} className="not-italic" /> Refine Node
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-dark)] tracking-tight flex items-center gap-3 uppercase">
                            Refine Bulletin <Sparkles className="text-indigo-500 animate-pulse" size={24} />
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleDelete}
                        className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-95 group cursor-pointer"
                        title="Purge Node"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={saving}
                        className="btn btn-primary px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'Synchronizing...' : <><Save size={16} /> Update & Synchronize</>}
                    </button>
                </div>
            </div>


            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-10 relative">
                        <div className="flex items-center gap-5 mb-10 border-b border-[var(--border-color)] pb-8">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/10 shadow-inner">
                                <FileText size={26} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">Matrix Refinement</h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">Architectural modifications to bulletin parameters</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Visual Asset Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2 italic">Current Spectral Visual</label>
                                <div 
                                    onClick={() => document.getElementById('news-image-input-edit').click()}
                                    className="relative group cursor-pointer w-full aspect-[21/9] rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-color)]/30 hover:bg-indigo-500/[0.02] hover:border-indigo-500/50 transition-all overflow-hidden flex flex-col items-center justify-center gap-4 group shadow-inner"
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <div className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                                                    <Plus size={16} /> Re-Inject Asset
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 rounded-2.5xl bg-indigo-500/5 text-indigo-500/30 flex items-center justify-center transition-all border border-indigo-500/5 shadow-sm">
                                                <ImageIcon size={32} />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-dark)]">Empty Visual Slot</div>
                                            </div>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        id="news-image-input-edit" 
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

                <div className="lg:col-span-4 space-y-8">
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-8">
                        <div className="flex items-center gap-4 mb-8 border-b border-[var(--border-color)] pb-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/10">
                                <Share2 size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1">State Logic</h3>
                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">Synchronicity protocol</p>
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
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center border border-indigo-500/10 shadow-sm">
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-0.5 leading-none">Global Pulse</div>
                                            <div className="text-[11px] font-black uppercase text-[var(--text-dark)]">Live State</div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${formData.status === 'Publish' ? 'bg-indigo-600' : 'bg-gray-200 shadow-inner'}`}
                                         onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'Publish' ? 'Draft' : 'Publish' }))}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${formData.status === 'Publish' ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed opacity-60 italic">
                                    Current node status is <span className={formData.status === 'Publish' ? 'text-emerald-500 font-black' : 'text-amber-500 font-black'}>{formData.status.toUpperCase()}</span>.
                                </p>
                            </div>

                            <div className="p-6 bg-emerald-500/[0.03] rounded-3xl border border-emerald-500/10 relative group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center border border-emerald-500/10 shadow-sm">
                                            <Sparkles size={18} />
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
                                    Push alerts are triggered only during "LIVE BROADCAST" deployment.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-8 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
                        <div className="relative">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-6 flex items-center gap-2 italic">
                                <MonitorIcon size={14} /> Node Telemetry
                            </h4>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Article ID</span>
                                    <span className="text-[11px] font-mono font-black text-indigo-500">#{id}</span>
                                </div>
                                <div className="h-px bg-[var(--border-color)] opacity-30"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Matrix Sync</span>
                                    <span className="text-emerald-500 animate-pulse"><Activity size={12} /></span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-color)] flex items-center justify-center">
                                <TerminalIcon size={14} className="text-[var(--text-muted)]" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] italic opacity-40">System Node #X01-ALPHA</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewsEdit;
