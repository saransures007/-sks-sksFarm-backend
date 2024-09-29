const mongoose = require('mongoose');
const { Schema } = mongoose;

const milkSchema = new mongoose.Schema({
  cowId: {
    type: Schema.Types.ObjectId, // Reference to Cow model
    ref: 'Cow', // Name of the model you are referencing
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
    required: true,
  },
  fat: {
    type: Number,
    required: true,
  },
  silage: {
    type: Number,
    required: true,
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

module.exports = mongoose.model('CowMilkProduction', milkSchema);
