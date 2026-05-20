import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Save, ShieldAlert, Key } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Cryptographic Mismatch: Confirm password does not match!");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("Security Requirement: Password must be at least 6 characters!");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/user/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (data.success) {
                toast.success("Security Credentials Updated Successfully!");
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                
                // Determine redirect path based on user role
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const role = storedUser.role;
                const isSubVendor = role === 'vendor' && storedUser.referred_by;
                
                setTimeout(() => {
                    if (isSubVendor) navigate('/sub-vendor/settings');
                    else if (role === 'vendor') navigate('/vendor/settings');
                    else if (role === 'admin') navigate('/profile');
                    else navigate('/user/profile');
                }, 1000);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to update credentials.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-10 pb-20 max-w-2xl mx-auto px-2">
            {/* Header Section */}
            <div className="flex flex-col gap-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] italic">
                    Security Core <Key size={12} /> Access Cryptography
                </div>
                <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-1">
                    Update Access Key
                </h1>
                <p className="text-xs font-bold text-[var(--text-muted)] italic">
                    Restructure and reinforce your cryptographic access parameters.
                </p>
            </div>

            {/* Change Password Card */}
            <div className="card shadow-2xl border border-[var(--border-color)] bg-[var(--surface-color)] rounded-[3rem] overflow-hidden">
                <div className="p-8 md:p-10 border-b border-[var(--border-color)] bg-gradient-to-r from-indigo-500/5 to-transparent flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-md">
                        <Lock size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[var(--text-dark)] uppercase tracking-tight">Access Control Panel</h3>
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Re-key authentication credentials</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                    <div className="space-y-6">
                        {/* Current Password */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Current Password Key</label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    required
                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--text-dark)] focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/5 transition-all outline-none"
                                    placeholder="Enter current password key"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50 hover:opacity-100 transition-opacity border-none bg-transparent cursor-pointer flex items-center justify-center"
                                >
                                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">New Password Key</label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    required
                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--text-dark)] focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/5 transition-all outline-none"
                                    placeholder="Min 6 characters required"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50 hover:opacity-100 transition-opacity border-none bg-transparent cursor-pointer flex items-center justify-center"
                                >
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Confirm New Key</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--text-dark)] focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/5 transition-all outline-none"
                                    placeholder="Re-enter new password key"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50 hover:opacity-100 transition-opacity border-none bg-transparent cursor-pointer flex items-center justify-center"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                        <ShieldAlert size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] font-bold text-amber-600/90 uppercase tracking-wide leading-relaxed">
                            Securing protocols: Updating password keys will terminate existing active login sessions across other user terminals to prevent unauthorized side-channel token leaks.
                        </p>
                    </div>

                    <div className="pt-6 border-t border-[var(--border-color)] flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                                const role = storedUser.role;
                                const isSubVendor = role === 'vendor' && storedUser.referred_by;
                                if (isSubVendor) navigate('/sub-vendor/settings');
                                else if (role === 'vendor') navigate('/vendor/settings');
                                else if (role === 'admin') navigate('/profile');
                                else navigate('/user/profile');
                            }}
                            className="px-8 py-4 font-black text-[var(--text-muted)] hover:text-[var(--text-dark)] uppercase tracking-widest text-[10px] transition-colors border-none bg-transparent cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2 border-none cursor-pointer"
                        >
                            {loading ? 'Restructuring...' : <><Save size={14} /> Commit Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
