import React, { useState, useEffect } from 'react';
import axios from '../api';

const CreateTask = () => {
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [event, setEvent] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [crewMembers, setCrewMembers] = useState([]);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCrewMembers = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/users/?role=crew');
                setCrewMembers(response.data);
            } catch (err) {
                setError('Error fetching crew members.');
            }
        };
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/events/');
                setEvents(response.data);
            } catch (err) {
                setError('Error fetching events.');
            }
        };
        fetchCrewMembers();
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/tasks/', {
                description,
                assigned_to: assignedTo,
                event,
                due_date: dueDate,
            });
            setSuccess(true);
            setError('');
            setDescription('');
            setAssignedTo('');
            setEvent('');
            setDueDate('');
            setTimeout(() => setSuccess(false), 3000);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.detail || 'Failed to create task.');
            setSuccess(false);
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Create Task</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>Task created successfully!</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required>
                    <option value="">Select Crew Member</option>
                    {crewMembers.map((member) => (
                        <option key={member.id} value={member.id}>{member.username}</option>
                    ))}
                </select>
                <select value={event} onChange={(e) => setEvent(e.target.value)} required>
                    <option value="">Select Event</option>
                    {events.map((event) => (
                        <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                </select>
                <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Task'}</button>
            </form>
        </div>
    );
};

export default CreateTask;