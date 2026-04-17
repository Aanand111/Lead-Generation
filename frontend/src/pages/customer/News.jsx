import React, { useState, useEffect } from 'react';
import {  
    Newspaper, Bell, Image as ImageIcon, Star, TrendingUp, Info, 
    ArrowRight, Activity, Zap, ExternalLink, Calendar,
    User, Target, Gift, Search, Filter, History as HistoryIcon, MessageSquare,
    X, ArrowLeft
 } from 'lucide-react';
import api from '../../utils/api';

const UserNews = () => {
    const [news, setNews] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);

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
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = import.meta.env.VITE_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';
        return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
    };

    if (selectedArticle) {
        return (
            <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
                <button 
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 text-indigo-500 font-bold uppercase tracking-widest text-[10px] mb-8 hover:translate-x-[-4px] transition-all"
                >
                    <ArrowLeft size={16} /> Back to Updates
                </button>

                <div className="max-w-4xl mx-auto">
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl mb-10 border border-[var(--border-color)]">
                        <img 
                            src={getImageUrl(selectedArticle.image)} 
                            alt={selectedArticle.title} 
                            className="w-full h-[400px] object-cover"
                            onError={(e) => { e.target.src = 'https://placehold.co/800x400?text=NO+IMAGE'; }}
                        />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="px-4 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 italic">
                            {selectedArticle.category_name || 'MARKET'}
                        </span>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2 italic">
                            <Calendar size={14} /> {new Date(selectedArticle.publish_date || selectedArticle.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-8 leading-tight">
                        {selectedArticle.title}
                    </h1>

                    <div className="prose prose-indigo max-w-none">
                        <div className="text-lg leading-relaxed text-[var(--text-dark)] opacity-80 whitespace-pre-wrap font-medium">
                            {selectedArticle.content || selectedArticle.description}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        News & Offers
                        <Newspaper size={24} className="text-indigo-500" />
                    </h2>
                    <p>Stay updated with the latest news, announcements, and exclusive promotional offers.</p>
                </div>
                <div className="pageHeaderActions flex items-center gap-4">
                    <button className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500 transition-all shadow-sm">
                        <Bell size={20} />
                    </button>
                </div>
            </div>

            {/* Promotional Banner Carousel */}
            <div className="mb-14 overflow-hidden rounded-[3rem] shadow-2xl relative group h-[400px] border border-[var(--border-color)]">
                {banners.length > 0 ? (
                    <div className="w-full h-full relative cursor-pointer" onClick={() => handleBannerClick(banners[0])}>
                        <img 
                            src={getImageUrl(banners[0].image)} 
                            alt={banners[0].title || "Offer"} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                            onError={(e) => { e.target.src = 'https://placehold.co/1920x800?text=Lead+Generation+Offer'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-14">
                            <div className="max-w-xl animate-slide-up">
                                <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-3 italic">
                                     <Star size={14} fill="currentColor" /> Exclusive Network Offer
                                </div>
                                <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white mb-6 leading-tight">
                                    {banners[0].title || 'Limited Offer: Get +50% Extra Credits Today'}
                                </h1>
                                <a 
                                    href={banners[0].link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 bg-white text-black px-12 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                    onClick={(e) => { e.stopPropagation(); handleBannerClick(banners[0]); }}
                                >
                                    Claim Now <ArrowRight size={18} strokeWidth={3} />
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center p-14">
                        <div className="max-w-xl text-center">
                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-6">Loading Offers</h2>
                            <p className="text-white/50 text-xs font-black uppercase tracking-[0.4em]">Getting the best deals for you...</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] flex items-center gap-4">
                        <Newspaper size={28} className="text-indigo-500" /> Latest Updates
                    </h3>

                    {loading ? (
                        <div className="py-40 text-center">
                            <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Loading Feed...</span>
                        </div>
                    ) : news.length > 0 ? (
                        news.map((item) => (
                            <div 
                                key={item.id} 
                                className="card p-8 shadow-xl border border-[var(--border-color)] bg-[var(--surface-color)] group hover:-translate-y-2 transition-all duration-500 flex flex-col md:flex-row gap-10 rounded-[2.5rem] relative overflow-hidden cursor-pointer"
                                onClick={() => setSelectedArticle(item)}
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity -rotate-12 group-hover:rotate-0">
                                    <Newspaper size={160} />
                                </div>
                                <div className="w-full md:w-56 h-56 rounded-[2rem] overflow-hidden flex-shrink-0 bg-[var(--bg-color)] border border-[var(--border-color)]">
                                    <img 
                                        src={getImageUrl(item.image)} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=News'; }}
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-2 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 italic">
                                                {item.category_name || 'MARKET'}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)]"></div>
                                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2 italic">
                                                <Calendar size={14} /> {new Date(item.publish_date || item.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <h4 className="text-2xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-4 group-hover:text-indigo-500 transition-colors leading-tight line-clamp-2">
                                            {item.title}
                                        </h4>
                                        <p className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed italic line-clamp-2 max-w-lg mb-6 group-hover:text-[var(--text-dark)]/80 transition-colors">
                                            {item.content || item.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-500/10">
                                                <User size={14} />
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dark)] italic">Admin Update</div>
                                        </div>
                                        <button className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 group italic">
                                            Read Full Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-40 text-center opacity-30 border-2 border-dashed border-[var(--border-color)] rounded-[3rem]">
                            <div className="flex flex-col items-center gap-6">
                                <Activity size={84} strokeWidth={1} />
                                <p className="font-black uppercase tracking-[0.4em] text-xs italic">Feed is currently up to date</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] flex items-center gap-3">
                        <TrendingUp size={24} className="text-amber-500" /> Emerging Trends
                    </h3>

                    <div className="space-y-6">
                        {news.slice(0, 3).map(n => (
                            <div 
                                key={n.id} 
                                className="card p-6 border border-[var(--border-color)] bg-[var(--surface-color)] hover:border-indigo-500/30 transition-all cursor-pointer group rounded-2xl"
                                onClick={() => setSelectedArticle(n)}
                            >
                                <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 opacity-70 italic leading-none flex items-center gap-2">
                                     <Zap size={10} fill="currentColor" /> Market Pulse
                                </div>
                                <h4 className="text-sm font-black italic tracking-tight uppercase text-[var(--text-dark)] group-hover:text-indigo-500 transition-colors mb-2 line-clamp-2">
                                    {n.title}
                                </h4>
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-50 flex items-center gap-2">
                                    <MessageSquare size={12} /> {n.category_name || 'News'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card p-8 bg-gradient-to-br from-indigo-500/10 to-amber-500/5 border border-[var(--border-color)] rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Gift size={120} strokeWidth={1} />
                        </div>
                        <h4 className="text-lg font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-2 italic">Referral Rewards</h4>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase leading-relaxed tracking-wider mb-6 opacity-70 italic max-w-xs">
                           Become an 'Elite Partner' by referring 50 active users this month.
                        </p>
                        <button className="bg-[var(--surface-color)] text-black border border-[var(--border-color)] px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:border-indigo-500 transition-all flex items-center gap-3 relative z-10 italic">
                            Track Rewards <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserNews;
