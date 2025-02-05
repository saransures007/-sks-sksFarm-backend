const mongoose = require('mongoose');
const FeedStockLevels = mongoose.model('feedStockLevels'); // Model for feed stock levels
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

const remove = async (Model, req, res) => {
  const { id } = req.params;

  try {
    // Find the entry to delete
    const entry = await Model.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Feed inventory usage entry not found.',
      });
    }

    const createdAtTime = new Date(entry.createdAt).getTime();
    const currentTime = Date.now();
    
    if (currentTime - createdAtTime > ONE_HOUR) {
      return res.status(400).json({
        success: false,
        message: 'Time expired 1Hrs. Entry cannot be deleted.',
      });
    }

    const { feedType, quantityUsed } = entry;
    const validQuantity = parseFloat(quantityUsed);

    if (isNaN(validQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity in the entry.',
      });
    }

    const stockUpdate = {};
    switch (feedType) {
      case 'Silage':
        stockUpdate.silageStock = (stockUpdate.silageStock || 0) + validQuantity; // Increase stock back
        break;
      case 'TMR Feed':
        stockUpdate.tmrFeedStock = (stockUpdate.tmrFeedStock || 0) + validQuantity; // Increase stock back
        break;
      case 'Pellet Feed':
        stockUpdate.pelletFeedStock = (stockUpdate.pelletFeedStock || 0) + validQuantity; // Increase stock back
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid feed type in the entry.',
        });
    }

    // Update FeedStockLevels model to increase stock
    await FeedStockLevels.updateOne(
      {},
      { $inc: stockUpdate, lastUpdated: Date.now() },
      { upsert: true } // Create a new document if one doesn't exist
    );

    // Delete the entry from the FeedInventoryUsage Model
    const result = await Model.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Failed to delete the feed inventory usage entry.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted the feed inventory usage entry and updated stock levels.',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting entry: ' + error.message,
    });
  }
};

module.exports = remove;
