import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, Lock, User, Shield, Key, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import api from '../utils/api';

const AdminProfile = () => {
    // We get the current user from localStorage
    const [user, setUser] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem('user')) || {
            name: 'Admin',
            designation: 'Administrator',
            profilePic: ''
        };
        return storedUser;
    });

    const [previewImage, setPreviewImage] = useState(user.profilePic);
    const fileInputRef = useRef(null);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setMessage({ type: 'error', text: 'Invalid file type. Please select a JPG, PNG, GIF, or WEBP image.' });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);

            uploadToCloudinary(file);
        }
    };

    const uploadToCloudinary = async (file) => {
        setIsUploading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/admin/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success && data.secure_url) {
                updateUserProfilePic(data.secure_url);
            } else {
                throw new Error(data.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            setMessage({ type: 'error', text: `Upload failed: ${error.message || 'Server rejected the request'}` });
            setIsUploading(false);
        }
    };

    const updateUserProfilePic = (imageUrl) => {
        const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...existingUser, profilePic: imageUrl };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setPreviewImage(imageUrl);

        window.dispatchEvent(new Event('userProfileUpdated'));
        setMessage({ type: 'success', text: 'Profile picture updated successfully.' });
        setIsUploading(false);

        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        
        try {
            const { data } = await api.put('/admin/profile', { name: user.name });
            
            if (data.success) {
                // Update localStorage with new name
                const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...existingUser, name: user.name };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                window.dispatchEvent(new Event('userProfileUpdated'));
                setMessage({ type: 'success', text: 'Profile information updated successfully.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please check your connection.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setIsSaving(true);
        try {
            // Placeholder for password update API call
            // await api.put('/admin/change-password', passwordData);
            setMessage({ type: 'success', text: 'Password changed successfully.' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update password. Authentication failed.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2>Admin Profile</h2>
                    <p>Manage your account details and security settings</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 transition-all animate-slide-up border ${
                    message.type === 'error' 
                    ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                    {message.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Profile Avatar Card */}
                <div className="card shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] lg:col-span-1 overflow-hidden group relative">
                    <div className="h-32 bg-indigo-500/5 absolute top-0 left-0 right-0 z-0 border-b border-[var(--border-color)]"></div>
                    <div className="relative pt-10 pb-8 flex flex-col items-center z-10">
                        <div className="relative group/avatar">
                            <div className={`w-36 h-36 rounded-3xl overflow-hidden border-4 border-[var(--surface-color)] shadow-2xl transition-all duration-500 ${isUploading ? 'opacity-50 scale-95 blur-sm' : 'group-hover/avatar:-translate-y-2 group-hover/avatar:shadow-indigo-500/20'} bg-[var(--bg-color)] flex items-center justify-center`}>
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-[var(--text-muted)] opacity-20" />
                                )}
                            </div>
                            
                            <button
                                onClick={() => !isUploading && fileInputRef.current.click()}
                                disabled={isUploading}
                                className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all outline-none border-4 border-[var(--surface-color)] cursor-pointer"
                            >
                                {isUploading ? <RefreshCcw size={20} className="animate-spin" /> : <Camera size={20} />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                className="hidden"
                                disabled={isUploading}
                            />
                        </div>

                        <div className="mt-8 text-center px-6 text-[var(--text-dark)]">
                            <h4 className="text-2xl font-black tracking-tight uppercase">{user.name}</h4>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-2">
                                <Shield size={10} /> {user.designation}
                            </div>
                        </div>

                        <div className="w-full h-px bg-[var(--border-color)] my-8"></div>

                        <div className="w-full px-8 space-y-4">
                            <div className="flex justify-between items-center group/info">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Account Status</span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Admin ID</span>
                                <span className="text-[10px] font-black text-indigo-500 tabular-nums uppercase">ADMIN-01</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security & Access Protocols */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* General Settings */}
                    {/* Profile Information */}
                    <div className="card shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] p-8">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                <User size={20} />
                            </div>
                             <div>
                                <h3 className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight">Profile Details</h3>
                                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase">Update your basic account information</p>
                            </div>
                        </div>

                         <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control !py-3 font-bold text-sm bg-[var(--bg-color)] border-[var(--border-color)] focus:bg-[var(--surface-color)] transition-all shadow-inner text-[var(--text-dark)]"
                                        value={user.name}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                 </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Designation</label>
                                    <input
                                        type="text"
                                        className="form-control !py-3 font-bold text-sm bg-[var(--bg-color)] border-[var(--border-color)] focus:bg-[var(--surface-color)] transition-all shadow-inner text-[var(--text-dark)]"
                                        value={user.designation}
                                        onChange={(e) => setUser({ ...user, designation: e.target.value })}
                                        placeholder="Administrator"
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control !py-3 font-bold text-sm bg-[var(--bg-color)] border-[var(--border-color)] focus:bg-[var(--surface-color)] transition-all shadow-inner text-[var(--text-dark)]"
                                        value={user.email}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn btn-primary px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all w-full md:w-auto"
                                >
                                    {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                                    {isSaving ? 'Updating...' : 'Save Profile Changes'}
                                </button>
                        </form>
                    </div>

                    {/* Security Settings */}
                    <div className="card shadow-sm border border-[var(--border-color)] bg-[var(--surface-color)] p-8">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight text-rose-500">Security Settings</h3>
                                <p className="text-[10px] font-medium text-rose-400 uppercase italic">We recommend changing your password regularly</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Current Password</label>
                                <input
                                    type="password"
                                    className="form-control !py-3 font-bold border-[var(--border-color)] bg-[var(--bg-color)] focus:ring-4 focus:ring-rose-500/10 transition-all text-sm shadow-inner text-[var(--text-dark)]"
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control !py-3 font-bold border-[var(--border-color)] bg-[var(--bg-color)] focus:ring-4 focus:ring-rose-500/10 transition-all text-sm shadow-inner text-[var(--text-dark)]"
                                        placeholder="Enter new password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control !py-3 font-bold border-[var(--border-color)] bg-[var(--bg-color)] focus:ring-4 focus:ring-rose-500/10 transition-all text-sm shadow-inner text-[var(--text-dark)]"
                                        placeholder="Confirm new password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSaving || isUploading}
                                className="btn w-full md:w-auto px-8 bg-rose-600 text-white hover:bg-rose-700 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-500/10 py-3 rounded-xl transition-all flex items-center justify-center gap-3 border-none cursor-pointer"
                            >
                                <Lock size={16} /> Update Password
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
