// AssignVendorsToTask.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const AssignVendorsToTask = ({ selectedTaskData, onClose }) => {
    const [vendors, setVendors] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState(selectedTaskData?.vendors || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVendors = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/vendors/");
                setVendors(response.data);
            } catch (err) {
                setError("Error fetching vendors.");
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://127.0.0.1:8000/api/tasks/${selectedTaskData.id}/`, {
                description: selectedTaskData.description,
                assigned_to: selectedTaskData.assigned_to?.id,
                event: selectedTaskData.event,
                status: selectedTaskData.status,
                vendors: selectedVendors,
            });
            console.log("Task updated successfully!");
            onClose();
        } catch (error) {
            console.error("Error updating task:", error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Assign Vendors to Task</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <select multiple value={selectedVendors} onChange={(e) => setSelectedVendors([...e.target.selectedOptions].map(o => o.value))}>
                    {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                    ))}
                </select>
                <button type="submit" disabled={loading}>Assign Vendors</button>
            </form>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default AssignVendorsToTask;
