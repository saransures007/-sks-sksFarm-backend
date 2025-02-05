const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const mongoose = require('mongoose');
const FeedStockLevels = mongoose.model('feedStockLevels'); // Model for feed stock levels

dayjs.extend(utc);

const createFeedInventory = async (Model, req, res) => {
  const { feedType, quantity, cost, addedBy,date } = req.body;

  console.log("Creating feed inventory entry");

  // Calculate costPerUnit
  const costPerUnit = cost / quantity;

  // Ensure all required fields are provided
  if (!feedType || !quantity || !cost || !costPerUnit || !addedBy || !date) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  try {
    // Fetch current stock levels
    const stock = await FeedStockLevels.findOne() || {
      silageStock: 0,
      silageCostPerUnit: 0,
      tmrFeedStock: 0,
      tmrFeedCostPerUnit: 0,
      pelletFeedStock: 0,
      pelletFeedCostPerUnit: 0,
    };

    // Determine stock and cost fields based on feedType
    let stockField, costField;
    switch (feedType) {
      case 'Silage':
        stockField = 'silageStock';
        costField = 'silageCostPerUnit';
        break;
      case 'TMR Feed':
        stockField = 'tmrFeedStock';
        costField = 'tmrFeedCostPerUnit';
        break;
      case 'Pellet Feed':
        stockField = 'pelletFeedStock';
        costField = 'pelletFeedCostPerUnit';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid feed type.',
        });
    }

    // Calculate new weighted average cost per unit
    const currentStock = stock[stockField] || 0;
    const currentCostPerUnit = stock[costField] || 0;
    const totalNewCost = currentStock * currentCostPerUnit + quantity * costPerUnit;
    const newStock = currentStock + quantity;
    const newCostPerUnit = totalNewCost / newStock;

    // Update stock levels and cost per unit
    const stockUpdate = {
      [stockField]: newStock,
      [costField]: newCostPerUnit,
      lastUpdated: Date.now(),
    };

    await FeedStockLevels.updateOne({}, stockUpdate, { upsert: true });

    // Create a new feed inventory entry
    const inventoryEntry = new Model({
      feedType,
      quantity, // Save as kg in the inventory entry
      costPerUnit,
      cost,
      addedBy,
      lastUpdated: Date.now(),
      date
    });

    const result = await inventoryEntry.save();

    return res.status(201).json({
      success: true,
      result,
      message: 'Successfully created feed inventory entry and updated stock levels.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating feed inventory entry: ' + error.message,
    });
  }
};

module.exports = createFeedInventory;
