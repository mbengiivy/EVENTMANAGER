// ViewVendors.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewVendors = () => {
    const [vendors, setVendors] = useState([]);
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

    return (
        <div>
            <h2>Vendors List</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && vendors.length === 0 && <p>No vendors available.</p>}
            <ul>
                {vendors.map((vendor) => (
                    <li key={vendor.id}>{vendor.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default ViewVendors;
