import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

const JoinGroup = () => {
  const [groupCode, setGroupCode] = useState(''); 
  const [message, setMessage] = useState(''); 
  const navigate = useNavigate();

  const joinGroup = async () => {
    if (!groupCode) {
      setMessage('Please enter a group code!');
      return;
    }

    const token = localStorage.getItem('token'); 
    if (!token) {
      setMessage('Please log in to join a group.');
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/groups/join`,
        { groupCode }, // Request body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token for authentication
            'Content-Type': 'application/json',
          },
        }
      );

      navigate(`/album-wall/${groupCode}`);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error || 'Failed to join the group');
      } else if (error.request) {
        setMessage('No response from server.');
      } else {
        setMessage('An error occurred while trying to join the group.');
      }
      console.error('Error:', error);
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
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        marginTop={'-11px'}
        sx={{ fontSize: '1.5rem' }} 
      >
        Join a Group
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
          {message}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Group Code"
        variant="outlined"
        value={groupCode}
        onChange={(e) => setGroupCode(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={joinGroup}
        sx={{ mb: 2, backgroundColor: '#1DB954' }}
      >
        Join Group
      </Button>
    </Box>
  );
};

export default JoinGroup;
