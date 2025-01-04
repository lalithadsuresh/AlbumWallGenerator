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

const GroupSchema = new mongoose.Schema({
  groupCode: { type: String, unique: true, required: true }, // Group code 
  name: { type: String, required: true }, // name of Group that User chose
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // No unique constraint
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Identity (SpotifyID) of User that created group
  createdAt: { type: Date, default: Date.now }, // when Group was created
});
  
  module.exports = mongoose.model('Group', GroupSchema);
  