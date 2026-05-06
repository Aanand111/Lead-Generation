import React, { lazy, Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    Award,
    Briefcase,
    ChevronRight,
    Download,
    FileSpreadsheet,
    Info,
    MousePointer2,
    PieChart,
    RefreshCcw,
    Target,
    UserCheck
} from 'lucide-react';
import api from '../utils/api';
import DeferredSectionLoader from '../components/DeferredSectionLoader';

const AnalyticsProductivityPanel = lazy(() => import('../components/analytics/AnalyticsProductivityPanel'));
const AnalyticsReportsPanel = lazy(() => import('../components/analytics/AnalyticsReportsPanel'));
const AnalyticsLeadsPanel = lazy(() => import('../components/analytics/AnalyticsLeadsPanel'));
const AnalyticsFeedbackPanel = lazy(() => import('../components/analytics/AnalyticsFeedbackPanel'));
const AnalyticsSubscriptionsPanel = lazy(() => import('../components/analytics/AnalyticsSubscriptionsPanel'));
const AnalyticsBannersPanel = lazy(() => import('../components/analytics/AnalyticsBannersPanel'));

const analyticsTabs = [
    { id: 'productivity', label: 'Vendor Productivity', icon: Briefcase },
    { id: 'leads', label: 'Lead Trends', icon: Target },
    { id: 'reports', label: 'Detailed Reports', icon: FileSpreadsheet },
    { id: 'feedback', label: 'Quality Trends', icon: Award },
    { id: 'subscriptions', label: 'Revenue & Subs', icon: PieChart },
    { id: 'banners', label: 'Banner optimization', icon: MousePointer2 }
];

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        vendorProductivity: [],
        feedbackTrends: [],
        bannerPerformance: [],
        subscriptionStats: [],
        leadLifecycle: { dailyVolume: [], categoryDistribution: [] },
        vendorTrends: []
    });
    const [leadReports, setLeadReports] = useState([]);
    const [reportFilters, setReportFilters] = useState({ status: '', category: '' });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('productivity');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setMessage('');

        try {
            const { data } = await api.get('/admin/analytics/granular');
            if (data.success) {
                setAnalytics(data.data);
            }

            const reportResponse = await api.get('/admin/analytics/lead-reports');
            if (reportResponse.data.success) {
                setLeadReports(reportResponse.data.data);
            }
        } catch (error) {
            console.error('Fetch analytics error:', error);
            setMessage('Failed to load analytics data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format = 'xlsx', type = 'leads') => {
        try {
            const response = await api.get('/admin/analytics/export-leads', {
                params: { ...reportFilters, format, type },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type === 'leads' ? 'Lead_Report' : 'Vendor_Report'}_${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`${type.toUpperCase()} ${format.toUpperCase()} generated!`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Generation failed. Try again.');
        }
    };

    const renderActivePanel = () => {
        switch (activeTab) {
            case 'productivity':
                return <AnalyticsProductivityPanel analytics={analytics} />;
            case 'leads':
                return <AnalyticsLeadsPanel analytics={analytics} />;
            case 'reports':
                return (
                    <AnalyticsReportsPanel
                        analytics={analytics}
                        leadReports={leadReports}
                        reportFilters={reportFilters}
                        setReportFilters={setReportFilters}
                    />
                );
            case 'feedback':
                return <AnalyticsFeedbackPanel analytics={analytics} />;
            case 'subscriptions':
                return <AnalyticsSubscriptionsPanel analytics={analytics} />;
            case 'banners':
                return <AnalyticsBannersPanel analytics={analytics} />;
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                        Admin Overview <ChevronRight size={10} /> Reports & Analytics
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Performance Analytics</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] leading-none">Detailed analysis of vendor productivity, conversion rates, and quality reports.</p>
                </div>
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={() => handleExport('xlsx', 'leads')}
                        className="px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 uppercase text-[9px] font-black tracking-widest border border-emerald-500"
                    >
                        <FileSpreadsheet size={14} /> Leads (XLSX)
                    </button>
                    <button
                        onClick={() => handleExport('csv', 'leads')}
                        className="px-4 py-3 bg-slate-700 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 uppercase text-[9px] font-black tracking-widest"
                    >
                        <Download size={14} /> Leads (CSV)
                    </button>
                    <button
                        onClick={() => handleExport('xlsx', 'vendors')}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 uppercase text-[9px] font-black tracking-widest border border-indigo-500"
                    >
                        <UserCheck size={14} /> Vendors (XLSX)
                    </button>
                    <button
                        onClick={fetchAnalytics}
                        className="p-3 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-muted)] hover:text-indigo-500 transition-all shadow-sm active:scale-95 flex items-center gap-2 uppercase text-[9px] font-black tracking-widest"
                    >
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </header>

            <div className="flex gap-2 p-1.5 bg-[var(--bg-color)]/50 rounded-2xl border border-[var(--border-color)] w-max max-w-full overflow-x-auto shadow-inner">
                {analyticsTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-md translate-y-[-1px]'
                                : 'text-[var(--text-muted)] hover:text-indigo-500 hover:bg-white/50'
                        }`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-4">
                    <div className="spinner"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest animate-pulse text-indigo-500">Loading Analytics Data...</span>
                </div>
            ) : (
                <div className="space-y-8 animate-slide-up">
                    {message && (
                        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-widest">
                            {message}
                        </div>
                    )}
                    <Suspense fallback={<DeferredSectionLoader label="Loading analytics panel..." />}>
                        {renderActivePanel()}
                    </Suspense>
                </div>
            )}

            {!loading && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 hidden md:block">
                    <div className="p-6 bg-indigo-900 text-indigo-100 rounded-[2.5rem] shadow-2xl shadow-indigo-600/30 border border-white/10 backdrop-blur-xl flex items-center gap-6 group hover:scale-[1.02] transition-all cursor-default">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 animate-pulse border border-white/5">
                            <Info size={24} />
                        </div>
                        <div className="flex-1 overflow-hidden leading-none mb-1">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-white mb-2 leading-none">Analytics Help</h5>
                            <p className="text-[10px] font-medium text-white/70 leading-relaxed">
                                Use the conversion data to identify underperforming vendors. Ideally, vendors with low conversion should be reviewed.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
