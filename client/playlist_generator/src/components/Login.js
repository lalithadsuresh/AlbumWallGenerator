import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [message, setMessage] = useState(''); // State for displaying messages
  const [profile, setProfile] = useState(null); // State to store the user profile
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  // Redirect to Spotify login
  const handleSpotifyLogin = () => {
    window.location.href = 'http://localhost:5000/api/users/login'; // Redirect to Spotify login route
  };

  // Validate the token and fetch the user profile
  const validateTokenAndFetchProfile = async () => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);

    if (!token) {
      setMessage('No token found. Please log in.');
      setIsLoggedIn(false);
      return;
    }

    try {
      // Validate token and fetch profile
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(response.data); // Store user profile
      setMessage('Welcome back!');
      setIsLoggedIn(true);
    } catch (error) {
      setMessage(
        error.response?.data.error || 'Session expired. Please log in again.'
      );
      setIsLoggedIn(false);
      localStorage.removeItem('token'); // Clear invalid token
    }
  };

  // Handle token in the callback URL and validate it
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (token) {
      localStorage.setItem('token', token); // Save token in localStorage
      console.log('Token stored:', token);
      window.history.replaceState({}, document.title, '/'); // Clean up URL
      validateTokenAndFetchProfile(); // Validate and fetch profile
    } else {
      validateTokenAndFetchProfile(); // Check token on every route
    }
  }, []);

  return (
    <div>
      <h2>Login with Spotify</h2>
      {!isLoggedIn && <button onClick={handleSpotifyLogin}>Log in with Spotify</button>}
      {isLoggedIn && <button onClick={validateTokenAndFetchProfile}>Fetch Profile</button>}
      {message && <p>{message}</p>}
      {profile && (
        <div>
          <h3>Profile Data:</h3>
          <p>Name: {profile.display_name}</p>
          <p>Email: {profile.email}</p>
          {profile.images && profile.images[0] && (
            <img src={profile.images[0]?.url} alt="Profile" width={100} />
          )}
        </div>
      )}
    </div>
  );
};

export default Login;
