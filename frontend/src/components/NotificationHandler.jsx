import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { acquireSocket, releaseSocket } from '../utils/socketClient';

const NotificationHandler = () => {
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (!token || !user?.id) {
            return undefined;
        }

        const socket = acquireSocket(token);
        socketRef.current = socket;

        const onConnect = () => {
            console.log('[SOCKET] Connected to real-time server');
        };

        const onNotification = (payload) => {
            console.log('[SOCKET] Notification received:', payload);
            toast.success(
                <div className="flex flex-col">
                    <span className="font-bold">{payload.title}</span>
                    <span>{payload.body}</span>
                </div>,
                {
                    duration: 5000,
                    icon: '!'
                }
            );
        };

        const onAdminNotification = (payload) => {
            console.log('[SOCKET] Admin notification:', payload);
            toast.success(
                <div className="flex flex-col">
                    <span className="font-black text-indigo-600">Admin Alert</span>
                    <span className="text-xs font-bold uppercase tracking-tight">{payload.title}</span>
                    <span className="text-[10px] text-gray-500">{payload.body}</span>
                </div>,
                { duration: 6000 }
            );
        };

        const onNewLeadAdded = (payload) => {
            console.log('[SOCKET] New lead added:', payload);
            toast(
                <div className="flex flex-col">
                    <span className="font-black text-emerald-500 flex items-center gap-2">New Lead Available</span>
                    <span className="text-xs font-bold uppercase tracking-tight">{payload.title}</span>
                    <span className="text-[10px] text-gray-500">{payload.body}</span>
                </div>,
                {
                    duration: 8000,
                    icon: '*',
                    style: {
                        borderRadius: '16px',
                        background: '#111c44',
                        color: '#fff',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }
                }
            );
        };

        const onWalletUpdate = (payload) => {
            console.log('[SOCKET] Wallet update received:', payload);
            const currentUser = localStorage.getItem('user');
            if (currentUser) {
                const parsedUser = JSON.parse(currentUser);
                parsedUser.wallet_balance = payload.wallet_balance;
                localStorage.setItem('user', JSON.stringify(parsedUser));
            }

            window.dispatchEvent(new CustomEvent('wallet_updated', { detail: payload }));
            toast.success(`Wallet Balance Updated: ${payload.wallet_balance} Credits`, {
                icon: '$',
                duration: 3000
            });
        };

        const onDisconnect = () => {
            console.log('[SOCKET] Disconnected');
        };

        socket.on('connect', onConnect);
        socket.on('notification', onNotification);
        socket.on('admin_notification', onAdminNotification);
        socket.on('new_lead_added', onNewLeadAdded);
        socket.on('wallet_update', onWalletUpdate);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('notification', onNotification);
            socket.off('admin_notification', onAdminNotification);
            socket.off('new_lead_added', onNewLeadAdded);
            socket.off('wallet_update', onWalletUpdate);
            socket.off('disconnect', onDisconnect);
            releaseSocket(socket);
            socketRef.current = null;
        };
    }, []);

    return null;
};

export default NotificationHandler;
