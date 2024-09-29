
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
    required: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the current date and time
  },
});

module.exports = mongoose.model('Examination', examinationSchema);
