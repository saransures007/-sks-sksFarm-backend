const mongoose = require('mongoose');

const TotalMilkProductionSchema = new mongoose.Schema({
  entryDate: {
    type: Date,
    required: true,
  },
  totalMilk: {
    type: Number, // Total milk produced on this day
    required: true,
  },
  avgSnf: {
    type: Number, // Average SNF value
    required: true,
  },
  avgFat: {
    type: Number, // Average Fat value
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

module.exports = mongoose.model('TotalMilkProduction', TotalMilkProductionSchema);
