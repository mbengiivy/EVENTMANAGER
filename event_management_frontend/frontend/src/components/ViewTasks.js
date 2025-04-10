import React, { useState, useEffect } from 'react';
import axios from '../api';

const ViewTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/tasks/');
                setTasks(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching tasks.');
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/tasks/${taskId}/`, { status: newStatus });
            setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
        } catch (err) {
            setError('Error updating task status.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/tasks/${taskId}/`);
            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (err) {
            setError('Error deleting task.');
        }
    };

    const filteredTasks = statusFilter
        ? tasks.filter(task => task.status === statusFilter)
        : tasks;

    if (loading) return <p>Loading tasks...</p>;

    return (
        <div>
            
            <h2>View Tasks</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
            </select>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th>Assigned To</th>
                        <th>Event</th>
                        <th>Status</th>
                        <th>Vendors</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTasks.map(task => (
                        <tr key={task.id}>
                            <td>{task.description}</td>
                            <td>{new Date(task.due_date).toLocaleDateString()}</td>
                            <td>{task.assigned_to.username}</td>
                            <td>{task.event.name}</td>
                            <td>{task.status}</td>
                            <td>{task.vendors.map(vendor => vendor.name).join(', ')}</td>
                            <td>
                                <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)}>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewTasks;