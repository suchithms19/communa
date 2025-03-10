const mongoose = require('mongoose');
const { generateId } = require('../utils/snowflake');

const memberSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: generateId
  },
  community: {
    type: String,
    ref: 'Community',
    required: true,
  },
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    ref: 'Role',
    required: true,
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  _id: false
});

// Ensure unique combination of community and user
memberSchema.index({ community: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Member', memberSchema); 