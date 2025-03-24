import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout';

const CrewEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/crew/events/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setEvents(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load events.');
                setLoading(false);
                console.error('Error fetching events:', err);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return <DashboardLayout><div className="alert alert-info">Loading events...</div></DashboardLayout>;
    }

    if (error) {
        return <DashboardLayout><div className="alert alert-danger">{error}</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <h2>Crew Events</h2>
            <div className="list-group">
                {events.map(event => (
                    <div key={event.id} className="list-group-item">
                        <strong>{event.name}</strong> - Date: {event.event_date}
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default CrewEvents;