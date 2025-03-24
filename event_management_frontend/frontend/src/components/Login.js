import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/login/', {
                username,
                password,
            });

            const token = response.data?.token;
            const role = response.data?.role;
            const companycode = response.data?.companycode; // Get company code

            if (token) {
                localStorage.setItem('token', token);
            } else {
                setError("Authentication failed: No token received.");
                return;
            }

            if (role) {
                localStorage.setItem('role', role);
            }

            if (companycode) { // Store company code
                localStorage.setItem('companycode', companycode);
            }

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed.');
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login
                    {loading ? 'Creating...' : 'Loggin In'}
                </button>
            </form>
        </div>
    );
};

export default Login;