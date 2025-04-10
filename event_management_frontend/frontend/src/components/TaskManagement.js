import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    //eslint-disable-next-line
    const [eventMap, setEventMap] = useState({});

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

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/events/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvents(response.data);
                const map = {};
                response.data.forEach(event => (map[event.id] = event.name));
                setEventMap(map);
            } catch (err) {
                setError('Failed to load events.');
                console.error('Error fetching events:', err);
            }
        };

        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/users/?role=crew', {
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
            await axios.post(
                'http://localhost:8000/api/tasks/',
                {
                    name: newTaskName,
                    description: newTaskDescription,
                    event: newTaskEvent,
                    assigned_to: newTaskAssignedTo,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            fetchTasks();
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
            await axios.put(
                `http://localhost:8000/api/tasks/${editTask.id}/`,
                {
                    name: editTask.name,
                    description: editTask.description,
                    event: editTask.event,
                    assigned_to: editTask.assigned_to,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            fetchTasks();
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
            fetchTasks();
        } catch (err) {
            setError('Failed to delete task.');
            console.error('Error deleting task:', err);
        }
    };

    return (
        <>
            <div className="container mt-4">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="text-primary">Task Management</h2>
                    <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                        + Create Task
                    </button>
                </div>

                {showCreateForm && (
                    <div className="card p-3 mb-4 shadow-sm">
                        <h4 className="mb-3">Create New Task</h4>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Task Name"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Description"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <select className="form-select" value={newTaskEvent} onChange={(e) => setNewTaskEvent(e.target.value)}>
                                <option value="">Select Event</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <select className="form-select" value={newTaskAssignedTo} onChange={(e) => setNewTaskAssignedTo(e.target.value)}>
                                <option value="">Select Crew Member</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-success" onClick={handleCreateTask}>
                            Create
                        </button>
                    </div>
                )}

                {editTask && (
                    <div className="card p-3 mb-4 shadow-sm">
                        <h4>Edit Task</h4>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                value={editTask.name}
                                onChange={(e) => setEditTask({ ...editTask, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                value={editTask.description}
                                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                            />
                        </div>
                        <button className="btn btn-warning" onClick={handleEditTask}>
                            Update
                        </button>
                    </div>
                )}

                <h3 className="mb-3">Task List</h3>
                <ul className="list-group">
                    {tasks.map((task) => (
                        <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{task.name}</strong> - {task.description} | Event: {task.event_name || 'Unknown'} | Assigned to: {task.assigned_to.username}
                            </div>
                            <div>
                                <button className="btn btn-secondary btn-sm me-2" onClick={() => setEditTask(task)}>
                                    Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task.id)}>
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default TaskManagement;
