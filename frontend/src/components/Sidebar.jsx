import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import InsureeLogo from '../assets/insuree.png';
import {
        LayoutDashboard, Users, Briefcase, Layers,
        MessageSquare, Bell, Settings, ChevronDown, ChevronRight, Grid, CreditCard,
        UserCheck, UserPlus, Newspaper, Terminal, Image as ImageIcon, Wallet, BarChart3
} from 'lucide-react';

import { useTheme } from '../utils/ThemeContext';

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/customers', label: 'Customers', icon: <Users size={20} /> },
    { path: '/vendors', label: 'Vendors', icon: <Briefcase size={20} /> },
    { path: '/commissions/approval', label: 'Commission Approval', icon: <UserCheck size={20} /> },
    { path: '/payouts', label: 'Payout Requests', icon: <Wallet size={20} /> },
    { path: '/analytics', label: 'Reporting & Analytics', icon: <BarChart3 size={20} /> },
    { path: '/sub-vendors', label: 'SubVendors', icon: <UserPlus size={20} /> },
    { path: '/notifications/send', label: 'Push Notifications', icon: <Bell size={20} /> },
    {
        label: 'Leads',
        icon: <Layers size={20} />,
        subItems: [
            { path: '/leads/categories', label: 'Leads Category' },
            { path: '/leads/approval', label: 'Lead Approvals' },
            { path: '/leads', label: 'Leads' },
            { path: '/leads/purchased', label: 'Purchased Leads' },
            { path: '/leads/available', label: 'Available Leads' },
            { path: '/leads/facebook', label: 'Facebook Leads' },
        ]
    },
    { path: '/banners', label: 'Banners', icon: <ImageIcon size={20} /> },
    {
        label: 'News',
        icon: <Newspaper size={20} />,
        subItems: [
            { path: '/news/category', label: 'News Category' },
            { path: '/news', label: 'News' },
        ]
    },
    {
        label: "Poster's",
        icon: <ImageIcon size={20} />,
        subItems: [
            { path: '/posters/category', label: 'Poster Category' },
            { path: '/posters', label: 'Poster' },
        ]
    },
    {
        label: 'Subscription Package',
        icon: <CreditCard size={20} />,
        subItems: [
            { path: '/subscriptions', label: 'Subscriptions' },
            { path: '/subscriptions/plan', label: 'Subscriptions plan' },
            { path: '/subscriptions/transaction', label: 'Transactions' },
        ]
    },
    {
        label: 'Contact Us',
        icon: <MessageSquare size={20} />,
        subItems: [
            { path: '/contact', label: 'Contact Form' },
            { path: '/contact-messages', label: 'Messages Inbox' },
        ]
    },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
];

