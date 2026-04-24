import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SubVendorSidebar from '../components/SubVendorSidebar';
import Header from '../components/Header';

const SubVendorLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
