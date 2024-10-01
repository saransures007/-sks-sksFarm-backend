const createCow = async (Model, req, res) => {
  const {
    id,
    earTagNumber,
    rfidKey,
    breed,
    entryDate,
    purchasedAmount,
    origin,
    motherId,
    expectedLiter,
    addedBy,
    birthDate,
    gender,
    soldDate, 
    soldAmount,
    isMilking, 
    breedingStartDate, 
    breedingEndDate, 
  } = req.body;

  console.log("req.body",req.body)

  // Ensure required fields are provided
  if (!id || !earTagNumber || !rfidKey || !breed || !entryDate || !origin || !expectedLiter || !addedBy || !birthDate || !gender || !isMilking || !purchasedAmount) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required except soldDate, isMilking.',
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
      soldDate, 
      isMilking,
      breedingStartDate, 
      breedingEndDate,
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
