import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [companycode, setCompanycode] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = 'Username is required';
            isValid = false;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        if (!companycode.trim()) {
            newErrors.companycode = 'Company Code is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
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
                });
                setSuccessMessage('Registration successful! Redirecting to login...');
                setErrorMessage('');
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                console.error('Registration failed:', error);
                setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
                setSuccessMessage('');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Registration</h2>
            <form onSubmit={handleRegistration}>
                {isLoading && <div className="alert alert-info">Registering...</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-control"
                        disabled={isLoading}
                    />
                    {errors.username && <div className="text-danger">{errors.username}</div>}
                </div>

                <div className="mb-3">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control"
                        disabled={isLoading}
                    />
                    {errors.email && <div className="text-danger">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                        disabled={isLoading}
                    />
                    {errors.password && <div className="text-danger">{errors.password}</div>}
                </div>

                <div className="mb-3">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-control"
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
                </div>

                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Company Code"
                        value={companycode}
                        onChange={(e) => setCompanycode(e.target.value)}
                        className="form-control"
                        disabled={isLoading}
                    />
                    {errors.companycode && <div className="text-danger">{errors.companycode}</div>}
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary">
                    Register
                </button>
            </form>
        </div>
    );
};

export default Registration;