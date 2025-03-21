import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout';
import Notifications from '../Notifications'; // Import Notifications

const CaptainDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [showEditForm, setShowEditForm] = useState(false);
    const [editEventId, setEditEventId] = useState(null);
    const [editEventName, setEditEventName] = useState('');
    const [userId, setUserId] = useState(null); // Add userId state

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/events/', {
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

    useEffect(() => {
        fetchEvents();
        const storedUserId = localStorage.getItem('userId'); // Fetch userId from localStorage
        setUserId(parseInt(storedUserId));
    }, []);

    const handleCreateEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:8000/api/events/',
                { name: newEventName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchEvents();
            setShowCreateForm(false);
            setNewEventName('');
        } catch (err) {
            setError('Failed to create event.');
            console.error('Error creating event:', err);
        }
    };

    const handleEditEvent = (eventId, eventName) => {
        setEditEventId(eventId);
        setEditEventName(eventName);
        setShowEditForm(true);
    };

    const handleUpdateEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/api/events/${editEventId}/`,
                {
                    name: editEventName,
                    date: '2024-01-01', // Replace with the actual date
                    companycode: 'COMPANY123', // Replace with the actual company code
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchEvents();
            setShowEditForm(false);
            setEditEventId(null);
            setEditEventName('');
        } catch (err) {
            setError('Failed to update event.');
            console.error('Error updating event:', err);
            if (err.response && err.response.data) {
                console.log('Backend error data:', err.response.data);
            }
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/events/${eventId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchEvents();
        } catch (err) {
            setError('Failed to delete event.');
            console.error('Error deleting event:', err);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div>Loading events...</div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div>{error}</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {userId && <Notifications userId={userId} />} {/* Render Notifications */}
            <button onClick={() => setShowCreateForm(true)}>Create Event</button>

            {showCreateForm && (
                <div>
                    <input
                        type="text"
                        placeholder="Event Name"
                        value={newEventName}
                        onChange={(e) => setNewEventName(e.target.value)}
                    />
                    <button onClick={handleCreateEvent}>Submit</button>
                </div>
            )}

            {showEditForm && (
                <div>
                    <input
                        type="text"
                        value={editEventName}
                        onChange={(e) => setEditEventName(e.target.value)}
                    />
                    <button onClick={handleUpdateEvent}>Update</button>
                </div>
            )}

            <h2>Event List</h2>
            <ul>
                {events.map((event) => (
                    <li key={event.id}>
                        {event.name}
                        <button onClick={() => handleEditEvent(event.id, event.name)}>Edit</button>
                        <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </DashboardLayout>
    );
};

export default CaptainDashboard;