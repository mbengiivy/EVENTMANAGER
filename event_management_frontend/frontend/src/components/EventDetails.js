import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EventDetails = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditForm, setShowEditForm] = useState(false);
    const [editEventName, setEditEventName] = useState('');
    // include other state variables that you are using.

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/events/${eventId}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setEvent(response.data);
                setLoading(false);
                setEditEventName(response.data.name); // initialise the edit form.
            } catch (err) {
                setError('Failed to load event details.');
                setLoading(false);
                console.error('Error fetching event details:', err);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleUpdateEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/api/events/${eventId}/`,
                { name: editEventName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setShowEditForm(false);
            navigate(`/events/${eventId}`);
        } catch (err) {
            setError('Failed to update event.');
            console.error('Error updating event:', err);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div>
            <h2>Event Details</h2>
            {event && (
                <div>
                    <p><strong>Name:</strong> {event.name}</p>
                    {/* ... other event details ... */}

                    <button className="btn btn-primary" onClick={() => setShowEditForm(true)}>Edit Event</button>

                    {showEditForm && (
                        <div className="mt-3">
                            <input type="text" className="form-control mb-2" value={editEventName} onChange={(e) => setEditEventName(e.target.value)} />
                            {/* ... other input fields ... */}
                            <button className="btn btn-success" onClick={handleUpdateEvent}>Update</button>
                            <button className="btn btn-secondary ml-2" onClick={() => setShowEditForm(false)}>Cancel</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventDetails;