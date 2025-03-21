import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Registration from './components/Registration';
import Login from './components/Login';
import CaptainDashboard from './components/dashboard/CaptainDashboard';
import CrewDashboard from './components/dashboard/CrewDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

// Captain Components
import CreateEvent from './components/CreateEvent';
import ViewEvents from './components/ViewEvents';
import EventDetails from './components/EventDetails';
import CreateTask from './components/CreateTask';
import ViewTasks from './components/ViewTasks';
import AddVendor from './components/AddVendor';
import ViewVendor from './components/ViewVendor';
import AssignVendorsToTask from './components/AssignVendorsToTask';
import ReportView from './components/ReportView';

// Crew Components
import CrewTasks from './components/CrewTasks';
import CrewEvents from './components/CrewEvents';
import CrewVendors from './components/CrewVendors';

function App() {
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
            setUserRole(storedRole);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    if (userRole === null) {
        return <div>Loading...</div>;
    }

    return (
      <>
      <Navigation />
      <Routes>        
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />

          {userRole === 'captain' && (
              <Route path="/*" element={<CaptainDashboard />}>
                   <Route index element={<ViewEvents />} /> 
                  <Route path="create-event" element={<CreateEvent />} />
                  <Route path="events" element={<ViewEvents />} />
                  <Route path="event/:id" element={<EventDetails />} />
                  <Route path="create-task" element={<CreateTask />} />
                  <Route path="view-tasks" element={<ViewTasks />} />
                  <Route path="add-vendor" element={<AddVendor />} />
                  <Route path="view-vendors" element={<ViewVendor />} />
                  <Route path="assign-vendors" element={<AssignVendorsToTask />} />
                  <Route path="reports" element={<ReportView />} />
              </Route>
          )}

          {userRole === 'crew' && (
              <Route path="/*" element={<CrewDashboard />}>
                  <Route index element={<CrewTasks />} />
                  <Route path="tasks" element={<CrewTasks />} />
                  <Route path="events" element={<CrewEvents />} />
                  <Route path="vendors" element={<CrewVendors />} />
              </Route>
          )}
      </Routes>
      </>
  );
}

export default App;