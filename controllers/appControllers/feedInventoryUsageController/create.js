const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const mongoose = require('mongoose');
const FeedStockLevels = mongoose.model('feedStockLevels'); // Model for feed stock levels

dayjs.extend(utc);

const createFeedInventoryUsage = async (Model, req, res) => {
  const { feedType, quantityUsed, date, addedBy } = req.body;

  console.log("Creating feed inventory usage entry");

  // Ensure all required fields are provided
  if (!feedType || !quantityUsed || !addedBy || !date) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  try {
    // Fetch current stock levels
    const stock = await FeedStockLevels.findOne();
    console.log("stock",stock)

    if (!stock) {
      return res.status(400).json({
        success: false,
        message: 'No feed stock available.',
      });
    }

    // Determine stock field based on feedType
    let stockField;
    switch (feedType) {
      case 'Silage':
        stockField = 'silageStock';
        break;
      case 'TMR Feed':
        stockField = 'tmrFeedStock';
        break;
      case 'Pellet Feed':
        stockField = 'pelletFeedStock';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid feed type.',
        });
    }

    // Check if there is enough stock to deduct
    const currentStock = stock[stockField] || 0;
    if (quantityUsed > currentStock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient feed stock.',
      });
    }

    // Calculate remaining stock after usage
    const newStock = currentStock - quantityUsed;

    // Update stock levels
    await FeedStockLevels.updateOne({}, { [stockField]: newStock, lastUpdated: Date.now() });

    // Create a new feed inventory usage entry
    const usageEntry = new Model({
      feedType,
      quantityUsed,
      remainingQuantity: newStock,
      date,
      date,
      lastUpdated: Date.now(),
      addedBy,
    });

    const result = await usageEntry.save();

    return res.status(201).json({
      success: true,
      result,
      message: 'Successfully recorded feed usage and updated stock levels.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating feed usage entry: ' + error.message,
    });
  }
};

module.exports = createFeedInventoryUsage;
