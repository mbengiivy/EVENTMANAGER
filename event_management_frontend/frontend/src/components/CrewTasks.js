import React, { useState, useEffect } from "react";
import axios from "axios";
import AssignVendorsToTask from "./AssignVendorsToTask";

const CrewTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [showAssignVendors, setShowAssignVendors] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem("token");
                console.log("Fetching tasks with token:", token); // Debugging log
                const response = await axios.get("http://localhost:8000/api/crew/tasks/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Fetched tasks:", response.data); // Debugging log
                setTasks(response.data);
            } catch (err) {
                setError("Failed to load tasks.");
                console.error("Error fetching tasks:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:8000/api/crew/tasks/${taskId}/status/`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
        } catch (err) {
            setError("Failed to update task status.");
            console.error("Error updating task status:", err);
        }
    };

    const handleTaskClick = (task) => {
        console.log("✅ Task clicked:", task); // Should appear in console
         // Forces a visible popup
        setSelectedTask(() => task);
        setShowAssignVendors(true);
    };
    console.log("📌 Modal State → showAssignVendors:", showAssignVendors, " | selectedTask:", selectedTask);


    const handleCloseModal = () => {
        console.log("❌ Closing modal");
        setShowAssignVendors(false);
        setSelectedTask(null);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-center">My Tasks</h2>

            {loading && <div className="alert alert-info text-center">Loading tasks...</div>}
            {error && <div className="alert alert-danger text-center">{error}</div>}
            {!loading && tasks.length === 0 && (
                <div className="alert alert-warning text-center">No tasks assigned to you.</div>
            )}

            <div className="row">
                {tasks.map((task) => (
                    <div key={task.id} className="col-md-6">
                    <div className="card mb-3 shadow-sm" 
                        onClick={() => handleTaskClick(task)} 
                        style={{ cursor: "pointer" }}>
                        <div className="card-body">
                            <h5 className="card-title">{task.name}</h5>
                            <p className="card-text"><strong>Description:</strong> {task.description || "No description available"}</p>
                            <p className="card-text">
                                <strong>Status:</strong> 
                                <span className={`badge ${task.status === "Completed" ? "bg-success" : "bg-warning"}`}>
                                    {task.status}
                                </span>
                            </p>
                            <button className="btn btn-success btn-sm me-2" 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent modal from opening
                                    handleUpdateStatus(task.id, "Completed");
                                }}>
                                Complete
                            </button>
                            <button className="btn btn-warning btn-sm" 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent modal from opening
                                    handleUpdateStatus(task.id, "In Progress");
                                }}>
                                In Progress
                            </button>
                        </div>
                    </div>
                </div>
                
                ))}
            </div>

            {showAssignVendors && selectedTask ? (
                <>
                    <p>📌 Opening Assign Vendor Modal for: {selectedTask.name}</p>
                    <AssignVendorsToTask selectedTaskData={selectedTask} onClose={handleCloseModal} />
                </>
            ) : null}
        </div>
    );
};

export default CrewTasks;
