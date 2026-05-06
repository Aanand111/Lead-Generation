import React, { useState, useEffect } from 'react';
import {  
    Newspaper, Bell, Image as ImageIcon, Star, TrendingUp, Info, 
    ArrowRight, Activity, Zap, ExternalLink, Calendar,
    User, Target, Gift, Search, Filter, History as HistoryIcon, MessageSquare,
    X, ArrowLeft, Sparkles, Share2, Bookmark, Clock,
    Trophy, ChevronRight
} from 'lucide-react';
import api from '../../utils/api';
import { toPublicAssetUrl } from '../../utils/urls';
import LeadAdModal from '../../components/LeadAdModal';

const UserNews = () => {
    const [news, setNews] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resNews, resBanners] = await Promise.all([
                api.get('/user/news'),
                api.get('/user/banners')
            ]);
            if (resNews.data.success) setNews(resNews.data.data);
            if (resBanners.data.success) {
                const fetchedBanners = resBanners.data.data;
                setBanners(fetchedBanners);
                if (fetchedBanners.length > 0) {
                    api.post(`/user/banners/${fetchedBanners[0].id}/interaction?type=view`).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Failed to fetch news data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBannerClick = async (banner) => {
        if (!banner) return;
        try {
            await api.post(`/user/banners/${banner.id}/interaction?type=click`);
            if (banner.type === 'LEAD_GENERATION' || banner.link === '#LEAD_GEN') {
                setSelectedBanner(banner);
                setIsLeadModalOpen(true);
                return;
            }
            if (banner.link) {
                window.open(banner.link, '_blank');
            }
        } catch (error) {
            console.error('Error tracking banner click:', error);
            if (banner.link) {
                window.open(banner.link, '_blank');
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://placehold.co/800x400?text=NO+IMAGE';
        return toPublicAssetUrl(imagePath);
    };

    if (selectedArticle) {
        return (
            <div className="page-content animate-fade-in space-y-10 pb-20">
                <button 
                    onClick={() => setSelectedArticle(null)}
                    className="group flex items-center gap-3 text-indigo-500 font-black uppercase tracking-[0.2em] text-[10px] italic hover:text-black transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    Return to Newsroom
                </button>

                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="relative h-[500px] rounded-[4rem] overflow-hidden shadow-2xl group border border-[var(--border-color)]">
                        <img 
                            src={getImageUrl(selectedArticle.image)} 
                            alt={selectedArticle.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-14 w-full">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest italic shadow-xl">
                                    {selectedArticle.category_name || 'MARKET REPORT'}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] font-black text-white/70 uppercase tracking-widest italic">
                                    <Calendar size={16} /> {new Date(selectedArticle.publish_date || selectedArticle.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9] italic">
                                {selectedArticle.title}
                            </h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8">
                            <div className="prose prose-xl max-w-none">
                                <div className="text-xl leading-[1.6] text-[var(--text-dark)] opacity-90 whitespace-pre-wrap font-medium">
                                    {selectedArticle.content || selectedArticle.description}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-4 space-y-8">
                             <div className="p-8 bg-[var(--surface-color)] rounded-[3rem] border border-[var(--border-color)] shadow-sm">
                                <h4 className="text-lg font-black uppercase tracking-tighter italic mb-6">Share Report</h4>
                                <div className="flex gap-4">
                                    <button className="flex-1 h-14 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><Share2 size={20} /></button>
                                    <button className="flex-1 h-14 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Bookmark size={20} /></button>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content animate-fade-in space-y-12 pb-20">
            {/* --- Newsroom Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Intelligence</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">
                            <Activity size={12} className="animate-pulse" /> Live Updates
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-[0.9]">
                        Insights & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-royal-blue to-emerald-500">Bulletins</span>
                    </h1>
                    <p className="mt-6 text-sm md:text-base text-[var(--text-muted)] font-medium max-w-lg leading-relaxed italic">
                        Stay ahead with real-time market data, network announcements, and exclusive opportunities.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-600 transition-all shadow-xl group cursor-pointer relative">
                         <Bell size={24} strokeWidth={1.5} />
                         <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-[var(--surface-color)]"></div>
                    </div>
                </div>
            </div>

            {/* --- Cinematic Promotional Banner --- */}
            <div className="relative group rounded-[4rem] overflow-hidden shadow-2xl h-[450px] border border-[var(--border-color)]">
                {banners.length > 0 ? (
                    <div className="w-full h-full relative cursor-pointer" onClick={() => handleBannerClick(banners[0])}>
                        <img 
                            src={getImageUrl(banners[0].image)} 
                            alt={banners[0].title || "Offer"} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent flex items-center p-14 md:p-20">
                            <div className="max-w-2xl space-y-6">
                                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] italic shadow-2xl">
                                     <Sparkles size={16} fill="currentColor" /> Network Highlight
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none italic drop-shadow-2xl">
                                    {banners[0].title || 'Elevate Your Lead Acquisition'}
                                </h1>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] italic">Click to reveal exclusive offer</p>
                                <button className="inline-flex items-center gap-4 bg-white text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all">
                                    Access Now <ArrowRight size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center p-14">
                        <div className="flex flex-col items-center gap-4 text-white/20">
                            <Activity size={64} className="animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Synchronizing Bulletins...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* --- Primary Feed --- */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="flex items-center justify-between">
                         <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                            <Newspaper size={32} className="text-indigo-600" /> Latest Journals
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">
                             Total Posts: {news.length}
                        </div>
                    </div>

                    {loading ? (
                         <div className="space-y-8">
                            {[1,2,3].map(i => (
                                <div key={i} className="bg-[var(--surface-color)] rounded-[3rem] p-10 h-64 border border-[var(--border-color)] animate-pulse flex gap-10">
                                    <div className="w-48 h-full bg-slate-50 rounded-2xl"></div>
                                    <div className="flex-1 space-y-4">
                                        <div className="h-4 bg-slate-50 rounded-full w-1/4"></div>
                                        <div className="h-10 bg-slate-50 rounded-full w-3/4"></div>
                                        <div className="h-20 bg-slate-50 rounded-2xl w-full"></div>
                                    </div>
                                </div>
                            ))}
                         </div>
                    ) : news.length > 0 ? (
                        <div className="space-y-10">
                            {news.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => setSelectedArticle(item)}
                                    className="group relative bg-[var(--surface-color)] border border-[var(--border-color)] p-8 md:p-10 rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:border-indigo-500/20 transition-all duration-500 flex flex-col md:flex-row gap-10 cursor-pointer overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-indigo-500 group-hover:scale-110 group-hover:-rotate-12 transition-transform">
                                        <Newspaper size={200} />
                                    </div>
                                    <div className="w-full md:w-64 aspect-square rounded-[2.5rem] overflow-hidden flex-shrink-0 bg-slate-50 shadow-inner">
                                        <img 
                                            src={getImageUrl(item.image)} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-2 relative z-10">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <span className="px-4 py-2 rounded-xl bg-indigo-500/5 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-500/10 italic">
                                                    {item.category_name || 'GENERAL'}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-50">
                                                    <Clock size={14} /> {new Date(item.publish_date || item.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <h4 className="text-3xl font-black text-[var(--text-dark)] uppercase tracking-tighter italic leading-[1.1] group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed italic line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                {item.content || item.description}
                                            </p>
                                        </div>
                                        <div className="mt-8 pt-8 border-t border-[var(--border-color)] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-500">
                                                    <User size={18} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest italic text-[var(--text-dark)]">Admin Intelligence</span>
                                            </div>
                                            <div className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px] italic flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                                Read Report <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center rounded-[4rem] bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col items-center gap-10 grayscale opacity-40">
                             <Newspaper size={48} strokeWidth={1} />
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">The newsroom is currently quiet</p>
                        </div>
                    )}
                </div>

                {/* --- Sidebar Insights --- */}
                <div className="lg:col-span-4 space-y-12">
                     <div className="space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                            <TrendingUp size={28} className="text-amber-500" /> Market Pulse
                        </h3>
                        <div className="space-y-4">
                            {news.slice(0, 4).map(n => (
                                <div 
                                    key={n.id} 
                                    onClick={() => setSelectedArticle(n)}
                                    className="p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2rem] hover:border-indigo-500/20 hover:shadow-xl transition-all cursor-pointer group"
                                >
                                    <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 opacity-70 italic flex items-center gap-2">
                                        <Zap size={10} fill="currentColor" /> Trending Now
                                    </div>
                                    <h5 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] group-hover:text-indigo-600 transition-colors line-clamp-2 italic">
                                        {n.title}
                                    </h5>
                                </div>
                            ))}
                        </div>
                     </div>

                     <div className="relative group p-10 rounded-[3.5rem] bg-indigo-900 text-white shadow-2xl shadow-indigo-600/20 overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 text-white/5 -rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-125">
                            <Trophy size={180} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest italic backdrop-blur-md">
                                <Star size={12} fill="currentColor" className="text-amber-400" /> Referral Quest
                            </div>
                            <h4 className="text-3xl font-black uppercase tracking-tighter leading-[1.1] italic">Elite Partner Status</h4>
                            <p className="text-[11px] font-medium uppercase tracking-widest leading-relaxed text-white/60">
                                Expand your network. Reach 50 active referrals to unlock VIP acquisition pricing.
                            </p>
                            <button className="w-full py-5 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-emerald-400 hover:text-black transition-all active:scale-95 shadow-2xl">
                                Check Progress
                            </button>
                        </div>
                     </div>
                </div>
            </div>

            <LeadAdModal 
                isOpen={isLeadModalOpen} 
                onClose={() => setIsLeadModalOpen(false)} 
                banner={selectedBanner}
            />
        </div>
    );
};

export default UserNews;
