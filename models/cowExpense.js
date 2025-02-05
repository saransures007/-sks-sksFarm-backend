const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  cowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cow', // Reference to the Cow model
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String, // Description of the expense
    required: true,
  },
  cost: {
    type: Number, // Expense cost
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

module.exports = mongoose.model('cowExpense', expenseSchema);
