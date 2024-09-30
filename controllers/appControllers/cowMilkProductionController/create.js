const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const cowMilkProduction = async (Model, req, res) => {
  const { cowId, liter, snf, fat, silage, entryDate, addedBy } = req.body;

  console.log("creating milk production");
  // Ensure all required fields are provided
  if (!cowId || !liter || !snf || !fat || !silage || !entryDate || !addedBy) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  try {
    // Convert entryDate to UTC using dayjs
    const utcEntryDate = dayjs(entryDate).utc().toISOString(); // Convert to ISO string in UTC format
    // Create a new milk entry
    const milkEntry = new Model({
      cowId,
      liter,
      snf,
      fat,
      silage,
      entryDate: utcEntryDate, // Use the converted UTC date
      addedBy,
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
