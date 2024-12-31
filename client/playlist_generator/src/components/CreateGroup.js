import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);

  // Fetch userId from local storage or another source
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      console.log(token);

      if (!token) {
        setMessage('Authentication token is missing. Please log in.');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/groups/current-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserId(response.data.userId);
      } catch (error) {
        console.error('Error fetching user data:', error.response?.data || error.message);
        setMessage('Unable to fetch user information. Please log in again.');
      }
    };

    fetchUser();
  }, []);

  const navigate = useNavigate();

  // Function to create the group
  const createGroup = async () => {
    if (!groupName || !userId) {
      setMessage('Please enter a group name and ensure you are logged in.');
      return;
    }
  
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    if (!token) {
      setMessage('Authentication token is missing. Please log in.');
      return;
    }
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/groups/create-group`,
        { groupName },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        }
      );
  
      const groupCode = response.data.group.groupCode;
      setMessage(`Group created successfully! Group Code: ${groupCode}`);
  
      // Navigate to AlbumWall with groupName and groupCode

      navigate(`/album-wall/${groupCode}`, { state: { groupName } });
    } catch (error) {
      console.error('Error creating group:', error.response?.data || error.message);
      setMessage('Error creating group');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" component="h2" align="center" gutterBottom>
        Create a New Group
      </Typography>
      <TextField
        fullWidth
        label="Enter group name"
        variant="outlined"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={createGroup}
        sx={{ mb: 2, backgroundColor: '#1DB954' }}
      >
        Create Group
      </Button>
      {message && (
        <Alert severity={message.startsWith('Group created') ? 'success' : 'error'}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default CreateGroup;
