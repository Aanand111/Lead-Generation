import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InsureeLogo from '../assets/insuree.png';
import {
    LayoutDashboard, Users, UserPlus, Wallet, Settings, ChevronDown, ChevronRight, Activity, Bell,
    Layers, Briefcase, CreditCard, Image as ImageIcon, Newspaper, Star, MoreVertical, Gem, Crown, Zap, Shield
} from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';

const CustomerSidebar = ({ isOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openDropdowns, setOpenDropdowns] = useState({});
    const { theme } = useTheme();
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                return {
                    name: parsedUser.name || parsedUser.full_name || 'User',
                    profilePic: parsedUser.profilePic || parsedUser.profile_pic || parsedUser.avatar || parsedUser.image || '',
                    isPremium: Boolean(parsedUser.isPremium)
                };
            } catch (e) {
                console.error("Sidebar user parse error", e);
            }
        }
        return { name: 'User', profilePic: '', isPremium: false };
    });

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { path: '/user/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        {
            label: 'Leads',
            icon: <Layers size={20} />,
            subItems: [
                { path: '/user/leads/available', label: 'Browse Leads' },
                { path: '/user/leads/my', label: 'My Acquired' },
            ]
        },
        { path: '/user/posters', label: 'Poster Creation', icon: <ImageIcon size={20} /> },
        { path: '/user/subscriptions', label: 'Subscription Plans', icon: <CreditCard size={20} /> },
        {
            label: 'Refer & Earn',
            icon: <UserPlus size={20} />,
            subItems: [
                { path: '/user/referrals', label: 'Referral Dashboard' },
                { path: '/user/referrals/history', label: 'Reward History' }
            ]
        },
        { path: '/user/news', label: 'News & Offers', icon: <Newspaper size={20} /> },
        { path: '/user/profile', label: 'Profile Settings', icon: <Settings size={20} /> },
    ];

    useEffect(() => {
        const handleUpdate = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser({
                        name: parsedUser.name || parsedUser.full_name || 'User',
                        profilePic: parsedUser.profilePic || parsedUser.profile_pic || parsedUser.avatar || parsedUser.image || '',
                        isPremium: Boolean(parsedUser.isPremium)
                    });
                } catch {
                    /* Ignore malformed cached user payload. */
                }
            }
        };

        window.addEventListener('userProfileUpdated', handleUpdate);
        return () => window.removeEventListener('userProfileUpdated', handleUpdate);
    }, []);

    const toggleDropdown = (label) => {
        if (!isOpen) return;
        setOpenDropdowns(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const activeColor = user.isPremium
        ? 'bg-gradient-to-r from-[#F5E5AB] via-[#D4AF37] to-[#C59B27] border border-[#D4AF37]/35 text-black'
        : 'bg-[var(--primary)]';
    const activeText = user.isPremium ? 'text-black font-black' : 'text-white font-black';
    const hoverColor = 'hover:text-[var(--text-dark)] hover:bg-[var(--active-menu-bg)]';
    const activeFg = 'text-[var(--primary)]';
    const sidebarBg = 'bg-[var(--surface-color)] border-[var(--border-color)]';

    return (
        <aside className={`custom-sidebar fixed left-0 top-0 h-screen z-[1000] overflow-y-auto overflow-x-hidden flex flex-col transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] border-r ${sidebarBg} text-[var(--text-dark)] ${user.isPremium ? 'shadow-[2px_0_20px_rgba(212,175,55,0.08)]' : ''} ${isOpen ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-collapsed-width)]'}`}>

            {/* Logo Header */}
            <div style={user.isPremium ? { borderColor: 'var(--border-color)', background: 'linear-gradient(to right, var(--primary-weak), transparent)' } : {}} className={`px-6 h-[70px] min-h-[70px] shrink-0 flex items-center justify-center border-b ${user.isPremium ? '' : 'border-[var(--border-color)] bg-gradient-to-b from-indigo-500/5 to-transparent'}`}>
                <div className={`flex items-center justify-center w-full overflow-hidden ${isOpen ? 'px-0' : 'px-2.5'}`}>
                    {isOpen && (
                        <div className="flex items-center gap-3 w-full">
                            <img src={InsureeLogo} alt="Logo" className={`h-[36px] w-auto transition-all duration-300 ease-in-out object-contain ${theme === 'dark' ? 'brightness-0 invert' : ''}`} />
                            {user.isPremium && (
                                <div style={{ background: 'var(--primary-weak)', borderColor: 'var(--border-color)' }} className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg border">
                                    <Crown size={10} className="text-[var(--primary)]" fill="currentColor" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--primary)]">Elite</span>
                                </div>
                            )}
                        </div>
                    )}
                    {!isOpen && user.isPremium && <Crown size={20} className="text-[var(--primary)]" fill="currentColor" />}
                    {!isOpen && !user.isPremium && <img src={InsureeLogo} alt="Logo" className={`h-[28px] w-auto object-contain ${theme === 'dark' ? 'brightness-0 invert' : ''}`} />}
                </div>
            </div>

            {/* Premium Banner (only when sidebar open + premium) */}
            {isOpen && user.isPremium && (
                <div style={{ background: 'linear-gradient(to right, var(--primary-weak), rgba(212,175,55,0.06), transparent)', borderColor: 'var(--border-color)' }} className="mx-3 mt-3 p-3 rounded-2xl border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--primary)]/20">
                        <Crown size={16} className="text-black" fill="currentColor" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest leading-none">Elite User</div>
                        <div className="text-[9px] text-[var(--primary)]/70 font-bold italic mt-0.5">VIP Access Active</div>
                    </div>
                    <Gem size={14} className="ml-auto text-[var(--primary)]/40 animate-pulse" fill="currentColor" />
                </div>
            )}

            {/* Menu */}
            <div className="py-2.5 flex-1 w-full">
                <ul className="list-none px-4 py-2.5 m-0 space-y-1">
                    {menuItems.map((item, index) => {
                        const hasSubItems = !!item.subItems;
                        const isMainActive = hasSubItems ? item.subItems.some(si => isActive(si.path)) : isActive(item.path);
                        const isOpn = openDropdowns[item.label];

                        return (
                            <li key={item.label || index} className="list-none">
                                {hasSubItems ? (
                                    <div
                                        onClick={() => toggleDropdown(item.label)}
                                        className={`flex items-center box-border cursor-pointer transition-all duration-200 rounded-xl group ${isOpen ? 'justify-between px-4 py-3' : 'justify-center py-3'} ${(isOpn && isOpen) ? `${user.isPremium ? 'bg-amber-500/10 text-amber-500' : 'bg-[var(--active-menu-bg)] text-[var(--primary)]'} font-bold` : isMainActive ? `${activeFg} font-bold` : `text-[var(--text-muted)] font-medium ${hoverColor}`}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center min-w-[20px]">{item.icon}</span>
                                            {isOpen && <span className="whitespace-nowrap text-sm">{item.label}</span>}
                                        </div>
                                        {isOpen && <span>{isOpn ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>}
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`flex items-center box-border no-underline rounded-xl transition-all duration-200 group ${isOpen ? 'justify-start px-4 py-3 gap-3' : 'justify-center py-3'} ${isMainActive
                                            ? `font-black ${activeText} ${activeColor} shadow-lg ${user.isPremium ? 'shadow-amber-500/20' : 'shadow-indigo-500/20'}`
                                            : `font-medium text-[var(--text-muted)] bg-transparent ${hoverColor}`}`}
                                    >
                                        <span className="flex items-center justify-center min-w-[20px]">{item.icon}</span>
                                        {isOpen && <span className="whitespace-nowrap text-sm">{item.label}</span>}
                                    </Link>
                                )}
                                {hasSubItems && isOpn && isOpen && (
                                    <ul className="list-none py-1.5 pl-[38px] m-0 space-y-0.5">
                                        {item.subItems.map((subItem) => (
                                            <li key={subItem.path} className="list-none">
                                                <Link
                                                    to={subItem.path}
                                                    className={`flex items-center px-3 py-2 text-[12px] no-underline transition-all duration-200 rounded-lg ${isActive(subItem.path)
                                                        ? `${activeFg} font-black`
                                                        : `text-[var(--text-muted)] font-medium ${hoverColor}`}`}
                                                >
                                                    <span className={`rounded-full mr-3 transition-all ${isActive(subItem.path) ? 'bg-[var(--primary)] w-1.5 h-1.5' : 'bg-current opacity-30 w-1 h-1'}`}></span>
                                                    {subItem.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* User Footer */}
            <div className={`border-t border-[var(--border-color)] ${isOpen ? 'p-4' : 'py-4 flex justify-center'}`}>               
                {isOpen ? (
                    <div
                        className={`flex items-center gap-3 p-3 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 ${user.isPremium
                            ? 'premium-user-card'
                            : 'bg-indigo-500/5 border-indigo-500/10 hover:bg-indigo-500/10'}`}
                        onClick={() => navigate('/user/profile')}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs overflow-hidden shrink-0 ${user.isPremium
                            ? 'ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-transparent'
                            : 'border-2 border-white shadow-sm bg-indigo-50 text-white'}`}>
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center font-black text-sm ${user.isPremium ? 'bg-[var(--primary)] text-black' : 'bg-indigo-500 text-white'}`}>
                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-black uppercase leading-none truncate text-[var(--text-dark)]">{user.name}</div>
                            <div className={`text-[9px] font-black italic leading-none mt-1.5 uppercase tracking-widest flex items-center gap-1.5 ${user.isPremium ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] opacity-70'}`}>
                                {user.isPremium ? (
                                    <>
                                        <Gem size={9} fill="currentColor" className="animate-pulse" />
                                        Elite User
                                    </>
                                ) : (
                                    'Member'
                                )}
                            </div>
                        </div>
                        {user.isPremium && (
                            <Crown size={14} className="text-[var(--primary)]/50 shrink-0" fill="currentColor" />
                        )}
                    </div>
                ) : (
                    <div
                        className="cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-105"
                        onClick={() => navigate('/user/profile')}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs overflow-hidden shrink-0 ${user.isPremium
                            ? 'ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-transparent'
                            : 'border-2 border-white shadow-sm bg-indigo-50 text-white'}`}>
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center font-black text-sm ${user.isPremium ? 'bg-[var(--primary)] text-black' : 'bg-indigo-500 text-white'}`}>
                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default CustomerSidebar;
