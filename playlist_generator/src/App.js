import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateGroup from './components/CreateGroup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/create-group" element={<CreateGroup />} />
      </Routes>
    </Router>
  );
}

export default App;