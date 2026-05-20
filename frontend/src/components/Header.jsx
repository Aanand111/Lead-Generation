import React, { useState, useEffect, useEffectEvent } from 'react';
import { Menu, Bell, User, LogOut, Settings, ChevronDown, Shield, Moon, Sun, Trash2, Crown, Gem } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InsureeLogo from '../assets/insuree.png';

import { useTheme } from '../utils/ThemeContext';
import { acquireSocket, releaseSocket } from '../utils/socketClient';
import api from '../utils/api';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                const subVendorStatus = parsedUser.role === 'vendor' && !!parsedUser.referred_by;
                let displayRole = parsedUser.designation || parsedUser.role || 'User';
                if (subVendorStatus) displayRole = 'SUB-VENDOR';
                else if (displayRole.toLowerCase() === 'vendor') displayRole = 'VENDOR';
                else if (displayRole.toLowerCase() === 'admin') displayRole = 'ADMIN';

                return {
                    name: parsedUser.name || parsedUser.full_name || 'User',
                    designation: displayRole,
                    profilePic: parsedUser.profilePic || parsedUser.profile_pic || parsedUser.avatar || parsedUser.image || '',
                    isPremium: Boolean(parsedUser.isPremium)
                };
            } catch (e) {
                console.error("Initial user parse error", e);
            }
        }
        return {
            name: 'User',
            designation: 'Account',
            profilePic: '',
            isPremium: false
        };
    });




    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isSubVendor, setIsSubVendor] = useState(false);

    const formatNotificationTime = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const fetchNotifications = useEffectEvent(async () => {
        try {
            const response = await api.get('/notifications');
            if (response.data.success) {
                const mapped = response.data.notifications.map(n => ({
                    id: n.id,
                    title: n.title,
                    body: n.body,
                    time: formatNotificationTime(n.created_at),
                    isRead: n.is_read
                }));
                setNotifications(mapped);
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('[NOTIFY] Failed to fetch notifications', error);
        }
    });






    useEffect(() => {
        const fetchUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    const subVendorStatus = parsedUser.role === 'vendor' && !!parsedUser.referred_by;
                    setIsSubVendor(subVendorStatus);

                    let displayRole = parsedUser.designation || parsedUser.role || 'Admin';
                    if (subVendorStatus) displayRole = 'SUB-VENDOR';
                    else if (displayRole.toLowerCase() === 'vendor') displayRole = 'VENDOR';
                    else if (displayRole.toLowerCase() === 'admin') displayRole = 'ADMIN';

                    let fallbackName = 'User';
                    if (displayRole === 'ADMIN') fallbackName = 'Admin';
                    if (displayRole === 'VENDOR' || displayRole === 'SUB-VENDOR') fallbackName = 'Vendor';

                    setUser({
                        name: parsedUser.name || parsedUser.full_name || fallbackName,
                        designation: displayRole,
                        profilePic: parsedUser.profilePic || parsedUser.profile_pic || parsedUser.avatar || parsedUser.image || '',
                        isPremium: Boolean(parsedUser.isPremium)
                    });
                } catch (error) {
                    console.error("Error parsing user data", error);
                }
            }
        };

        fetchUser();
        void fetchNotifications();
        window.addEventListener('userProfileUpdated', fetchUser);

        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const token = localStorage.getItem('token');

        if (!parsedUser?.id || !token) {
            return () => window.removeEventListener('userProfileUpdated', fetchUser);
        }

        const socket = acquireSocket(token);
        const onNotification = (payload) => {
            const newNotification = {
                id: payload.id || Date.now(),
                title: payload.title,
                body: payload.body,
                time: 'Just now',
                isRead: false
            };
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        socket.on('notification', onNotification);

        return () => {
            socket.off('notification', onNotification);
            releaseSocket(socket);
            window.removeEventListener('userProfileUpdated', fetchUser);
        };
    }, []);


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <header className={`h-[70px] flex items-center justify-between px-6 fixed top-0 right-0 z-[999] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] border-b backdrop-blur-md ${isSidebarOpen ? 'left-[var(--sidebar-width)]' : 'left-[var(--sidebar-collapsed-width)]'} ${user.isPremium ? 'bg-[var(--surface-color)] border-amber-500/40 shadow-[0_2px_20px_rgba(245,158,11,0.15)]' : `bg-[var(--surface-color)] border-[var(--border-color)]`}`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className={`border-none cursor-pointer p-2 rounded-xl flex items-center justify-center transition-all duration-200 ${user.isPremium ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-indigo-500/5 text-[var(--primary)] hover:bg-indigo-500/10'}`}
                >
                    <Menu size={20} />
                </button>

                {!isSidebarOpen && (
                    <img
                        src={InsureeLogo}
                        alt="Logo"
                        className={`h-8 w-auto object-contain transition-opacity duration-300 ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
                    />
                )}
            </div>

            <div className="flex items-center gap-5">
                {theme === 'light' ? (
                    <Moon size={20} className="text-[var(--text-muted)] cursor-pointer" onClick={toggleTheme} />
                ) : (
                    <Sun size={20} className="text-[var(--text-muted)] cursor-pointer" onClick={toggleTheme} />
                )}

                {/* Notification Bell Dropdown */}
                <div className="relative">
                    <div className="relative cursor-pointer p-1.5 rounded-lg hover:bg-slate-500/5" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                        <Bell size={20} className="text-[var(--text-muted)]" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[var(--surface-color)]">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    {isNotificationOpen && (
                        <>
                            <div className="fixed inset-0 z-[999]" onClick={() => setIsNotificationOpen(false)} />
                            <div className="absolute top-[130%] right-0 w-[300px] max-h-[400px] overflow-hidden bg-[var(--surface-color)] shadow-xl rounded-2xl border border-[var(--border-color)] z-[1000] flex flex-col animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-indigo-500/5">
                                    <h4 className="text-sm font-bold text-indigo-500 uppercase tracking-wider">Notifications</h4>
                                    <button
                                        onClick={() => { setNotifications([]); setUnreadCount(0); }}
                                        className="p-1 hover:bg-red-500/10 rounded text-red-500 border-none bg-transparent cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center flex flex-col items-center gap-3">
                                            <Bell size={30} className="text-slate-500 opacity-20" />
                                            <p className="text-xs text-[var(--text-muted)] font-medium">No system notifications yet</p>
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} className="p-4 border-b border-[var(--border-color)] hover:bg-indigo-500/5 transition-colors cursor-pointer group">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                                        <Bell size={14} />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-bold text-[var(--text-dark)] group-hover:text-indigo-500 transition-colors tracking-tight">{notif.title}</span>
                                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{notif.body}</p>
                                                        <span className="text-[9px] text-indigo-500/50 font-medium mt-1 uppercase tracking-widest">{notif.time}</span>
                                                    </div>

                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <div className="p-3 text-center border-t border-[var(--border-color)]">
                                        <button className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest border-none bg-transparent cursor-pointer">View All Activity</button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>


                <div className="relative">
                    <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 cursor-pointer group px-2 py-1.5 rounded-2xl hover:bg-indigo-500/5 transition-all"
                    >
                        <div className="flex flex-col text-right leading-none gap-0.5">
                            <span className={`text-[13px] font-black uppercase tracking-tight ${user.isPremium ? 'text-white' : 'text-[var(--text-dark)]'}`}>
                                {user.name}
                            </span>
                            <div className={`inline-flex items-center justify-end gap-1 text-[9px] font-black uppercase tracking-widest ${user.isPremium ? 'text-amber-400' : isSubVendor ? 'text-amber-500' : 'text-indigo-500'}`}>
                                {user.isPremium ? <Crown size={10} fill="currentColor" /> : <Shield size={10} />}
                                {user.isPremium ? 'Elite User' : user.designation}
                            </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full shadow-sm border transition-all overflow-hidden flex items-center justify-center ${user.isPremium ? 'border-amber-500 ring-2 ring-amber-500/30 bg-black' : 'border-[var(--border-color)] bg-[var(--bg-color)] group-hover:border-indigo-500/30'}`}>
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user.isPremium
                                    ? <Crown size={18} className="text-amber-500" fill="currentColor" />
                                    : <User size={20} className="text-indigo-500" />
                            )}
                        </div>
                        <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-[999]" onClick={() => setIsDropdownOpen(false)} />
                            <div className="absolute top-[120%] right-0 w-[180px] bg-[var(--surface-color)] shadow-md rounded border border-[var(--border-color)] py-2 z-[1000]">
                                <div className="px-5 py-2 border-b border-[var(--border-color)] mb-1">
                                    <div className="font-semibold text-sm text-[var(--text-dark)]">{user.name}</div>
                                    <div className="text-xs text-[var(--text-muted)]">{user.designation}</div>
                                </div>
                                <button
                                    onClick={() => {
                                        let path = '/profile';
                                        if (isSubVendor) path = '/sub-vendor/settings';
                                        else if (user.designation.toLowerCase() === 'vendor') path = '/vendor/settings';
                                        else if (user.designation.toLowerCase() === 'user' || user.designation.toLowerCase() === 'customer') path = '/user/profile';

                                        navigate(path);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2 w-full border-none bg-transparent cursor-pointer text-[var(--text-dark)] text-sm text-left transition-colors hover:bg-[var(--bg-color)]"
                                >
                                    <User size={16} /> Profile
                                </button>
                                <button
                                    onClick={() => {
                                        let path = '/settings';
                                        if (isSubVendor) path = '/sub-vendor/settings';
                                        else if (user.designation.toLowerCase() === 'vendor') path = '/vendor/settings';
                                        else if (user.designation.toLowerCase() === 'user' || user.designation.toLowerCase() === 'customer') path = '/user/profile';

                                        navigate(path);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2 w-full border-none bg-transparent cursor-pointer text-[var(--text-dark)] text-sm text-left transition-colors hover:bg-[var(--bg-color)]"
                                >
                                    <Settings size={16} /> Settings
                                </button>
                                <div className="border-t border-[var(--border-color)] my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-5 py-2 w-full border-none bg-transparent cursor-pointer text-[var(--danger)] text-sm text-left transition-colors hover:bg-[var(--bg-color)]"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
