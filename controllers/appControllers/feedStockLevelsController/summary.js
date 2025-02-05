const mongoose = require('mongoose');
const feedInventoryModel = mongoose.model('feedInventory');
const summaryFeedStockLevels = async (Model, req, res) => {
  try {
    // Aggregate the feed stock data
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

    // Fetch feed inventory data to calculate cost and quantity for each feed type
    const feedInventoryData = await feedInventoryModel.aggregate([
      {
        $match: {
          feedType: { $in: ['Silage', 'TMR Feed', 'Pellet Feed'] }, // Filter for relevant feed types
        },
      },
      {
        $group: {
          _id: '$feedType',
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$totalCost' },
        },
      },
    ]);

    // Create a map for average prices
    const avgPrices = {
      avgTotalSilageStockPrice: 0,
      avgTotalTMRFeedStockPrice: 0,
      avgTotalPelletFeedStockPrice: 0,
    };

    // Assign calculated average prices based on feed type
    feedInventoryData.forEach(feed => {
      if (feed.totalQuantity > 0) {
        if (feed._id === 'Silage') {
          avgPrices.avgTotalSilageStockPrice = feed.totalCost / feed.totalQuantity;
        } else if (feed._id === 'TMR Feed') {
          avgPrices.avgTotalTMRFeedStockPrice = feed.totalCost / feed.totalQuantity;
        } else if (feed._id === 'Pellet Feed') {
          avgPrices.avgTotalPelletFeedStockPrice = feed.totalCost / feed.totalQuantity;
        }
      }
    });

    // Fetch the latest updated record
    const lastUpdatedRecord = await Model.findOne({})
      .sort({ lastUpdated: -1 })
      .select('silageStock tmrFeedStock pelletFeedStock lastUpdated recordedBy');

    if (!lastUpdatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'No last updated record available.',
      });
    }

    return res.status(200).json({
      success: true,
      result: {
        totalSilageStock: summaryData[0].totalSilageStock,
        totalTMRFeedStock: summaryData[0].totalTMRFeedStock,
        totalPelletFeedStock: summaryData[0].totalPelletFeedStock,
        ...avgPrices, // Include average prices in the result
      },
      lastUpdatedRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generating feed stock summary: ' + error.message,
    });
  }
};

module.exports = summaryFeedStockLevels;
