const express = require('express');
const router = express.Router();
const Group = require('../Models/groupModel'); 

// Create a new group
router.post('/create', async (req, res) => {
    const { groupName, groupCode } = req.body;

    const newGroup = new Group({
        groupName,
        groupCode,
        members: [],
    });

    try {
        await newGroup.save();
        res.status(201).json({ message: 'Group created', group: newGroup });
    } catch (err) {
        res.status(500).json({ error: 'Error creating group' });
    }
});

// Join a group
router.post('/join', async (req, res) => {
    const { groupCode, member } = req.body; // Expecting groupCode and member info in the request body

    try {
        // Find the group by groupCode
        const group = await Group.findOne({ groupCode });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the member is already in the group
        if (group.members.includes(member)) {
            return res.status(400).json({ error: 'Member already in the group' });
        }

        // Add the member to the group
        group.members.push(member);

        // Save the updated group
        const updatedGroup = await group.save();

        // Send success response
        res.status(200).json({ message: 'Member added to group', group: updatedGroup });
    } catch (err) {
        console.error('Error joining group:', err); // Log error details
        res.status(500).json({ error: 'Error joining group' });
    }
});




module.exports = router;

