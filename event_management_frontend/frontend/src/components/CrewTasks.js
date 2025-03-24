import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout';

const CrewTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/crew/tasks/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTasks(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load tasks.');
                setLoading(false);
                console.error('Error fetching tasks:', err);
            }
        };

        fetchTasks();
    }, []);

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/crew/tasks/${taskId}/status/`, {
                status: newStatus,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
        } catch (err) {
            setError('Failed to update task status.');
            console.error('Error updating task status:', err);
        }
    };

    if (loading) {
        return <DashboardLayout><div className="alert alert-info">Loading tasks...</div></DashboardLayout>;
    }

    if (error) {
        return <DashboardLayout><div className="alert alert-danger">{error}</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <h2>Crew Tasks</h2>
            <div className="list-group">
                {tasks.map(task => (
                    <div key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{task.name}</strong> - Status: <span className={`badge ${task.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}>{task.status}</span>
                        </div>
                        <div>
                            <button className="btn btn-sm btn-success me-2" onClick={() => handleUpdateStatus(task.id, 'Completed')}>Complete</button>
                            <button className="btn btn-sm btn-warning" onClick={() => handleUpdateStatus(task.id, 'In Progress')}>In Progress</button>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default CrewTasks;