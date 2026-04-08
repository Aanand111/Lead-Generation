import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(socketUrl);

        socket.on('new_vendor_referral', (data) => {
            console.log('[NOTIFICATION] Real-time referral detected:', data);
            
            // Custom Professional Toast with 2s duration
            toast.success(
                (t) => (
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