// src/components/dashboard/UserRoleManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout';

const UserRoleManagement = () => {
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedRole, setEditedRole] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/users/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
            } catch (err) {
                setError('Failed to load users.');
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    const handleEditRole = (userId, currentRole) => {
        setEditingUserId(userId);
        setEditedRole(currentRole);
    };

    const handleSaveRole = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/users/${userId}/`, {
                role: editedRole,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers(); // Refresh users
            setEditingUserId(null);
        } catch (err) {
            setError('Failed to update user role.');
            console.error('Error updating user role:', err);
        }
    };

    return (
        <DashboardLayout>
            {error && <div className="alert alert-danger">{error}</div>}

            <h2>User Role Management</h2>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>
                                {editingUserId === user.id ? (
                                    <select className="form-control" value={editedRole} onChange={(e) => setEditedRole(e.target.value)}>
                                        <option value="admin">Admin</option>
                                        <option value="crew">Crew</option>
                                    </select>
                                ) : (
                                    user.role
                                )}
                            </td>
                            <td>
                                {editingUserId === user.id ? (
                                    <button className="btn btn-sm btn-success" onClick={() => handleSaveRole(user.id)}>Save</button>
                                ) : (
                                    <button className="btn btn-sm btn-primary" onClick={() => handleEditRole(user.id, user.role)}>Edit</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DashboardLayout>
    );
};

export default UserRoleManagement;