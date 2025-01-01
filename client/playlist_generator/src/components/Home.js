import React, { useState } from 'react';
import CreateGroup from './CreateGroup';
import JoinGroup from './JoinGroup';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import Album from './photos/album.png';


const HomePage = () => {
  const [activeTab, setActiveTab] = useState('create');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 600,
        margin: '0 auto',
        padding: 10,
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        marginTop: '40px'
      }}
    >
    <Typography variant="h4" 
        component="h1" sx={{ fontWeight: 'bold', 
        marginBottom: '16px',
        marginTop: '-50px'}}>
        Welcome to Album Wall Generator!
    </Typography>
    <Box
        component="img"
        src={Album}
        alt="Album Wall Generator"
        sx={{
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          marginBottom: '16px',
          borderRadius: '8px',
        }}
      />
      <Typography variant="body1" paragraph>
        This app helps you create inspiration for your room's album cover wall. 
        Using the Spotify API, the app uses your top artists and tracks to create
        a personalized design for you. You can choose to create your own album wall
        or you can invite your roommates, friends, etc., to create a group wall as well!
        Here's how it works:
        </Typography>
        <Typography variant="body1" component="ol" paragraph>
        <li>Login to Spotify.</li>
        <li>Create a Group Code.</li>
        <li>Join a group using the Code.</li>
        <li>Share the Group Code with friends or go solo!</li>
        <li>Generate your album cover wall!</li>
        </Typography>


      {/* Tab Navigation */}
      <Paper elevation={3} sx={{ marginBottom: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Create Group" value="create" />
          <Tab label="Join Group" value="join" />
        </Tabs>
      </Paper>

      {/* Display Components Based on Active Tab */}
      <Box>
        {activeTab === 'create' && <CreateGroup />}
        {activeTab === 'join' && <JoinGroup />}
      </Box>
    </Box>
  );
};

export default HomePage;
