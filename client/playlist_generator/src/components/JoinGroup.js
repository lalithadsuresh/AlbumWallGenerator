import React, { useState } from 'react';
import axios from 'axios';

const JoinGroup = () => {
  const [groupCode, setGroupCode] = useState(''); // State for group code input
  const [message, setMessage] = useState(''); // State for status messages

  const joinGroup = async () => {
    if (!groupCode) {
      setMessage('Please enter a group name!');
      return;
    }
  
    const token = localStorage.getItem('token'); // Retrieve the user's token
    if (!token) {
      setMessage('Please log in to join a group.');
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/groups/join',
        { groupCode }, // Request body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token for authentication
            'Content-Type': 'application/json',
          },
        }
      );
  
      const data = response.data;
  
      // Handle success
      setMessage(`Successfully joined group: ${data.group.name}`);
    } catch (error) {
      // Handle error response
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
    <div>
      <h2>Join a Group</h2>
      <input
        type="text"
        placeholder="Enter group code"
        value={groupCode}
        onChange={(e) => setGroupCode(e.target.value)}
      />
      <button onClick={joinGroup}>Join Group</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default JoinGroup;
