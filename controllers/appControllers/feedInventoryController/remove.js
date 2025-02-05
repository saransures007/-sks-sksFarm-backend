const mongoose = require('mongoose');
const FeedStockLevels = mongoose.model('feedStockLevels'); // Model for feed stock levels

const remove = async (Model, req, res) => {
  const { id } = req.params;

  try {
    // Find the entry to delete
    const entry = await Model.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }


    const { feedType, quantity } = entry;
    const validQuantity = parseFloat(quantity);
    console.log("validQuantity", validQuantity)

    if (isNaN(validQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity in the entry.',
      });
    }

    const stockUpdate = {};
    switch (feedType) {
      case 'Silage':
        stockUpdate.silageStock = (stockUpdate.silageStock || 0) - validQuantity; // Ensure the stock is a number
        break;
      case 'TMR Feed':
        stockUpdate.tmrFeedStock = (stockUpdate.tmrFeedStock || 0) - validQuantity; // Ensure the stock is a number
        break;
      case 'Pellet Feed':
        stockUpdate.pelletFeedStock = (stockUpdate.pelletFeedStock || 0) - validQuantity; // Ensure the stock is a number
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid feed type in the entry.',
        });
    }
    // Update FeedStockLevels model
    await FeedStockLevels.updateOne(
      {},
      { $inc: stockUpdate, lastUpdated: Date.now() },
      { upsert: true } // Create a new document if one doesn't exist
    );

    // Delete the entry from the Model
    const result = await Model.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted feedInventory',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting entry: ' + error.message,
    });
  }
};

module.exports = remove;
