import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import InsureeLogo from '../assets/insuree.png';
import {
    LayoutDashboard, Users, UserPlus, Wallet, Settings, ChevronDown, ChevronRight, Activity, Bell
} from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';

const VendorSidebar = ({ isOpen }) => {
    const location = useLocation();
    const [openDropdowns, setOpenDropdowns] = useState({});
    const { theme } = useTheme();

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { path: '/vendor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        {
            label: 'Referrals',
            icon: <Users size={20} />,
            subItems: [
                { path: '/vendor/referrals', label: 'My Network' },
                { path: '/vendor/refer-user', label: 'Refer User' },
                { path: '/vendor/refer-vendor', label: 'Refer Vendor' },
            ]
        },
        { path: '/vendor/earnings', label: 'My Earnings', icon: <Wallet size={20} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    const toggleDropdown = (label) => {
        if (!isOpen) return;
        setOpenDropdowns(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <aside className={`custom-sidebar fixed left-0 top-0 h-screen z-[1000] overflow-y-auto overflow-x-hidden flex flex-col transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[var(--surface-color)] text-[var(--text-dark)] border-r border-[var(--border-color)] ${isOpen ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-collapsed-width)]'}`}>
            <div className={`px-6 h-[70px] min-h-[70px] shrink-0 flex items-center justify-center border-b border-[var(--border-color)] bg-gradient-to-b from-indigo-500/5 to-transparent`}>
                <div className={`flex items-center justify-center w-full overflow-hidden ${isOpen ? 'px-0' : 'px-2.5'}`}>
                    {isOpen && (
                        <img src={InsureeLogo} alt="Logo" className={`h-[40px] w-auto transition-all duration-300 ease-in-out object-contain ${theme === 'dark' ? 'brightness-0 invert' : ''}`} />
                    )}
                </div>
            </div>

            <div className="py-2.5 flex-1 w-full">
                {isOpen && <div className="px-6 py-3 pb-1 text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">Partner Menu</div>}

                <ul className="list-none px-4 py-2.5 m-0">
                    {menuItems.map((item, index) => {
                        const hasSubItems = !!item.subItems;
                        const isMainActive = hasSubItems ? item.subItems.some(si => isActive(si.path)) : isActive(item.path);
                        const isOpn = openDropdowns[item.label];

                        return (
                            <li key={item.label || index} className="mb-1.5 list-none">
                                {hasSubItems ? (
                                    <div onClick={() => toggleDropdown(item.label)} className={`flex items-center box-border cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-xl group ${isOpen ? 'justify-between px-4 py-3' : 'justify-center py-3'} ${isMainActive || isOpn ? 'font-bold' : 'font-medium'} ${(isOpn && isOpen) ? 'bg-[var(--active-menu-bg)] text-[var(--primary)]' : (isMainActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[#556ee6]')}`}>
                                        <div className="flex items-center">
                                            <span className="flex items-center justify-center min-w-[25px]">{item.icon}</span>
                                            {isOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                                        </div>
                                        {isOpen && <span>{isOpn ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>}
                                    </div>
                                ) : (
                                    <Link to={item.path} className={`flex items-center box-border no-underline rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group ${isOpen ? 'justify-start px-4 py-3' : 'justify-center py-3'} ${isMainActive ? 'font-bold text-white bg-[var(--primary)] shadow-lg' : 'font-medium text-[var(--text-muted)] bg-transparent hover:text-[var(--primary)] hover:bg-[var(--active-menu-bg)]'}`}>
                                        <span className={`flex items-center justify-center ${isOpen ? 'min-w-[28px]' : 'auto'}`}>{item.icon}</span>
                                        {isOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                                    </Link>
                                )}
                                {hasSubItems && isOpn && isOpen && (
                                    <ul className="list-none py-2 pl-[30px] m-0">
                                        {item.subItems.map((subItem) => (
                                            <li key={subItem.path} className="mb-0.5 list-none">
                                                <Link to={subItem.path} className={`flex items-center px-3 py-2 text-[13.5px] no-underline transition-all duration-200 rounded-lg ${isActive(subItem.path) ? 'text-[var(--primary)] font-semibold' : 'text-[var(--text-muted)] font-medium hover:text-[var(--primary)]'}`}>
                                                    <span className={`rounded-full mr-3 w-1 h-1 ${isActive(subItem.path) ? 'bg-[var(--primary)] w-1.5 h-1.5' : 'bg-[var(--border-color)]'}`}></span>
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
            <div className="sidebar-footer p-4 border-t border-[var(--border-color)]">
               <div className="flex items-center gap-3 bg-indigo-500/5 p-3 rounded-2xl border border-indigo-500/10 overflow-hidden">
                   <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-xs">V</div>
                   {isOpen && <div>
                       <div className="text-[10px] font-black text-[var(--text-dark)] uppercase leading-none">Vendor Node</div>
                       <div className="text-[9px] font-bold text-[var(--text-muted)] italic leading-none mt-1 uppercase tracking-tighter">Production Live</div>
                   </div>}
               </div>
            </div>
        </aside>
    );
};

export default VendorSidebar;
