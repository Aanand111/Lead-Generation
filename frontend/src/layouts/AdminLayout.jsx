import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { toast } from 'react-hot-toast';
import { Bell, MapPin, Zap } from 'lucide-react';
import { acquireSocket, releaseSocket } from '../utils/socketClient';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            return undefined;
        }

        const socket = acquireSocket(token);

        const onConnect = () => {
            console.log('[SOCKET] Admin mission control online. ID:', socket.id);
        };

        const onConnectError = (error) => {
            console.error('[SOCKET] Admin connection blocked:', error.message);
        };

        const onNotification = (data) => {
            console.log('[ADMIN_NOTIF] System alert:', data);
            toast.success(
                () => (
                    <div className="flex flex-col gap-1 min-w-[200px]">
                        <span className="font-black text-[10px] uppercase tracking-widest text-indigo-600">{data.title || 'System Alert'}</span>
                        <span className="text-xs font-bold text-gray-800">{data.body || data.message}</span>
                    </div>
                ),
                {
                    duration: 4000,
                    position: 'top-right',
                    style: {
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        padding: '1rem'
                    }
                }
            );
        };

        const onGlobalNotification = (data) => {
            console.log('[ADMIN_NOTIF] Global announcement received:', data);
            toast.success(
                () => (
                    <div className="flex flex-col gap-2 min-w-[220px]">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center animate-bounce">
                                 <Bell size={16} />
                             </div>
                             <span className="font-black text-[10px] uppercase tracking-widest text-indigo-600">Admin Broadcast</span>
                        </div>
                        <div className="space-y-1">
                             <div className="text-xs font-black text-gray-800 uppercase tracking-tight">{data.title || 'Notification'}</div>
                             <div className="text-[10px] font-bold text-gray-500 leading-relaxed">
                                 {data.message || data.body}
                             </div>
                        </div>
                    </div>
                ),
                {
                    duration: 6000,
                    position: 'top-center',
                    style: {
                        background: 'white',
                        borderRadius: '1.5rem',
                        borderLeft: '4px solid #6366f1',
                        boxShadow: '0 25px 60px rgba(99, 102, 241, 0.2)',
                        padding: '1.2rem'
                    }
                }
            );
        };

        const onNewLeadAdded = (data) => {
            console.log('[ADMIN_NOTIF] Lead added successfully:', data);
            toast.success(
                () => (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center animate-pulse">
                                 <Zap size={16} />
                             </div>
                             <span className="font-black text-[10px] uppercase tracking-widest text-emerald-600">Lead Live</span>
                        </div>
                        <div className="space-y-1">
                             <div className="text-xs font-black text-gray-800 uppercase tracking-tight">{data.category} Lead Published</div>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                 <MapPin size={10} className="text-indigo-500" />
                                 Node: {data.city} (Targeted)
                             </div>
                        </div>
                    </div>
                ),
                {
                    duration: 3000,
                    position: 'bottom-right',
                    style: {
                        background: 'white',
                        borderRadius: '1.5rem',
                        borderLeft: '4px solid #10b981',
                        boxShadow: '0 20px 50px rgba(16, 185, 129, 0.1)',
                        padding: '1.2rem'
                    }
                }
            );
        };

        const onNewVendorReferral = (data) => {
            console.log('[NOTIFICATION] Real-time referral detected:', data);
            
            // Custom Professional Toast with 2s duration
            toast.success(
                () => (
                    <div className="flex flex-col gap-1">
                        <span className="font-black text-[10px] uppercase tracking-widest text-indigo-600">New Cluster Linkage Detected</span>
                        <span className="text-xs font-bold text-gray-800">{data.message}</span>
                        <span className="text-[9px] text-gray-500 italic">Initiated by: {data.referrer}</span>
                    </div>
                ),
                {
                    duration: 2000, 
                    position: 'top-right',
                    style: {
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '1.2rem',
                        border: '1px solid var(--border-color)',
                        padding: '1rem',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }
                }
            );
        };

        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.on('notification', onNotification);
        socket.on('global_notification', onGlobalNotification);
        socket.on('new_lead_added', onNewLeadAdded);
        socket.on('new_vendor_referral', onNewVendorReferral);

        return () => {
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.off('notification', onNotification);
            socket.off('global_notification', onGlobalNotification);
            socket.off('new_lead_added', onNewLeadAdded);
            socket.off('new_vendor_referral', onNewVendorReferral);
            releaseSocket(socket);
        };
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="adminShell">
            <Sidebar isOpen={isSidebarOpen} />

            <div 
                className="adminContent"
                style={{ 
                    marginLeft: isSidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)'
                }}
            >
                <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="adminMain">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
