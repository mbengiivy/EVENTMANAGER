import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Notifications from '../Notifications'; // Import Notifications

const CaptainDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // const [showCreateForm, setShowCreateForm] = useState(false); // No longer needed for direct navigation
    // const [newEventName, setNewEventName] = useState(''); // No longer needed here
    // const [newEventDate, setNewEventDate] = useState(''); // No longer needed here
    // const [newEventCompanyCode, setNewEventCompanyCode] = useState(''); // No longer needed here
    const [showEditForm, setShowEditForm] = useState(false);
    const [editEventId, setEditEventId] = useState(null);
    const [editEventName, setEditEventName] = useState('');
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

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
        const storedUserId = localStorage.getItem('userId');
        console.log('Stored userId:', storedUserId);
        const parsedUserId = parseInt(storedUserId);
        if (!isNaN(parsedUserId)) {
            setUserId(parsedUserId);
        } else {
            console.error('Invalid userId in localStorage:', storedUserId);
            setUserId(null);
        }
    }, []);

    // const handleCreateEvent = async () => { // This function is no longer directly called here
    //     try {
    //         const token = localStorage.getItem('token');
    //         const response = await axios.post(
    //             'http://localhost:8000/api/events/',
    //             {
    //                 name: newEventName,
    //                 date: newEventDate,
    //                 companycode: newEventCompanyCode,
    //                 chief_planner: userId,
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );
    //         fetchEvents();
    //         setShowCreateForm(false);
    //         setNewEventName('');
    //         console.log('Event created successfully:', response.data);
    //         // Handle template data here
    //         console.log('Generated Template:', response.data.template);
    //         // You can now use response.data.template to display the template in your UI
    //     } catch (err) {
    //         setError('Failed to create event.');
    //         console.error('Error creating event:', err);
    //         if (err.response && err.response.data) {
    //             console.log('Backend error data:', err.response.data);
    //         }
    //     }
    // };

    const navigateToCreateEvent = () => {
        navigate('/create-event');
    };

    const handleEditEvent = (eventId, eventName) => {
        setEditEventId(eventId);
        setEditEventName(eventName);
        setShowEditForm(true);
    };

    const handleUpdateEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
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
            console.log('Event updated successfully:', response.data);

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
            console.log('Event deleted successfully');
        } catch (err) {
            setError('Failed to delete event.');
            console.error('Error deleting event:', err);
        }
    };

    if (loading) {
        return (
            <>
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </>
        );
    }

    return (
        <>
            {userId && <Notifications userId={userId} />}

            <div className="mb-3">
                <button className="btn btn-primary" onClick={navigateToCreateEvent}>Create Event</button>
            </div>

            {/* The create event form is no longer rendered here */}
            {/* {showCreateForm && (
                <div className="mb-3">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Event Name"
                            value={newEventName}
                            onChange={(e) => setNewEventName(e.target.value)}
                        />
                    </div>
                    <div className="input-group mt-2">
                        <input
                            type="date" // Use type="date" for date input
                            className="form-control"
                            placeholder="Event Date"
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                        />
                    </div>
                    <div className="input-group mt-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Company Code"
                            value={newEventCompanyCode}
                            onChange={(e) => setNewEventCompanyCode(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-success mt-2" onClick={handleCreateEvent}>Submit</button>
                </div>
            )} */}

            {showEditForm && (
                <div className="mb-3">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            value={editEventName}
                            onChange={(e) => setEditEventName(e.target.value)}
                        />
                        <button className="btn btn-success" onClick={handleUpdateEvent}>Update</button>
                    </div>
                </div>
            )}

            <h2>Event List</h2>
            <ul className="list-group">
                {events.map((event) => (
                    <li key={event.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {event.name}
                        <div>
                            <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditEvent(event.id, event.name)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default CaptainDashboard;