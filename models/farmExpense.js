const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String, // Additional details about the expense
    required: true,
  },
  cost: {
    type: Number, // Expense or investment cost
    required: true,
    min: 0,
  },
  addedBy: {
    type: String, // User who added the entry
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
  addedBy: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('farmExpense', expenseSchema);
