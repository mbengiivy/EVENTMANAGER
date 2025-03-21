import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Registration from './components/Registration';
import Login from './components/Login';
import 'bootstrap/dist/css/bootstrap.min.css';

// Captain Components
import CreateEvent from './components/CreateEvent';
import ViewEvents from './components/ViewEvents';
import EventDetails from './components/EventDetails';
import CreateTask from './components/CreateTask';
import ViewTasks from './components/ViewTasks';
import AddVendor from './components/AddVendor';
import ViewVendor from './components/ViewVendor';
import AssignVendorsToTask from './components/AssignVendorsToTask';
import ReportView from './components/ReportView'; // Placeholder for reports

// Crew Components
import CrewTasks from './components/CrewTasks'; // Placeholder for crew tasks
import CrewEvents from './components/CrewEvents'; // Placeholder for crew events
import CrewVendors from './components/CrewVendors'; // Placeholder for crew vendors

function App() {
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
            setUserRole(storedRole);
        } else {
            // Fetch role from backend on login
            const token = localStorage.getItem('token');
            if (token) {
                // Example Fetch
                fetch('/api/user/role', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('userRole', data.role);
                    setUserRole(data.role);
                })
                .catch(error => console.error('Error fetching role:', error));
            } else {
                navigate('/login')
            }
        }
    }, [navigate]);

    if (userRole === null) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    return (
        <>
            <Navigation />
            <Routes>
                <Route path="/register" element={<Registration />} />
                <Route path="/login" element={<Login />} />

                {userRole === 'captain' && (
                    <>
                        <Route path="/create-event" element={<CreateEvent />} />
                        <Route path="/events" element={<ViewEvents />} />
                        <Route path="/event/:id" element={<EventDetails />} />
                        <Route path="/create-task" element={<CreateTask />} />
                        <Route path="/view-tasks" element={<ViewTasks />} />
                        <Route path="/add-vendor" element={<AddVendor />} />
                        <Route path="/view-vendors" element={<ViewVendor />} />
                        <Route path="/assign-vendors" element={<AssignVendorsToTask />} />
                        <Route path="/reports" element={<ReportView />} />
                    </>
                )}

                {userRole === 'crew' && (
                    <>
                        <Route path="/tasks" element={<CrewTasks />} />
                        <Route path="/events" element={<CrewEvents />} />
                        <Route path="/vendors" element={<CrewVendors />} />
                    </>
                )}
            </Routes>
        </>
    );
}

export default App;