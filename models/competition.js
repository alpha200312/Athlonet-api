const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }, // Short description of the competition
  sport: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }, // Reference to the organizing entity
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }], // Participating teams
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String },
  isPrivate: { type: Boolean, default: false }, // Visibility flag
  notifications: { type: Boolean, default: true }, // Enable/Disable notifications for this competition
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Competition', competitionSchema);
