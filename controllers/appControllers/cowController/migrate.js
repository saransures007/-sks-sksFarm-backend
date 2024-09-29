exports.migrate = (result) => {
  let newData = {};

  // Extract cow-specific fields
  newData._id = result._id;
  newData.id = result.id;
  newData.earTagNumber = result.earTagNumber;
  newData.rfidKey = result.rfidKey;
  newData.breed = result.breed;
  newData.entryDate = result.entryDate;
  newData.origin = result.origin;
  newData.motherId = result.motherId;
  newData.expectedLiter = result.expectedLiter;
  newData.addedBy = result.addedBy;
  newData.birthDate = result.birthDate;
  newData.gender = result.gender;
  newData.soldDate = result.soldDate;
  newData.createdAt = result.createdAt;

  // Add any other necessary fields here, if applicable

  return newData;
};
