import React, { useState, useEffect } from 'react';
import axios from '../api';

const ViewVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [error, setError] = useState('');
    const [editVendorId, setEditVendorId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editContactInfo, setEditContactInfo] = useState('');
    const [editServicesOffered, setEditServicesOffered] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/vendors/');
                setVendors(response.data);
            } catch (err) {
                setError('Error fetching vendors.');
            }
        };
        fetchVendors();
    }, []);

    const handleEdit = (vendor) => {
        setEditVendorId(vendor.id);
        setEditName(vendor.name);
        setEditContactInfo(vendor.contact_info);
        setEditServicesOffered(vendor.services_offered);
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/vendors/${editVendorId}/`, {
                name: editName,
                contact_info: editContactInfo,
                services_offered: editServicesOffered,
            });
            setVendors(vendors.map(vendor => vendor.id === editVendorId ? { ...vendor, name: editName, contact_info: editContactInfo, services_offered: editServicesOffered } : vendor));
            setEditVendorId(null);
        } catch (err) {
            setError('Error updating vendor.');
        }
    };

    return (
        <div>
            <h2>View Vendors</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Contact Info</th>
                        <th>Services Offered</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vendors.map(vendor => (
                        <tr key={vendor.id}>
                            {editVendorId === vendor.id ? (
                                <>
                                    <td><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} /></td>
                                    <td><textarea value={editContactInfo} onChange={(e) => setEditContactInfo(e.target.value)} /></td>
                                    <td><textarea value={editServicesOffered} onChange={(e) => setEditServicesOffered(e.target.value)} /></td>
                                    <td><button onClick={handleUpdate}>Update</button></td>
                                </>
                            ) : (
                                <>
                                    <td>{vendor.name}</td>
                                    <td>{vendor.contact_info}</td>
                                    <td>{vendor.services_offered}</td>
                                    <td><button onClick={() => handleEdit(vendor)}>Edit</button></td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewVendors;