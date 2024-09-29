const createCow = async (Model, req, res) => {
  const {
    id,
    earTagNumber,
    rfidKey,
    breed,
    entryDate,
    origin,
    motherId,
    expectedLiter,
    addedBy,
    birthDate,
    gender,
    soldDate, // Include soldDate here
  } = req.body;

  // Ensure required fields are provided
  if (!id || !earTagNumber || !rfidKey || !breed || !entryDate || !origin || !expectedLiter || !addedBy || !birthDate || !gender) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required except soldDate.',
    });
  }

  try {
    const newCow = new Model({
      id,
      earTagNumber,
      rfidKey,
      breed,
      entryDate,
      origin,
      motherId,
      expectedLiter,
      addedBy,
      birthDate,
      gender,
      soldDate, // Add soldDate to the model
    });

    const result = await newCow.save();
    return res.status(201).json({
      success: true,
      result,
      message: 'Successfully created cow entry.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating entry: ' + error.message,
    });
  }
};

module.exports = createCow;
