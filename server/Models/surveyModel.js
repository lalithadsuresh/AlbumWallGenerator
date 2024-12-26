const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const surveySchema = new mongoose.Schema({
  groupCode: { type: String, required: true },
  energy: { type: Number, required: true }
});

module.exports = mongoose.model('Survey', surveySchema);