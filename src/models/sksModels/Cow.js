const mongoose = require('mongoose');

const cowSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  earTagNumber: {
    type: String,
    required: true,
    unique: true, // Ensures each ear tag number is unique
  },
  rfidKey: {
    type: String,
    required: true,
    unique: true, // Ensures each RFID key is unique
  },
  breed: {
    type: String,
    required: true,
  },
  entryDate: {
    type: Date,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  motherId: {
    type: String,
  },
  expectedLiter: {
    type: Number, // Milk quantity in liters (or ml)
    required: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Cow', 'Bull'], // Gender can be 'Cow' or 'Bull'
    required: true,
  },
  soldDate: {
    type: Date, // Date when the cow was sold, if applicable
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Cow', cowSchema);
