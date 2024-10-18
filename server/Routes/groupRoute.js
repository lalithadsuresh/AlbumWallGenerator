const express = require('express');
const router = express.Router();
const Group = require('../Models/groupModel'); 

// Create a new group
router.post('/create', async (req, res) => {
    const { name, groupCode } = req.body;

    const newGroup = new Group({
        name,
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

// Join an existing group using the groupCode
router.post('/join', async (req, res) => {
    const { groupCode, memberName } = req.body;

    try {
        const group = await Group.findOne({ groupCode });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        group.members.push(memberName);
        await group.save();

        res.status(200).json({ message: 'Joined group', group });
    } catch (err) {
        res.status(500).json({ error: 'Error joining group' });
    }
});

// Get group details using groupCode
router.get('/:groupCode', async (req, res) => {
    const { groupCode } = req.params; // Retrieve groupCode from URL parameters

    try {
        const group = await Group.findOne({ groupCode });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json({ group });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching group' });
    }
});

module.exports = router;