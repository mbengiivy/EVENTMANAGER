import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';


const ViewEvents = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");
     

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem("token"); // Retrieve token
                console.log("Stored Token:", localStorage.getItem("token"));
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
        <Link to={`http://127.0.0.1:8000/api/event/${event.id}`}>
            {event.name} - {event.date}
        </Link>
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
 