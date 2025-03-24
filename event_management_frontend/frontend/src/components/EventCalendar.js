import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DashboardLayout from './DashboardLayout';

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
                const response = await axios.get('http://localhost:8000/api/calendar/events/', { // Updated endpoint
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setEvents(response.data); // Data is already formatted

                setLoading(false);
            } catch (err) {
                setError('Failed to load events.');
                setLoading(false);
                console.error('Error fetching events:', err);
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
            <h2>Event Calendar</h2>
            <div style={{ height: 600 }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ margin: '20px' }}
                />
            </div>
        </DashboardLayout>
    );
};

export default EventCalendar;