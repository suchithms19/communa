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
    required: true,
    unique: true,
  },
  owner: {
    type: String,
    default: generateId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
  _id: false
});

// Create slug from name before saving
communitySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }
  next();
});

module.exports = mongoose.model('Community', communitySchema); 