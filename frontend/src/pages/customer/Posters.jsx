import React, { useState, useEffect } from 'react';
import { 
    Image as ImageIcon, Share2, Download, Plus, Star, Layers, 
    ChevronRight, Zap, Target, Gem, Edit3, Save, Trash2, 
    Smartphone, ExternalLink, Activity, Info, Upload
} from 'lucide-react';
import api from '../../utils/api';

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
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Artistic Studio</h2>
                    <p>Generate high-impact marketing posters from lead intelligence templates</p>
                </div>
                <div className="pageHeaderActions flex items-center gap-4">
                    <div className={`${hasPosterPlan ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-amber-500/5 border-amber-500/10'} px-6 py-3 rounded-2xl flex items-center gap-4 group hover:opacity-80 transition-all cursor-default`}>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none italic">
                            {hasPosterPlan ? 'Premium Spectra' : 'Daily Protocol'}
                        </div>
                        <div className="flex items-center gap-2">
                             {hasPosterPlan ? (
                                <Gem size={16} className="text-indigo-500 animate-bounce" />
                             ) : (
                                <Star size={16} fill="currentColor" className={freePosterAvailable ? "text-amber-500" : "text-[var(--text-muted)] opacity-30"} />
                             )}
                            <span className={`text-xl font-black tabular-nums ${hasPosterPlan ? 'text-indigo-500' : (freePosterAvailable ? "text-amber-500" : "text-[var(--text-muted)] opacity-30")}`}>
                                {hasPosterPlan ? 'UNLIMITED' : (freePosterAvailable ? '1 PASS' : '0 PASS')}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsCreatorOpen(true)}
                        className="btn btn-primary px-8 py-3.5 flex items-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={18} strokeWidth={3} /> Invoke Constructor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {loading ? (
                    <div className="col-span-full py-40 text-center">
                        <div className="spinner mb-4 mx-auto"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Initializing Rendering Engine...</span>
                    </div>
                ) : posters.length > 0 ? (
                    posters.map((poster) => (
                        <div key={poster.id} className="card shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] group hover:-translate-y-4 transition-all duration-500 flex flex-col rounded-[2.5rem]">
                            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg-color)]/50">
                                <img 
                                    src={poster.image_url || 'https://placehold.co/800x1000?text=Lead+Poster'} 
                                    alt="Poster" 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center justify-center gap-4">
                                        <button className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl">
                                            <Download size={20} />
                                        </button>
                                        <button className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl">
                                            <Share2 size={20} />
                                        </button>
                                        <button className="w-12 h-12 rounded-2xl bg-rose-500/80 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-rose-500 transition-all shadow-xl">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/30 text-[9px] font-black uppercase tracking-widest text-black shadow-lg">
                                    {poster.category_name || 'MARKETING'}
                                </div>
                            </div>
                            <div className="p-8 border-t border-[var(--border-color)]">
                                <h3 className="text-xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-2 group-hover:text-indigo-500 transition-colors">{poster.title || 'Marketing Protocol'}</h3>
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-70 mb-6">Generated on {new Date(poster.created_at).toLocaleDateString()}</div>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--surface-color)] bg-indigo-500/10 flex items-center justify-center overflow-hidden">
                                                <Target size={14} className="text-indigo-500/40" />
                                            </div>
                                        ))}
                                    </div>
                                    <button className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest group/btn italic">
                                        Edit Parameters <Edit3 size={14} className="group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-[3rem]">
                        <div className="flex flex-col items-center gap-6">
                            <ImageIcon size={84} strokeWidth={1} />
                            <p className="font-black uppercase tracking-[0.4em] text-xs italic">Artistic studio is currently dormant</p>
                            <button onClick={() => setIsCreatorOpen(true)} className="btn btn-primary px-8 py-3.5 font-black uppercase tracking-[0.2em] text-[10px] mt-4 shadow-xl shadow-indigo-500/10">Initialize Constructor</button>
                        </div>
                    </div>
                )}
            </div>

            {isCreatorOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[9999] p-4 flex items-center justify-center overflow-auto animate-fade-in">
                    <div className="bg-[var(--surface-color)] w-full max-w-6xl rounded-[3rem] shadow-2xl border border-[var(--border-color)] overflow-hidden animate-zoom-in relative">
                        <button 
                            onClick={() => setIsCreatorOpen(false)}
                            className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 transition-all z-20 cursor-pointer"
                        >
                            <Plus size={24} className="rotate-45" />
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-12 border-r border-[var(--border-color)] flex flex-col justify-between min-h-[600px] bg-[var(--bg-color)]/20">
                                <div>
                                    <h3 className="text-4xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-2">Constructor Panel</h3>
                                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-10 opacity-70 italic">Synchronize your brand identity with lead intelligence templates</p>
                                    
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-widest ml-1">Select Template</label>
                                            <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide">
                                                {templates.map(tmp => (
                                                    <button 
                                                        key={tmp.id} 
                                                        onClick={() => setSelectedTemplate(tmp)}
                                                        className={`flex-shrink-0 w-24 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all ${selectedTemplate?.id === tmp.id ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-80'}`}
                                                    >
                                                        <img src={tmp.thumbnail} alt="Template" className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-widest ml-1">Marketing Narrative</label>
                                            <textarea 
                                                value={userInputs.content}
                                                onChange={(e) => setUserInputs({...userInputs, content: e.target.value})}
                                                className="w-full h-24 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl p-6 text-xs font-bold text-[var(--text-dark)] italic focus:border-indigo-500 transition-all outline-none resize-none shadow-inner"
                                                placeholder="Inject your marketing message here..."
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-widest ml-1">Business Name</label>
                                                <input 
                                                    value={userInputs.business_name}
                                                    onChange={(e) => setUserInputs({...userInputs, business_name: e.target.value})}
                                                    className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-4 text-xs font-bold text-[var(--text-dark)] italic focus:border-indigo-500 transition-all outline-none shadow-sm" 
                                                    placeholder="e.g. Acme Studio" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-widest ml-1">Contact Protocol</label>
                                                <input 
                                                    value={userInputs.phone}
                                                    onChange={(e) => setUserInputs({...userInputs, phone: e.target.value})}
                                                    className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-4 text-xs font-bold text-[var(--text-dark)] italic focus:border-indigo-500 transition-all outline-none shadow-sm" 
                                                    placeholder="Phone Number" 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[var(--border-color)]/30">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-widest ml-1">Brand Logo</label>
                                                <div className="relative group/upload">
                                                    <input 
                                                        type="file" 
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setLogoFile(file);
                                                                setUserInputs({...userInputs, logo_url: URL.createObjectURL(file)});
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-full h-16 bg-[var(--surface-color)] border-2 border-dashed border-[var(--border-color)] rounded-2xl flex items-center justify-center gap-3 group-hover/upload:border-indigo-500 transition-all">
                                                        <Plus size={16} className="text-indigo-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Attach Logo</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-widest ml-1">Custom Visual</label>
                                                <div className="relative group/upload">
                                                    <input 
                                                        type="file" 
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setVisualFile(file);
                                                                setUserInputs({...userInputs, visual_url: URL.createObjectURL(file)});
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-full h-16 bg-[var(--surface-color)] border-2 border-dashed border-[var(--border-color)] rounded-2xl flex items-center justify-center gap-3 group-hover/upload:border-indigo-500 transition-all">
                                                        <Upload size={16} className="text-indigo-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Custom Image</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex items-center justify-between border-t border-[var(--border-color)] pt-8">
                                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic ${hasPosterPlan ? 'text-emerald-500' : (freePosterAvailable ? 'text-amber-500 animate-pulse' : 'text-indigo-500')}`}>
                                         {hasPosterPlan ? <Gem size={14} className="animate-pulse" /> : (freePosterAvailable ? <Zap size={14} fill="currentColor" /> : <Gem size={14} />)}
                                         {hasPosterPlan ? 'VIP Unlimited Access' : (freePosterAvailable ? 'Using Daily Free Pass' : 'Premium Render Mode')}
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            if (!selectedTemplate) return;
                                            setSubmitting(true);
                                            try {
                                                const formData = new FormData();
                                                formData.append('template_id', selectedTemplate.id);
                                                formData.append('title', `${selectedTemplate.title} - My Copy`);
                                                // Sending user_data text as JSON string
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
                                                }
                                            } catch (err) {
                                                console.error("Generation failed", err);
                                                alert(err.response?.data?.message || "Generation failed");
                                            } finally {
                                                setSubmitting(false);
                                            }
                                        }}
                                        disabled={submitting || !selectedTemplate}
                                        className="btn btn-primary px-10 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 shadow-2xl shadow-indigo-500/20 active:translate-y-1 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Save size={18} /> 
                                                {hasPosterPlan ? 'FREE (VIP)' : (freePosterAvailable ? 'FREE RENDER' : 'RENDER (5 CREDITS)')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                             <div className="p-12 flex flex-col items-center justify-center bg-[var(--bg-color)]/50 relative overflow-hidden group/preview">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary-glow)_0%,transparent_70%)] opacity-30"></div>
                                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-8 relative z-10 animate-pulse italic">Live Rendering Spectrum</div>
                                <div className="relative w-full max-w-[400px] aspect-[4/5] bg-white rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 hover:rotate-2 hover:scale-105 group-hover/preview:shadow-[0_80px_150px_-30px_rgba(99,102,241,0.3)]">
                                    <div className="relative w-full h-full">
                                        {selectedTemplate ? (
                                            <>
                                                <img src={selectedTemplate.thumbnail} alt="Preview BG" className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 p-8 h-full flex flex-col justify-between">
                                                    {selectedTemplate.layout_config?.fields.map(field => (
                                                        <div 
                                                            key={field.id}
                                                            className={`absolute bg-white/20 backdrop-blur-sm rounded p-1 whitespace-pre-wrap uppercase tracking-tighter leading-none flex items-center justify-center overflow-hidden`}
                                                            style={{
                                                                left: `${field.x}%`,
                                                                top: `${field.y}%`,
                                                                fontSize: field.type === 'text' ? `${(field.fontSize || 16) / 4}px` : 'auto',
                                                                color: field.color || '#000',
                                                                fontWeight: field.fontWeight || 'black',
                                                                width: field.width ? `${field.width}%` : 'auto',
                                                                height: field.height ? `${field.height}%` : 'auto'
                                                            }}
                                                        >
                                                            {field.id === 'logo' ? (
                                                                userInputs.logo_url ? <img src={userInputs.logo_url} className="w-full h-full object-contain" /> : <div className="text-xs opacity-50"><Layers size={20} /></div>
                                                            ) : field.type === 'image' ? (
                                                                userInputs.visual_url ? <img src={userInputs.visual_url} className="w-full h-full object-cover" /> : <div className="text-xs opacity-50"><ImageIcon size={20} /></div>
                                                            ) : (
                                                                <span>{userInputs[field.id] || field.label}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-8 h-full flex flex-col justify-center items-center text-indigo-500/20">
                                                <Layers size={84} strokeWidth={1} />
                                                <p className="text-[10px] font-black uppercase mt-4">No Template Selected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-10 flex gap-4 relative z-10">
                                    <button className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-indigo-500 transition-colors italic">
                                        <Smartphone size={14} /> Mobile Preview
                                    </button>
                                    <div className="w-px h-4 bg-[var(--border-color)]"></div>
                                    <button className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-indigo-500 transition-colors italic">
                                        <ExternalLink size={14} /> Full Spectrum
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPosters;
