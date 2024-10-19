const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Group schema
const GroupSchema = new Schema({
    groupName: { type: String, required: true },  // Group name
    groupCode: { type: String, unique: true },    // Unique group code for joining
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Members of the group (reference to User)
    createdAt: { type: Date, default: Date.now }  // Timestamp for group creation
});

const Group = mongoose.model('Group', GroupSchema);
module.exports = Group;