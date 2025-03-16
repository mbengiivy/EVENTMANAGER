import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './components/Registration'; // Import your components
import Login from './components/Login';
import CreateEvent from './components/CreateEvent'
import ViewEvents from './components/ViewEvents';
import EventDetails from './components/EventDetails';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/api/register" element={<Registration />} />
        <Route path="/api/login" element={<Login />} />
        <Route path="/api/create-event" element={<CreateEvent />} />
        <Route path="/api/events" element={<ViewEvents />} />
        <Route path="/api/event/:id" element={<EventDetails />} />
        {/* Add more routes later */}
      </Routes>
    </Router>
  );
}

export default App;