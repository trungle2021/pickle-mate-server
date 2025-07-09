// models/playerPointChangeLog.js
const mongoose = require('mongoose');

const skillPointChangeLogSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  team: {
    type: String,
    enum: ['winning', 'losing'],
    required: true
  },
  before: {
    type: Number,
    required: true
  },
  after: {
    type: Number,
    required: true
  },
  delta: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optional: index for fast querying
skillPointChangeLogSchema.index({ player: 1, createdAt: -1 });
skillPointChangeLogSchema.index({ match: 1 });

module.exports = mongoose.model('SkillPointChangeLog', skillPointChangeLogSchema);
