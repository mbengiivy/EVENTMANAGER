import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './components/Registration'; // Import your components
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="api/register" element={<Registration />} />
        <Route path="api/login" element={<Login />} />
        {/* Add more routes later */}
      </Routes>
    </Router>
  );
}

export default App;