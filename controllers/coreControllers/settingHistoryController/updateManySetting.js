const mongoose = require('mongoose');

const Model = mongoose.model('setting');

const updateManySetting = async (req, res) => {
  // Expecting an array of setting objects
  const payload = req.body.settings;

  if (!Array.isArray(payload) || payload.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payload. Please provide an array of settings to update.',
    });
  }

  const updates = payload.map((setting) => ({
    updateOne: {
      filter: { settingKey: setting.settingKey },  // Matching by settingKey
      update: { $set: { settingValue: setting.settingValue || '' } },  // Set value, defaulting to empty string if not provided
    },
  }));

  try {
    const result = await Model.bulkWrite(updates);

    if (result.modifiedCount > 0) {
      return res.status(200).json({
        success: true,
        message: 'Successfully updated settings.',
        modifiedCount: result.modifiedCount,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'No settings were updated.',
        modifiedCount: result.modifiedCount,
      });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings.',
    });
  }
};

module.exports = updateManySetting;
