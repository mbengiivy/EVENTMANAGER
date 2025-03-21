// src/components/Navigation.js
import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import {NavLink } from 'react-router-dom';


const Navigation = () => {
    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand as={NavLink} to="/">Event Manager</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
                    <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                    <Nav.Link as={NavLink} to="/create-event">Create Event</Nav.Link>
                    <Nav.Link as={NavLink} to="/events">View Events</Nav.Link>
                    <Nav.Link as={NavLink} to="/create-task">Create Task</Nav.Link>
                    <Nav.Link as={NavLink} to="/view-tasks">View Tasks</Nav.Link>
                    <Nav.Link as={NavLink} to="/add-vendor">Add Vendor</Nav.Link>
                    <Nav.Link as={NavLink} to="/view-vendors">View Vendors</Nav.Link>
                    <Nav.Link as={NavLink} to="/assign-vendors">Assign Vendors</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Navigation;