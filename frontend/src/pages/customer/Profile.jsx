import React, { useState, useEffect } from 'react';
import { 
    User, Smartphone, Mail, MapPin, ShieldCheck, 
    Lock, CheckCircle, Activity, Camera, Edit3, 
    Save, Trash2, Key, Target, Globe, CreditCard,
    Zap, Gem, LogOut, ChevronRight
} from 'lucide-react';
import api from '../../utils/api';

const UserProfile = () => {
    const [profile, setProfile] = useState({
        name: 'User Name',
        phone: '9329384316',
        email: 'user@geega.com',
        city: 'Indore',
        state: 'MP',
        pincode: '452001',
        profile_pic: null
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/user/profile');
            if (data.success) {
                setProfile(data.data);
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
            const { data } = await api.put('/user/profile', profile);
            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Profile Settings</h2>
                    <p>Manage your account details and security settings</p>
                </div>
                <div className="pageHeaderActions flex items-center gap-4">
                     <button onClick={() => {/* Logout logic */}} className="btn bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/10 flex items-center gap-3 font-black uppercase tracking-widest text-[11px] px-8 py-3.5 rounded-2xl shadow-xl shadow-rose-500/10 transition-all">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`mb-8 p-5 rounded-[2rem] flex items-center gap-4 animate-slide-up border ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                    {message.type === 'error' ? <Activity size={24} /> : <CheckCircle size={24} />}
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-10">
                    <div className="card p-12 bg-[var(--surface-color)] border border-[var(--border-color)] text-center relative overflow-hidden rounded-[3rem] shadow-xl group">
                         <div className="absolute top-0 right-0 p-12 opacity-5 text-indigo-500 group-hover:opacity-10 transition-opacity">
                            <Target size={180} strokeWidth={1} />
                        </div>
                        
                        <div className="relative inline-block mb-10 group/avatar">
                            <div className="w-44 h-44 rounded-[3.5rem] bg-indigo-500/5 border-4 border-indigo-500/20 flex items-center justify-center text-indigo-500 overflow-hidden shadow-2xl transition-transform duration-500 group-hover/avatar:rotate-6 group-hover/avatar:scale-105">
                                {profile.profile_pic ? (
                                    <img src={profile.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                                ) : <User size={84} strokeWidth={1} />}
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white cursor-pointer hover:bg-indigo-600 transition-colors">
                                <Camera size={24} />
                            </button>
                        </div>
                        
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-2">{profile.name}</h3>
                        <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-8 opacity-70 leading-none">Member</p>

                        <div className="space-y-4 pt-10 border-t border-[var(--border-color)]">
                             <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-color)]/50 border border-[var(--border-color)] group hover:border-indigo-500/30 transition-all cursor-default relative overflow-hidden">
                                <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Account Status</div>
                                <div className="text-sm font-black text-emerald-500 tracking-widest tabular-nums uppercase leading-none">ACTIVE</div>
                             </div>
                             <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-color)]/50 border border-[var(--border-color)] group hover:border-indigo-500/30 transition-all cursor-default relative overflow-hidden">
                                <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Referral Bonus</div>
                                <div className="text-sm font-black text-indigo-500 tracking-widest tabular-nums uppercase leading-none">15% EXTRA</div>
                             </div>
                        </div>
                    </div>

                    <div className="card p-10 shadow-lg border border-[var(--border-color)] bg-[var(--surface-color)] group hover:border-indigo-500/20 transition-all flex items-center justify-between rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500 group-hover:opacity-10 transition-opacity">
                            <Key size={120} strokeWidth={1} />
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Lock size={24} />
                            </div>
                             <div>
                                <h4 className="text-xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-1 leading-none">Security</h4>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-70 leading-none mt-2">Update Password</p>
                            </div>
                        </div>
                        <ChevronRight size={24} className="text-[var(--text-muted)] group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </div>

                <div className="lg:col-span-2">
                     <div className="card shadow-2xl border border-[var(--border-color)] bg-[var(--surface-color)] rounded-[3rem] overflow-hidden">
                        <div className="p-10 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[var(--text-dark)]">Account Information</h3>
                                <div className="h-6 w-px bg-[var(--border-color)]"></div>
                                 <ShieldCheck size={24} className="text-emerald-500" />
                            </div>
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Encrypted Connection</div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black italic text-[var(--text-dark)] uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <User size={14} className="text-indigo-500" /> Full Name
                                    </label>
                                    <input 
                                        type="text" value={profile.name} 
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-6 py-5 text-sm font-black text-[var(--text-dark)] uppercase tracking-widest italic focus:border-indigo-500 transition-all outline-none shadow-sm focus:shadow-indigo-500/10" 
                                        placeholder="Full Name"
                                    />
                                </div>
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black italic text-[var(--text-dark)] uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Smartphone size={14} className="text-indigo-500" /> Phone Number
                                    </label>
                                    <input 
                                        type="text" value={profile.phone} readOnly
                                        className="w-full bg-[var(--bg-color)]/50 border border-[var(--border-color)] rounded-2xl px-6 py-5 text-sm font-black text-[var(--text-muted)] uppercase tracking-widest italic outline-none cursor-not-allowed tabular-nums shadow-inner" 
                                    />
                                     <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1 ml-2 italic">Phone number cannot be changed</div>
                                </div>
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black italic text-[var(--text-dark)] uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Mail size={14} className="text-indigo-500" /> Email Address
                                    </label>
                                    <input 
                                        type="email" value={profile.email} 
                                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-6 py-5 text-sm font-black text-[var(--text-dark)] italic focus:border-indigo-500 transition-all outline-none shadow-sm focus:shadow-indigo-500/10" 
                                        placeholder="Email Address"
                                    />
                                </div>
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black italic text-[var(--text-dark)] uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Globe size={14} className="text-indigo-500" /> Location
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input 
                                            type="text" value={profile.city} 
                                            onChange={(e) => setProfile({...profile, city: e.target.value})}
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-4 text-xs font-black text-[var(--text-dark)] uppercase tracking-widest italic focus:border-indigo-500 transition-all outline-none" 
                                            placeholder="City"
                                        />
                                        <input 
                                            type="text" value={profile.state} 
                                            onChange={(e) => setProfile({...profile, state: e.target.value})}
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-4 text-xs font-black text-[var(--text-dark)] uppercase tracking-widest italic focus:border-indigo-500 transition-all outline-none" 
                                            placeholder="State"
                                        />
                                    </div>
                                </div>
                            </div>

                             <div className="space-y-4">
                                <label className="text-[11px] font-black italic text-[var(--text-dark)] uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <MapPin size={14} className="text-indigo-500" /> Pincode
                                </label>
                                <input                                     type="text" value={profile.pincode} 
                                    onChange={(e) => setProfile({...profile, pincode: e.target.value})}
                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-6 py-5 text-sm font-black text-[var(--text-dark)] italic focus:border-indigo-500 transition-all outline-none shadow-sm tabular-nums" 
                                    placeholder="Enter pincode"
                                />
                           </div>

                             <div className="pt-10 border-t border-[var(--border-color)] flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                     <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">
                                        <CheckCircle size={14} /> Account Verified
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">
                                        <Gem size={14} fill="currentColor" /> Premium Status
                                    </div>
                                </div>
                               <div className="flex gap-4">
                                    <button type="button" className="px-10 py-5 bg-[var(--bg-color)] text-[var(--text-muted)] hover:bg-[var(--border-color)] font-black uppercase tracking-widest text-[11px] rounded-3xl transition-all border-none cursor-pointer italic">Revert Changes</button>
                                     <button type="submit" disabled={loading} className="btn btn-primary px-14 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                                        {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
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
