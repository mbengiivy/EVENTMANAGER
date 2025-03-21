// src/components/DashboardLayout.js
import React, { Children } from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    return (
        <div>
            
            <div className="dashboard-content">
                {children}
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;