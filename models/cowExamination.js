const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  disease: {
    type: String,
    required: true,
  },
  entryDate: {
    type: Date,
    required: true,
  },
  cowId: {
    type: String,
    ref: 'cow', // Name of the model you are referencing
    required: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  symptoms: {
    type: String, // List of symptoms observed
    required: true,
  },
  treatment: {
    type: String, // Description of treatment administered
  },
  nextCheckupDate: {
    type: Date, // Suggested date for the next checkup
  },
  notes: {
    type: String, // Additional notes from the veterinarian
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

module.exports = mongoose.model('cowExamination', examinationSchema);
