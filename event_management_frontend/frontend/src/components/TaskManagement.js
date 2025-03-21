import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout';

const TaskManagement = () => {
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskEvent, setNewTaskEvent] = useState('');
    const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [editTask, setEditTask] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/tasks/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTasks(response.data);
            } catch (err) {
                setError('Failed to load tasks.');
                console.error('Error fetching tasks:', err);
            }
        };

        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/events/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvents(response.data);
            } catch (err) {
                setError('Failed to load events.');
                console.error('Error fetching events:', err);
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

        fetchTasks();
        fetchEvents();
        fetchUsers();
    }, []);

    const handleCreateTask = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/tasks/', {
                name: newTaskName,
                description: newTaskDescription,
                event: newTaskEvent,
                assigned_to: newTaskAssignedTo,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasks(); // Refresh tasks
            setShowCreateForm(false);
            setNewTaskName('');
            setNewTaskDescription('');
            setNewTaskEvent('');
            setNewTaskAssignedTo('');
        } catch (err) {
            setError('Failed to create task.');
            console.error('Error creating task:', err);
        }
    };

    const handleEditTask = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/tasks/${editTask.id}/`, {
                name: editTask.name,
                description: editTask.description,
                event: editTask.event,
                assigned_to: editTask.assigned_to,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasks(); // Refresh tasks
            setEditTask(null);
        } catch (err) {
            setError('Failed to update task.');
            console.error('Error updating task:', err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/tasks/${taskId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasks(); // Refresh tasks
        } catch (err) {
            setError('Failed to delete task.');
            console.error('Error deleting task:', err);
        }
    };

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/tasks/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(response.data);
        } catch (err) {
            setError('Failed to load tasks.');
            console.error('Error fetching tasks:', err);
        }
    };

    return (
        <DashboardLayout>
            {error && <div>{error}</div>}

            <button onClick={() => setShowCreateForm(true)}>Create Task</button>

            {showCreateForm && (
                <div>
                    <input type="text" placeholder="Task Name" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} />
                    <input type="text" placeholder="Description" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} />
                    <select value={newTaskEvent} onChange={(e) => setNewTaskEvent(e.target.value)}>
                        <option value="">Select Event</option>
                        {events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
                    </select>
                    <select value={newTaskAssignedTo} onChange={(e) => setNewTaskAssignedTo(e.target.value)}>
                        <option value="">Select Crew Member</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                    </select>
                    <button onClick={handleCreateTask}>Create</button>
                </div>
            )}

            {editTask && (
                <div>
                    <input type="text" value={editTask.name} onChange={(e) => setEditTask({ ...editTask, name: e.target.value })} />
                    <input type="text" value={editTask.description} onChange={(e) => setEditTask({ ...editTask, description: e.target.value })} />
                    <select value={editTask.event} onChange={(e) => setEditTask({ ...editTask, event: e.target.value })}>
                        {events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
                    </select>
                    <select value={editTask.assigned_to} onChange={(e) => setEditTask({ ...editTask, assigned_to: e.target.value })}>
                        {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                    </select>
                    <button onClick={handleEditTask}>Update</button>
                </div>
            )}

            <h2>Task List</h2>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        {task.name} - {task.description} - Event: {task.event} - Assigned to: {task.assigned_to}
                        <button onClick={() => setEditTask(task)}>Edit</button>
                        <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </DashboardLayout>
    );
};

export default TaskManagement;