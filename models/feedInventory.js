const mongoose = require('mongoose');

const feedInventorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  feedType: {
    type: String,
    required: true,
    enum: ['Pellet Feed', 'Silage', 'TMR Feed'],
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  costPerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
  cost: {
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

module.exports = mongoose.model('feedInventory', feedInventorySchema);
