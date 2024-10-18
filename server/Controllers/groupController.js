const Group = require('./models/Group'); // Assuming the Group model is in models folder
const User = require('./models/User');

// Controller to handle group creation
const createGroup = async (req, res) => {
    const { groupName, userId } = req.body;

    // Generate a unique group code
    const groupCode = Math.random().toString(36).substr(2, 8);  // Simple random code generator

    try {
        // Create a new group document
        const newGroup = new Group({
            groupName,
            groupCode,
            members: [userId]  // Add the user who created the group
        });
        await newGroup.save();

        // Add the group to the user's document
        await User.findByIdAndUpdate(userId, {
            $push: { groups: newGroup._id }
        });

        res.json({ message: 'Group created', group: newGroup });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create group' });
    }
};


const joinGroup = async (req, res) => {
    const { groupCode, userId } = req.body;

    try {
        // Find the group by groupCode
        const group = await Group.findOne({ groupCode });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the user is already a member
        if (group.members.includes(userId)) {
            return res.status(400).json({ error: 'User already in the group' });
        }

        // Add the user to the group members
        group.members.push(userId);
        await group.save();

        // Add the group to the user's document
        await User.findByIdAndUpdate(userId, {
            $push: { groups: group._id }
        });

        res.json({ message: 'Joined group successfully', group });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join group' });
    }
};
