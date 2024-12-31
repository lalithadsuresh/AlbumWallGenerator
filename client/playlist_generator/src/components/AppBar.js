import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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

  const handleHomeNavigation = () => {
    window.location.href = '/home'; 
  };

  const handlePrivacyNavigation = () => {
    window.location.href = '/privacy'; // Redirect to privacy policy page
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#1DB954' }}>
          <Toolbar>
            <Button
              color="inherit"
              onClick={handleHomeNavigation}
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
      <Box
        sx={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
            backgroundColor: '#f9f9f9',
            textAlign: 'center',
            py: 1,
            borderTop: '1px solid #ddd',
            zIndex: 9999, // Ensure it's on top of other components
        }}
        >
        <Typography variant="body2" color="textSecondary">
            Album Wall Generator uses the{' '}
            <a
            href="https://developer.spotify.com/documentation/web-api"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1DB954', textDecoration: 'none' }}
            >
            Spotify Web API
            </a>. Not associated with Spotify.
        </Typography>
        <Button color="inherit" onClick={handlePrivacyNavigation}>
            Privacy Policy
        </Button>
        </Box>
    </>
  );
}
