import React, { useState } from 'react';
import axios from 'axios';

const JoinGroup = () => {
  const [groupCode, setGroupCode] = useState('');

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/groups/join', { groupCode });
      console.log('Joined group:', response.data);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  return (
    <div>
      <h2>Join a Group</h2>
      <form onSubmit={handleJoinGroup}>
        <input
          type="text"
          value={groupCode}
          onChange={(e) => setGroupCode(e.target.value)}
          placeholder="Enter group code"
        />
        <button type="submit">Join Group</button>
      </form>
    </div>
  );
};

export default JoinGroup;