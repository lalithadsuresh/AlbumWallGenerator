import React, { useState } from 'react';
import axios from 'axios';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [message, setMessage] = useState('');

  // Function to generate a random group code
  const generateGroupCode = () => {
    const code = Math.random().toString(36).substr(2, 8); // Generate an 8-character code
    setGroupCode(code);
  };

  // Function to create the group
  const createGroup = async () => {
    if (!groupName || !groupCode) {
      setMessage('Please enter a group name and generate a code');
      return;
    }

    try {
      await axios.post('/api/groups/create', {
        name: groupName,
        groupCode: groupCode
      });
      setMessage('Group created successfully!');
    } catch (error) {
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