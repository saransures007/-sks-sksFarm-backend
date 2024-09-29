// migrate.js
exports.migrate = (result) => {
  let newData = {};
  
  // Base fields from the cowMilkProduction model
  newData._id = result._id;
  newData.liter = result.liter;
  newData.entryDate = result.entryDate;
  newData.snf = result.snf;
  newData.fat = result.fat;
  newData.addedBy = result.addedBy;
  newData.createdAt = result.createdAt;

  // Populate cow details if available
  if (result.cowId) {
    newData.cowId = result.cowId._id;  // cow ID
    newData.earTagNumber = result.cowId.earTagNumber; // Ear tag number
    newData.rfidKey = result.cowId.rfidKey; // RFID key
  }

  return newData;
};
