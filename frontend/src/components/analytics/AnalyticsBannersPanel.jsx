import React from 'react';

const AnalyticsBannersPanel = ({ analytics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {analytics.bannerPerformance.map((banner, index) => (
                <div key={index} className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm relative overflow-hidden group transition-all hover:translate-y-[-4px] hover:border-indigo-500/30">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-1000 blur-2xl"></div>

                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${parseFloat(banner.ctr) >= 5 ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                                <h4 className="font-black text-sm uppercase tracking-tight text-[var(--text-dark)] leading-none pt-0.5">{banner.title}</h4>
                            </div>
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic leading-none">{banner.placement} Cluster</p>
                        </div>
                        <div className="bg-indigo-600 text-white h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-100 italic pt-0.5">
                            #{index + 1}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 relative z-10 mb-10">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">Views</p>
                            <p className="text-xl font-black text-[var(--text-dark)] tracking-tighter tabular-nums leading-none">{(parseInt(banner.views, 10) || 0).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">Clicks</p>
                            <p className="text-xl font-black text-indigo-600 tracking-tighter tabular-nums leading-none">{(parseInt(banner.clicks, 10) || 0).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none">CTR Index</p>
                            <p className="text-xl font-black text-emerald-500 tracking-tighter tabular-nums leading-none">{parseFloat(banner.ctr || 0).toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <div className="h-2 w-full bg-[var(--bg-color)] rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                            <div
                                className={`h-full transition-all duration-1000 ${parseFloat(banner.ctr) >= 5 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-indigo-500'}`}
                                style={{ width: `${parseFloat(banner.ctr) * 10}%`, minWidth: '4px' }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] italic overflow-hidden leading-none mt-1">
                            <span>Engagement Tracking</span>
                            <span className={parseFloat(banner.ctr) >= 5 ? 'text-emerald-500' : 'text-indigo-500'}>{parseFloat(banner.ctr) >= 5 ? 'High Performance' : 'Normal'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AnalyticsBannersPanel;
