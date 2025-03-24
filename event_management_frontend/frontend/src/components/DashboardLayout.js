import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <div className="container-fluid">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="/dashboard">Event Manager</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" href="/dashboard">Dashboard</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/user-roles">User Roles</a>
                        </li>
                    </ul>
                    <button className="btn btn-danger ml-auto" onClick={handleLogout}>Logout</button>
                </div>
            </nav>
            <div className="row">
                <div className="col-md-12">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;