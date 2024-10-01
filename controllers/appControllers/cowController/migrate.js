exports.migrate = (result) => {
  let newData = {};

  // Extract cow-specific fields
  newData._id = result._id;
  newData.id = result.id;
  newData.earTagNumber = result.earTagNumber;
  newData.rfidKey = result.rfidKey;
  newData.name = result.name;  
  newData.breed = result.breed;
  newData.entryDate = result.entryDate;
  newData.purchasedAmount = result.purchasedAmount;
  newData.origin = result.origin;
  newData.motherId = result.motherId;
  newData.expectedLiter = result.expectedLiter;
  newData.addedBy = result.addedBy;
  newData.birthDate = result.birthDate;
  newData.gender = result.gender;
  newData.soldDate = result.soldDate;
  newData.soldAmount = result.soldAmount;
  newData.createdAt = result.createdAt;
  newData.isMilking = result.isMilking;
  newData.breedingStartDate = result.breedingStartDate;
  newData.breedingEndDate = result.breedingEndDate;

  return newData;
};
