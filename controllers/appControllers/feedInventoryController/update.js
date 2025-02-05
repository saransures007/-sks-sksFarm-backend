const mongoose = require('mongoose');
const FeedStockLevels = mongoose.model('feedStockLevels'); // Model for feed stock levels
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const update = async (Model, req, res) => {
  const { id } = req.params;
  const { quantity, cost } = req.body;
    // Calculate costPerUnit
    const costPerUnit = cost / quantity;
    req.body.costPerUnit=costPerUnit;
  req.body.lastUpdated = Date.now();
  try {
    // Find the existing entry
    const entry = await Model.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    const createdAtTime = new Date(entry.createdAt).getTime();
    const currentTime = Date.now();
    
    if (currentTime - createdAtTime > TWENTY_FOUR_HOURS) {
      return res.status(400).json({
        success: false,
        message: 'Time expired. Entry cannot be edited.',
      });
    }
    

    // Extract feedType, new quantity, and cost per unit from the request body
    const { feedType, quantity: newQuantity, totalCost } = req.body;
    const validNewQuantity = parseFloat(newQuantity);
    const validNewCostPerUnit = parseFloat(totalCost/validNewQuantity);

    if (isNaN(validNewQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity provided in the update.',
      });
    }

    // Extract current quantity and validate
    const currentQuantity = parseFloat(entry.quantity);
    if (isNaN(currentQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Current quantity in the entry is invalid.',
      });
    }

    // Determine the difference in quantity
    const quantityDifference = validNewQuantity - currentQuantity;
    // if (quantityDifference === 0) {
    //   return res.status(200).json({
    //     success: true,
    //     message: 'Quantity is the same, no changes made.',
    //   });
    // }

    // Prepare the stock update based on the feedType
    const stockUpdate = {};
    switch (feedType) {
      case 'Silage':
        stockUpdate.silageStock = (stockUpdate.silageStock || 0) + quantityDifference;
        break;
      case 'TMR Feed':
        stockUpdate.tmrFeedStock = (stockUpdate.tmrFeedStock || 0) + quantityDifference;
        break;
      case 'Pellet Feed':
        stockUpdate.pelletFeedStock = (stockUpdate.pelletFeedStock || 0) + quantityDifference;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid feed type provided.',
        });
    }

    // If cost per unit is updated, calculate the new total cost
    if (!isNaN(validNewCostPerUnit)) {
      req.body.costPerUnit = validNewCostPerUnit;
    }

    // Update stock levels in FeedStockLevels model
    await FeedStockLevels.updateOne(
      {},
      { $inc: stockUpdate, lastUpdated: Date.now() },
      { upsert: true } // Create a new document if one doesn't exist
    );

    // Update the entry in the Model with the new quantity and cost per unit
    const updatedEntry = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    return res.status(200).json({
      success: true,
      result: updatedEntry,
      message: 'Successfully updated the feed inventory.',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating entry: ' + error.message,
    });
  }
};

module.exports = update;
