exports.migrate = (result) => {
  const newData = {
    _id: result._id,
    date: result.date,
    type: result.type,
    description: result.description,
    cost: result.cost,
    createdAt: result.createdAt,
    lastUpdated: result.lastUpdated,
    addedBy: result.addedBy,
  };

  if (result.farmId) {
    newData.farm = {
      _id: result.farmId._id,
      id: result.farmId.id,
      farmName: result.farmId.farmName,
    };
  }

  return newData;
};
