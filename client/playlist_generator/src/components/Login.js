import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';

const Login = () => {
  const [message, setMessage] = useState(''); // State for displaying messages
  const [profile, setProfile] = useState(null); // State to store the user profile
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const navigate = useNavigate();

  // Access the API base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Debugging: Log the API base URL to verify it's loaded correctly
  useEffect(() => {
    if (!API_BASE_URL) {
      console.error(
        "REACT_APP_API_BASE_URL is undefined. Ensure it's set correctly in your .env file and restart the server."
      );
    } else {
      console.log("REACT_APP_API_BASE_URL:", API_BASE_URL);
    }
  }, [API_BASE_URL]);

  const handleSpotifyLogin = () => {
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is undefined, cannot redirect to Spotify login.");
      setMessage("API_BASE_URL is not defined. Please contact support.");
      return;
    }
    console.log(`Redirecting to Spotify login: ${API_BASE_URL}/api/users/login`);
    window.location.href = `${API_BASE_URL}/api/users/login`;
  };

  const handleAfterLogin = () => {
    console.log("Navigating to /home");
    navigate('/home');
  };

  const validateTokenAndFetchProfile = async () => {
    const token = localStorage.getItem('token');
    console.log('Token found in localStorage:', token);

    if (!token) {
      console.warn("No token found. User is not logged in.");
      setMessage('No token found. Please log in.');
      setIsLoggedIn(false);
      return;
    }

    try {
      console.log(`Validating token with ${API_BASE_URL}/api/users/profile`);
      const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Profile data fetched successfully:", response.data);
      setProfile(response.data);
      setMessage('Welcome back!');
      setIsLoggedIn(true);
    } catch (error) {
      console.error(
        "Error validating token or fetching profile:",
        error.response?.data || error.message
      );
      setMessage(error.response?.data.error || 'Session expired. Please log in again.');
      setIsLoggedIn(false);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    console.log("Checking for token in URL...");
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (token) {
      console.log("Token found in URL:", token);
      localStorage.setItem('token', token);
      console.log("Token stored in localStorage:", token);
      window.history.replaceState({}, document.title, '/');
      validateTokenAndFetchProfile();
    } else {
      console.log("No token found in URL. Validating existing token...");
      validateTokenAndFetchProfile();
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No active session found.");
      setMessage('No active session found.');
      return;
    }

    try {
      console.log(`Logging out and deleting account with ${API_BASE_URL}/api/users/delete-account`);
      await axios.delete(`${API_BASE_URL}/api/users/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Account deleted successfully. Clearing session...");
      localStorage.removeItem('token');
      setProfile(null);
      setIsLoggedIn(false);
      setMessage('You have successfully logged out.');
    } catch (error) {
      console.error("Error deleting account:", error.response?.data || error.message);
      setMessage('Failed to delete account. Please try again later.');
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        width: '100%',
        maxWidth: 500,
        margin: '0 auto',
        padding: 4,
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        marginTop: '50px',
        marginBottom: '100px',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: '1.5rem' }}>
        Login with Spotify
      </Typography>

      {message && (
        <Alert severity={isLoggedIn ? 'success' : 'info'} sx={{ mb: 2, width: '100%' }}>
          {message}
        </Alert>
      )}

      {!isLoggedIn && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSpotifyLogin}
          fullWidth
          sx={{
            backgroundColor: '#1DB954',
            color: '#fff',
            '&:hover': { backgroundColor: '#1AAE4A' },
            mb: 2,
          }}
        >
          Log in with Spotify
        </Button>
      )}

      {isLoggedIn && (
        <Button
          variant="contained"
          onClick={handleAfterLogin}
          fullWidth
          sx={{ mb: 2, backgroundColor: '#1DB954' }}
        >
          Generate your Album Wall!
        </Button>
      )}

      {isLoggedIn && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          fullWidth
          sx={{ mb: 2 }}
        >
          Log out
        </Button>
      )}

      {profile && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{
            mt: 5,
            mb: 6,
            padding: 2,
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontSize: '1.25rem' }}>
            Your Profile
          </Typography>
          {profile.images && profile.images[0] && (
            <Avatar
              src={profile.images[0]?.url}
              alt="Profile"
              sx={{ width: 100, height: 100, mb: 2 }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default Login;
