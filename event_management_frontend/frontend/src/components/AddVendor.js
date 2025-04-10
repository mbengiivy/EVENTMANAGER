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
            console.error("Vendor creation error:", error.response?.data || error.message);
            if (error.response?.data) {
                const errorData = error.response.data;
                const firstKey = Object.keys(errorData)[0];
                setError(`${firstKey}: ${errorData[firstKey]}`);
            } else {
                setError('Failed to add vendor.');
            }
            setSuccess(false);
        
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container mt-4">
                <div className="card shadow-lg p-4 border-0 rounded">
                    <h2 className="text-center mb-4">Add Vendor</h2>
                    {error && <div className="alert alert-danger text-center">{error}</div>}
                    {success && <div className="alert alert-success text-center">Vendor added successfully!</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="vendorName" className="form-label fw-bold">Name</label>
                            <input
                                type="text"
                                id="vendorName"
                                className="form-control border-2"
                                placeholder="Enter vendor name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="contactInfo" className="form-label fw-bold">Contact Info</label>
                            <textarea
                                id="contactInfo"
                                className="form-control border-2"
                                rows="3"
                                placeholder="Enter contact information"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="servicesOffered" className="form-label fw-bold">Services Offered</label>
                            <textarea
                                id="servicesOffered"
                                className="form-control border-2"
                                rows="3"
                                placeholder="Enter services offered"
                                value={servicesOffered}
                                onChange={(e) => setServicesOffered(e.target.value)}
                                required
                            />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary fw-bold py-2" disabled={loading}>
                                {loading ? 'Creating...' : 'Add Vendor'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddVendor;
