import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear user data from localStorage
        console.log("Logging out...")
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('companycode');

        setIsLoggedIn(false);
        setUserRole("")
        // Redirect to homepage page
        navigate('/');
    }, [navigate]);

    return null; // No UI needed
};

export default Logout;
