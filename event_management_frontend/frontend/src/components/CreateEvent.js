import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [template, setTemplate] = useState([]);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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

    const fetchTemplate = useCallback(async () => {
        if (!eventName.trim()) {
            setErrorMessage("Please enter an event name before loading the template.");
            return;
        }
        setIsLoading(true);
        setErrorMessage('');
        try {
            const response = await axios.get(`http://localhost:8000/api/templates/?event_type=${eventName}`);
            setTemplate(response.data.template || []);
        } catch (error) {
            console.error('Error fetching template:', error);
            setErrorMessage('Failed to load template.');
            setTemplate([{ label: 'Notes', type: 'textarea', key: 'notes' }]);
        }
        setIsLoading(false);
    }, [eventName]);

    const handleChange = (e) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');
            const companycode = localStorage.getItem('companycode');
            const eventData = {
                name: eventName,
                date: eventDate,
                companycode,
                template,
                ...formData,
            };

            const response = await axios.post('http://localhost:8000/api/events/', eventData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccessMessage('Event created successfully!');
            navigate(`/events/${response.data.id}`);
        } catch (error) {
            console.error('Error creating event:', error);
            setErrorMessage('Failed to create event.');
        }

        setIsLoading(false);
    };

    return (
        <>
            <div className="container mt-4">
                <div className="card shadow p-4">
                    <h2 className="mb-4 text-center">Create Event</h2>

                    {isLoading && <div className="alert alert-info">Processing...</div>}
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Event Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Event Name"
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                    className={`form-control ${errors.eventName ? 'is-invalid' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.eventName && <div className="invalid-feedback">{errors.eventName}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Event Date</label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className={`form-control ${errors.eventDate ? 'is-invalid' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.eventDate && <div className="invalid-feedback">{errors.eventDate}</div>}
                            </div>
                        </div>

                        <div className="text-center mb-3">
                            <button
                                type="button"
                                onClick={fetchTemplate}
                                disabled={isLoading}
                                className="btn btn-primary"
                            >
                                Load Template
                            </button>
                        </div>

                        {template.length > 0 && (
                            <div className="card p-3 mb-3">
                                <h5 className="mb-3 text-center">Template Fields</h5>
                                <div className="row">
                                    {template.map((field) => (
                                        <div key={field.key} className="col-md-6 mb-3">
                                            <label className="form-label">{field.label}:</label>
                                            {field.type === 'select' ? (
                                                <select
                                                    name={field.key}
                                                    value={formData[field.key] || ''}
                                                    onChange={handleChange}
                                                    className="form-select"
                                                    disabled={isLoading}
                                                >
                                                    <option value="">Select...</option>
                                                    {field.options?.map((option) => (
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
                                                    onChange={handleChange}
                                                    className="form-control"
                                                    disabled={isLoading}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="text-center">
                            <button type="submit" disabled={isLoading} className="btn btn-success w-50">
                                Create Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateEvent;
