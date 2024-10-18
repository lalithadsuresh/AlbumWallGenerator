const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    groupCode: {
        type: String,
        required: true,
        unique: true,
    },
    members: {
        type: [String], // Array of member names
        default: [],
    },
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;