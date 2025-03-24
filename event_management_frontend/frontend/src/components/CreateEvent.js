import React, { useState } from 'react';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';

const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [template, setTemplate] = useState([]);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!eventName.trim()) {
            newErrors.eventName = 'Event name is required.';
            isValid = false;
        }

        if (!eventDate) {
            newErrors.eventDate = 'Event date is required.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const fetchTemplate = async () => {
        setIsLoading(true); // Start loading
        try {
            const response = await axios.get(`http://localhost:8000/api/templates/?event_type=${eventName}`);
            setTemplate(response.data.template);
        } catch (error) {
            console.error('Error fetching template:', error);
            setTemplate([{ label: 'Notes', type: 'textarea', key: 'notes' }]);
        }
        setIsLoading(false); // Stop loading
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:8000/api/events/', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSuccessMessage('Event created successfully!');
                setErrorMessage('');
            } catch (error) {
                console.error('Error creating event:', error);
                setErrorMessage('Failed to create event.');
                setSuccessMessage('');
            }
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <h2>Create Event</h2>
            {isLoading && <div className="alert alert-info">Loading...</div>}
            {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
            )}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Event Name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="form-control" // Bootstrap input style
                    disabled={isLoading}
                />
                {errors.eventName && (
                    <div className="text-danger">{errors.eventName}</div>
                )}
            </div>
            <div className="mb-3">
                <input
                    type="date"
                    placeholder="Event Date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="form-control" // Bootstrap input style
                    disabled={isLoading}
                />
                {errors.eventDate && (
                    <div className="text-danger">{errors.eventDate}</div>
                )}
            </div>
            <button onClick={fetchTemplate} disabled={isLoading} className="btn btn-primary">
                Load Template
            </button>
            <form onSubmit={handleSubmit}>
                {template.map((field) => (
                    <div key={field.key} className="mb-3">
                        <label className="form-label">{field.label}:</label>
                        {field.type === 'select' ? (
                            <select
                                name={field.key}
                                value={formData[field.key] || ''}
                                onChange={(e) => handleChange(e)}
                                className="form-select" // Bootstrap select style
                                disabled={isLoading}
                            >
                                <option value="">Select...</option>
                                {field.options &&
                                    field.options.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                name={field.key}
                                value={formData[field.key] || ''}
                                onChange={(e) => handleChange(e)}
                                className="form-control" // Bootstrap input style
                                disabled={isLoading}
                            />
                        )}
                    </div>
                ))}
                <button type="submit" disabled={isLoading} className="btn btn-success">
                    Create Event
                </button>
            </form>
        </DashboardLayout>
    );
};

export default CreateEvent;