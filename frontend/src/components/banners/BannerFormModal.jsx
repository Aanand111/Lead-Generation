import React from 'react';
import {
    Activity,
    Image as ImageIcon,
    Layout,
    Plus,
    RefreshCcw,
    Share2,
    ShieldCheck,
    Sparkles
} from 'lucide-react';
import CustomSelect from '../CustomSelect';

const BannerFormModal = ({ formData, modalMode, onChange, onClose, onSubmit, saving }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[9000] flex items-center justify-center p-6 overflow-y-auto no-scrollbar">
            <div className="w-full max-w-6xl relative animate-zoom-in">
                <div className="flex items-center justify-between mb-10 px-2">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-[1.5rem] bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                            <Sparkles size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-none">
                                {modalMode === 'add' ? 'Add New Banner' : 'Edit Banner'}
                            </h2>
                            <p className="text-indigo-400/60 font-medium text-sm mt-3 tracking-wide">Enter the details for your marketing banner</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] hover:bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[2px] transition-all flex items-center gap-4 group cursor-pointer">
                        <Plus size={16} className="rotate-45 group-hover:rotate-0 transition-transform" /> Cancel
                    </button>
                </div>

                <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-[var(--surface-color)] rounded-[3rem] p-12 border border-[var(--border-color)] backdrop-blur-xl space-y-12 shadow-2xl">
                        <div className="flex items-center gap-6 mb-4">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                                <Layout size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tighter">General Information</h3>
                                <p className="text-[10px] text-indigo-400/50 font-black uppercase tracking-widest mt-1">Set the basic identity and type of your banner</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-widest ml-1 block">Banner Title</label>
                                <input type="text" name="title" value={formData.title} onChange={onChange} className="w-full p-7 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[2rem] font-black uppercase tracking-tight text-sm text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all placeholder-[var(--text-muted)] shadow-inner" placeholder="EX: Summer Promotion" required />
                            </div>

                            <CustomSelect
                                label="Banner Type"
                                name="type"
                                value={formData.type}
                                onChange={onChange}
                                options={[
                                    { value: 'promotional', label: 'PROMOTIONAL' },
                                    { value: 'LEAD_GENERATION', label: 'LEAD GENERATION (FB STYLE)' },
                                    { value: 'informational', label: 'INFORMATIONAL' },
                                    { value: 'event', label: 'SPECIAL EVENT' },
                                    { value: 'other', label: 'GENERAL' }
                                ]}
                            />

                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-[0.3em] ml-1 block">Banner Image URL</label>
                                <div className="flex gap-6">
                                    <input type="text" name="image" value={formData.image} onChange={onChange} className="flex-1 p-7 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[2rem] font-black uppercase tracking-tight text-xs text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all placeholder-[var(--text-muted)]" placeholder="https://image-url.com" required />
                                    <div className="w-24 h-24 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-color)] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xl">
                                        {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-indigo-500/20" />}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-widest ml-1 block">Target Link URL</label>
                                <input type="text" name="link" value={formData.link} onChange={onChange} className="w-full p-7 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[2rem] font-black uppercase tracking-tight text-xs text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all placeholder-[var(--text-muted)]" placeholder="https://yourlink.com" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-[var(--surface-color)] rounded-[3rem] p-10 border border-[var(--border-color)] backdrop-blur-xl shadow-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                    <Share2 size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight">Display Settings</h4>
                                    <p className="text-[9px] text-indigo-400/40 font-black uppercase tracking-widest mt-0.5">Control where and when</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <CustomSelect
                                    label="Page Placement"
                                    name="placement"
                                    value={formData.placement}
                                    onChange={onChange}
                                    options={[
                                        { value: 'home', label: 'HOME PAGE' },
                                        { value: 'sidebar', label: 'SIDEBAR' },
                                        { value: 'footer', label: 'FOOTER' },
                                        { value: 'popup', label: 'POPUP' }
                                    ]}
                                />

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-widest ml-1 block">Start Date</label>
                                    <input type="datetime-local" name="start_date" value={formData.start_date} onChange={onChange} className="w-full p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.5rem] font-black uppercase tracking-tight text-[10px] text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-indigo-400/40 uppercase tracking-widest ml-1 block">End Date (Optional)</label>
                                    <input type="datetime-local" name="end_date" value={formData.end_date} onChange={onChange} className="w-full p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.5rem] font-black uppercase tracking-tight text-[10px] text-[var(--text-dark)] focus:bg-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all" />
                                </div>

                                <div className="p-6 bg-[var(--bg-color)]/50 rounded-[2rem] border border-[var(--border-color)]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-[var(--text-dark)] uppercase tracking-widest">Active Status</div>
                                                <div className="text-[8px] text-indigo-400/60 font-black uppercase mt-0.5 tracking-tight">Toggle Visibility</div>
                                            </div>
                                        </div>
                                        <div className="relative inline-block w-14 h-7 rounded-full bg-[var(--border-color)] cursor-pointer overflow-hidden transition-all has-[:checked]:bg-emerald-500">
                                            <input type="checkbox" id="is_active_modal" name="is_active" checked={formData.is_active} onChange={onChange} className="peer hidden" />
                                            <label htmlFor="is_active_modal" className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-xl transition-all peer-checked:translate-x-7 cursor-pointer"></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-sm tracking-widest rounded-[2.5rem] shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 mt-4 border-none cursor-pointer" disabled={saving}>
                            {saving ? <RefreshCcw size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                            {saving ? 'Saving...' : (modalMode === 'add' ? 'Save Banner' : 'Update Banner')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BannerFormModal;
