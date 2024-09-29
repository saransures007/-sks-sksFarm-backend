const mongoose = require('mongoose');

const calfSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  motherId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Cow model
    ref: 'Cow',
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  gender: {
    type: String, // e.g., 'Male' or 'Female'
    required: true,
  },
  weightAtBirth: {
    type: Number, // Weight of the calf at birth in kg
  },
  addedBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Calf', calfSchema);
