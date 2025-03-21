import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useParams, useNavigate } from 'react-router-dom';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/events/${id}/`);
                setEvent(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleUpdate = async () => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/events/${id}/`, event);
            setEditing(false); // Exit editing mode
            navigate(`/events/${id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update event details.');
        }
    };

    const handleInputChange = (e) => {
        setEvent({ ...event, [e.target.name]: e.target.value });
    };

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!event) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {editing ? (
                <div>
                    <h2>Edit Event</h2>
                    <input type="text" name="name" value={event.name} onChange={handleInputChange} placeholder="Name" />
                    <input type="text" name="date" value={event.date} onChange={handleInputChange} placeholder="Date" />
                    <textarea name="description" value={event.description} onChange={handleInputChange} placeholder="Description" />
                    <button onClick={handleUpdate}>Save</button>
                    <button onClick={() => setEditing(false)}>Cancel</button>
                </div>
            ) : (
                <div>
                    <h2>{event.name}</h2>
                    <p>Date: {event.date}</p>
                    <p>Description: {event.description}</p>
                    <button onClick={() => setEditing(true)}>Edit</button>
                </div>
            )}
            {loading && <p>Loading event details...</p>}
        </div>
    );
};

export default EventDetails;