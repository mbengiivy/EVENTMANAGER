import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';


const EventDetails = () => {
    const { eventId } = useParams();
    console.log("Event ID from URL:", eventId);
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditForm, setShowEditForm] = useState(false);
    const [editEventName, setEditEventName] = useState('');
    const [template, setTemplate] = useState([]);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState('text');
    const [newFieldValue, setNewFieldValue] = useState('');
    const [fieldValues, setFieldValues] = useState({});

    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/events/${eventId}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Retrieved Token:", token); // Debugging line

            if (!token) {
                setError("Unauthorized: No token found. Please log in.");
                return;
            }
    
                console.log("Fetched Event Data:", response.data);
                setEvent(response.data);
                setTemplate(response.data.template || []);
                setEditEventName(response.data.name || "");
                setFieldValues(response.data.field_values || {});
            } catch (err) {
                setError("Failed to load event details.");
                console.error("Error fetching event details:", err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchEventDetails();
    }, [eventId]);
    

    const handleUpdateEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            const companycode = localStorage.getItem('companycode');
            const updatedEventData = {
                name: editEventName,
                date: event.date, // Keep the existing date
                companycode: companycode || event.companycode, // Keep the existing company code
                template: template, // Make sure the updated template structure is sent
                field_values: fieldValues, // **Include the fieldValues here!**
            };
    
            console.log("Updating event with:", JSON.stringify(updatedEventData, null, 2));
    
            await axios.put(
                `http://localhost:8000/api/events/${eventId}/`,
                updatedEventData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            setShowEditForm(false);
            navigate(`/events/${eventId}`);
        } catch (err) {
            setError('Failed to update event.');
            console.error('Error updating event:', err.response?.data || err);
        }
    };

    const handleAddField = () => {
        if (newFieldName) {
            const newFieldKey = newFieldName.toLowerCase().replace(/\s+/g, '_');
            const newField = { label: newFieldName, type: newFieldType, key: newFieldKey };
            setTemplate([...template, newField]);
            setFieldValues({ ...fieldValues, [newFieldKey]: newFieldValue });
            setNewFieldName('');
            setNewFieldValue('');
        }
    };

    const handleFieldValueChange = (key, value) => {
        setFieldValues({ ...fieldValues, [key]: value });
    };

    if (loading) {
        return <><div className="text-center mt-5">Loading...</div></>;
    }

    if (error) {
        return <><div className="alert alert-danger text-center mt-4">{error}</div></>;
    }

    return (
        <>
            <div className="container mt-4">
                <h2 className="mb-3">Event Details</h2>
                <p className="text-muted">Click the 'Edit Event' button to modify event details.</p>
                {event && (
                    <div className="card p-4 shadow-sm">
                        <h3 className="mb-3">{event.name}</h3>
                        {template.length > 0 ? (
                            template.map((field) => (
                                <div key={field.key} className="mb-2">
                                    <strong>{field.label}:</strong> {fieldValues[field.key] || 'N/A'}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No template fields available.</p>
                        )}

                        <div className="mt-4">
                            <h3>Add New Field</h3>
                            <div className="d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Field Name"
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                />
                                <select className="form-select" value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}>
                                    <option value="text">Text</option>
                                    <option value="textarea">Textarea</option>
                                </select>
                                <input
                                    type={newFieldType}
                                    className="form-control"
                                    placeholder="Field Value"
                                    value={newFieldValue}
                                    onChange={(e) => setNewFieldValue(e.target.value)}
                                />
                                <button className="btn btn-success" onClick={handleAddField}>Add</button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button className="btn btn-primary" onClick={() => setShowEditForm(true)}>
                                Edit Event
                            </button>

                            {showEditForm && (
                                <div className="mt-3">
                                    <div className="mb-3">
                                        <label className="form-label">Event Name:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editEventName}
                                            onChange={(e) => setEditEventName(e.target.value)}
                                        />
                                    </div>
                                    {template.map((field) => (
                                        <div key={field.key} className="mb-3">
                                            <label className="form-label">{field.label}:</label>
                                            <input
                                                type={field.type}
                                                className="form-control"
                                                value={fieldValues[field.key] || ''}
                                                onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <button className="btn btn-success me-2" onClick={handleUpdateEvent}>Update</button>
                                    <button className="btn btn-secondary" onClick={() => setShowEditForm(false)}>Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default EventDetails;