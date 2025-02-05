const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const mongoose = require('mongoose');
const Cow = mongoose.model('cow'); // Model for feed stock levels

dayjs.extend(utc);

const cowMilkProduction = async (Model, req, res) => {
  const { cowId, liter, snf, fat, silage, entryDate, pelletsFeed, dryFodder, tmrFeed, addedBy } = req.body;

  console.log("creating milk production");

// Ensure all required fields are provided, allowing zero as a valid value
if (
  cowId == null || liter == null || silage == null || tmrFeed == null || 
  pelletsFeed == null || dryFodder == null || entryDate == null || addedBy == null
) {
  return res.status(400).json({
    success: false,
    message: 'All fields are required.',
  });
}

  try {
    // Check if the cow exists and is milking
    const cow = await Cow.findById(cowId);
    if (!cow) {
      return res.status(404).json({
        success: false,
        message: 'Cow not found.',
      });
    }

    if (!cow.isMilking) {
      return res.status(400).json({
        success: false,
        message: 'Milk production entry can only be created for milking cows.',
      });
    }

    // Convert entryDate to UTC using dayjs
    const utcEntryDate = dayjs(entryDate).utc().toISOString(); // Convert to ISO string in UTC format
    // Create a new milk entry
    const milkEntry = new Model({
      cowId,
      liter,
      snf,
      fat,
      silage,
      pelletsFeed, 
      dryFodder, 
      tmrFeed,
      entryDate: utcEntryDate, // Use the converted UTC date
      addedBy,
      lastUpdated: Date.now(),
    });

    const result = await milkEntry.save();

    return res.status(201).json({
      success: true,
      result,
      message: 'Successfully created Milk entry.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating entry: ' + error.message,
    });
  }
};

module.exports = cowMilkProduction;