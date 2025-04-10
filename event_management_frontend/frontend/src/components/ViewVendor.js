import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const ViewVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

    return (
        <>
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-primary">Vendors List</h2>
                    <button className="btn btn-success" onClick={() => navigate('/add-vendor')}>
                        + Add Vendor
                    </button>
                </div>

                {loading && <div className="alert alert-info text-center">Loading...</div>}
                {error && <div className="alert alert-danger text-center">{error}</div>}
                {!loading && !error && vendors.length === 0 && (
                    <div className="alert alert-warning text-center">No vendors available.</div>
                )}

                <div className="row">
                    {vendors.map((vendor) => (
                        <div key={vendor.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                            <div className="card shadow-sm border-0 rounded">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">{vendor.name}</h5>
                                    <p className="card-text"><strong>Contact:</strong> {vendor.contact_info}</p>
                                    <p className="card-text">
                                        <strong>Services:</strong> {vendor.services_offered || "No services listed"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ViewVendors;
