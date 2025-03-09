const mongoose = require('mongoose');
const { generateId } = require('../utils/snowflake');

const roleSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: generateId
  },
  name: {
    type: String,
    required: true,
    unique:true,
  },
  scopes: [{
    type: String,
    required: true,
  }],
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

module.exports = mongoose.model('Role', roleSchema); 