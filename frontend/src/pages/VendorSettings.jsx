import React, { useState, useEffect } from 'react';
import { 
    User, Smartphone, Mail, ShieldCheck, 
    Lock, CheckCircle, Activity, Camera, 
    Save, Key, Globe, LogOut, ChevronRight,
    RefreshCcw, XCircle
} from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const VendorSettings = () => {
    const [profile, setProfile] = useState({
        full_name: '',
        phone: '',
        email: '',
        status: '',
        referral_code: '',
        wallet_balance: 0
    });
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/user/profile');
            if (data.success) {
                setProfile(data.data);
                // Auto-sync localStorage
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (storedUser && data.data.full_name) {
                    localStorage.setItem('user', JSON.stringify({ ...storedUser, name: data.data.full_name }));
                    window.dispatchEvent(new Event('userProfileUpdated'));
                }
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
            setMessage({ type: 'error', text: 'Cloud synchronization failed. Reconnecting...' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { data } = await api.put('/user/profile', {
                full_name: profile.full_name,
                email: profile.email
            });
            if (data.success) {
                setMessage({ type: 'success', text: 'Partner profile updated successfully.' });
                // Update local storage
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...storedUser, name: profile.full_name }));
                window.dispatchEvent(new Event('userProfileUpdated'));
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile. Server error.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="animate-fade-in space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 italic">
                        Account Protocol <Lock size={10} /> Profile Management
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">My Settings</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic">Manage your partner credentials and global preferences.</p>
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="px-8 py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/5 active:scale-95 transition-all flex items-center gap-3 hover:bg-rose-600 hover:text-white"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            {message.text && (
                <div className={`mx-2 p-5 rounded-[2rem] flex items-center gap-4 animate-slide-up border ${
                    message.type === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                }`}>
                    {message.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="text-[11px] font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Identity Card */}
                <div className="card shadow-2xl border border-[var(--border-color)] bg-[var(--surface-color)] rounded-[2.5rem] overflow-hidden">
                    <div className="h-32 bg-indigo-500/5 border-b border-[var(--border-color)] relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10 text-indigo-500 rotate-12">
                            <ShieldCheck size={120} strokeWidth={1} />
                        </div>
                    </div>
                    <div className="px-8 pb-10 -mt-16 flex flex-col items-center relative z-10 text-center">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-[var(--surface-color)] border-4 border-[var(--surface-color)] shadow-2xl overflow-hidden flex items-center justify-center text-indigo-500 group">
                            <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center transition-all group-hover:scale-110">
                                <User size={56} strokeWidth={1.5} />
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <h3 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-2">{profile.full_name || profile.phone || 'Partner Profile'}</h3>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
                                Official Partner
                            </div>
                        </div>

                        <div className="w-full mt-10 grid grid-cols-2 gap-3">
                             <div className="p-4 rounded-2xl bg-[var(--bg-color)]/50 border border-[var(--border-color)]">
                                <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 opacity-60">Status</div>
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{profile.status || 'ACTIVE'}</div>
                             </div>
                             <div className="p-4 rounded-2xl bg-[var(--bg-color)]/50 border border-[var(--border-color)]">
                                <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 opacity-60">Partner ID</div>
                                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{profile.referral_code || 'VND-XXXX'}</div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Identity Configuration */}
                <div className="lg:col-span-2 space-y-8">
                    
                    <div className="card shadow-2xl border border-[var(--border-color)] bg-[var(--surface-color)] rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border-color)] bg-gradient-to-r from-indigo-500/5 to-transparent flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                                    <Globe size={20} />
                                </div>
                                <h3 className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight">Profile Details</h3>
                            </div>
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Verified Vendor
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="p-8 lg:p-10 space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Full Legal Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--text-dark)] uppercase tracking-tight focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/5 transition-all outline-none"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                            placeholder="John Doe"
                                        />
                                        <Edit3 size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-30" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Phone Number (Protected)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-color)]/50 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--text-muted)] uppercase tracking-widest tabular-nums outline-none cursor-not-allowed italic opacity-70"
                                        value={profile.phone}
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Email Endpoint</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--text-dark)] lowercase tracking-tight focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/5 transition-all outline-none"
                                            value={profile.email}
                                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                                            placeholder="vendor@geega.com"
                                        />
                                        <Mail size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-30" />
                                    </div>
                                </div>
                             </div>

                             <button
                                type="submit"
                                disabled={isSaving || loading}
                                className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 border-none cursor-pointer disabled:opacity-50"
                            >
                                {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                                {isSaving ? 'Updating...' : 'Save Profile Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Security Management */}
                    <div className="card shadow-2xl border border-[var(--border-color)] bg-[var(--surface-color)] rounded-[2.5rem] overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                         <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between">
                            <div className="flex items-center gap-4 text-rose-500">
                                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                    <Lock size={20} />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Security & Access</h3>
                            </div>
                        </div>
                        <div className="p-8 flex items-center justify-between gap-6">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest italic opacity-70 max-w-[300px]">
                                Your account is protected by industry-standard encryption. We suggest updating your password every 90 days.
                            </p>
                            <button className="px-6 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-[var(--text-dark)] hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all flex items-center gap-3">
                                <Key size={14} /> Change Password
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Internal icon for editing
const Edit3 = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
);

export default VendorSettings;
