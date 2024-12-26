const express = require('express');
const router = express.Router();
const Group = require('../Models/groupModel'); 
const Survey = require('../Models/surveyModel')
const User = require('../Models/userModel');
const authMiddleware = require('../utils/MiddlewareAuth'); 
const refreshTokenMiddleware = require('../utils/RefreshToken'); 


router.post('/join', authMiddleware, async (req, res) => {
    const { groupCode } = req.body;
    const userId = req.user.id;
  
    try {
      // Validate groupCode
      const group = await Group.findOne({ groupCode });
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
  
      // Check if the user is already a member
      if (group.members.includes(userId)) {
        return res.status(400).json({ error: 'You are already a member of this group' });
      }
  
      // Add user to the group's members
      group.members.push(userId);
  
      // Add groupCode to the user's groupCodes
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      user.groupCodes = user.groupCodes || [];
      if (!user.groupCodes.includes(groupCode)) {
        user.groupCodes.push(groupCode);
      }
  
      await group.save();
      await user.save();
  
      res.status(200).json({ message: 'Successfully joined group', groupCode });
    } catch (error) {
      console.error('Error joining group:', error);
      res.status(500).json({ error: 'An error occurred while joining the group' });
    }
  });

router.post('/submit', async (req, res) => {
    const { groupCode, energy } = req.body;
  
    if (!groupCode || !energy ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      const survey = new Survey({ groupCode, energy });
      await survey.save();
      res.status(200).json({ message: 'Survey submitted successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error saving survey.' });
    }
  });


  router.post('/create-group', authMiddleware, async (req, res) => {
    try {
      const { groupName, groupCode } = req.body;
  
      if (!groupName) {
        return res.status(400).json({ error: 'Group name is required' });
      }
  
      const userId = req.user.id;
  
      // Generate a unique groupCode if not provided
      const uniqueGroupCode = groupCode || Math.random().toString(36).substr(2, 8);
  
      const newGroup = new Group({
        name: groupName,
        groupCode: uniqueGroupCode,
        createdBy: userId,
        members: [userId],
        createdAt: Date.now(),
      });

      const user = await User.findById(userId);
      user.groupCodes = user.groupCodes || [];
      user.groupCodes.push(groupCode);
      await user.save();
      await newGroup.save();
  
      res.status(201).json({
        message: 'Group created successfully',
        group: newGroup,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Group code must be unique' });
      }
      console.error('Error creating group:', error.message);
      res.status(500).json({ error: 'Failed to create group' });
    }
  });
  

router.get('/current-user', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
  
      if (!userId) {
        return res.status(400).json({ error: 'Invalid token or user not found' });
      }
  
      res.status(200).json({ userId }); // Respond with the user ID
    } catch (error) {
      console.error('Error fetching current user:', error.message);
      res.status(500).json({ error: 'Failed to fetch current user' });
    }
  });


  router.post('/submit-survey', authMiddleware, async (req, res) => {
    const { groupCode, answers } = req.body;
    const userId = req.user.id;
  
    try {
      if (!groupCode || !answers) {
        return res.status(400).json({ error: 'Group code and answers are required' });
      }
  
      // Validate answers
      const validKeys = ['chill', 'energetic', 'relaxed', 'happy', 'focused'];
      for (const key of validKeys) {
        if (!answers[key] || answers[key] < 1 || answers[key] > 5) {
          return res.status(400).json({ error: `Invalid value for ${key}. Must be between 1 and 5.` });
        }
      }
  
      // Find the group
      const group = await Group.findOne({ groupCode });
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
  
      // Check if the user is a member
      if (!group.members.includes(userId)) {
        return res.status(403).json({ error: 'You are not a member of this group' });
      }
  
      // Check if the user has already submitted a response
      const existingResponse = group.surveyResponses.find(
        (response) => response.userId.toString() === userId
      );
      if (existingResponse) {
        return res.status(400).json({ error: 'You have already submitted the survey' });
      }
  
      // Add the user's survey response
      group.surveyResponses.push({ userId, answers });
      await group.save();
  
      // Check if all members have submitted
      if (group.surveyResponses.length === group.members.length) {
        group.surveyCompleted = true; // Mark survey as complete
  
        // Calculate averages
        const aggregatedResponses = group.surveyResponses.reduce(
          (totals, response) => {
            for (const key in response.answers) {
              totals[key] = (totals[key] || 0) + response.answers[key];
            }
            return totals;
          },
          {}
        );
  
        const averages = {};
        const totalResponses = group.surveyResponses.length;
        for (const key in aggregatedResponses) {
          averages[key] = aggregatedResponses[key] / totalResponses;
        }
  
        await group.save();
  
        // Trigger playlist generation with averages
        const playlist = await createPlaylistForGroup(averages);
        return res.status(200).json({
          message: 'Survey completed and playlist generated!',
          playlist,
        });
      }
  
      res.status(200).json({ message: 'Survey response submitted successfully' });
    } catch (error) {
      console.error('Error submitting survey:', error);
      res.status(500).json({ error: 'An error occurred while submitting the survey' });
    }
  });
  


module.exports = router;

