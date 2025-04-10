import React, { useState, useEffect } from "react";
import axios from "axios";

const CrewEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8000/api/crew/events/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setEvents(response.data);
                console.log("API Response:", response.data)
                setLoading(false);
            } catch (err) {
                setError("Failed to load events.");
                setLoading(false);
                console.error("Error fetching events:", err);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return <div className="alert alert-info text-center mt-4">Loading events...</div>;
    }

    if (error) {
        return <div className="alert alert-danger text-center mt-4">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2 className="text-primary text-center">My Events</h2>

            {events.length === 0 ? (
                <div className="alert alert-warning text-center mt-3">
                    No tasks have been assigned to you yet, so there are no events available.
                </div>
                ) : (
                <div className="list-group mt-3">
                    {events.map((event) => (
                        <div key={event.id} className="list-group-item">
                            <strong>{event.name}</strong> - Date: {event.date}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CrewEvents;
