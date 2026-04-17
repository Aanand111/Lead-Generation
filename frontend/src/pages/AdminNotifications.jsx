import React, { useState, useEffect } from 'react';
import { 
    Bell, Send, Users, Shield, Target, 
    History, CheckCircle, AlertCircle, RefreshCcw,
    LayoutGrid, UserCheck, MessageSquare
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        targetType: 'ALL', // ALL, ROLE, SPECIFIC
        targetRole: 'user',
        targetIds: ''
    });
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.body) {
            return toast.error("Title and body are required");
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            if (formData.targetType === 'SPECIFIC') {
                payload.targetIds = formData.targetIds.split(',').map(id => id.trim());
            }

            const { data } = await api.post('/admin/notifications/send', payload);
            if (data.success) {
                toast.success(data.message);
                setFormData({
                    title: '',
                    body: '',
                    targetType: 'ALL',
                    targetRole: 'user',
                    targetIds: ''
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to dispatch notification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-32">
            <header>
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                    System Control <Bell size={10} /> Push Engine
                </div>
                <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Communication Hub</h1>
                <p className="text-xs font-bold text-[var(--text-muted)] leading-none">Draft and dispatch targeted real-time alerts across the network nodes.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Notification Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Send size={120} />
                        </div>
                        
                        <form onSubmit={handleSend} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Dispatch Target</label>
                                    <select 
                                        className="w-full p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-indigo-500"
                                        value={formData.targetType}
                                        onChange={(e) => setFormData({...formData, targetType: e.target.value})}
                                    >
                                        <option value="ALL">All Network Nodes (Broadcast)</option>
                                        <option value="ROLE">Specific Entity Role</option>
                                        <option value="SPECIFIC">Targeted User Multi-Select</option>
                                    </select>
                                </div>

                                {formData.targetType === 'ROLE' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Entity Role</label>
                                        <select 
                                            className="w-full p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-indigo-500"
                                            value={formData.targetRole}
                                            onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                                        >
                                            <option value="user">Customers (Buyers)</option>
                                            <option value="vendor">Vendors (Suppliers)</option>
                                            <option value="admin">Administrators</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {formData.targetType === 'SPECIFIC' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">User Selection (IDs via Comma)</label>
                                    <textarea 
                                        className="w-full p-6 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-3xl text-xs font-bold outline-none focus:border-indigo-500 min-h-[100px]"
                                        placeholder="Enter User IDs separated by commas..."
                                        value={formData.targetIds}
                                        onChange={(e) => setFormData({...formData, targetIds: e.target.value})}
                                    />
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 italic">Pro Tip: Select IDs from the user management list.</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Alert Title</label>
                                <input 
                                    className="w-full p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-indigo-500"
                                    placeholder="Enter short punchy title..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Notification Body</label>
                                <textarea 
                                    className="w-full p-6 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-3xl text-sm font-bold outline-none focus:border-indigo-500 min-h-[120px]"
                                    placeholder="Detailed message for the push notification..."
                                    value={formData.body}
                                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Send size={18} />}
                                Initiate Dispatch Sequence
                            </button>
                        </form>
                    </div>
                </div>

                {/* Quick Info & Stats */}
                <div className="space-y-8">
                    <div className="card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3rem] shadow-sm relative overflow-hidden group">
                        <History size={100} className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-black uppercase tracking-tight text-[var(--text-dark)] mb-6 flex items-center gap-3 italic"><LayoutGrid size={18} className="text-indigo-600" /> Dispatch Presets</h4>
                        <div className="space-y-3">
                            <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color)] cursor-pointer hover:border-indigo-500/30 transition-all">
                                <span className="text-[10px] font-black uppercase text-indigo-600 mb-1 block">Maintenance Alert</span>
                                <p className="text-[10px] font-bold text-[var(--text-muted)]">System scheduled for upgrade at 02:00 AM.</p>
                            </div>
                            <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color)] cursor-pointer hover:border-indigo-500/30 transition-all">
                                <span className="text-[10px] font-black uppercase text-emerald-600 mb-1 block">New Offer Banner</span>
                                <p className="text-[10px] font-bold text-[var(--text-muted)]">New credit packages are live! Check deals.</p>
                            </div>
                            <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color)] cursor-pointer hover:border-indigo-500/30 transition-all opacity-50">
                                <span className="text-[10px] font-black uppercase text-rose-600 mb-1 block">Security Audit</span>
                                <p className="text-[10px] font-bold text-[var(--text-muted)]">Reset your API keys for enhanced safety.</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-[3rem] shadow-xl relative overflow-hidden">
                        <Shield size={120} className="absolute -bottom-4 -left-4 opacity-10" />
                        <h4 className="text-xl font-black uppercase tracking-tight text-white mb-2 leading-none">Security Protocol</h4>
                        <p className="text-[10px] font-medium text-white/60 leading-relaxed uppercase tracking-widest mb-6 underline decoration-indigo-500 underline-offset-4 decoration-2">Verified Admin Authorization required for bulk dispatch.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">End-to-end Socket encryption</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Low Latency Dispatch (1ms)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Rate Limited: 5000 msg/sec</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
