import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
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
        const response = await axios.get('http://localhost:5000/api/groups/current-user', {
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

  // Function to generate a random group code
  const generateGroupCode = () => {
    const code = Math.random().toString(36).substr(2, 8);
    setGroupCode(code);
  };

  // Function to create the group
  const createGroup = async () => {
    if (!groupName || !groupCode || !userId) {
      setMessage('Please enter a group name, generate a code, and ensure you are logged in.');
      return;
    }
  
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    if (!token) {
      setMessage('Authentication token is missing. Please log in.');
      return;
    }
  
    try {
      await axios.post(
        'http://localhost:5000/api/groups/create-group',
        {
          groupName: groupName,
          groupCode: groupCode,
          userId: userId, // Include userId in the payload
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        }
      );
      setMessage('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error.response?.data || error.message);
      setMessage('Error creating group');
    }
  };

  return (
    <div>
      <h2>Create a New Group</h2>
      <input
        type="text"
        placeholder="Enter group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button onClick={generateGroupCode}>Generate Group Code</button>
      {groupCode && <p>Generated Group Code: {groupCode}</p>}
      <button onClick={createGroup}>Create Group</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateGroup;