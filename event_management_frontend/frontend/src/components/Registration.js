import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [companycode, setCompanycode] = useState('');
    const [role, setRole] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!username.trim()) newErrors.username = 'Username is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
        if (!password.trim()) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!companycode.trim()) newErrors.companycode = 'Company Code is required';
        if (!role.trim()) newErrors.role = 'Role is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            try {
                await axios.post('http://localhost:8000/api/register/', {
                    username,
                    email,
                    password,
                    companycode,
                    role,
                });
                setSuccessMessage('Registration successful! Redirecting to login...');
                setErrorMessage('');
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
                setSuccessMessage('');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
            <div className="row w-100">
                <div className="col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                    <div className="card shadow p-4">
                        <h2 className="text-center mb-4">Register</h2>
                        {isLoading && <div className="alert alert-info">Registering...</div>}
                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                        
                        <form onSubmit={handleRegistration}>
                            <div className="mb-3">
                                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control" disabled={isLoading} />
                                {errors.username && <div className="text-danger">{errors.username}</div>}
                            </div>

                            <div className="mb-3">
                                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" disabled={isLoading} />
                                {errors.email && <div className="text-danger">{errors.email}</div>}
                            </div>

                            <div className="mb-3">
                                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" disabled={isLoading} />
                                {errors.password && <div className="text-danger">{errors.password}</div>}
                            </div>

                            <div className="mb-3">
                                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-control" disabled={isLoading} />
                                {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
                            </div>

                            <div className="mb-3">
                                <input type="text" placeholder="Company Code" value={companycode} onChange={(e) => setCompanycode(e.target.value)} className="form-control" disabled={isLoading} />
                                {errors.companycode && <div className="text-danger">{errors.companycode}</div>}
                            </div>

                            <div className="mb-3">
                                <select value={role} onChange={(e) => setRole(e.target.value)} className="form-control" disabled={isLoading}>
                                    <option value="">Select Role</option>
                                    <option value="captain">Captain</option>
                                    <option value="crew">Crew</option>
                                </select>
                                {errors.role && <div className="text-danger">{errors.role}</div>}
                            </div>

                            <button type="submit" disabled={isLoading} className="btn btn-primary w-100">
                                {isLoading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;
