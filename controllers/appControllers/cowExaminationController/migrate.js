exports.migrate = (result) => {
  const newData = {
    _id: result._id,
    date: result.date,
    type: result.type,
    description: result.description,
    cost: result.cost,
    createdAt: result.createdAt,
    addedBy: result.addedBy,
    lastUpdated: result.lastUpdated,
  };

  if (result.cowId) {
    newData.cow = {
      _id: result.cowId._id,
      id: result.cowId.id,
      earTagNumber: result.cowId.earTagNumber,
      rfidKey: result.cowId.rfidKey,
    };
  }

  return newData;
};
