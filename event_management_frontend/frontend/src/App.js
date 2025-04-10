import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Registration from "./components/Registration";
import Login from "./components/Login";
import CaptainDashboard from "./components/dashboard/CaptainDashboard";
import CrewDashboard from "./components/dashboard/CrewDashboard";
import Homepage from "./components/Homepage";
import EventCalendar from "./components/EventCalendar";
import ProtectedRoute from "./components/ProtectedRoute";

import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Captain Components
import CreateEvent from "./components/CreateEvent";
import ViewEvents from "./components/ViewEvents";
import EventDetails from "./components/EventDetails";
import CreateTask from "./components/CreateTask";
import ViewTasks from "./components/ViewTasks";
import AddVendor from "./components/AddVendor";
import ViewVendor from "./components/ViewVendor";
import AssignVendorsToTask from "./components/AssignVendorsToTask";
import ReportsAndAnalytics from "./components/ReportsAndAnalytics";
import TaskManagement from "./components/TaskManagement";

// Crew Components
import CrewTasks from "./components/CrewTasks";
import CrewEvents from "./components/CrewEvents";
import CrewVendors from "./components/CrewVendors";

function App() {
    const navigate = useNavigate();
    //const location = useLocation();

    const [userRole, setUserRole] = useState(() => localStorage.getItem("userRole") || "");
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));

    const updateLoginState = (role, token) => {
        if (!token) {
            console.error("❌ Token is missing! Fixing...");
            return;
        }

        localStorage.setItem("userRole", role);
        localStorage.setItem("token", token);

        setUserRole(role);
        setIsLoggedIn(true);

        console.log("✅ Login state updated ->", { role, token });
    };

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedToken = localStorage.getItem("token");
    
        if (storedToken && storedRole) {
            setUserRole(storedRole);
            setIsLoggedIn(true);
        } else {
            // Only reset if BOTH token and role are missing
            if (!storedToken && !storedRole) {
                console.warn("⚠️ No valid login session found. Resetting state...");
                setUserRole("");
                setIsLoggedIn(false);
            }
        }
    
        console.log("🔄 State updated ->", { storedRole, storedToken });
    }, []);

    const logoutUser = () => {
        localStorage.clear();
        setUserRole("");
        setIsLoggedIn(false);
        navigate("/");
    };

    const handleLogoClick = () => {
        if (isLoggedIn) {
            if (userRole === "captain") {
                navigate("/captain-dashboard");
            } else if (userRole === "crew") {
                navigate("/crew-dashboard");
            }
        } else {
            navigate("/");
        }
    };

    return (
        <div>
            <Navigation
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                logoutUser={logoutUser}
                handleLogoClick={handleLogoClick}
            />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login updateLoginState={updateLoginState} />} />
                <Route path="/event-calendar" element={<EventCalendar />} />

                {/* Captain Routes */}
                <Route element={<ProtectedRoute requiredRole="captain" />}>
                    <Route path="/captain-dashboard" element={<CaptainDashboard />} />
                    <Route path="/create-event" element={<CreateEvent />} />
                    <Route path="/view-events" element={<ViewEvents />} />
                    <Route path="/events/:eventId" element={<EventDetails />} />
                    <Route path="/create-task" element={<CreateTask />} />
                    <Route path="/view-tasks" element={<ViewTasks />} />
                    <Route path="/add-vendor" element={<AddVendor />} />
                    <Route path="/view-vendor" element={<ViewVendor />} />
                    <Route path="/reports-and-analytics" element={<ReportsAndAnalytics />} />
                    <Route path="/task-management" element={<TaskManagement />} />
                </Route>

                {/* Crew Routes */}
                <Route element={<ProtectedRoute requiredRole="crew" />}>
                    <Route path="/crew-dashboard" element={<CrewDashboard />} />
                    <Route path="/assign-vendors-to-task" element={<AssignVendorsToTask />} />
                    <Route path="/crew-tasks" element={<CrewTasks />} />
                    <Route path="/crew-events" element={<CrewEvents />} />
                    <Route path="/crew-vendors" element={<CrewVendors />} />
                </Route>

                {/* Catch-all route for unauthorized access */}
                <Route
                    path="*"
                    element={
                        <div style={{ textAlign: "center", marginTop: "50px" }}>
                            {isLoggedIn ? <p>Unauthorized access.</p> : <p>Please log in to access this page.</p>}
                        </div>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;