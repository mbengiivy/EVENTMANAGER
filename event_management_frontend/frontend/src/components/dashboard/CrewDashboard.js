import React, { useState, useEffect } from "react";
import Notifications from "../Notifications";
import EventCalendar from "../EventCalendar"; // Import Calendar Component

const CrewDashboard = () => {
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null); // Add state for user name

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        const storedUserName = localStorage.getItem("userName"); // Retrieve user name
        setUserId(parseInt(storedUserId));
        setUserName(storedUserName);
    }, []);

    return (
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <h2 className="text-center text-primary">Crew Dashboard</h2>

                {/* Welcome Message */}
                {userName && (
                    <h4 className="text-center text-secondary mt-3">Welcome, {userName}!</h4>
                )}

                {/* Notifications Section */}
                {userId && (
                    <div className="mt-4">
                        <h5 className="text-dark">Notifications</h5>
                        <Notifications userId={userId} />
                    </div>
                )}

                {/* Event Calendar Section */}
                <div className="mt-4">
                    <h5 className="text-dark">Event Calendar</h5>
                    <EventCalendar /> {/* Display the calendar */}
                </div>
            </div>
        </div>
    );
};

export default CrewDashboard;
