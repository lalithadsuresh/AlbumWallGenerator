import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token'); // Check if token exists
    setIsLoggedIn(!!token); // Update state based on token presence
  }, []);

  const handleLoginNavigation = () => {
    if (isLoggedIn) {
      // Logout logic
      localStorage.removeItem('token'); // Clear token from local storage
      setIsLoggedIn(false); // Update state to reflect logout
    } else {
      // Navigate to login
      window.location.href = '/login'; // Redirect to login page
    }
  };

  const handleLoginNavigation2 = () => {
    window.location.href = '/home'; 
  };

  return (
    <Box sx={{ flexGrow: 1}}>
      <AppBar position="static" sx = {{backgroundColor: '#1DB954'}}>
        <Toolbar>
          <Button
            color="inherit"
            onClick={handleLoginNavigation2}
            sx={{ marginRight: 'auto' }} // Push to the start of the header
          >
            Album Wall Generator
          </Button>
          <Button color="inherit" onClick={handleLoginNavigation}>
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
