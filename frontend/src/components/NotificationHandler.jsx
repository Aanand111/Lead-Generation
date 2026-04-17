import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const NotificationHandler = () => {
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (token && user?.id) {
            // Initialize Socket Connection
            const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
            
            socketRef.current = io(socketUrl, {
                query: { userId: user.id }
            });

            socketRef.current.on('connect', () => {
                console.log('[SOCKET] Connected to real-time server');
            });

            socketRef.current.on('notification', (payload) => {
                console.log('[SOCKET] Notification received:', payload);
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-bold">{payload.title}</span>
                        <span>{payload.body}</span>
                    </div>,
                    { 
                        duration: 5000,
                        icon: '🔔'
                    }
                );
            });

            socketRef.current.on('admin_notification', (payload) => {
                console.log('[SOCKET] Admin notification:', payload);
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-black text-indigo-600">🛡️ Admin Alert</span>
                        <span className="text-xs font-bold uppercase tracking-tight">{payload.title}</span>
                        <span className="text-[10px] text-gray-500">{payload.body}</span>
                    </div>,
                    { duration: 6000 }
                );
            });

            socketRef.current.on('new_lead_added', (payload) => {
                console.log('[SOCKET] New lead added:', payload);
                toast(
                    <div className="flex flex-col">
                        <span className="font-black text-emerald-500 flex items-center gap-2">🚀 New Lead Available!</span>
                        <span className="text-xs font-bold uppercase tracking-tight">{payload.title}</span>
                        <span className="text-[10px] text-gray-500">{payload.body}</span>
                    </div>,
                    { 
                        duration: 8000,
                        icon: '🔥',
                        style: {
                            borderRadius: '16px',
                            background: '#111c44',
                            color: '#fff',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }
                    }
                );
            });

            socketRef.current.on('wallet_update', (payload) => {
                console.log('[SOCKET] Wallet update received:', payload);
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.wallet_balance = payload.wallet_balance;
                    localStorage.setItem('user', JSON.stringify(user));
                }
                window.dispatchEvent(new CustomEvent('wallet_updated', { detail: payload }));
                toast.success(`Wallet Balance Updated: ${payload.wallet_balance} Credits`, {
                    icon: '💰',
                    duration: 3000
                });
            });


            socketRef.current.on('disconnect', () => {
                console.log('[SOCKET] Disconnected');
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return null;
};

export default NotificationHandler;
