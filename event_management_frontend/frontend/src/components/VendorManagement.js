import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout';

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [newVendorName, setNewVendorName] = useState('');
    const [newVendorContact, setNewVendorContact] = useState('');
    const [newVendorAssignedTo, setNewVendorAssignedTo] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editVendor, setEditVendor] = useState(null);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/vendors/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setVendors(response.data);
            } catch (err) {
                setError('Failed to load vendors.');
                console.error('Error fetching vendors:', err);
            }
        };

        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/users/?role=crew', { // Filter for crew
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
            } catch (err) {
                setError('Failed to load users.');
                console.error('Error fetching users:', err);
            }
        };

        fetchVendors();
        fetchUsers();
    }, []);

    const handleCreateVendor = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/vendors/', {
                name: newVendorName,
                contact: newVendorContact,
                assigned_to: newVendorAssignedTo,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchVendors(); // Refresh vendors
            setShowCreateForm(false);
            setNewVendorName('');
            setNewVendorContact('');
            setNewVendorAssignedTo('');
        } catch (err) {
            setError('Failed to create vendor.');
            console.error('Error creating vendor:', err);
        }
    };

    const handleEditVendor = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/vendors/${editVendor.id}/`, {
                name: editVendor.name,
                contact: editVendor.contact,
                assigned_to: editVendor.assigned_to,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchVendors(); // Refresh vendors
            setEditVendor(null);
        } catch (err) {
            setError('Failed to update vendor.');
            console.error('Error updating vendor:', err);
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/vendors/${vendorId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchVendors(); // Refresh vendors
        } catch (err) {
            setError('Failed to delete vendor.');
            console.error('Error deleting vendor:', err);
        }
    };

    return (
        <DashboardLayout>
            {error && <div>{error}</div>}

            <button onClick={() => setShowCreateForm(true)}>Create Vendor</button>

            {showCreateForm && (
                <div>
                    <input type="text" placeholder="Vendor Name" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} />
                    <input type="text" placeholder="Contact Info" value={newVendorContact} onChange={(e) => setNewVendorContact(e.target.value)} />
                    <select value={newVendorAssignedTo} onChange={(e) => setNewVendorAssignedTo(e.target.value)}>
                        <option value="">Select Crew Member</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                    </select>
                    <button onClick={handleCreateVendor}>Create</button>
                </div>
            )}

            {editVendor && (
                <div>
                    <input type="text" value={editVendor.name} onChange={(e) => setEditVendor({ ...editVendor, name: e.target.value })} />
                    <input type="text" value={editVendor.contact} onChange={(e) => setEditVendor({ ...editVendor, contact: e.target.value })} />
                    <select value={editVendor.assigned_to} onChange={(e) => setEditVendor({ ...editVendor, assigned_to: e.target.value })}>
                        {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                    </select>
                    <button onClick={handleEditVendor}>Update</button>
                </div>
            )}

            <h2>Vendor List</h2>
            <ul>
                {vendors.map(vendor => (
                    <li key={vendor.id}>
                        {vendor.name} - {vendor.contact} - Assigned to: {vendor.assigned_to}
                        <button onClick={() => setEditVendor(vendor)}>Edit</button>
                        <button onClick={() => handleDeleteVendor(vendor.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </DashboardLayout>
    );
};

export default VendorManagement;