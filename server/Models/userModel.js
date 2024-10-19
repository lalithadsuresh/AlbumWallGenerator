const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User schema
const UserSchema = new Schema({
    username: { type: String, required: true },
    spotifyId: { type: String, unique: true },  // Storing Spotify-specific info
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],  // Groups this user belongs to
});

const User = mongoose.model('User', UserSchema);
module.exports = User;