exports.migrate = (result) => {
  let newData = {};
  newData._id = result._id;
  newData.entryDate = result.entryDate;
  newData.totalMilk = result.totalMilk;
  newData.avgSnf = result.avgSnf;
  newData.avgFat = result.avgFat;
  newData.ratePerLiter = result.ratePerLiter;
  newData.TotalAmount = result.ratePerLiter * result.totalMilk;
  newData.addedBy = result.addedBy;
  newData.lastUpdated = result.lastUpdated;
  newData.createdAt = result.createdAt;

  // Additional fields can be added if necessary
  return newData;
};
