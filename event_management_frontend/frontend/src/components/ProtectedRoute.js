import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ requiredRole }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        // 🚨 User is not logged in → Redirect to login
        return <Navigate to="/login" replace />;
    }

    if (role !== requiredRole) {
        // 🚨 User role mismatch → Redirect to unauthorized page
        return <Navigate to="/" replace />;
    }

    // ✅ User is authorized → Load the page
    return <Outlet />;
};

export default ProtectedRoute;
