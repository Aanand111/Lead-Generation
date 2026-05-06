import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import InsureeLogo from '../assets/insuree.png';
import {
    LayoutDashboard, Users, UserPlus, Wallet, Settings, 
    ChevronDown, ChevronRight, Activity, Plus
} from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';

const SubVendorSidebar = ({ isOpen }) => {
    const location = useLocation();
    const [openDropdowns, setOpenDropdowns] = useState({});
    const { theme } = useTheme();

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { path: '/sub-vendor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/sub-vendor/leads/my', label: 'My Leads', icon: <Activity size={20} /> },
        { path: '/sub-vendor/refer-user', label: 'Refer User', icon: <UserPlus size={20} /> },
        { path: '/sub-vendor/referrals', label: 'My Referrals', icon: <Users size={20} /> },
        { path: '/sub-vendor/leads/upload', label: 'Forge Leads', icon: <Plus size={20} /> },
        { path: '/sub-vendor/earnings', label: 'My Earnings', icon: <Wallet size={20} /> },
        { path: '/sub-vendor/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <aside className={`custom-sidebar fixed left-0 top-0 h-screen z-[1000] overflow-y-auto overflow-x-hidden flex flex-col transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[var(--surface-color)] text-[var(--text-dark)] border-r border-[var(--border-color)] ${isOpen ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-collapsed-width)]'}`}>
            <div className={`px-6 h-[70px] min-h-[70px] shrink-0 flex items-center justify-center border-b border-[var(--border-color)] bg-gradient-to-b from-amber-500/5 to-transparent`}>
                <div className={`flex items-center justify-center w-full overflow-hidden ${isOpen ? 'px-0' : 'px-2.5'}`}>
                    {isOpen && (
                        <img src={InsureeLogo} alt="Logo" className={`h-[40px] w-auto transition-all duration-300 ease-in-out object-contain ${theme === 'dark' ? 'brightness-0 invert' : ''}`} />
                    )}
                </div>
            </div>

            <div className="py-2.5 flex-1 w-full">
                {isOpen && <div className="px-6 py-3 pb-1 text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase italic">Sub-Vendor Portal</div>}

                <ul className="list-none px-4 py-2.5 m-0">
                    {menuItems.map((item, index) => {
                        const isMainActive = isActive(item.path);

                        return (
                            <li key={item.label || index} className="mb-1.5 list-none">
                                <Link to={item.path} className={`flex items-center box-border no-underline rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group ${isOpen ? 'justify-start px-4 py-3' : 'justify-center py-3'} ${isMainActive ? 'font-bold text-white bg-amber-500 shadow-lg shadow-amber-500/20' : 'font-medium text-[var(--text-muted)] bg-transparent hover:text-amber-500 hover:bg-amber-500/5'}`}>
                                    <span className={`flex items-center justify-center ${isOpen ? 'min-w-[28px]' : 'auto'}`}>{item.icon}</span>
                                    {isOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
            
            <div className="sidebar-footer p-4 border-t border-[var(--border-color)]">
               <div className="flex items-center gap-3 bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10 overflow-hidden">
                   <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[10px]">SV</div>
                   {isOpen && <div>
                       <div className="text-[10px] font-black text-[var(--text-dark)] uppercase leading-none">Sub-Node</div>
                       <div className="text-[9px] font-bold text-[var(--text-muted)] italic leading-none mt-1 uppercase tracking-tighter">Verified Agent</div>
                   </div>}
               </div>
            </div>
        </aside>
    );
};

export default SubVendorSidebar;
