const express = require('express');
const router = express.Router();
const Group = require('../Models/groupModel');
const User = require('../Models/userModel');
const authMiddleware = require('../utils/MiddlewareAuth');
const GroupSurveyHandler = require('../utils/GroupSurveyHandler');



// Route to join a group 

router.post('/join', authMiddleware, async (req, res) => {
  const { groupCode } = req.body;
  const userId = req.user.id;

  try {
    const group = await Group.findOne({ groupCode });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // if group doens't include current user trying to join, push to members
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    // see if user actually exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // see if the user has a group code attached to their user model
    user.groupCodes = user.groupCodes || [];
    if (!user.groupCodes.includes(groupCode)) {
      user.groupCodes.push(groupCode);
      await user.save();
    }

    res.status(200).json({
      message: 'Successfully joined group',
      groupCode,
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'An error occurred while joining the group' });
  }
});

// For future developments in creating a survey to generate 
// an album wall / playlist 

router.post('/submit', async (req, res) => {
  const { groupCode, energy } = req.body;

  if (!groupCode || !energy) {
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

// Route to allow user to create a group

router.post('/create-group', authMiddleware, async (req, res) => {
  try {
    const { groupName } = req.body;

    if (!groupName) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const userId = req.user.id;

    let uniqueGroupCode = Math.random().toString(36).substr(2, 8);
    let isUnique = false;

    // check if there are any groups with a unique Group Code
    while (!isUnique) {
      const existingGroup = await Group.findOne({ groupCode: uniqueGroupCode });
      if (!existingGroup) {
        isUnique = true;
      } else {
        console.log(`Duplicate group code detected: ${uniqueGroupCode}`);
        uniqueGroupCode = Math.random().toString(36).substr(2, 8);
      }
    }

    console.log(`Final unique group code: ${uniqueGroupCode}`);

    // create new Group model in database
    const newGroup = new Group({
      name: groupName,
      groupCode: uniqueGroupCode,
      createdBy: userId,
      members: [userId],
      createdAt: Date.now(),
    });

    const user = await User.findById(userId);
    user.groupCodes = user.groupCodes || [];
    user.groupCodes.push(uniqueGroupCode);
    await user.save();
    await newGroup.save();

    res.status(201).json({
      message: 'Group created successfully',
      group: newGroup,
    });
  } catch (error) {
    if (error.code === 11000) {
      console.error('Duplicate groupCode error:', error);
      return res.status(400).json({ error: 'Group code must be unique. Please try again.' });
    }
    console.error('Error creating group:', error.stack);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Route to retrieve current user

router.get('/current-user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: 'Invalid token or user not found' });
    }

    res.status(200).json({ userId });
  } catch (error) {
    console.error('Error fetching current user:', error.message);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// Route to generate album wall for user

router.get('/group-album-wall/:groupCode', authMiddleware, async (req, res) => {
  const { groupCode } = req.params;

  try {
    // initialize surveyHandler utility function (generates album wall)
    const surveyHandler = new GroupSurveyHandler();

    // Fetch group details
    const group = await Group.findOne({ groupCode });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Fetch album wall for the group
    const albumWall = await surveyHandler.getGroupAlbumWall(groupCode);

    // Return the generated album wall with group name
    res.status(200).json({
      message: 'Successfully generated album wall',
      groupCode,
      groupName: group.name,
      albumWall,
    });
  } catch (error) {
    console.error('Error generating album wall:', error);

    if (error.message === 'Group not found') {
      return res.status(404).json({ error: 'Group not found' });
    }
    if (error.message === 'No users found in group') {
      return res.status(400).json({ error: 'No users found in group to generate album wall' });
    }

    res.status(500).json({ error: 'Failed to generate album wall' });
  }
});

router.get('/check-group-completion/:groupCode', authMiddleware, async (req, res) => {
  const { groupCode } = req.params;

  try {
    const surveyHandler = new GroupSurveyHandler();
    const groupStatus = await surveyHandler.checkGroupCompletion(groupCode);

    res.status(200).json({
      message: 'Group completion status retrieved successfully',
      groupStatus,
    });
  } catch (error) {
    console.error('Error checking group completion:', error);
    if (error.message === 'Group not found') {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(500).json({ error: 'Failed to check group completion' });
  }
});

module.exports = router;
