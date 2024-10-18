import React, { useState } from 'react';
import axios from 'axios';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/groups/create', { name: groupName });
      console.log('Group created:', response.data);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div>
      <h2>Create a Group</h2>
      <form onSubmit={handleCreateGroup}>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
        />
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
};

export default CreateGroup;