const Sidebar = React.memo(({ isOpen }) => {
    const location = useLocation();
    const { theme } = useTheme();

    // Check if a dropdown contains the active path
    const isDropdownActive = (subItems) => {
        return subItems.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
    };

    const isActive = (path) => location.pathname === path;

    // Initialize dropdowns based on current path to avoid extra render cycle
    const [openDropdowns, setOpenDropdowns] = useState(() => {
        const initialState = {};
        if (isOpen) {
            menuItems.forEach(item => {
                if (item.subItems && item.subItems.some(sub => location.pathname === sub.path || location.pathname.startsWith(sub.path + '/'))) {
                    initialState[item.label] = true;
                }
            });
        }
        return initialState;
    });

    console.log("Sidebar Rendered | Path:", location.pathname);

    const toggleDropdown = (label) => {
        if (!isOpen) return;
        setOpenDropdowns(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    // Update only when path changes, but do it intelligently
    useEffect(() => {
        if (!isOpen) {
            setOpenDropdowns({});
            return;
        }
        
        const newOpenState = {};
        menuItems.forEach(item => {
            if (item.subItems && isDropdownActive(item.subItems)) {
                newOpenState[item.label] = true;
            }
        });

        setOpenDropdowns(prev => {
            const isDifferent = JSON.stringify(prev) !== JSON.stringify(newOpenState);
            return isDifferent ? { ...prev, ...newOpenState } : prev;
        });
    }, [location.pathname, isOpen]);

    return (
        <aside className={`custom-sidebar fixed left-0 top-0 h-screen z-[1000] overflow-y-auto overflow-x-hidden flex flex-col transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[var(--surface-color)] text-[var(--text-dark)] border-r border-[var(--border-color)] ${isOpen ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-collapsed-width)]'}`}>
            <div className={`px-6 h-[70px] min-h-[70px] shrink-0 flex items-center justify-center border-b border-[var(--border-color)] bg-gradient-to-b from-indigo-500/5 to-transparent`}>
                <div className={`flex items-center justify-center w-full overflow-hidden ${isOpen ? 'px-0' : 'px-2.5'}`}>
                    {isOpen && (
                        <img
                            src={InsureeLogo}
                            alt="Logo"
                            className={`h-[40px] w-auto transition-all duration-300 ease-in-out object-contain ${theme === 'dark' ? 'brightness-0 invert' : 'drop-shadow-[0_2px_8px_rgba(99,102,241,0.15)]'}`}
                        />
                    )}
                </div>
            </div>

            <div className="py-2.5 flex-1 w-full">
                {isOpen && <div className="px-6 py-3 pb-1 text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">MAIN MENU</div>}

                <ul className="list-none px-4 py-2.5 m-0">
                    {menuItems.map((item, index) => {
                        const hasSubItems = !!item.subItems;
                        const isMainActive = hasSubItems ? isDropdownActive(item.subItems) : isActive(item.path);
                        const isOpn = openDropdowns[item.label];

                        return (
                            <li key={item.label || index} className="mb-1.5 list-none">
                                {hasSubItems ? (
                                    <div
                                        onClick={() => toggleDropdown(item.label)}
                                        className={`flex items-center box-border cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-xl group
                                            ${isOpen ? 'justify-between px-4 py-3' : 'justify-center py-3'}
                                            ${isMainActive || isOpn ? 'font-bold' : 'font-medium'}
                                            ${(isOpn && isOpen) ? 'bg-[var(--active-menu-bg)] text-[var(--primary)]' : (isMainActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[#556ee6] hover:bg-indigo-500/5')}`}
                                    >
                                        <div className={`flex items-center ${isOpen ? 'justify-start w-auto' : 'justify-center w-full'}`}>
                                            <span className={`flex items-center justify-center ${isOpen ? 'min-w-[25px]' : 'auto'}`}>
                                                {item.icon}
                                            </span>
                                            {isOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                                        </div>
                                        {isOpen && (
                                            <span className="flex items-center">
                                                {isOpn ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`flex items-center box-border no-underline rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group
                                            ${isOpen ? 'justify-start px-4 py-3' : 'justify-center py-3'}
                                            ${isMainActive ? 'font-bold text-white bg-[var(--primary)] shadow-[0_10px_20px_-5px_var(--primary-glow)]' : 'font-medium text-[var(--text-muted)] bg-transparent hover:text-[var(--primary)] hover:bg-[var(--active-menu-bg)]'}`}
                                    >
                                        <span className={`flex items-center justify-center ${isOpen ? 'min-w-[28px]' : 'auto'} ${isMainActive ? 'text-white' : 'text-inherit'}`}>
                                            {item.icon}
                                        </span>
                                        {isOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                                    </Link>
                                )}

                                {hasSubItems && isOpn && isOpen && (
                                    <ul className="list-none py-2 pl-[30px] pr-0 m-0">
                                        {item.subItems.map((subItem) => {
                                            const isSubActive = isActive(subItem.path);
                                            return (
                                                <li key={subItem.path} className="mb-0.5 list-none">
                                                    <Link
                                                        to={subItem.path}
                                                        className={`flex items-center px-3 py-2 text-[13.5px] no-underline transition-all duration-200 ease-in rounded-lg
                                                            ${isSubActive ? 'text-[var(--primary)] font-semibold' : 'text-[var(--text-muted)] font-medium hover:text-[var(--primary)] hover:bg-[var(--active-menu-bg)]'}`}
                                                    >
                                                        <span className={`rounded-full mr-3 transition-all duration-200 bg-[var(--border-color)] ${isSubActive ? 'w-1.5 h-1.5 bg-[var(--primary)]' : 'w-1 h-1 group-hover:bg-[var(--primary)]'}`}></span>
                                                        {subItem.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
});

export default Sidebar;
