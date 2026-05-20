import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SubVendorSidebar from '../components/SubVendorSidebar';
import Header from '../components/Header';
import api from '../utils/api';

const SubVendorLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/user/profile');
                if (data.success) {
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const updatedUser = {
                        ...storedUser,
                        name: data.data.full_name || data.data.name || storedUser.name,
                        full_name: data.data.full_name || data.data.name || storedUser.full_name,
                        email: data.data.email || storedUser.email,
                        phone: data.data.phone || storedUser.phone,
                        profile_pic: data.data.profile_pic || storedUser.profile_pic
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event('userProfileUpdated'));
                }
            } catch (err) {
                console.error("Failed to sync profile in SubVendorLayout", err);
            }
        };

        fetchProfile();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="adminShell">
            <SubVendorSidebar isOpen={isSidebarOpen} />

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

export default SubVendorLayout;
