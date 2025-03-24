import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout';
import Notifications from '../Notifications';
import CrewEvents from './CrewEvents'; // Create this component
import CrewTasks from './CrewTasks'; // Create this component
import CrewVendors from './CrewVendors'; // Create this component
import EventCalendar from './EventCalendar'; // Import Calendar Component

const CrewDashboard = () => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        setUserId(parseInt(storedUserId));
    }, []);

    return (
        <DashboardLayout>
            <div className="container mt-4">
                <h2>Crew Dashboard</h2>

                {userId && <Notifications userId={userId} />}

                <div className="mt-3">
                    <CrewEvents />
                    <CrewTasks />
                    <CrewVendors />
                    <EventCalendar />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CrewDashboard;