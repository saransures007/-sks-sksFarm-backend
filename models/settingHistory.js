const mongoose = require('mongoose');

const settingHistorySchema = new mongoose.Schema({
  settingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'setting',
    required: true,
  },
  settingKey: {
    type: String,
    required: true,
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String, // e.g., user ID or username
  },
});

// Export the model
module.exports = mongoose.model('settingHistory', settingHistorySchema);
