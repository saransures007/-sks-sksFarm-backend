const mongoose = require('mongoose');
const { Schema } = mongoose;

const milkSchema = new mongoose.Schema({
  cowId: {
    type: Schema.Types.ObjectId, // Reference to cow model
    ref: 'cow', // Name of the model you are referencing
    required: true,
  },
  liter: {
    type: Number, 
    required: true,
  },
  entryDate: {
    type: Date,
    required: true,
  },
  snf: {
    type: Number,
  },
  fat: {
    type: Number,
  },
  silage: {
    type: Number,
    required: true,
  },
  tmrFeed: {
    type: Number,
    required: true,
  },
  pelletsFeed: {
    type: Number,
    required: true,
  },
  dryFodder: {
    type: Number,
    required: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the current date and time
  },
});

module.exports = mongoose.model('cowMilkProduction', milkSchema);
