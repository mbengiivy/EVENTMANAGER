import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

                if (Array.isArray(response.data)) {
                    setEvents(response.data);
                } else {
                    setError('Invalid data format from API.');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to load events.');
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleViewDetails = (eventId) => {
        navigate(`/events/${eventId}`);
    };

    const handleEdit = (eventId) => {
        navigate(`/events/${eventId}/edit`);
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8000/api/events/${eventId}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvents(events.filter((event) => event.id !== eventId));
            } catch (error) {
                console.error('Error deleting event:', error);
                setError('Failed to delete event. Please try again');
            }
        }
    };

    if (loading) {
        return <><div className="alert alert-info text-center">Loading events...</div></>;
    }

    if (error) {
        return <><div className="alert alert-danger text-center">{error}</div></>;
    }

    return (
        <>
            <h2 className="text-center mb-4">View Events</h2>
            <div className="row justify-content-center">
                {events.map((event) => (
                    <div key={event.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                        <div className="card shadow border rounded-lg p-3">
                            <div className="card-body">
                                <h5 className="card-title text-primary border-bottom pb-2">{event.name}</h5>
                                <p className="card-text text-muted"><strong>Date:</strong> {event.date}</p>
                                <p className="card-text"><strong>Location:</strong> {event.location || 'N/A'}</p>
                                <p className="card-text"><strong>Description:</strong> {event.description || 'N/A'}</p>
                                <div className="d-flex justify-content-between mt-3">
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => handleViewDetails(event.id)}>View</button>
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => handleEdit(event.id)}>Edit</button>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(event.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ViewEvents;
