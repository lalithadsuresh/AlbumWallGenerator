const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User schema
const UserSchema = new mongoose.Schema({
  spotifyId: { type: String, unique: true }, // Spotify user ID
  displayName: { type: String }, // User's display name
  email: { type: String }, // User's email address
  accessToken: { type: String }, // Spotify access token
  refreshToken: { type: String }, // Spotify refresh token
  tokenExpiry: { type: Date }, // Token expiry date
  groupCodes: [{ type: String }], // List of group codes the user is a part of
  groupCode: { type: String, unique: true, sparse: true }, // Current group code (if needed)
  username: { type: String, required: true }, // Username

  // Surveys field: Stores survey responses for specific groups
  surveys: [
    {
      groupCode: { type: String, required: true }, // Group the survey is for
      answers: {
        chill: { type: Number, min: 1, max: 5 }, // User's response for "chill"
        energetic: { type: Number, min: 1, max: 5 }, // User's response for "energetic"
        relaxed: { type: Number, min: 1, max: 5 }, // User's response for "relaxed"
        happy: { type: Number, min: 1, max: 5 }, // User's response for "happy"
        focused: { type: Number, min: 1, max: 5 }, // User's response for "focused"
      },
    },
  ],
});

// Add an index to ensure `groupCode` is unique when present
UserSchema.index(
  { groupCode: 1 },
  { unique: true, partialFilterExpression: { groupCode: { $ne: null } } }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
