import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; 
import Login from './components/Login';
import AlbumWall from './components/AlbumWall';
import Layout from './components/Layout';
import Home from './components/Home';
import Privacy from './components/Privacy';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}> 
            <Route index element={<Navigate to="/home" />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/album-wall/:groupCode" element={<AlbumWall />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;