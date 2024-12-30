import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; 
import CreateGroup from './components/CreateGroup';
import JoinGroup from './components/JoinGroup';
import Login from './components/Login';
import AlbumWall from './components/AlbumWall';
import Layout from './components/Layout';
import Home from './components/Home';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/join-group" element={<JoinGroup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/album-wall/:groupCode" element={<AlbumWall />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
