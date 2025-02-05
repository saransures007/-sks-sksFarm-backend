const mongoose = require('mongoose');

const Setting = mongoose.model('setting');
const settingHistoryModel = mongoose.model('settingHistory');
const updateManySetting = async (req, res) => {
  const payload = req.body.settings;

  if (!Array.isArray(payload) || payload.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payload. Please provide an array of settings to update.',
    });
  }

  try {
    // Fetch the current settings to be updated
    const settingKeys = payload.map((setting) => setting.settingKey);
    const currentSettings = await Setting.find({ settingKey: { $in: settingKeys } });

    // Create history entries
    const historyEntries = currentSettings.map((currentSetting) => {
      const matchingPayload = payload.find((p) => p.settingKey === currentSetting.settingKey);
      if (matchingPayload && matchingPayload.settingValue !== currentSetting.settingValue) {
        return {
          settingId: currentSetting._id,
          settingKey: currentSetting.settingKey,
          previousValue: currentSetting.settingValue,
          updatedBy: req.user?.id || 'system', // Assuming `req.user` contains the user info
        };
      }
      return null; // Skip unchanged settings
    }).filter(Boolean); // Remove null entries

    // Insert history entries
    if (historyEntries.length > 0) {
      await settingHistoryModel.insertMany(historyEntries);
    }

    // Prepare bulk updates
    const updates = payload.map((setting) => ({
      updateOne: {
        filter: { settingKey: setting.settingKey },
        update: { $set: { settingValue: setting.settingValue || '' } },
      },
    }));

    // Perform bulk updates
    const result = await Setting.bulkWrite(updates);

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings.',
    });
  }
};

module.exports = updateManySetting;
