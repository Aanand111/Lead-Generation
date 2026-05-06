import React, { useState, useEffect } from 'react';
import { 
    Image as ImageIcon, Share2, Download, Plus, Star, Layers, 
    ChevronRight, Zap, Gem, Edit3, Save, Trash2, 
    Smartphone, ExternalLink, Activity, Info, Upload,
    Sparkles, Palette, MousePointer2, X, Clock,
    MonitorSmartphone, Heart
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const UserPosters = () => {
    const [posters, setPosters] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [freePosterAvailable, setFreePosterAvailable] = useState(true);
    const [hasPosterPlan, setHasPosterPlan] = useState(false);
    const [userInputs, setUserInputs] = useState({
        business_name: '',
        phone: '',
        content: '',
        logo_url: null,
        visual_url: null
    });
    const [logoFile, setLogoFile] = useState(null);
    const [visualFile, setVisualFile] = useState(null);

    const fetchPostersData = async () => {
        setLoading(true);
        try {
            const [postersRes, templatesRes] = await Promise.all([
                api.get('/user/posters'),
                api.get('/user/poster-templates')
            ]);
            
            if (postersRes.data.success) {
                setPosters(postersRes.data.data);
                setFreePosterAvailable(postersRes.data.freePosterAvailable);
                setHasPosterPlan(postersRes.data.hasPosterPlan);
            }
            if (templatesRes.data.success) {
                setTemplates(templatesRes.data.data);
                if (templatesRes.data.data.length > 0) {
                    setSelectedTemplate(templatesRes.data.data[0]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch posters/templates", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostersData();
    }, []);

    return (
        <div className="page-content animate-fade-in space-y-12 pb-20">
            {/* --- Premium Studio Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-indigo-600/20">
                            Marketing Engine
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest italic">
                            <Sparkles size={12} fill="currentColor" /> AI-Powered Studio
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-[0.9]">
                        Poster <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-royal-blue to-emerald-500">Laboratory</span>
                    </h1>
                    <p className="mt-6 text-sm md:text-base text-[var(--text-muted)] font-medium max-w-lg leading-relaxed">
                        Design high-conversion marketing materials instantly. Custom-brand templates with your business details in one click.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-[var(--surface-color)] p-1.5 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl flex items-center gap-4 pr-8">
                         <div className={`w-14 h-14 rounded-[2rem] flex items-center justify-center shadow-lg ${hasPosterPlan ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                            {hasPosterPlan ? <Gem size={24} /> : <Zap size={24} />}
                         </div>
                         <div>
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 opacity-70">Quota Remaining</div>
                            <div className="text-2xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums leading-none">
                                {hasPosterPlan ? 'VIP' : (freePosterAvailable ? '1 FREE' : 'LIMITED')}
                            </div>
                         </div>
                    </div>
                    <button 
                        onClick={() => setIsCreatorOpen(true)}
                        className="px-10 py-6 bg-black text-white hover:bg-indigo-600 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all active:scale-95 flex items-center gap-3"
                    >
                        <Plus size={20} strokeWidth={3} /> Launch Maker
                    </button>
                </div>
            </div>

            {/* --- Posters Repository --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {loading ? (
                    [1,2,3].map(i => (
                        <div key={i} className="bg-[var(--surface-color)] rounded-[3.5rem] p-1 h-[500px] shadow-sm border border-[var(--border-color)] animate-pulse overflow-hidden">
                            <div className="h-[75%] bg-slate-50 w-full rounded-t-[3.4rem]"></div>
                            <div className="p-8 space-y-4">
                                <div className="h-6 bg-slate-50 rounded-full w-3/4"></div>
                                <div className="h-3 bg-slate-50 rounded-full w-1/4"></div>
                            </div>
                        </div>
                    ))
                ) : posters.length > 0 ? (
                    posters.map((poster) => (
                        <div key={poster.id} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10"></div>
                            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-2 rounded-[3.5rem] shadow-sm group-hover:shadow-2xl group-hover:border-indigo-500/20 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                                
                                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-100">
                                    <img 
                                        src={poster.image_url || 'https://placehold.co/800x1000?text=Design+Ready'} 
                                        alt="Poster" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-10 backdrop-blur-[2px]">
                                        <div className="flex items-center gap-4 scale-90 group-hover:scale-100 transition-transform">
                                            <button className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all shadow-2xl">
                                                <Download size={22} />
                                            </button>
                                            <button className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-2xl">
                                                <Share2 size={22} />
                                            </button>
                                            <button className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-2xl">
                                                <Trash2 size={22} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600 shadow-xl">
                                        {poster.category_name || 'BRANDING'}
                                    </div>
                                </div>

                                <div className="p-8 pb-10 flex flex-col items-center text-center">
                                    <h3 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tighter italic group-hover:text-indigo-600 transition-colors mb-2">{poster.title || 'Untitled Design'}</h3>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">
                                        <Clock size={12} /> {new Date(poster.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center rounded-[4rem] bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col items-center gap-10 grayscale opacity-40">
                        <div className="w-24 h-24 rounded-full bg-indigo-500/5 flex items-center justify-center">
                            <ImageIcon size={48} strokeWidth={1} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Portfolio Empty</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ready to engineer your first campaign?</p>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Advanced Design Studio Modal --- */}
            {isCreatorOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-[60px] z-[9999] p-4 flex items-center justify-center animate-fade-in">
                    <div className="bg-[var(--surface-color)] w-full max-w-[1400px] h-[90vh] rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col relative">
                        
                        {/* Modal Header */}
                        <div className="px-12 py-8 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-[var(--text-dark)] uppercase tracking-tighter italic">Creative Workspace</h2>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Professional Grade Output</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsCreatorOpen(false)}
                                className="w-14 h-14 rounded-full bg-white border border-[var(--border-color)] flex items-center justify-center text-slate-400 hover:text-rose-500 hover:rotate-90 transition-all shadow-sm"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Control Panel */}
                            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar space-y-12 bg-white">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                                        <h3 className="text-xl font-black uppercase tracking-tight italic">Blueprint Parameters</h3>
                                    </div>

                                    <div className="space-y-10">
                                        {/* Template Selector */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Active Base Template</label>
                                            <div className="flex gap-5 overflow-x-auto pb-6 px-1 custom-scrollbar">
                                                {templates.map(tmp => (
                                                    <button 
                                                        key={tmp.id} 
                                                        onClick={() => setSelectedTemplate(tmp)}
                                                        className={`flex-shrink-0 w-32 aspect-[4/5] rounded-[1.5rem] overflow-hidden border-4 transition-all ${selectedTemplate?.id === tmp.id ? 'border-indigo-600 scale-105 shadow-2xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                                    >
                                                        <img src={tmp.thumbnail} alt="Template" className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Content Input */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Marketing Content</label>
                                            <textarea 
                                                value={userInputs.content}
                                                onChange={(e) => setUserInputs({...userInputs, content: e.target.value})}
                                                className="w-full h-32 bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-sm font-black text-[var(--text-dark)] italic focus:border-indigo-500 focus:bg-white transition-all outline-none resize-none shadow-inner"
                                                placeholder="Craft your compelling message here..."
                                            ></textarea>
                                        </div>

                                        {/* Brand Details */}
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Business Identity</label>
                                                <input 
                                                    value={userInputs.business_name}
                                                    onChange={(e) => setUserInputs({...userInputs, business_name: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-[var(--text-dark)] uppercase tracking-widest focus:border-indigo-500 focus:bg-white transition-all outline-none shadow-sm" 
                                                    placeholder="Acme Industries" 
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Call Logic (Phone)</label>
                                                <input 
                                                    value={userInputs.phone}
                                                    onChange={(e) => setUserInputs({...userInputs, phone: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-[var(--text-dark)] tabular-nums focus:border-indigo-500 focus:bg-white transition-all outline-none shadow-sm" 
                                                    placeholder="+91 0000 0000" 
                                                />
                                            </div>
                                        </div>

                                        {/* Asset Uploads */}
                                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Brand Mark (Logo)</label>
                                                <div className="relative group/upload">
                                                    <input 
                                                        type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setLogoFile(file);
                                                                setUserInputs({...userInputs, logo_url: URL.createObjectURL(file)});
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-full h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 group-hover/upload:border-indigo-500 group-hover/upload:bg-indigo-50/30 transition-all">
                                                        <Plus size={18} className="text-indigo-600" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attach PNG</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Campaign Hero Image</label>
                                                <div className="relative group/upload">
                                                    <input 
                                                        type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setVisualFile(file);
                                                                setUserInputs({...userInputs, visual_url: URL.createObjectURL(file)});
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-full h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 group-hover/upload:border-indigo-500 group-hover/upload:bg-indigo-50/30 transition-all">
                                                        <Upload size={18} className="text-indigo-600" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Visual</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Rendering Preview */}
                            <div className="flex-1 p-12 flex flex-col items-center justify-center bg-slate-50/80 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]"></div>
                                <div className="flex items-center gap-3 mb-10 relative z-10">
                                    <div className="px-5 py-2 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] animate-pulse italic">Real-Time Sync</div>
                                </div>

                                <div className="relative w-full max-w-[450px] aspect-[4/5] bg-white rounded-[2.5rem] shadow-[0_60px_100px_-30px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-700 hover:scale-[1.02]">
                                    {selectedTemplate ? (
                                        <div className="relative w-full h-full">
                                            <img src={selectedTemplate.thumbnail} alt="Base" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 p-10 h-full flex flex-col justify-between">
                                                {selectedTemplate.layout_config?.fields.map(field => (
                                                    <div 
                                                        key={field.id}
                                                        className="absolute flex items-center justify-center overflow-hidden"
                                                        style={{
                                                            left: `${field.x}%`,
                                                            top: `${field.y}%`,
                                                            width: field.width ? `${field.width}%` : 'auto',
                                                            height: field.height ? `${field.height}%` : 'auto',
                                                            fontSize: field.type === 'text' ? `${(field.fontSize || 16) / 4}px` : 'auto',
                                                            color: field.color || '#000',
                                                            fontWeight: field.fontWeight || 'black',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {field.id === 'logo' ? (
                                                            userInputs.logo_url ? <img src={userInputs.logo_url} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200 rounded-lg"><Layers size={24} /></div>
                                                        ) : field.type === 'image' ? (
                                                            userInputs.visual_url ? <img src={userInputs.visual_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200 rounded-2xl"><ImageIcon size={48} /></div>
                                                        ) : (
                                                            <span className="uppercase tracking-tighter leading-none italic">{userInputs[field.id] || field.label}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-200">
                                            <ImageIcon size={100} strokeWidth={1} />
                                            <p className="mt-6 text-[10px] font-black uppercase tracking-widest">Awaiting Blueprint</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-12 flex gap-8 relative z-10">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors cursor-default">
                                        <MonitorSmartphone size={16} /> Multi-Channel Adaptive
                                    </div>
                                    <div className="w-px h-4 bg-slate-200"></div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors cursor-default">
                                        <Heart size={16} /> Premium Fidelity
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer / Action Bar */}
                        <div className="px-12 py-10 border-t border-[var(--border-color)] bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-8">
                             <div className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 ${hasPosterPlan ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-white text-indigo-600 border-indigo-100'}`}>
                                {hasPosterPlan ? <Gem size={18} fill="currentColor" className="animate-pulse" /> : <Zap size={18} fill="currentColor" className="text-amber-500" />}
                                <span className="text-[11px] font-black uppercase tracking-widest italic">{hasPosterPlan ? 'Unlimited Lab Access' : 'Single Session Pass'}</span>
                            </div>

                            <button 
                                onClick={async () => {
                                    if (!selectedTemplate) return;
                                    setSubmitting(true);
                                    try {
                                        const formData = new FormData();
                                        formData.append('template_id', selectedTemplate.id);
                                        formData.append('title', `${selectedTemplate.title} - ${userInputs.business_name || 'My Campaign'}`);
                                        formData.append('user_data', JSON.stringify({
                                            business_name: userInputs.business_name,
                                            phone: userInputs.phone,
                                            content: userInputs.content
                                        }));
                                        if (logoFile) formData.append('logo', logoFile);
                                        if (visualFile) formData.append('image', visualFile);

                                        const res = await api.post('/user/generate-poster', formData, {
                                            headers: { 'Content-Type': 'multipart/form-data' }
                                        });
                                        
                                        if (res.data.success) {
                                            setIsCreatorOpen(false);
                                            fetchPostersData();
                                            toast.success('Asset Engine Generated Successfully.');
                                        }
                                    } catch (err) {
                                        toast.error(err.response?.data?.message || "Generation Error.");
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                                disabled={submitting || !selectedTemplate}
                                className="w-full md:w-auto px-16 py-6 bg-black text-white hover:bg-indigo-600 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[12px] shadow-2xl transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4"
                            >
                                {submitting ? <Activity size={24} className="animate-spin" /> : <MousePointer2 size={24} fill="currentColor" />}
                                {submitting ? 'GENERATING...' : (hasPosterPlan ? 'PROCESS DESIGN (FREE)' : (freePosterAvailable ? 'PROCESS FREE' : 'PROCESS (5 CR)'))}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPosters;
