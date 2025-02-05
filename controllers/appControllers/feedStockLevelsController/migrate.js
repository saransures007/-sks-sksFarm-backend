exports.migrate = (result) => {
  const newData = {
    _id: result._id,
    feedType: result.feedType,
    quantity: result.quantity,
    unit: result.unit,
    costPerUnit: result.costPerUnit,
    totalCost: result.totalCost,
    lastUpdated: result.lastUpdated,
    addedBy: result.addedBy,
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
