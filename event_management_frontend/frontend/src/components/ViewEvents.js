import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';

const ViewEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/events/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setEvents(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to load events.');
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="alert alert-info">Loading events...</div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="alert alert-danger">{error}</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <h2>View Events</h2>
            <div className="row">
                {events.map((event) => (
                    <div key={event.id} className="col-md-4 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{event.name}</h5>
                                <p className="card-text">
                                    <strong>Date:</strong> {event.event_date}
                                </p>
                                <p className="card-text">
                                    <strong>Location:</strong> {event.location || 'N/A'}
                                </p>
                                <p className="card-text">
                                    <strong>Description:</strong> {event.description || 'N/A'}
                                </p>
                                <button className="btn btn-primary btn-sm me-2">
                                    View Details
                                </button>
                                <button className="btn btn-secondary btn-sm me-2">
                                    Edit
                                </button>
                                <button className="btn btn-danger btn-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default ViewEvents;