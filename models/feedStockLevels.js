const mongoose = require('mongoose');

const feedStockLevelsSchema = new mongoose.Schema({
  silageStock: {
    type: Number,
    required: true,
    min: 0, // Stock cannot be negative
  },
  tmrFeedStock: {
    type: Number,
    required: true,
    min: 0,
  },
  pelletFeedStock: {
    type: Number,
    required: true,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the current date and time
  },
  addedBy: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('feedStockLevels', feedStockLevelsSchema);
