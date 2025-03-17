import React, { useState, useEffect } from 'react';
import axios from '../api';

const AssignVendorsToTask = () => {
    const [tasks, setTasks] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [error, setError] = useState('');
    const [selectedTaskData, setSelectedTaskData] = useState(null); // Keeping this since you need it

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/tasks/');
                setTasks(response.data);
            } catch (err) {
                setError('Error fetching tasks.');
            }
        };

        const fetchVendors = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/vendors/');
                setVendors(response.data);
            } catch (err) {
                setError('Error fetching vendors.');
            }
        };

        fetchTasks();
        fetchVendors();
    }, []);

    const handleTaskChange = (e) => {
        const taskId = e.target.value;
        setSelectedTask(taskId);
        if (taskId) {
            const task = tasks.find(t => t.id === parseInt(taskId));
            setSelectedTaskData(task);
            console.log('Selected Task Data:', task);
        } else {
            setSelectedTaskData(null);
        }
    };

    const handleVendorChange = (vendorId) => {
        if (selectedVendors.includes(vendorId)) {
            setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
        } else {
            setSelectedVendors([...selectedVendors, vendorId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (!selectedTaskData) {
            setError('Please select a task first.');
            return;
        }

        try {
            await axios.put(`http://127.0.0.1:8000/api/tasks/${selectedTaskData.id}/`, {
                description: selectedTaskData.description,
                assigned_to: selectedTaskData.assigned_to?.id,  // Send only the ID
                event: selectedTaskData.event,
                status: selectedTaskData.status,  // Include all required fields
                vendors: selectedVendors, // Send the selected vendors
            });
            console.log("Task updated successfully!");
        } catch (error) {
            console.error("Error updating task:", error.response?.data);
        }
    };

    return (
        <div>
            <h2>Assign Vendors to Task</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <label>Select Task:</label>
                <select value={selectedTask} onChange={handleTaskChange} required>
                    <option value="">Select Task</option>
                    {tasks.map((task) => (
                        <option key={task.id} value={task.id}>
                            {task.description}
                        </option>
                    ))}
                </select>

                {selectedTaskData && (
                    <div>
                        <h4>Task Details:</h4>
                        <p><strong>Description:</strong> {selectedTaskData.description}</p>
                        <p><strong>Status:</strong> {selectedTaskData.status}</p>
                        <p><strong>Assigned To:</strong> {selectedTaskData.assigned_to?.username || 'N/A'}</p>
                    </div>
                )}

                <div>
                    <p>Select Vendors:</p>
                    {vendors.map((vendor) => (
                        <label key={vendor.id}>
                            <input
                                type="checkbox"
                                value={vendor.id}
                                checked={selectedVendors.includes(vendor.id)}
                                onChange={() => handleVendorChange(vendor.id)}
                            />
                            {vendor.name}
                        </label>
                    ))}
                </div>

                <button type="submit">Assign Vendors</button>
            </form>
        </div>
    );
};

export default AssignVendorsToTask;
