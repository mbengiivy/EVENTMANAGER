import React, { useState } from 'react';
import axios from '../api';

const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventDetails, setEventDetails] = useState(null); // Store OpenAI response
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/events/create_with_openai/', {
                name: eventName,
                date: eventDate,
            });

            console.log("API Response:", response.data); // Debugging output
            setEventDetails(response.data || {}); // Ensure it's always an object
            setSuccess('Event details generated. Please confirm.');

        } catch (err) {
            console.error("Error fetching event details:", err);
            setError(err.response?.data?.error || 'Failed to generate event details.');
        }
        setLoading(false);
    };

    const handleConfirm = async () => {
        if (!eventDetails) {
            setError("No event details available to confirm.");
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/create-event/', {
                name: eventName,
                date: eventDate,
                description: eventDetails.description || "No description provided.",
                agenda: eventDetails.agenda || [],
                tasks: eventDetails.tasks || [],
            });

            setSuccess('Event created successfully!');
        } catch (err) {
            console.error("Error creating event:", err);
            setError(err.response?.data?.error || 'Failed to create event.');
        }
    };

    return (
        <div>
            <h2>Create Event</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Event Name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                />
                <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                />
                <button type="submit">Generate Event Details</button>
            </form>

            {eventDetails && (
                <div>
                    <h3>Event Details</h3>
                    
                    {eventDetails?.description ? (
                        <p>Description: {eventDetails.description}</p>
                    ) : (
                        <p>No description provided.</p>
                    )}

                    {eventDetails?.agenda?.length > 0 ? (
                        <div>
                            <h4>Agenda</h4>
                            <ul>
                                {eventDetails.agenda.map((item, index) => (
                                    <li key={index}>
                                        {item?.time}: {item?.activity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>No agenda available.</p>
                    )}

                    {eventDetails?.tasks?.length > 0 ? (
                        <div>
                            <h4>Tasks</h4>
                            <ul>
                                {eventDetails.tasks.map((task, index) => (
                                    <li key={index}>{task}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>No tasks assigned.</p>
                    )}

                    <button onClick={handleConfirm}>Confirm Event
                    {loading ? 'Creating...' : 'Create event'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreateEvent;
