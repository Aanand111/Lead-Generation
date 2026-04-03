import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, Settings, ChevronDown, Shield, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InsureeLogo from '../assets/insuree.png';

import { useTheme } from '../utils/ThemeContext';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    console.log("Header Reander");
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState({
        name: 'Admin',
        designation: 'Admin',
        profilePic: ''
    });



    useEffect(() => {
        const fetchUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser({
                        name: parsedUser.name || parsedUser.full_name || 'Admin',
                        designation: parsedUser.designation || parsedUser.role || 'Admin',
                        profilePic: parsedUser.profilePic || parsedUser.profile_pic || parsedUser.avatar || parsedUser.image || ''
                    });
                } catch (error) {
                    console.error("Error parsing user data", error);
                }
            }
        };

        fetchUser();

        window.addEventListener('userProfileUpdated', fetchUser);
        return () => window.removeEventListener('userProfileUpdated', fetchUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <header className={`h-[70px] flex items-center justify-between px-6 fixed top-0 right-0 z-[999] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] border-b border-[var(--border-color)] ${theme === 'light' ? 'bg-white/80' : 'bg-slate-900/80'} backdrop-blur-md shadow-sm ${isSidebarOpen ? 'left-[var(--sidebar-width)]' : 'left-[var(--sidebar-collapsed-width)]'}`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="border-none bg-indigo-500/5 cursor-pointer text-[var(--primary)] p-2 rounded-xl flex items-center justify-center transition-all duration-200"
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
                <Bell size={20} className="text-[var(--text-muted)] cursor-pointer" />

                <div className="relative">
                    <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 cursor-pointer group px-2 py-1.5 rounded-2xl hover:bg-indigo-500/5 transition-all"
                    >
                        <div className="flex flex-col text-right leading-none gap-0.5">
                            <span className="text-[13px] font-black text-[var(--text-dark)] uppercase tracking-tight">
                                {user.name}
                            </span>
                            <div className="inline-flex items-center justify-end gap-1 text-indigo-500 text-[9px] font-black uppercase tracking-widest">
                                <Shield size={10} /> {user.designation}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-color)] shadow-sm border border-[var(--border-color)] group-hover:border-indigo-500/30 transition-all overflow-hidden flex items-center justify-center">
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} className="text-indigo-500" />
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
                                        const path = user.designation.toLowerCase() === 'user' ? '/user/profile' : '/profile';
                                        navigate(path); 
                                        setIsDropdownOpen(false); 
                                    }}
                                    className="flex items-center gap-2 px-5 py-2 w-full border-none bg-transparent cursor-pointer text-[var(--text-dark)] text-sm text-left transition-colors hover:bg-[var(--bg-color)]"
                                >
                                    <User size={16} /> Profile
                                </button>
                                <button
                                    onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}
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