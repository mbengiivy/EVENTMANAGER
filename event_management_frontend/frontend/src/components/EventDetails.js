import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useParams } from 'react-router-dom';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000//api/events/${id}/`);
                setEvent(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch event details.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!event) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>{event.name}</h2>
            <p>Date: {event.date}</p>
            <p>Description: {event.description}</p>
            {/* Display other event details (agenda, tasks, etc.) */}
            {loading && <p>Loading event details...</p>}

        </div>
    );
};

export default EventDetails;