import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './components/Registration'; // Import your components
import Login from './components/Login';
import CreateEvent from './components/CreateEvent';
import ViewEvents from './components/ViewEvents';
import EventDetails from './components/EventDetails';
import CreateTask from './components/CreateTask';
import ViewTasks from './components/ViewTasks';
import AddVendor from './components/AddVendor';
import ViewVendor from './components/ViewVendor';
import AssignVendorsToTask from './components/AssignVendorsToTask';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/api/register" element={<Registration />} />
        <Route path="/api/login" element={<Login />} />
        <Route path="/api/create-event" element={<CreateEvent />} />
        <Route path="/api/events" element={<ViewEvents />} />
        <Route path="/api/event/:id" element={<EventDetails />} />
        <Route path="/api/create-task" element={<CreateTask />} />
        <Route path="/api/view-tasks" element={<ViewTasks />} />
        <Route path="/add-vendor" element={<AddVendor />} />
        <Route path="/view-vendors" element={<ViewVendor />} />
        <Route path="/assign-vendors" element={<AssignVendorsToTask />} />
        {/* Add more routes later */}
      </Routes>
    </Router>
  );
}

export default App;