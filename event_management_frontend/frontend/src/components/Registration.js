import React, { useState } from 'react';
import axios from 'axios';

const Registration = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('crew'); // Default to crew
    const [companycode, setCompanycode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false) ;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); 
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register/', { 
                name,
                username,
                email,
                role,
                companycode,
                password,
            });

            setSuccess('Registration successful!');
            window.location.href = '/login';
            // Optionally, redirect to login page
            console.log(response.data); // Output the server's response
            console.log("Registration Success:", response.data);

        } catch (err) {
            console.error("Registration Error:", err.response?.data || err.message);
            setError(err.response?.data?.error || 'Registration failed.');
        }
         setLoading(false); 
    };

    return (
        <div>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="captain">Captain</option>
                    <option value="crew">Crew</option>
                </select>
                <input type="text" placeholder="Company Code" value={companycode} onChange={(e) => setCompanycode(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" disabled={loading}>
    {loading ? 'Creating...' : 'Register'}
</button>

            </form>
        </div>
    );
};

export default Registration;