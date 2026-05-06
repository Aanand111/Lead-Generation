import React from 'react';
import {
    Edit2,
    Eye,
    Image as ImageIcon,
    Layout,
    MousePointer2,
    Settings2,
    Share2,
    Sparkles,
    Trash2,
    TrendingUp
} from 'lucide-react';
import { toPublicAssetUrl } from '../../utils/urls';

const BannerListSection = ({ banners, loading, onDelete, onEdit }) => {
    return (
        <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] mt-10">
            <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/30">
                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                        <TrendingUp size={16} />
                    </div>
                    Banner Status: <span className="text-[var(--text-dark)] font-black ml-1">{(banners?.length || 0)} Total Banners</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-indigo-400 cursor-help shadow-inner">
                    <Settings2 size={18} />
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="w-16 text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">ID</th>
                            <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Banner Image</th>
                            <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Title & Category</th>
                            <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Placement</th>
                            <th className="text-center text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Performance</th>
                            <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Status</th>
                            <th className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Schedule</th>
                            <th className="text-right text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest px-10">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-32">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest animate-pulse">Loading Banners...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : banners.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-32 text-[var(--text-muted)] italic">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <Layout size={64} strokeWidth={1} />
                                        <p className="font-black uppercase tracking-widest text-[10px]">No banners found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            banners.map((banner, index) => {
                                if (!banner) return null;

                                return (
                                    <tr key={banner.id} className="transition-all hover:bg-white/[0.03] group border-b border-white/5 last:border-0 text-xs text-indigo-100/90">
                                        <td className="text-center text-indigo-400/50 font-black">#{(index + 1).toString().padStart(3, '0')}</td>
                                        <td>
                                            <div className="w-24 h-14 rounded-2xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center group/preview relative shadow-2xl transition-all group-hover:rotate-2">
                                                {banner.image ? (
                                                    <img
                                                        src={toPublicAssetUrl(banner.image)}
                                                        alt={banner.title}
                                                        className="w-full h-full object-cover transition-transform group-hover/preview:scale-110"
                                                        onError={(event) => { event.target.src = 'https://placehold.co/300x150?text=NO+THUMBNAIL'; }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={20} className="text-gray-300 opacity-50" />
                                                )}
                                                <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Eye size={16} className="text-white" />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-black text-[var(--text-dark)] uppercase tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1 max-w-[180px]">{banner.title}</div>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-[0.1em] mt-1.5 border border-indigo-500/5 shadow-inner">
                                                <Sparkles size={10} /> {banner.type}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-[10px] text-indigo-300/60 font-black uppercase italic tracking-tighter">
                                                <Share2 size={12} className="opacity-30" />
                                                <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{banner.placement}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="text-center">
                                                    <div className="flex items-center gap-1.5 text-[var(--text-dark)] font-black text-sm">
                                                        <Eye size={12} className="text-blue-500" /> {banner.views || 0}
                                                    </div>
                                                    <div className="text-[8px] uppercase font-black text-gray-400 tracking-widest mt-0.5 opacity-60">Views</div>
                                                </div>
                                                <div className="h-6 w-px bg-gray-100"></div>
                                                <div className="text-center">
                                                    <div className="flex items-center gap-1.5 text-[var(--text-dark)] font-black text-sm">
                                                        <MousePointer2 size={12} className="text-emerald-500" /> {banner.clicks || 0}
                                                    </div>
                                                    <div className="text-[8px] uppercase font-black text-gray-400 tracking-widest mt-0.5 opacity-60">Clicks</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${banner.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 opacity-50'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                {banner.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-[9px] text-[var(--text-muted)] space-y-1 font-black uppercase tracking-tighter italic">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></div>
                                                    {(() => {
                                                        const date = new Date(banner.start_date);
                                                        return !banner.start_date || Number.isNaN(date.getTime()) ? 'No Start Date' : date.toLocaleDateString();
                                                    })()}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/40"></div>
                                                    {(() => {
                                                        const date = new Date(banner.end_date);
                                                        return !banner.end_date || Number.isNaN(date.getTime()) ? 'No End Date' : date.toLocaleDateString();
                                                    })()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-right px-10">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => onEdit(banner)} className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-indigo-600/10 text-indigo-500 transition-all border-none bg-transparent cursor-pointer active:scale-90" title="Edit">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => onDelete(banner.id)} className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-red-600/10 text-red-500 transition-all border-none bg-transparent cursor-pointer active:scale-90" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BannerListSection;
