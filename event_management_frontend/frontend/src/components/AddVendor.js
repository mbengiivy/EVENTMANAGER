import React, { useState } from 'react';
import axios from '../api';

const AddVendor = () => {
    const [name, setName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [servicesOffered, setServicesOffered] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/vendors/', { name, contact_info: contactInfo, services_offered: servicesOffered });
            setSuccess(true);
            setError('');
            setName('');
            setContactInfo('');
            setServicesOffered('');
        } catch (error) {
            setError(error.response?.data?.detail || 'Failed to add vendor.');
            setSuccess(false);
        }
    };

    return (
        <div>
            <h2>Add Vendor</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>Vendor added successfully!</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <textarea placeholder="Contact Info" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
                <textarea placeholder="Services Offered" value={servicesOffered} onChange={(e) => setServicesOffered(e.target.value)} required />
                <button type="submit">Add Vendor</button>
                {loading ? 'Creating...' : 'Add Vendor'}
            </form>
        </div>
    );
};

export default AddVendor;