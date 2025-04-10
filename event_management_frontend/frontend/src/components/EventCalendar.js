import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const EventCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/calendar/events/', {
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

    return (
        <>
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-primary">Event Calendar</h2>
                </div>

                {loading && <div className="alert alert-info text-center">Loading calendar...</div>}
                {error && <div className="alert alert-danger text-center">{error}</div>}

                {!loading && !error && (
                    <div className="card shadow-sm border-0 rounded">
                        <div className="card-body">
                            <div className="calendar-container" style={{ height: 600 }}>
                                <Calendar
                                    localizer={localizer}
                                    events={events}
                                    startAccessor="start"
                                    endAccessor="end"
                                    className="border rounded p-3"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default EventCalendar;
