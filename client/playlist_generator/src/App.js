import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateGroup from './components/CreateGroup';
import JoinGroup from './components/JoinGroup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/join-group" element={<JoinGroup />} />
        
      </Routes>
    </Router>
  );
}

export default App;