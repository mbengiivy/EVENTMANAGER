import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout';

const CrewVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/crew/vendors/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setVendors(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load vendors.');
                setLoading(false);
                console.error('Error fetching vendors:', err);
            }
        };

        fetchVendors();
    }, []);

    if (loading) {
        return <DashboardLayout><div className="alert alert-info">Loading vendors...</div></DashboardLayout>;
    }

    if (error) {
        return <DashboardLayout><div className="alert alert-danger">{error}</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <h2>Crew Vendors</h2>
            <div className="list-group">
                {vendors.map(vendor => (
                    <div key={vendor.id} className="list-group-item">
                        <strong>{vendor.name}</strong> - Contact: {vendor.contact_person}
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default CrewVendors;