const CowMilkProduction = async (Model, req, res) => {
  const { cowId, liter, snf, fat, silage, entryDate, addedBy } = req.body;

  console.log("creating milk production");
  // Ensure all required fields are provided
  if (!cowId || !liter || !snf || !fat || !silage || !entryDate || !addedBy ) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  try {
    // Create a new milk entry
    const milkEntry = new Model({
      cowId,
      liter,
      snf,
      fat,
      silage,
      entryDate,
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

module.exports = CowMilkProduction;
