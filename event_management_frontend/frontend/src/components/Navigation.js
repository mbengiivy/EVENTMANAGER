import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';

function Navigation({ isLoggedIn, userRole, logoutUser }) {
    const navigate = useNavigate();

    const handleBrandClick = () => {
        if (!isLoggedIn) {
            navigate('/');
        } else if (userRole === 'captain') {
            navigate('/captain-dashboard');
        } else if (userRole === 'crew') {
            navigate('/crew-dashboard');
        }
    };

    const renderAuthLinks = () => (
        <>
            <Nav.Link as={NavLink} to="/registration">Register</Nav.Link>
            <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
        </>
    );

    const renderCaptainLinks = () => (
        <>
            <Nav.Link as={NavLink} to="/create-event">Create Event</Nav.Link>
            <Nav.Link as={NavLink} to="/view-events">View Events</Nav.Link>
            <Nav.Link as={NavLink} to="/add-vendor">Add Vendor</Nav.Link>
            <Nav.Link as={NavLink} to="/view-vendor">View Vendors</Nav.Link>
            <Nav.Link as={NavLink} to="/reports-and-analytics">Reports</Nav.Link>
            <Nav.Link as={NavLink} to="/event-calendar">Calendar</Nav.Link>
            <Nav.Link as={NavLink} to="/task-management">Manage Tasks</Nav.Link>
            <Nav.Link onClick={logoutUser} style={{ cursor: 'pointer', color: 'red' }}>Logout</Nav.Link>
        </>
    );

    const renderCrewLinks = () => (
        <>
            <Nav.Link as={NavLink} to="/crew-tasks">My Tasks</Nav.Link>
            <Nav.Link as={NavLink} to="/crew-events">My Events</Nav.Link>
            <Nav.Link as={NavLink} to="/crew-vendors">Vendors</Nav.Link>
            <Nav.Link as={NavLink} to="/event-calendar">Calendar</Nav.Link>
            <Nav.Link onClick={logoutUser} style={{ cursor: 'pointer', color: 'red' }}>Logout</Nav.Link>
        </>
    );

    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
                Event Manager
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    {isLoggedIn ? (
                        userRole === 'captain' ? renderCaptainLinks() : renderCrewLinks()
                    ) : (
                        renderAuthLinks()
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Navigation;