import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        try {
            const response = await axios.post('http://localhost:8000/api/login/', {
                username,
                password,
            });
    
            console.log("Login Response:", response.data);  // Debugging log
    
            const token = response.data?.token;
            const role = response.data?.role;
    
            if (token) {
                localStorage.setItem('token', token);
                console.log("Stored Token:", localStorage.getItem("token"));
            } else {
                console.error("No token received!");
                setError("Authentication failed: No token received.");
                return;
            }
    
            if (role) {
                localStorage.setItem('role', role);
                console.log("Stored Role:", localStorage.getItem("role"));
            } else {
                console.warn("No role received from backend.");
            }
    
            // Redirect based on role
            if (role === 'captain') {
                navigate('/api/events');
            } else {
                navigate('/crew');
            }
        } catch (err) {
            console.error("Login Error:", err.response?.data || err.message);
            setError(err.response?.data?.error || 'Login failed.');
        }
    };
    

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;