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
  name: {
    type: String,
  },
  breed: {
    type: String,
    required: true,
  },
  entryDate: {
    type: Date,
    required: true,
  },
  purchasedAmount: {
    type: Number, // Date when the cow was sold, if applicable
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
  weight: {
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
    enum: ['Cow', 'Bull','calf'], // Gender can be 'cow' or 'Bull'
    required: true,
  },
  soldDate: {
    type: Date, // Date when the cow was sold, if applicable
  },
  soldAmount: {
    type: Number, // Date when the cow was sold, if applicable
  },
  isMilking: {
    type: Boolean,
    required: true,
    default: false, // Default to false, indicating the cow is not milking
  },
  breedingStartDate: {
    type: Date, // Date when breeding starts
  },
  breedingEndDate: {
    type: Date, // Date when breeding ends
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

module.exports = mongoose.model('cow', cowSchema);
