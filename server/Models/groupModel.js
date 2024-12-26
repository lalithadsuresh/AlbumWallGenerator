const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Group schema
const GroupSchema = new mongoose.Schema({
  groupCode: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // No unique constraint
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});
  
  module.exports = mongoose.model('Group', GroupSchema);
  