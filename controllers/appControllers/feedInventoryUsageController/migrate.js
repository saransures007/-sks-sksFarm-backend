exports.migrate = (result) => {
  const newData = {
    _id: result._id,
    feedType: result.feedType,
    quantityUsed: result.quantityUsed,
    remainingQuantity: result.remainingQuantity,
    usedBy: result.usedBy,
    date: result.date,
    lastUpdated: result.lastUpdated,
    createdAt: result.createdAt,
  };

  // Check if `farmId` exists and add farm details if present
  if (result.farmId) {
    newData.farm = {
      _id: result.farmId._id,
      id: result.farmId.id,
      farmName: result.farmId.farmName,
    };
  }

  return newData;
};
