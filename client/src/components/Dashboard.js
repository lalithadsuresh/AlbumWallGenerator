import React from 'react';
import { useHistory } from 'react-router-dom';

const Dashboard = () => {
  const history = useHistory();

  const handleCreateGroup = () => {
    history.push('/create-group'); // Redirect to create group page
  };

  const handleJoinGroup = () => {
    history.push('/join-group'); // Redirect to join group page
  };

  return (
    <div>
      <h2>Welcome to the Playlist Generator!</h2>
      <p>Choose an option:</p>
      <button onClick={handleCreateGroup}>Create a Group</button>
      <button onClick={handleJoinGroup}>Join a Group</button>
    </div>
  );
};

export default Dashboard;