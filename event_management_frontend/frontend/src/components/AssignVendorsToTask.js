import React, { useState, useEffect } from "react";
import axios from "axios";

const AssignVendorsToTask = ({ selectedTaskData, onClose }) => {
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch vendors when component mounts
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Unauthorized: No token found.");
                    return;
                }

                const response = await axios.get("http://localhost:8000/api/vendors/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setVendors(response.data);
            } catch (err) {
                setError("Failed to load vendors. Please try again.");
                console.error("Error fetching vendors:", err);
            }
        };

        fetchVendors();
    }, []);

    // Ensure selectedTaskData is valid before rendering
    if (!selectedTaskData || Object.keys(selectedTaskData).length === 0) {
        console.warn("No valid task selected for vendor assignment.");
        return null;
    }

    const handleAssignVendor = async () => {
        if (!selectedVendor) {
            setError("Please select a vendor.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Unauthorized: No token found.");
                setLoading(false);
                return;
            }

            await axios.post(
                "http://localhost:8000/api/assign-vendor-to-tasks/assign_vendor/",
                {
                    task_id: selectedTaskData.id,
                    vendor_id: selectedVendor,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setLoading(false);
            onClose(); // Close modal after successful assignment
        } catch (err) {
            setError("Failed to assign vendor. Please try again.");
            console.error("Error assigning vendor:", err);
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Assign Vendor to Task</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                    <p><strong>Task:</strong> {selectedTaskData?.name || selectedTaskData?.task_name || "Unnamed Task"}</p>


                        <label htmlFor="vendor">Select Vendor:</label>
                        <select
                            id="vendor"
                            className="form-select"
                            value={selectedVendor}
                            onChange={(e) => {
                                setSelectedVendor(e.target.value);
                                setError(""); // Clear error on selection
                            }}
                        >
                            <option value="">-- Choose a Vendor --</option>
                            {vendors.length > 0 ? (
                                vendors.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                    </option>
                                ))
                            ) : (
                                <option disabled>Loading vendors...</option>
                            )}
                        </select>

                        {error && <div className="alert alert-danger mt-2">{error}</div>}
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleAssignVendor} disabled={loading}>
                            {loading ? "Assigning..." : "Assign Vendor"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignVendorsToTask;
