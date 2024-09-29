const search = async (Model, req, res) => {
  const { cowId, liter, entryDate, snf, fat } = req.query;

  const criteria = {};
  if (cowId) {
    criteria.cowId = cowId;
  }
  if (liter) {
    criteria.liter = liter;
  }
  if (entryDate) {
    criteria.entryDate = new Date(entryDate);
  }
  if (snf) {
    criteria.snf = snf;
  }
  if (fat) {
    criteria.fat = fat;
  }

  try {
    const result = await Model.find(criteria);
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error searching entries: ' + error.message,
    });
  }
};

module.exports = search;
