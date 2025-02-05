const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const mongoose = require('mongoose');
const Setting = mongoose.model('setting');

dayjs.extend(utc);

const createFeedInventory = async (Model, req, res) => {
  const { feedType, quantity, unit, totalCost,  addedBy } = req.body;
  console.log("Creating feed inventory entry");
  

  // Calculate costPerUnit 
  const costPerUnit = totalCost / quantity;

  // Ensure all required fields are provided
  if (!feedType || !quantity || !unit || !costPerUnit || !addedBy) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }
  try {
    // Create a new feed inventory entry
    const inventoryEntry = new Model({
      feedType,
      quantity,
      unit,
      costPerUnit,
      totalCost,
      addedBy,
      lastUpdated: Date.now(),
    });
    

    const result = await inventoryEntry.save();

    return res.status(201).json({
      success: true,
      result,
      message: 'Successfully created feed inventory entry.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating feed inventory entry: ' + error.message,
    });
  }
};

module.exports = createFeedInventory;
