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
            const response = await axios.post('/api/login/', { // Replace with your actual API endpoint
                username,
                password,
            });

            // Store the token and user role
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);

            // Redirect based on role
            if (response.data.role === 'captain') {
                navigate('/captain');
            } else {
                navigate('/crew');
            }
        } catch (err) {
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