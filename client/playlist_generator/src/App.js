import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; 
import CreateGroup from './components/CreateGroup';
import JoinGroup from './components/JoinGroup';
import Survey from './components/Survey';
import Login from './components/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/join-group" element={<JoinGroup />} />
          <Route path="/group-survey" element={<Survey />} />
          <Route path="/login" element={<Login />} />
          <Route path="/survey" element={<Survey />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
