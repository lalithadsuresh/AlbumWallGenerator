const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Group schema
const GroupSchema = new mongoose.Schema({
  groupCode: { type: String, unique: true, required: true }, // Group code 
  name: { type: String, required: true }, // name of Group that User chose
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // No unique constraint
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Identity (SpotifyID) of User that created group
  createdAt: { type: Date, default: Date.now }, // when Group was created
});
  
  module.exports = mongoose.model('Group', GroupSchema);
  