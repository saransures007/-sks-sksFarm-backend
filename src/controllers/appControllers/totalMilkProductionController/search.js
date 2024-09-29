const search = async (Model, req, res) => {
  const { entryDate, totalMilk, avgSnf, avgFat } = req.query;

  const criteria = {};
  if (entryDate) {
    criteria.entryDate = new Date(entryDate);
  }
  if (totalMilk) {
    criteria.totalMilk = totalMilk;
  }
  if (avgSnf) {
    criteria.avgSnf = avgSnf;
  }
  if (avgFat) {
    criteria.avgFat = avgFat;
  }

  try {
    const results = await Model.find(criteria);
    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error searching entries: ' + error.message,
    });
  }
};

module.exports = search;
