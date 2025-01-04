const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/*

Group Schema keeps track of:
-> generated group code that users can send to other users
-> name they set for the group to pass on to frontend functions
-> members / other users in the User model in the group
-> who the group was created by  
-> when group was created

*/




const UserSchema = new mongoose.Schema({
  spotifyId: { type: String, unique: true, required: true }, // Spotify user ID
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
