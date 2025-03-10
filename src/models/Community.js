const mongoose = require('mongoose');
const { generateId } = require('../utils/snowflake');

const communitySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: generateId
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  owner: {
    type: String,
    default: generateId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
  _id: false
});

// Create slug from name before saving
communitySchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }
  next();
});

module.exports = mongoose.model('Community', communitySchema); 