const mongoose = require('mongoose');
const feedInventoryModel = mongoose.model('feedInventory');
const feedInventoryUsageModel = mongoose.model('feedInventoryUsage');
const SettingsModel = mongoose.model('setting');

const summaryFeedStockLevels = async (Model, req, res) => {
  try {
    // Fetch package sizes from settings
    const settings = await SettingsModel.find({
      settingKey: { 
        $in: ['tmr_package_size', 'silage_package_size', 'pellets_package_size'] 
      }
    }).lean();

    const packageSizes = {};
    settings.forEach(setting => {
      packageSizes[setting.settingKey] = setting.settingValue || 1; // Avoid division by zero
    });

    // Aggregate stock levels
    const summaryData = await Model.aggregate([
      {
        $group: {
          _id: null,
          totalSilageStock: { $sum: '$silageStock' },
          totalTMRFeedStock: { $sum: '$tmrFeedStock' },
          totalPelletFeedStock: { $sum: '$pelletFeedStock' },
        },
      },
    ]);

    if (!summaryData.length) {
      return res.status(404).json({
        success: false,
        message: 'No feed stock data available.',
      });
    }

    // Calculate package availability (rounded to 2 decimals)
    const totalSilagePackages = (summaryData[0].totalSilageStock / packageSizes.silage_package_size).toFixed(2);
    const totalTMRPackages = (summaryData[0].totalTMRFeedStock / packageSizes.tmr_package_size).toFixed(2);
    const totalPelletPackages = (summaryData[0].totalPelletFeedStock / packageSizes.pellets_package_size).toFixed(2);

    // Calculate average daily usage (last 7 days)
    const last7DaysUsage = await feedInventoryUsageModel.aggregate([
      {
        $match: {
          date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: '$feedType',
          avgDailyUsage: { $avg: '$quantityUsed' },
        },
      },
    ]);

    const dailyUsageMap = {};
    last7DaysUsage.forEach(usage => {
      dailyUsageMap[usage._id] = usage.avgDailyUsage || 1; // Avoid division by zero
    });

    // Predict stock availability in days (rounded to 2 decimals)
    const predictedSilageDays = (summaryData[0].totalSilageStock / (dailyUsageMap['Silage'] || 1)).toFixed(2);
    const predictedTMRDays = (summaryData[0].totalTMRFeedStock / (dailyUsageMap['TMR Feed'] || 1)).toFixed(2);
    const predictedPelletDays = (summaryData[0].totalPelletFeedStock / (dailyUsageMap['Pellet Feed'] || 1)).toFixed(2);

    return res.status(200).json({
      success: true,
      result: {
        totalSilageStock: summaryData[0].totalSilageStock,
        totalTMRFeedStock: summaryData[0].totalTMRFeedStock,
        totalPelletFeedStock: summaryData[0].totalPelletFeedStock,
        totalSilagePackages,
        totalTMRPackages,
        totalPelletPackages,
        predictedSilageDays,
        predictedTMRDays,
        predictedPelletDays,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generating feed stock summary: ' + error.message,
    });
  }
};

module.exports = summaryFeedStockLevels;
