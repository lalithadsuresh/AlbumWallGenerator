const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User schema
const UserSchema = new mongoose.Schema({
  spotifyId: { type: String, unique: true, required: true }, // Spotify user ID
  displayName: { type: String }, // User's display name
  email: { type: String }, // User's email address
  accessToken: { type: String, required: true }, // Spotify access token
  refreshToken: { type: String, required: true }, // Spotify refresh token
  tokenExpiry: { type: Date, required: true }, // Token expiry date
  groupCodes: [{ type: String }], // List of group codes the user is a part of
  groupCode: { type: String, sparse: true, unique: true }, // Current group code
});

// Add a sparse index for `groupCode`
UserSchema.index(
  { groupCode: 1 },
  { unique: true, sparse: true } 
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
