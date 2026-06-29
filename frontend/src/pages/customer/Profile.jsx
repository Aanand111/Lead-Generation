import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    User, Smartphone, Mail, MapPin, ShieldCheck,
    Lock, CheckCircle, Activity, Camera, Edit3,
    Save, Trash2, Key, Target, Globe, CreditCard,
    Zap, Gem, LogOut, ChevronRight, Settings, Sparkles,
    Shield, Map as MapIcon
} from 'lucide-react';
import api from '../../utils/api';
import { useTheme } from '../../utils/ThemeContext';

const UserProfile = () => {
    const { isPremium: isUserPremium } = useTheme();
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleRequestPasswordReset = async () => {
        const toastId = toast.loading('Initiating secure password reset link...');
        try {
            const { data } = await api.post('/user/request-password-reset');
            if (data.success) {
                toast.success(data.message || 'Password reset link sent to your registered Gmail address!', { id: toastId, duration: 6000 });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to dispatch password reset link. Please try again.', { id: toastId, duration: 6000 });
        }
    };
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        pincode: '',
        address: '',
        pan_number: '',
        profile_pic: null
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/user/profile');
            if (data.success) {
                setProfile({
                    ...data.data,
                    name: data.data.full_name || data.data.name || '',
                    phone: data.data.phone || '',
                    email: data.data.email || '',
                    city: data.data.city || '',
                    state: data.data.state || '',
                    pincode: data.data.pincode || '',
                    address: data.data.address || '',
                    pan_number: data.data.pan_number || ''
                });
                
                // Sync local storage so Header reflects DB changes immediately
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (storedUser.id) {
                    const updatedUser = {
                        ...storedUser,
                        name: data.data.full_name || data.data.name || storedUser.name,
                        full_name: data.data.full_name || data.data.name || storedUser.full_name,
                        phone: data.data.phone || storedUser.phone,
                        email: data.data.email || storedUser.email,
                        profile_pic: data.data.profile_pic || storedUser.profile_pic
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event('userProfileUpdated'));
                }
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...profile,
                full_name: profile.name // Override old full_name with the updated name
            };
            const { data } = await api.put('/user/profile', payload);
            if (data.success) {
                // Update local storage so Header reflects the new name and number
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = {
                    ...storedUser,
                    name: profile.name,
                    full_name: profile.name,
                    phone: profile.phone,
                    email: profile.email
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('userProfileUpdated'));

                setMessage({ type: 'success', text: 'Profile Vault Updated.' });

                // Force reload after a short delay to ensure everything syncs visually
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Synchronization Failed.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Please select a JPG, PNG, or WEBP image.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setLoading(true);
        try {
            const { data } = await api.post('/user/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (data.success) {
                setProfile({ ...profile, profile_pic: data.url });
                
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                storedUser.profile_pic = data.url;
                localStorage.setItem('user', JSON.stringify(storedUser));
                window.dispatchEvent(new Event('userProfileUpdated'));

                setMessage({ type: 'success', text: 'Identity Visual Updated.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Photo Upload Failed.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="page-content animate-fade-in space-y-10 pb-20">
            {/* --- Profile Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Secure Node</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">
                            <ShieldCheck size={12} /> Identity Verified
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-[var(--text-dark)] tracking-tighter uppercase leading-none italic">
                        Account <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isUserPremium ? 'from-[#F5E5AB] via-[#D4AF37] to-[#F5E5AB] animate-shine' : 'from-indigo-600 to-indigo-400'}`}>Identity</span>
                    </h1>
                </div>
                <button className="px-8 py-4 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-xl shadow-rose-500/5">
                    <LogOut size={18} /> Terminate Session
                </button>
            </div>

            {/* --- Status Message --- */}
            {message.text && (
                <div className={`p-6 rounded-[2rem] border-2 backdrop-blur-xl flex items-center gap-5 animate-slide-up ${message.type === 'error' ? 'bg-rose-500/5 text-rose-600 border-rose-500/10' : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                    }`}>
                    <div className="w-10 h-10 rounded-2xl bg-current/10 flex items-center justify-center">
                        {message.type === 'error' ? <Activity size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* --- Left Column: Summary & Quick Links --- */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="card p-10 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3.5rem] shadow-xl relative overflow-hidden group text-center">
                        <div className={`absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>
                            <User size={200} strokeWidth={1} />
                        </div>

                        <div className="relative inline-block mb-8 group/avatar">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".jpg,.jpeg,.png,.webp" 
                                onChange={handlePhotoChange} 
                            />
                            <div className={`w-40 h-40 rounded-[3rem] border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transform group-hover/avatar:rotate-3 transition-transform duration-500 ${isUserPremium ? 'from-[#D4AF37]/10 to-transparent text-[#D4AF37] bg-gradient-to-br' : 'from-indigo-500/10 to-transparent text-indigo-500 bg-gradient-to-br'}`}>
                                {profile.profile_pic ? (
                                    <img src={profile.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                                ) : <User size={72} strokeWidth={1.5} />}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-[var(--surface-color)]"
                            >
                                <Camera size={20} />
                            </button>
                        </div>

                        <h3 className="text-3xl font-black text-[var(--text-dark)] uppercase tracking-tighter italic mb-1">{profile.name}</h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>Authorized Partner</p>

                        <div className="space-y-3 pt-8 border-t border-[var(--border-color)]">
                            <div className={`flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-color)]/50 border border-transparent transition-all ${isUserPremium ? 'hover:border-[#D4AF37]/20' : 'hover:border-indigo-500/10'}`}>
                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Network Status</span>
                                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                                </span>
                            </div>
                            <div className={`flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-color)]/50 border border-transparent transition-all ${isUserPremium ? 'hover:border-[#D4AF37]/20' : 'hover:border-indigo-500/10'}`}>
                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Account Tier</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>Premium</span>
                            </div>
                        </div>
                    </div>

                    <div 
                        onClick={handleRequestPasswordReset}
                        className={`card p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group cursor-pointer flex items-center justify-between overflow-hidden ${isUserPremium ? 'hover:border-[#D4AF37]/30 shadow-[#D4AF37]/5' : 'hover:border-indigo-500/20'}`}
                    >
                        <div className={`absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>
                            <Lock size={120} strokeWidth={1} />
                        </div>
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${isUserPremium ? 'bg-[#D4AF37] text-black shadow-[#D4AF37]/20' : 'bg-indigo-500 text-white shadow-indigo-500/20'}`}>
                                <Key size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black uppercase tracking-tighter text-[var(--text-dark)]">Security Vault</h4>
                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">Update Password</p>
                            </div>
                        </div>
                        <ChevronRight size={24} className={`text-[var(--text-muted)] group-hover:translate-x-1 transition-all ${isUserPremium ? 'group-hover:text-[#D4AF37]' : 'group-hover:text-indigo-500'}`} />
                    </div>
                </div>

                <div className="lg:col-span-8">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 animate-bounce ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <Activity size={18} />}
                            {message.text}
                        </div>
                    )}
                    <div className="card bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[3.5rem] shadow-2xl overflow-hidden">
                        <div className="p-10 md:p-12 border-b border-[var(--border-color)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[var(--border-color)]/10">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isUserPremium ? 'bg-[#D4AF37] text-black' : 'bg-indigo-600'}`}>
                                    <Settings size={20} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tighter italic">Personal Metadata</h3>
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Update your profile parameters</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">
                                <Sparkles size={12} fill="currentColor" className="text-amber-400" /> End-to-End Encrypted
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 italic ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>
                                        <User size={14} /> Name
                                    </label>
                                    <input
                                        type="text" value={profile.name || ''}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className={`w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.5rem] px-8 py-5 text-sm font-black text-[var(--text-dark)] uppercase tracking-widest italic transition-all outline-none shadow-sm ${isUserPremium ? 'focus:border-[#D4AF37]' : 'focus:border-indigo-500'}`}
                                        placeholder="Name"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 italic ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>
                                        <Smartphone size={14} /> Registered Mobile
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text" value={profile.phone || ''}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            className={`w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.5rem] px-8 py-5 text-sm font-black text-[var(--text-dark)] uppercase tracking-widest italic transition-all outline-none tabular-nums shadow-sm ${isUserPremium ? 'focus:border-[#D4AF37]' : 'focus:border-indigo-500'}`}
                                            placeholder="Mobile Number"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 italic ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>
                                        <Mail size={14} /> Email Environment
                                    </label>
                                    <input
                                        type="email" value={profile.email || ''}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className={`w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.5rem] px-8 py-5 text-sm font-black text-[var(--text-dark)] lowercase tracking-wide transition-all outline-none shadow-sm ${isUserPremium ? 'focus:border-[#D4AF37]' : 'focus:border-indigo-500'}`}
                                        placeholder="Email Address"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 italic ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>
                                        <Globe size={14} /> Geographic Location
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text" value={profile.city || ''}
                                            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                            className={`w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.2rem] px-6 py-5 text-[11px] font-black text-[var(--text-dark)] uppercase tracking-widest italic transition-all outline-none shadow-sm ${isUserPremium ? 'focus:border-[#D4AF37]' : 'focus:border-indigo-500'}`}
                                            placeholder="City"
                                        />
                                        <input
                                            type="text" value={profile.state || ''}
                                            onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                                            className={`w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.2rem] px-6 py-5 text-[11px] font-black text-[var(--text-dark)] uppercase tracking-widest italic transition-all outline-none shadow-sm ${isUserPremium ? 'focus:border-[#D4AF37]' : 'focus:border-indigo-500'}`}
                                            placeholder="State"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 italic ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>
                                    <MapIcon size={14} /> Postal Index Number (PIN)
                                </label>
                                <input
                                    type="text" value={profile.pincode || ''}
                                    onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                                    className={`w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.5rem] px-8 py-5 text-sm font-black text-[var(--text-dark)] tabular-nums tracking-[0.5em] transition-all outline-none shadow-sm ${isUserPremium ? 'focus:border-[#D4AF37]' : 'focus:border-indigo-500'}`}
                                    placeholder="Enter 6-digit Pincode"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 italic ${isUserPremium ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>
                                    <CreditCard size={14} /> PAN Card Number (Identity)
                                </label>
                                <input
                                    type="text" value={profile.pan_number || ''}
                                    onChange={(e) => setProfile({ ...profile, pan_number: e.target.value.toUpperCase() })}
                                    className={`w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[1.5rem] px-8 py-5 text-sm font-black text-[var(--text-dark)] uppercase tracking-widest transition-all outline-none shadow-sm ${isUserPremium ? 'focus:border-[#D4AF37]' : 'focus:border-indigo-500'}`}
                                    placeholder="Enter PAN Number"
                                />
                            </div>

                            <div className="pt-10 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex flex-wrap items-center gap-6 justify-center">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">
                                        <Shield size={14} fill="currentColor" /> SSL SECURE
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] italic">
                                        <Gem size={14} fill="currentColor" /> PREMIUM ACCOUNT
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={fetchProfile}
                                        className="flex-1 md:flex-none px-10 py-5 text-[var(--text-muted)] hover:text-[var(--text-dark)] font-black uppercase tracking-widest text-[10px] transition-colors"
                                    >
                                        Revert
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`flex-1 md:flex-none px-14 py-5 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isUserPremium ? 'hover:bg-[#D4AF37] hover:text-black shadow-[#D4AF37]/5' : 'hover:bg-indigo-600'}`}
                                    >
                                        {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />} Update Profile
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
