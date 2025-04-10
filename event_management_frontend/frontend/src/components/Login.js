import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ updateLoginState }) => { // Accept updateLoginState as a prop
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:8000/api/login/", {
                username,
                password,
            });

            console.log("✅ Login API response:", response.data);

            if (!response.data?.token || !response.data?.role) {
                throw new Error("Authentication failed: Missing token or role.");
            }

            // Extract necessary details
            const { id, token, role, companycode } = response.data;

            // Store user details in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("userId", id.toString());

            if (companycode) {
                localStorage.setItem("companycode", companycode);
            }

            // Update login state
            updateLoginState(role, token);

            // Redirect based on role
            const redirectPath = role === "captain" ? "/captain-dashboard" : role === "crew" ? "/crew-dashboard" : "/";
            navigate(redirectPath);
        } catch (err) {
            console.error("❌ Login error:", err);
            setError(err.response?.data?.error || err.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-lg p-4" style={{ width: "100%", maxWidth: "400px" }}>
                <h2 className="text-center mb-4">Login</h2>

                {/* Error Message */}
                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Logging In...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
