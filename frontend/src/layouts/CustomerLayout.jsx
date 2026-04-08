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
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(socketUrl);

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
                    duration: 4000, // Longer for users to see
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
