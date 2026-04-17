import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from '../components/CustomerSidebar';
import Header from '../components/Header';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { Zap, MapPin } from 'lucide-react';

const CustomerLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userId = user?.id || user?.user_id;

        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(socketUrl, {
            query: { userId }
        });

        socket.on('connect', () => {
            console.log('[SOCKET] Connected to mission control. ID:', socket.id);
        });

        socket.on('connect_error', (error) => {
            console.error('[SOCKET] Connection failed:', error.message);
        });

        // Generic Notification Listener (Legacy/System)
        socket.on('notification', (data) => {
            console.log('[USER_NOTIF] System notification received:', data);
            toast.success(
                (t) => (
                    <div className="flex flex-col gap-1 min-w-[200px]">
                        <span className="font-black text-[10px] uppercase tracking-widest text-indigo-600">{data.title || 'Notification'}</span>
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
        });

        // Global Notification Listener
        socket.on('global_notification', (data) => {
            console.log('[USER_NOTIF] Global broadcast received:', data);
            toast.success(
                (t) => (
                    <div className="flex flex-col gap-2 min-w-[220px]">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center animate-bounce">
                                 <Bell size={16} />
                             </div>
                             <span className="font-black text-[10px] uppercase tracking-widest text-indigo-600">Announcement</span>
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
        });

        socket.on('new_lead_added', (data) => {
            console.log('[USER_NOTIF] Lead broadcast detected:', data);
            
            toast.success(
                (t) => (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center animate-pulse">
                                 <Zap size={16} />
                             </div>
                             <span className="font-black text-[10px] uppercase tracking-widest text-amber-600">New High-Value Lead</span>
                        </div>
                        <div className="space-y-1">
                             <div className="text-xs font-black text-gray-800 uppercase tracking-tight">{data.category} Lead Ready</div>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                 <MapPin size={10} className="text-indigo-500" />
                                 Node: {data.city} (PIN-TARGET)
                             </div>
                        </div>
                        <button 
                            onClick={() => toast.dismiss(t.id)}
                            className="text-[9px] font-black uppercase tracking-widest text-indigo-600 pt-1 text-left hover:underline"
                        >
                            Refresh to Browse
                        </button>
                    </div>
                ),
                {
                    duration: 4000,
                    position: 'bottom-right',
                    style: {
                        background: 'white',
                        borderRadius: '1.5rem',
                        borderLeft: '4px solid #f59e0b',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                        padding: '1.2rem'
                    }
                }
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="adminShell">
            <CustomerSidebar isOpen={isSidebarOpen} />

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

export default CustomerLayout;
