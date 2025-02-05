const mongoose = require('mongoose');
const FeedStockLevels = mongoose.model('feedStockLevels'); // Model for feed stock levels
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const update = async (FeedInventoryUsage, req, res) => {
  const { id } = req.params;
  req.body.lastUpdated = Date.now();
  try {
    // Find the existing feed usage entry
    const usageEntry = await FeedInventoryUsage.findById(id);
    if (!usageEntry) {
      return res.status(404).json({
        success: false,
        message: 'Feed inventory usage entry not found.',
      });
    }

    const createdAtTime = new Date(usageEntry.createdAt).getTime();
    const currentTime = Date.now();
    
    if (currentTime - createdAtTime > TWENTY_FOUR_HOURS) {
      return res.status(400).json({
        success: false,
        message: 'Time expired 24Hrs. Entry cannot be deleted.',
      });
    }
    const { feedType, quantityUsed } = req.body;

    // Validate required fields
    if (!feedType || isNaN(quantityUsed)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields or invalid data.',
      });
    }

    // Calculate the quantity difference
    const quantityDifference = quantityUsed - usageEntry.quantityUsed;

    // Get current stock from FeedStockLevels
    const stock = await FeedStockLevels.findOne({});
    if (!stock) {
      return res.status(500).json({
        success: false,
        message: 'Stock levels not found.',
      });
    }

    // Get current stock for the specific feed type
    const currentStock = stock[`${feedType.toLowerCase()}Stock`] || 0;

    // Prepare stock update
    let newStockLevel = currentStock;

    if (quantityDifference > 0) {
      // If new quantity is greater, reduce stock
      newStockLevel -= quantityDifference;
    } else if (quantityDifference < 0) {
      // If new quantity is less, add back stock
      newStockLevel += Math.abs(quantityDifference);
    }

    // Check if the new stock level is valid (should not be negative)
    if (newStockLevel < 0) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock to fulfill the usage. Available stock: ${currentStock}, Required: ${quantityUsed}`,
      });
    }

    // Prepare stock update object
    const stockUpdate = { [`${feedType.toLowerCase()}Stock`]: newStockLevel };

    console.log("Stock update:", stockUpdate);

    // Update stock levels
    await FeedStockLevels.updateOne(
      {},
      { $set: stockUpdate, lastUpdated: Date.now() },
      { upsert: true }
    );

    // Update feed inventory usage entry
    req.body.remainingQuantity = newStockLevel; // Store remaining quantity after update
    const updatedEntry = await FeedInventoryUsage.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      result: updatedEntry,
      message: 'Successfully updated the feed inventory usage entry.',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating entry: ' + error.message,
    });
  }
};

module.exports = update;
