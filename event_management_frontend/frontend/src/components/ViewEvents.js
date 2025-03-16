import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewEvents = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem("token"); // Retrieve token
                const headers = token ? { Authorization: `Token ${token}` } : {};

                const response = await axios.get("http://127.0.0.1:8000/api/events/", { headers });

                console.log("Fetched Events:", response.data);
                setEvents(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError(err.response?.data?.detail || "Failed to load events.");
            }
        };

        fetchEvents();
    }, []);

    return (
        <div>
            <h2>View Events</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {events.length > 0 ? (
                <ul>
                    {events.map((event) => (
                        <li key={event.id}>
                            {event.name} - {event.date}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No events available.</p>
            )}
        </div>
    );
};

export default ViewEvents;
