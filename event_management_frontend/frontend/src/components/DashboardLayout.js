import React from 'react';
import Navigation from './Navigation'; // Assuming Navigation.js is in the same directory

const DashboardLayout = ({ children }) => {
    return (
        <div className="container-fluid">
            <Navigation /> {/* Render the Navigation component */}
            <div className="row">
                <div className="col-md-12">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;