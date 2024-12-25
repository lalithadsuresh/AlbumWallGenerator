import React, { useState } from 'react';
import axios from 'axios';

const JoinGroup = () => {
  const [groupCode, setGroupCode] = useState(''); // State for group code input
  const [message, setMessage] = useState(''); // State for status messages

  const joinGroup = async () => {
    if (!groupCode) {
      setMessage('Please enter a group code!');
      return;
    }

    try {
      // Replace this URL with your backend API endpoint
      const response = await axios.post(
        'http://localhost:5000/api/groups/join',
        { groupCode }, // Request body
        { headers: { 'Content-Type': 'application/json' } } // Configuration object with headers
      );
    
      // `response.data` contains the JSON payload from the server
      const data = response.data;
    
      // Handle success
      setMessage(`Successfully joined group: ${data.group.groupName}`);
    } catch (error) {
      // Handle error response
      if (error.response) {
        // The request was made and the server responded with a non-2xx status code
        setMessage(error.response.data.error || 'Failed to join the group');
      } else if (error.request) {
        // The request was made but no response was received
        setMessage('No response from server.');
      } else {
        // Something else happened during the request setup
        setMessage('An error occurred while trying to join the group.');
      }
      console.error('Error:', error);
    }
  }

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
